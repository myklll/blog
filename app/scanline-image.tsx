"use client";

import { useEffect, useRef } from "react";

// Renders a photo as a smeared, grainy broadcast scan (WebGL fragment shader).
// The plain <img> underneath is the accessible/LCP element and the fallback when
// WebGL is unavailable. Hovering the parent `.group` eases the effect out.

const VERTEX = `
attribute vec2 p;
varying vec2 v;
void main() {
  v = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAGMENT = `
precision highp float;
varying vec2 v;
uniform sampler2D tex;
uniform vec2 scale;   // object-fit: cover
uniform float time;
uniform float dpr;
uniform float line;   // scanline period in device px, scaled to the image size
uniform float amount; // 1 = full effect, 0 = clean photo
uniform float mono;   // 1 = the clean photo is black and white

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float luma(vec2 uv) {
  return dot(texture2D(tex, uv).rgb, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 uv = (v - 0.5) * scale + 0.5;

  // each band of rows is nudged sideways a little, re-rolled ~12x a second
  float band = floor(gl_FragCoord.y / (line * 0.5));
  float jitter = (hash(vec2(band, floor(time * 12.0))) - 0.5) * 0.006 * amount;

  // horizontal smear
  float smear = 0.012 * amount;
  float l = 0.0;
  for (int i = -4; i <= 4; i++) {
    l += luma(uv + vec2(float(i) / 4.0 * smear + jitter, 0.0));
  }
  // lift shadows so darker skin tones keep their detail
  l = smoothstep(0.12, 0.8, pow(l / 9.0, 0.55));

  // scanlines
  float ph = fract(gl_FragCoord.y / line);
  // fine periods use crisp pixel rows (a sine that small aliases into blotches)
  float s = line < 4.5 ? step(0.5, ph) : 0.5 + 0.5 * sin(ph * 6.2831853);
  l *= mix(1.0, mix(0.15, 1.0, smoothstep(0.15, 0.6, s)), amount);

  // grain, heavier in the highlights like the reference
  float n = hash(gl_FragCoord.xy + fract(time) * 97.0);
  l += (n - 0.5) * 0.55 * amount * (0.35 + 0.65 * l);
  l = clamp(l, 0.0, 1.0);

  vec3 ink = vec3(0.106, 0.102, 0.09);
  vec3 paper = vec3(0.97, 0.96, 0.94);
  vec3 scan = mix(ink, paper, l);
  vec3 photo = texture2D(tex, uv).rgb;
  photo = mix(photo, vec3(dot(photo, vec3(0.299, 0.587, 0.114))), mono);
  gl_FragColor = vec4(mix(photo, scan, amount), 1.0);
}`;

export function ScanlineImage({
  src,
  alt,
  className = "",
  mono = false,
  hoverSelf = false,
  intro,
}: {
  src: string;
  alt: string;
  className?: string;
  // hovering reveals a black-and-white photo instead of the colour one
  mono?: boolean;
  // only hovering the image itself (not its parent `.group`) eases the effect out
  hoverSelf?: boolean;
  // marks the element for the home intro (home-intro.tsx)
  intro?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const img = imgRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl || gl.isContextLost()) return;

    const program = createProgram(gl);
    if (!program) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uScale = u("scale");
    const uTime = u("time");
    const uDpr = u("dpr");
    const uLine = u("line");
    const uAmount = u("amount");
    gl.uniform1f(u("mono"), mono ? 1 : 0);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let ready = false;
    let visible = true;
    let amount = 1;
    let target = 1;
    let last = 0;
    let tex: WebGLTexture | null = null;

    const draw = (t: number) => {
      gl.uniform1f(uTime, reduceMotion ? 0 : t / 1000);
      gl.uniform1f(uAmount, amount);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(wrap.clientWidth * dpr));
      const h = Math.max(1, Math.round(wrap.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(uDpr, dpr);
      // at least ~16 lines on any image (2 device px minimum), capped at 6 CSS px on the hero
      gl.uniform1f(uLine, Math.max(2, Math.min(6 * dpr, h / 16)));
      // cover: shrink the sampled range on the axis that overflows
      const canvasAspect = w / h;
      const imgAspect = img.naturalWidth / img.naturalHeight || 1;
      gl.uniform2f(
        uScale,
        canvasAspect < imgAspect ? canvasAspect / imgAspect : 1,
        canvasAspect < imgAspect ? 1 : imgAspect / canvasAspect
      );
      if (ready) draw(performance.now());
    };

    // grain flickers at ~24fps; eases toward the hover target
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || t - last < 1000 / 24) return;
      last = t;
      amount += (target - amount) * 0.25;
      draw(t);
    };

    const start = () => {
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      ready = true;
      resize();
      canvas.style.opacity = "1";
      if (reduceMotion) return;
      raf = requestAnimationFrame(loop);
    };

    const hoverTarget = (!hoverSelf && wrap.closest(".group")) || wrap;
    const onEnter = () => {
      target = 0;
      if (reduceMotion) { amount = 0; draw(0); }
    };
    const onLeave = () => {
      target = 1;
      if (reduceMotion) { amount = 1; draw(0); }
    };
    hoverTarget.addEventListener("mouseenter", onEnter);
    hoverTarget.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);

    if (img.complete && img.naturalWidth) start();
    else img.addEventListener("load", start, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      img.removeEventListener("load", start);
      hoverTarget.removeEventListener("mouseenter", onEnter);
      hoverTarget.removeEventListener("mouseleave", onLeave);
      // free resources but keep the context alive: React re-runs this effect on
      // the same canvas (strict mode, fast refresh) and a lost context can't be reused
      canvas.style.opacity = "0";
      gl.deleteTexture(tex);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [src, mono, hoverSelf]);

  return (
    <div ref={wrapRef} data-intro={intro} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover grayscale contrast-125 ${
          mono || hoverSelf ? "" : "group-hover:grayscale-0 group-hover:contrast-100 transition-[filter] duration-500"
        }`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500"
      />
    </div>
  );
}

function createProgram(gl: WebGLRenderingContext) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}
