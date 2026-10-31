import { withHeadingId } from "./utils";

export function H2({ children }) {
  return (
    <h2 className="group font-serif text-3xl leading-tight tracking-[-0.02em] mt-12 mb-4 relative">
      {withHeadingId(children)}
    </h2>
  );
}
