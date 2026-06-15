import { cn } from "@/lib/utils";

/** Inline **bold** → <strong>. */
function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{part}</span>;
  });
}

/**
 * Lichtgewicht markdown-renderer voor AI-antwoorden: **bold**, opsommingen
 * (- / * / •), genummerde lijsten en alinea's met witregels. Geen externe lib.
 */
export function FormattedText({ text, className }: { text: string; className?: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flush = (key: string | number) => {
    if (!list.length) return;
    const items = list.map((li, i) => <li key={i}>{renderInline(li)}</li>);
    blocks.push(
      ordered ? (
        <ol key={`ol-${key}`} className="list-decimal space-y-1 pl-5">
          {items}
        </ol>
      ) : (
        <ul key={`ul-${key}`} className="list-disc space-y-1 pl-5">
          {items}
        </ul>
      ),
    );
    list = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) {
      flush(idx);
      return;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      const isOrdered = Boolean(numbered);
      if (list.length && isOrdered !== ordered) flush(`${idx}-x`);
      ordered = isOrdered;
      list.push((bullet ?? numbered)![1]);
      return;
    }
    flush(idx);
    blocks.push(
      <p key={idx} className="leading-relaxed">
        {renderInline(line)}
      </p>,
    );
  });
  flush("end");

  return <div className={cn("space-y-2", className)}>{blocks}</div>;
}
