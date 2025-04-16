import { GDScriptParserContext } from "../types.js"
import { isEscapedChar, isStringDelimiterChar } from "../utils.js"

/**
 * Checks if the current character is a string delimiter
 */
export function isStringDelimiter({ context }: { context: GDScriptParserContext }) {
    const char = context.text[context.i]
    return !context.inString && isStringDelimiterChar(char) && !isEscapedChar(context.text, context.i)
}
