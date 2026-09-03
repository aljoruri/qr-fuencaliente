import type { ReactNode } from "react";

function inline(text: string, keyPrefix = "inline"): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);
  return parts.filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>
    ) : /^\[[^\]]+\]\(https?:\/\/[^)\s]+\)$/.test(part) ? (
      <a
        key={`${keyPrefix}-${index}`}
        href={part.slice(part.indexOf("](") + 2, -1)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {part.slice(1, part.indexOf("]("))}
      </a>
    ) : (
      <span key={`${keyPrefix}-${index}`}>{part}</span>
    ),
  );
}

function withLineBreaks(lines: string[], keyPrefix: string): ReactNode[] {
  return lines.flatMap((line, index) => [
    ...(index > 0 ? [<br key={`${keyPrefix}-break-${index}`} />] : []),
    ...inline(line.trimEnd(), `${keyPrefix}-line-${index}`),
  ]);
}

export function MarkdownText({ value }: { value: string }) {
  const blocks = value.split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="prose-copy">
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.every((line) => /^[-*]\s+/.test(line));
        const isOrdered = lines.every((line) => /^\d+[.)]\s+/.test(line));
        if (isList) {
          return (
            <ul key={index}>
              {lines.map((line, itemIndex) => <li key={itemIndex}>{inline(line.replace(/^[-*]\s+/, ""))}</li>)}
            </ul>
          );
        }
        if (isOrdered) {
          return (
            <ol key={index}>
              {lines.map((line, itemIndex) => <li key={itemIndex}>{inline(line.replace(/^\d+[.)]\s+/, ""))}</li>)}
            </ol>
          );
        }
        if (block.startsWith("> ")) {
          return <blockquote key={index}>{inline(block.replace(/^>\s?/, ""))}</blockquote>;
        }
        return <p key={index}>{withLineBreaks(lines, `paragraph-${index}`)}</p>;
      })}
    </div>
  );
}
