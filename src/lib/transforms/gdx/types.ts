/**
 * Context type for the GDScript parser state machine
 */
export type GDScriptParserContext = {
    text: string
    processor: (segment: string, ctx: { line: number, col: number }) => string | void
    options?: { collectResult?: boolean }
    result: string
    results: string[]
    currentSegment: string
    inString: boolean
    stringDelimiter: string | null
    unterminatedStringStart: number | null
    i: number
    line: number
    col: number
}
