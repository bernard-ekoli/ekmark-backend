function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if (word.length > maxCharsPerLine) {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = '';
            }
            for (let i = 0; i < word.length; i += maxCharsPerLine) {
                lines.push(word.slice(i, i + maxCharsPerLine));
            }
            continue;
        }

        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length > maxCharsPerLine && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = candidate;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

export function createSvg(
    maxWidth: number,
    text: string = "Watermark",
    fontSize: number = 24
): string {
    const padding = fontSize * 0.5;
    const lineHeight = fontSize * 1.3;
    const avgCharWidth = fontSize * 0.6;

    const usableWidth = maxWidth - padding * 2;
    const maxCharsPerLine = Math.max(1, Math.floor(usableWidth / avgCharWidth));

    // ↓ this is the only new line — call the function to get your lines array
    const lines = wrapText(text, maxCharsPerLine);

    const svgHeight = lines.length * lineHeight + padding;

    const tspans = lines
        .map((line, i) => `<tspan x="${padding}" dy="${i === 0 ? fontSize : lineHeight}">${line}</tspan>`)
        .join('\n');

    return `
    <svg width="${maxWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="1" dy="1" result="offsetblur" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <text
            font-size="${fontSize}"
            font-family="Arial, sans-serif"
            font-weight="bold"
            fill="white"
            fill-opacity="0.4"
            filter="url(#shadow)"
        >
            ${tspans}
        </text>
    </svg>`;
}