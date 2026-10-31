import { BackLink } from "../back-link";
import { Footer } from "../footer";

export default function Layout({ children }) {
  return (
    <div className="max-w-2xl mx-auto pt-8 md:pt-14">
      <article className="mb-10 text-lg leading-relaxed">
        <BackLink />
        {children}
      </article>
      <Footer />
    </div>
  );
}
