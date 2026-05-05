// Tiny markdown renderer — handles the subset our AI outputs return.
// Supports: # / ## / ### headings, **bold**, *italic*, `code`, lists,
// blockquotes, horizontal rules, simple tables, and links. No deps.

interface Props {
  text: string;
  className?: string;
}

function inline(s: string) {
  // escape, then re-introduce safe spans
  let t = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  t = t.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-ink-700/60 border border-ink-600 text-court text-[0.85em]">$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-ink-50">$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="text-court underline" href="$2" target="_blank" rel="noreferrer">$1</a>');
  return t;
}

export default function Markdown({ text, className = '' }: Props) {
  const lines = text.split('\n');
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s\-|:]+\|\s*$/.test(lines[i + 1])) {
      const header = line.split('|').slice(1, -1).map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
        i++;
      }
      blocks.push(
        `<div class="overflow-x-auto my-3"><table class="w-full text-sm border border-ink-700 rounded-lg overflow-hidden"><thead class="bg-ink-800"><tr>${header
          .map((h) => `<th class="text-left px-3 py-2 text-ink-200 font-medium">${inline(h)}</th>`)
          .join('')}</tr></thead><tbody>${rows
          .map(
            (r) =>
              `<tr class="border-t border-ink-700">${r
                .map((c) => `<td class="px-3 py-2 text-ink-200">${inline(c)}</td>`)
                .join('')}</tr>`,
          )
          .join('')}</tbody></table></div>`,
      );
      continue;
    }

    if (/^### /.test(line)) {
      blocks.push(`<h3 class="text-base font-semibold mt-4 mb-1 text-ink-50">${inline(line.replace(/^### /, ''))}</h3>`);
      i++;
      continue;
    }
    if (/^## /.test(line)) {
      blocks.push(`<h2 class="text-lg font-semibold mt-4 mb-2 text-ink-50">${inline(line.replace(/^## /, ''))}</h2>`);
      i++;
      continue;
    }
    if (/^# /.test(line)) {
      blocks.push(`<h1 class="text-xl font-bold mt-4 mb-2 text-ink-50">${inline(line.replace(/^# /, ''))}</h1>`);
      i++;
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push('<hr class="my-3 border-ink-700"/>');
      i++;
      continue;
    }
    if (/^>\s/.test(line)) {
      blocks.push(`<blockquote class="border-l-2 border-court pl-3 my-2 text-ink-200">${inline(line.replace(/^>\s/, ''))}</blockquote>`);
      i++;
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      blocks.push(
        `<ul class="list-disc pl-5 space-y-1 my-2">${items
          .map((it) => `<li class="text-ink-200">${inline(it)}</li>`)
          .join('')}</ul>`,
      );
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    // paragraph: collect until blank
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^[-*#>]/.test(lines[i]) && !/^\s*\|/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(`<p class="text-ink-200 leading-relaxed">${inline(buf.join(' '))}</p>`);
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: blocks.join('\n') }} />;
}
