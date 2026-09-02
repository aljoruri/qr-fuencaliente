import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
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
        return <p key={index}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
