import { GDScriptParserContext } from "../types.js"

/**
 * Checks if we are currently inside a string
 */
export function isInString({ context }: { context: GDScriptParserContext }) {
    return context.inString
}
