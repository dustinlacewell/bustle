// GDScript Type Stripping Utilities
// This module provides composable, well-named utilities for stripping type hints from GDScript code.
// Each transformation is focused and testable. The high-level function composes them for full-file processing.

export type ClassNames = string[]

/**
 * Remove a type hint (e.g., : Bar) from a variable, const, or onready declaration line.
 */
export function stripVarTypeHint(line: string, classNames: ClassNames): string {
    // Handles var, onready var, const
    return line.replace(
        new RegExp(`(:\\s*(${classNames.join("|")})\\b)`, "g"),
        ""
    )
}

/**
 * Remove type hints from a single parameter (e.g., foo: Bar = 5 => foo = 5)
 */
export function stringParamTypeHint(param: string, classNames: ClassNames): string {
    // Remove type hints in the form : TypeName (with optional whitespace)
    return param.replace(
        new RegExp(`(:\\s*(${classNames.join("|")})\\b)`, "g"),
        ""
    ).replace(/\s*=\s*/g, " = ").trim()
}

/**
 * Split a GDScript parameter list into individual parameters, respecting nested expressions and strings.
 */
export function splitParamList(classNames: string): string[] {
    const params = []
    let buf = ""
    let depth = 0
    let inString = false
    let stringChar = ""
    let prevChar = ""
    for (let i = 0; i < classNames.length; i++) {
        const c = classNames[i]
        const state = processParamListChar(c, { inString: inString, stringChar: stringChar, depth }, prevChar)
        inString = state.inString
        stringChar = state.stringChar
        depth = state.depth
        if (c === "," && depth === 0 && !inString) {
            params.push(buf)
            buf = ""
        }
        else {
            buf += c
        }
        prevChar = c
    }
    if (buf.trim()) params.push(buf)
    return params
}

function isStringChar(c: string): boolean {
    return c === "\"" || c === "'"
}

function isOpenParen(c: string): boolean {
    return c === "(" || c === "[" || c === "{"
}

function isCloseParen(c: string): boolean {
    return c === ")" || c === "]" || c === "}"
}

function updateStringState(c: string, inString: boolean, stringChar: string, prevChar: string): { inString: boolean, stringChar: string } {
    if (inString) {
        if (c === stringChar && prevChar !== "\\") return { inString: false, stringChar: "" }
        return { inString: inString, stringChar: stringChar }
    }
    else if (isStringChar(c)) {
        return { inString: true, stringChar: c }
    }
    return { inString: inString, stringChar: stringChar }
}

function processParamListChar(
    c: string,
    state: { inString: boolean, stringChar: string, depth: number },
    prevChar: string
): { inString: boolean, stringChar: string, depth: number } {
    let { inString, stringChar, depth } = state
    const stringState = updateStringState(c, inString, stringChar, prevChar)
    inString = stringState.inString
    stringChar = stringState.stringChar
    if (!inString) {
        if (isOpenParen(c)) depth++
        else if (isCloseParen(c)) depth--
    }
    return { inString, stringChar, depth }
}

function processSingleLineParamList(paramList: string, classNames: ClassNames): string {
    return splitParamList(paramList)
        .map(param => stringParamTypeHint(param, classNames))
        .filter(Boolean)
        .join(", ")
}

type StripFunc = (param: string) => string

function processMultiLineParam(line: string, stripAndFormat: StripFunc): string {
    const match = line.match(/^(\s*)/)
    const leading = match ? match[1] : ""
    let rest = line.trim()
    const hasComma = rest.endsWith(",")
    if (hasComma) rest = rest.slice(0, -1)
    const params = splitParamList(rest).map(stripAndFormat).filter(Boolean)
    let joined = params.join(", ")
    if (hasComma && joined) joined += ","
    return leading + joined
}

function addTrailingCommaIfMissing(line: string): string {
    return line && !line.trim().endsWith(",") ? line + "," : line
}

function fillEmptyLinesFromNonEmpty(paramLines: string[], nonEmpty: string[]): string[] {
    let idx = 0
    return paramLines.map(l => l.trim() === "" ? l : nonEmpty[idx++])
}

function ensureTrailingCommas(paramLines: string[]): string[] {
    let nonEmpty = paramLines.filter(l => l.trim() !== "")
    nonEmpty = nonEmpty.map((line, i, arr) =>
        i < arr.length - 1 ? addTrailingCommaIfMissing(line) : line
    )
    return fillEmptyLinesFromNonEmpty(paramLines, nonEmpty)
}

function processMultiLineParamList(paramList: string, classNames: ClassNames): string {
    const stripAndFormat = (param: string) => stringParamTypeHint(param, classNames)
    const lines = paramList.split("\n")
    const paramLines = lines.map(line => processMultiLineParam(line, stripAndFormat))
    const rebuilt = ensureTrailingCommas(paramLines)
    return rebuilt.join("\n")
}

/**
 * Remove type hints from a full parameter list (single or multi-line)
 */
