import Link from "next/link";

/** Shared 404 body. `links` are real routes the visitor can go to instead. */
export function NotFoundView({ title, message, links }: { title: string; message: string; links: { href: string; label: string }[] }) {
  return (
    <section aria-labelledby="nf-title" className="grid max-w-xl justify-items-start gap-3 py-8 sm:py-12">
      <p className="num text-[13px] font-medium text-muted-foreground">Error 404</p>
      <h1 id="nf-title">{title}</h1>
      <p className="muted">{message}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {links.map((l, i) => (
          <Link key={l.href} className={`btn ${i === 0 ? "btn-solid" : "btn-line"}`} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
