import { processGDScript } from "./gdx/index.js"

/**
 * Applies a number of replacements to some text, but only when they are not within string literals.
 *
 * @param text The input GDScript code to process
 * @param replacements A record with tokens as keys and their replacements as values
 * @returns A new string with replacements applied
 */
export function replaceTokens(
    text: string,
    replacements: Record<string, string>
): string {
    return processGDScript(
        text,
        segment => applyGDScriptReplacements(segment, replacements)
    ) as string
}

/**
 * Detects which tokens from a set are present in the text, but only outside of string literals.
 * @param text The input GDScript code to process
 * @param tokens The set of tokens to detect
 * @returns A set of tokens found outside of string literals
 */
export function detectTokens(text: string, tokens: Set<string>): Set<string> {
    const found = new Set<string>()
    processGDScript(
        text,
        segment => scanSegmentForTokens(segment, tokens, found)
    )
    return found
}

/**
 * Determines if a character is a string delimiter
 *
 * @param char The character to check
 * @returns True if the character is a string delimiter, false otherwise
 */
export function isStringDelimiter(char: string): boolean {
    return char === "\"" || char === "'"
}

/**
 * Counts consecutive backslashes before a given index
 *
 * @param text The text to search
 * @param index The index to start from
 * @returns The number of consecutive backslashes
 */
export function countPrecedingBackslashes(text: string, index: number): number {
    let count = 0
    let j = index - 1
    while (j >= 0 && text[j] === "\\") {
        count++
        j--
    }
    return count
}

/**
 * Determines if a character at index is escaped
 *
 * @param text The text to search
 * @param index The index to check
 * @returns True if the character is escaped, false otherwise
 */
export function isEscaped(text: string, index: number): boolean {
    return countPrecedingBackslashes(text, index) % 2 === 1
}

/**
 * Applies GDScript identifier replacements to a text segment
 *
 * @param segment The text segment to process
 * @param replacements Record mapping tokens to their replacements
 * @returns The processed text with all replacements applied
 */
export function applyGDScriptReplacements(
    segment: string,
    replacements: Record<string, string>
): string {
    let result = segment

    for (const token of Object.keys(replacements).sort((a, b) => b.length - a.length)) {
        // Create a regex that matches complete GDScript identifiers
        // GDScript identifiers can include letters, digits, and underscores, but can't start with a digit
        const tokenRegex = new RegExp(`\\b${token}\\b`, "g")
        result = result.replace(tokenRegex, replacements[token])
    }

    return result
}

/**
 * Scans a segment for tokens and adds found tokens to the result set.
 * @param segment The text segment to scan
 * @param tokens The set of tokens to detect
 * @param found The set to add found tokens to
 */
export function scanSegmentForTokens(segment: string, tokens: Set<string>, found: Set<string>): void {
    for (const token of tokens) {
        const tokenRegex = new RegExp(`\\b${token}\\b`)
        if (tokenRegex.test(segment)) {
            found.add(token)
        }
    }
}
