export function Figure({ wide = false, children }) {
  return (
    <div
      className={`
    text-center
    ${
      wide
        ? `
      bg-ink/5
      relative
      left-[50%]
      right-[50%]
      ml-[-50vw]
      mr-[-50vw]
      w-[100vw]
    `
        : ""
    }
  `}
    >
      <div className={wide ? "max-w-2xl mx-auto px-6" : ""}>
        {children}
      </div>
    </div>
  );
}
