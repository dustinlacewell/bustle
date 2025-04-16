import { GDScriptParserContext } from "../types.js"

/**
 * Checks if we've reached the end of the comment (newline)
 */
function isEndOfComment(char: string): boolean {
    return char === "\n"
}

/**
 * Checks if we've reached the end of the text
 */
function isEndOfText(i: number, textLength: number): boolean {
    return i >= textLength
}

/**
 * Updates the result string when not collecting results
 */
function updateResult(
    currentResult: string,
    char: string,
    shouldCollect: boolean
): string | undefined {
    if (!shouldCollect) {
        return currentResult + char
    }
    return undefined
}

/**
 * Handles a newline character in a comment
 */
function handleNewline(line: number): { line: number, col: number } {
    return {
        line: line + 1,
        col: 1
    }
}

/**
 * Updates column position for non-newline characters
 */
function updateColumn(col: number): number {
    return col + 1
}

/**
 * Processes a comment section
 */
export function processComment({ context }: { context: GDScriptParserContext }): Partial<GDScriptParserContext> {
    const updates: Partial<GDScriptParserContext> = {}
    let i = context.i

    while (!isEndOfText(i, context.text.length)) {
        const char = context.text[i]

        // Update result if needed
        const newResult = updateResult(
            updates.result || context.result,
            char,
            !!context.options?.collectResult
        )

        if (newResult !== undefined) {
            updates.result = newResult
        }

        // Handle end of comment
        if (isEndOfComment(char)) {
            i++
            const { line, col } = handleNewline(context.line)
            updates.line = line
            updates.col = col
            break
        }

        // Update position
        i++
        updates.col = updateColumn(updates.col || context.col)
    }

    updates.i = i
    return updates
}
