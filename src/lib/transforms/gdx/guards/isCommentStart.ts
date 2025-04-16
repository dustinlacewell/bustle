import { GDScriptParserContext } from "../types.js"

/**
 * Checks if the current character is the start of a comment
 */
export function isCommentStart({ context }: { context: GDScriptParserContext }) {
    const char = context.text[context.i]
    return !context.inString && char === "#"
}
