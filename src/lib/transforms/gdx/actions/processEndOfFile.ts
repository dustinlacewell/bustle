import { GDScriptParserContext } from "../types.js"

/**
 * Processes the end of file condition
 */
export function processEndOfFile({ context }: { context: GDScriptParserContext }) {
    if (context.unterminatedStringStart !== null && !context.options?.collectResult) {
        return { result: context.text }
    }
    return {}
}
