import { GDScriptParserContext } from "../types.js"
import { isEscapedChar, isStringDelimiterChar } from "../utils.js"

/**
 * Processes a character inside a string literal
 */
export function processInsideString({ context }: { context: GDScriptParserContext }) {
    const char = context.text[context.i]
    const isDelimiter = isStringDelimiterChar(char)
    const isCharEscaped = isEscapedChar(context.text, context.i)

    const updates: Partial<GDScriptParserContext> = {
        result: !context.options?.collectResult ? context.result + char : context.result,
        i: context.i + 1
    }

    if (isDelimiter && !isCharEscaped && char === context.stringDelimiter) {
        updates.inString = false
        updates.stringDelimiter = null
        updates.unterminatedStringStart = null
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
