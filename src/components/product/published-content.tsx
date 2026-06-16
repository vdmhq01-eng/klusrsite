import type { ReactNode } from "react";
import type { ProductContentOverride } from "@/lib/store/product-content";

/**
 * Toont gepubliceerde, door de admin goedgekeurde AI-content (beschrijving,
 * specificaties, FAQ) op de productpagina. Server-component; rendert de
 * markdown-achtige tekst netjes op.
 */

function renderInline(text: string, keyBase: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g).map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-semibold text-foreground">
          {bold[1]}
        </strong>
      );
    }
    const em = part.match(/^\*([^*]+)\*$/);
    if (em) {
      return (
        <em key={`${keyBase}-${i}`} className="italic">
          {em[1]}
        </em>
      );
    }
    return <span key={`${keyBase}-${i}`}>{part}</span>;
  });
}

function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split(/\n/).map((l) => l.trim());
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (!bullets.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="my-2 ml-5 list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
        {bullets.map((b, i) => (
          <li key={i}>{renderInline(b, `ul-${nodes.length}-${i}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((line, i) => {
    if (!line) {
      flush();
      return;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flush();
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      nodes.push(
        <p key={`q-${i}`} className="my-2 border-l-2 border-primary/40 pl-3 text-xs text-muted-foreground">
          {renderInline(quote[1], `q-${i}`)}
        </p>,
      );
      return;
    }
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      nodes.push(
        <h3 key={`h-${i}`} className="mt-4 text-base font-bold text-foreground">
          {heading[1]}
        </h3>,
      );
      return;
    }
    nodes.push(
      <p key={`p-${i}`} className="my-2 text-sm leading-relaxed text-muted-foreground">
        {renderInline(line, `p-${i}`)}
      </p>,
    );
  });

  flush();
  return nodes;
}

const SECTION_TITLES: Record<string, string> = {
  description: "Productinformatie",
  specifications: "Specificaties",
  faqs: "Veelgestelde vragen",
};

export function PublishedContent({
  content,
}: {
  content: Record<string, ProductContentOverride>;
}) {
  const order = ["description", "specifications", "faqs"] as const;
  const sections = order
    .map((type) => content[type])
    .filter((c): c is ProductContentOverride => Boolean(c?.content?.trim()));

  if (sections.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {sections.map((section) => (
        <section key={section.type} className="mt-6 first:mt-0">
          <h2 className="mb-2 text-lg font-extrabold tracking-tight">
            {SECTION_TITLES[section.type] ?? "Informatie"}
          </h2>
          <div>{renderMarkdown(section.content)}</div>
        </section>
      ))}
    </div>
  );
}
