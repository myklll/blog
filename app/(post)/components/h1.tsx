import { withHeadingId } from "./utils";

export function H1({ children }) {
  return (
    <h1 className="font-display uppercase text-4xl md:text-6xl leading-[1.05] text-balance mb-6">
      {withHeadingId(children)}
    </h1>
  );
}
