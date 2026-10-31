import { withHeadingId } from "./utils";

export function H3({ children }) {
  return (
    <h3 className="group font-serif text-2xl leading-tight mt-10 mb-3 relative">
      {withHeadingId(children)}
    </h3>
  );
}
