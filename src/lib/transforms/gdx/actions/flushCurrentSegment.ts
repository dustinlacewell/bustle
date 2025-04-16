import { GDScriptParserContext } from "../types.js"

/**
 * Determines if the current segment needs processing
 */
function hasContentToProcess(segment: string): boolean {
    return segment.length > 0
}

/**
 * Handles the result when collecting results is enabled
 */
function handleCollectResult(
    results: string[],
    processed: string | void,
    _currentSegment: string
): Partial<GDScriptParserContext> {
    if (processed !== undefined) {
        return {
            results: [...results, processed],
            currentSegment: ""
        }
    }
    return { currentSegment: "" }
}

/**
 * Handles the result when collecting results is disabled
 */
function handleSingleResult(
    result: string,
    processed: string | void,
    _currentSegment: string
): Partial<GDScriptParserContext> {
    if (typeof processed === "string") {
        return {
            result: result + processed,
            currentSegment: ""
        }
    }
    return { currentSegment: "" }
}

/**
 * Flushes the current segment by processing it and adding to result/results
 */
export function flushCurrentSegment({ context }: { context: GDScriptParserContext }): Partial<GDScriptParserContext> {
    if (!hasContentToProcess(context.currentSegment)) {
        return {}
    }

    const processed = context.processor(
        context.currentSegment,
        { line: context.line, col: context.col }
    )

    if (context.options?.collectResult) {
        return handleCollectResult(context.results, processed, context.currentSegment)
    }

    return handleSingleResult(context.result, processed, context.currentSegment)
}
