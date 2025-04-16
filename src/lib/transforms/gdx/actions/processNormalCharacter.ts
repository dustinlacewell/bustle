import { GDScriptParserContext } from "../types.js"

/**
 * Processes a normal character (not in a string or comment)
 */
export function processNormalCharacter({ context }: { context: GDScriptParserContext }) {
    const char = context.text[context.i]
    const updates: Partial<GDScriptParserContext> = {
        currentSegment: context.currentSegment + char,
        i: context.i + 1
    }

    if (char === "\n") {
        updates.inString = false
        updates.stringDelimiter = null
        updates.unterminatedStringStart = null
        updates.line = context.line + 1
        updates.col = 1
    }
    else {
        updates.col = context.col + 1
    }

    return updates
}
