import { GDScriptParserContext } from "../types.js"

/**
 * Handles the start of a string literal
 */
export function startString({ context }: { context: GDScriptParserContext }) {
    const char = context.text[context.i]
    return {
        inString: true,
        stringDelimiter: char,
        result: !context.options?.collectResult ? context.result + char : context.result,
        unterminatedStringStart: context.i,
        i: context.i + 1,
        col: context.col + 1
    }
}
