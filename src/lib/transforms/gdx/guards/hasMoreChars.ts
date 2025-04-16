import { GDScriptParserContext } from "../types.js"

/**
 * Checks if there are more characters to process
 */
export function hasMoreChars({ context }: { context: GDScriptParserContext }) {
    return context.i < context.text.length
}
