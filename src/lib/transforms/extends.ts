import { Logger } from "../logger.js"

function isExtendsLine(line: string): boolean {
    return /^\s*extends\b/.test(line)
}

function isCommentLine(line: string): boolean {
    return /^\s*#/.test(line)
}

export const replaceExtends = (text: string, className: string, replacement: string, logger: Logger): string => {
    const regex = new RegExp(`\\s*extends\\s+${className}`, "gm")
    return text.replace(regex, (match: string) => {
        const whitespace = match.match(/^\s*/)![0]
        logger.extra(`Replacing extends ${className} with ${replacement}`)
        return `${whitespace}extends "${replacement}"`
    })
}

function findExtendsLineIndex(lines: string[]): number | undefined {
    for (let i = 0; i < lines.length; i++) {
        if (isExtendsLine(lines[i]) && !isCommentLine(lines[i])) {
            return i
        }
    }
    return undefined
}

export function moveExtendsToTop(text: string): string {
    const lines: string[] = text.split("\n")
    const idx = findExtendsLineIndex(lines)
    if (idx === undefined) return text
    const extendsLine = lines[idx]
    const rest = lines.slice(0, idx).concat(lines.slice(idx + 1))
    return [extendsLine, ...rest].join("\n")
}
