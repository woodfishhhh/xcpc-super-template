export function stripCodeFence(source: string): string {
  const value = source.replace(/\r\n/g, '\n').trim()
  const fenced = value.match(/^```[^\n]*\n([\s\S]*?)\n?```$/)
  return fenced ? fenced[1].trimEnd() : value
}

export function toMarkdownCodeBlock(code: string, language = 'cpp'): string {
  const normalized = stripCodeFence(code).trimEnd()
  return `\`\`\`${language.trim() || 'cpp'}\n${normalized}\n\`\`\``
}