export function stripParamListTypeHints(paramList: string, classNames: ClassNames): string {
    if (!paramList.includes("\n")) {
        return processSingleLineParamList(paramList, classNames)
    }
    else {
        return processMultiLineParamList(paramList, classNames)
    }
}

/**
 * Find all parameter list ranges (start/end indices) in a function/method signature string.
 */
function processFuncRegexMatch(signature: string, match: RegExpExecArray): { parenIdx: number, end: number } {
    const parenIdx = match.index + match[0].length - 1
    let depth = 1
    let end = parenIdx + 1
    while (end < signature.length && depth > 0) {
        if (signature[end] === "(") depth++
        else if (signature[end] === ")") depth--
        end++
    }
    return { parenIdx, end }
}

function processFuncRegex(signature: string, funcRegex: RegExp): Array<{ start: number, end: number }> {
    let match
    const ranges = []
    while ((match = funcRegex.exec(signature)) !== null) {
        const { parenIdx, end } = processFuncRegexMatch(signature, match)
        ranges.push({ start: parenIdx + 1, end: end - 1 })
    }
    return ranges
}

function findAllParameterListRanges(signature: string): Array<{ start: number, end: number }> {
    const funcRegex = /(def|func)\s+\w+\s*\(/g
    return processFuncRegex(signature, funcRegex)
}

function adjustRangeForOffset(range: { start: number, end: number }, offset: number) {
    return {
        start: range.start + offset,
        end: range.end + offset
    }
}

function stripAndReplaceParamList(
    signature: string,
    start: number,
    end: number,
    classNames: ClassNames
): { text: string, lastIndex: number } {
    const paramList = signature.slice(start, end)
    const stripped = stripParamListTypeHints(paramList, classNames)
    return {
        text: signature.slice(0, start) + stripped + signature.slice(end),
        lastIndex: start + stripped.length
    }
}

function processSingleParamListRange(
    result: string,
    offset: number,
    range: { start: number, end: number },
    classNames: ClassNames
): { result: string, offset: number } {
    const { start: adjStart, end: adjEnd } = adjustRangeForOffset(range, offset)
    const { text } = stripAndReplaceParamList(result, adjStart, adjEnd, classNames)
    return {
        result: text,
        offset: offset + text.length - result.length
    }
}

function processAllParamListRanges(
    signature: string,
    ranges: Array<{ start: number, end: number }>,
    classNames: ClassNames
): string {
    let result = signature
    let offset = 0
    for (const range of ranges) {
        ({ result, offset } = processSingleParamListRange(result, offset, range, classNames))
    }
    return result
}

/**
 * Remove type hints from all parameter lists and return types in a function/method signature.
 */
export function stripSignatureTypeHints(signature: string, classNames: ClassNames): string {
    const ranges = findAllParameterListRanges(signature)
    let result = processAllParamListRanges(signature, ranges, classNames)
    result = stripReturnTypeAnnotation(result, classNames)
    return result
}

function escapeRegexClassNames(classNames: string[]): string[] {
    return classNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
}

/**
 * Remove a return type annotation (e.g., ) -> Bar:) from a function/method signature line.
 */
export function stripReturnTypeAnnotation(line: string, classNames: ClassNames): string {
    // Handles any whitespace/newlines between ) and -> Type:
    const safeClassNames = escapeRegexClassNames(classNames).filter(Boolean)
    if (safeClassNames.length === 0) return line
    const pattern = `\\)\\s*\\n?\\s*->\\s*(${safeClassNames.join("|")})\\b\\s*:`
    try {
        return line.replace(new RegExp(pattern, "g"), "):")
    }
    catch (e) {
        console.error("Invalid regex in stripReturnTypeAnnotation:", pattern, e)
        return line
    }
}

/**
 * High-level: strip all type hints from a block of GDScript code.
 * Applies signature and variable/const/onready stripping.
 */
export function stripTypes(code: string, classNames: ClassNames): string {
    // 1. Strip type hints from all function/method signatures
    let output = code
    output = stripAllSignatures(output, classNames)
    // 2. Strip type hints from all var/onready/const declarations
    output = stripAllVars(output, classNames)
    return output
}

/**
 * Strip all function/method signatures in a file
 */
export function stripAllSignatures(code: string, classNames: ClassNames): string {
    // Replace each signature block
    const funcRegex = /(def|func)\s+\w+\s*\([^)]*\)[^\n]*:?/gm
    return code.replace(funcRegex, match => stripSignatureTypeHints(match, classNames))
}

/**
 * Strip all var/onready/const declarations in a file
 */
export function stripAllVars(code: string, classNames: ClassNames): string {
    return code.split("\n").map((line) => {
        if (/^\s*(var|onready var|const)\s+/.test(line)) {
            return stripVarTypeHint(line, classNames)
        }
        return line
    }).join("\n")
}

// Export internal helpers for testing only
export { processMultiLineParamList, processSingleLineParamList as processSingleLineParamList }
