// Utility functions for GDScript processing

/**
 * Checks if a character is a string delimiter
 */
export function isStringDelimiterChar(char: string): boolean {
    return char === "\"" || char === "'"
}

/**
 * Counts the number of backslashes preceding a character at a given index
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
 * Determines if a character is escaped by a backslash
 */
export function isEscapedChar(text: string, index: number): boolean {
    return countPrecedingBackslashes(text, index) % 2 === 1
}
