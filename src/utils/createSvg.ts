function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        if (word.length > maxCharsPerLine) {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = "";
            }

            for (let i = 0; i < word.length; i += maxCharsPerLine) {
                lines.push(word.slice(i, i + maxCharsPerLine));
            }

            continue;
        }

        const candidate = currentLine
            ? `${currentLine} ${word}`
            : word;

        if (candidate.length > maxCharsPerLine && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = candidate;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export function createSvg(
    maxWidth: number,
    maxHeight: number,
    text: string = "Watermark",
    fontSize: number = 24
): string {
    if (
        !Number.isFinite(maxWidth) ||
        !Number.isFinite(maxHeight) ||
        maxWidth < 1 ||
        maxHeight < 1 ||
        !Number.isFinite(fontSize) ||
        fontSize <= 0
    ) {
        throw new RangeError("Image dimensions and font size must be positive finite numbers");
    }

    let currentFontSize = fontSize;

    let lines: string[] = [];
    let padding = 0;
    let lineHeight = 0;
    let avgCharWidth = 0;
    let svgWidth = 0;
    let svgHeight = 0;
    let fits = false;

    for (let attempt = 0; attempt < 100; attempt++) {
        padding = currentFontSize * 0.5;
        lineHeight = currentFontSize * 1.3;
        avgCharWidth = currentFontSize * 0.6;

        const usableWidth = Math.max(
            1,
            maxWidth - padding * 2
        );

        const maxCharsPerLine = Math.max(
            1,
            Math.floor(usableWidth / avgCharWidth)
        );

        lines = wrapText(text, maxCharsPerLine);
        if (lines.length === 0) {
            lines = [" "];
        }

        const longestLineChars = Math.max(
            ...lines.map((line) => line.length),
            1
        );

        const textWidth =
            longestLineChars * avgCharWidth;

        svgWidth = Math.min(
            maxWidth,
            Math.ceil(textWidth + padding * 2)
        );

        svgHeight = Math.ceil(
            lines.length * lineHeight + padding
        );

        if (
            svgWidth <= maxWidth &&
            svgHeight <= maxHeight
        ) {
            fits = true;
            break;
        }

        currentFontSize *= 0.9;
    }

    if (!fits) {
        throw new Error("Could not fit the watermark inside the image");
    }

    const tspans = lines
        .map(
            (line, i) =>
                `<tspan x="${svgWidth / 2}" dy="${i === 0
                    ? currentFontSize
                    : lineHeight
                }">${escapeXml(line)}</tspan>`
        )
        .join("\n");

    return `
    <svg
        width="${svgWidth}"
        height="${svgHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <filter
                id="shadow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
            >
                <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="2"
                    result="blur"
                />

                <feOffset
                    dx="1.5"
                    dy="1.5"
                    result="offsetblur"
                />

                <feFlood
                    flood-color="gray"
                    flood-opacity="0.7"
                    result="shadowColor"
                />

                <feComposite
                    in="shadowColor"
                    in2="offsetblur"
                    operator="in"
                    result="shadow"
                />

                <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        <text
            x="${svgWidth / 2}"
            font-size="${currentFontSize}"
            font-family="Arial, sans-serif"
            font-weight="bold"
            fill="white"
            fill-opacity="0.4"
            text-anchor="middle"
            filter="url(#shadow)"
        >
            ${tspans}
        </text>
    </svg>`;
}