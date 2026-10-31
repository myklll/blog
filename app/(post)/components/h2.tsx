import { withHeadingId } from "./utils";

export function H2({ children }) {
  return (
    <h2 className="group font-display text-3xl leading-tight mt-12 mb-4 relative">
      {withHeadingId(children)}
    </h2>
  );
}
