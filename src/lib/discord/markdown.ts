const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * A tiny subset of Discord markdown: code blocks, inline code, bold, italic,
 * links, mentions written as @name / #channel, and line breaks.
 * Input is escaped first, so it is safe for user-typed text.
 */
export function discordMarkdown(text: string): string {
    const blocks: string[] = [];
    let out = escape(text).replace(/```(?:\w+\n)?([\s\S]*?)```/g, (_, code: string) => {
        blocks.push(`<pre class="dc-codeblock"><code>${code.replace(/^\n|\n$/g, '')}</code></pre>`);
        return `\u0000${blocks.length - 1}\u0000`;
    });
    out = out
        .replace(/`([^`]+)`/g, '<code class="dc-code">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/(^|\s)@([\w.]+)/g, '$1<span class="dc-mention">@$2</span>')
        .replace(/(^|\s)#([\w-]+)/g, '$1<span class="dc-mention">#$2</span>')
        .replace(/:(step|success|warning|error|join|leave|death|command):/g, '<img class="dc-emoji" src="/emoji/$1.png" alt=":$1:">')
        .replace(/\n/g, '<br>');
    return out.replace(/\u0000(\d+)\u0000/g, (_, i) => blocks[+i]);
}
