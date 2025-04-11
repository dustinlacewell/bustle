export const isCommentLine = (line: string): boolean =>
    line.trim().startsWith('#')

export const extractClassName = (line: string): string | null => {
    const match = line.match(/^class_name\s+([A-Z][a-zA-Z0-9_]*)/)
    return match ? match[1] : null
}

export const isClassNameLine = (line: string): boolean =>
    line.trim().startsWith('class_name')