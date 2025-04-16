import { describe, expect, it } from "vitest"

import {
    applyGDScriptReplacements,
    countPrecedingBackslashes,
    detectTokens,
    isEscaped,
    isStringDelimiter,
    replaceTokens
} from "./replaceTokens.js"

describe("isStringDelimiter", () => {
    it("detects single and double quotes", () => {
        expect(isStringDelimiter("\"")).toBe(true)
        expect(isStringDelimiter("'")).toBe(true)
        expect(isStringDelimiter("a")).toBe(false)
        expect(isStringDelimiter(" ")).toBe(false)
    })
})

describe("countPrecedingBackslashes", () => {
    it("counts correctly", () => {
    // index points to the char after the last backslash to count
        expect(countPrecedingBackslashes("foo", 2)).toBe(0) // before 'o'
        expect(countPrecedingBackslashes("foo\\", 4)).toBe(1) // before last '\'
        expect(countPrecedingBackslashes("foo\\\\\"", 5)).toBe(2) // before '"' at index 5
        expect(countPrecedingBackslashes("foo\\\"", 4)).toBe(1) // before '"' at index 4
        expect(countPrecedingBackslashes("foo\\bar", 4)).toBe(1) // before 'b' at index 4
    })
    it("debug char codes", () => {
        const s = "foo\\bar"
        const codes = Array.from(s).map(c => c.charCodeAt(0))
        console.log(codes) // Should be [102, 111, 111, 92, 98, 97, 114]
    })
})

describe("isEscaped", () => {
    it("is true if odd number of backslashes", () => {
        expect(isEscaped("foo\\\"", 4)).toBe(true) // '\' before '"'
        expect(isEscaped("foo\\\\\"", 6)).toBe(false) // '\\' before '"'
    })
})

describe("applyGDScriptReplacements", () => {
    it("replaces tokens by word boundary", () => {
        expect(applyGDScriptReplacements("foo bar", { foo: "baz", bar: "qux" })).toBe("baz qux")
        expect(applyGDScriptReplacements("foobar", { foo: "baz" })).toBe("foobar")
    })
    it("respects identifier boundaries", () => {
        expect(applyGDScriptReplacements("foo_bar", { foo: "baz" })).toBe("foo_bar")
        expect(applyGDScriptReplacements("foo bar_foo", { foo: "baz" })).toBe("baz bar_foo")
    })
})

describe("detectTokens", () => {
    it("detects tokens outside of strings", () => {
        const input = "foo = bar; baz = foo;"
        const tokens = new Set(["foo", "bar", "baz"])
        expect(detectTokens(input, tokens)).toEqual(new Set(["foo", "bar", "baz"]))
    })
    it("does not detect tokens inside single-quoted strings", () => {
        const input = "foo = 'bar'; baz = 'foo'; qux = bar;"
        const tokens = new Set(["foo", "bar", "baz", "qux"])
        expect(detectTokens(input, tokens)).toEqual(new Set(["foo", "baz", "qux", "bar"]))
    })
    it("does not detect tokens inside double-quoted strings", () => {
        const input = "foo = \"bar\"; baz = \"foo\"; qux = bar;"
        const tokens = new Set(["foo", "bar", "baz", "qux"])
        expect(detectTokens(input, tokens)).toEqual(new Set(["foo", "baz", "qux", "bar"]))
    })
    it("handles escaped quotes inside strings", () => {
        const input = "foo = \"ba\\\"r\"; bar = 1;"
        const tokens = new Set(["foo", "bar"])
        expect(detectTokens(input, tokens)).toEqual(new Set(["foo", "bar"]))
    })
    it("handles unterminated string literals gracefully", () => {
        const input = "foo = \"bar"
        const tokens = new Set(["foo", "bar"])
        expect(detectTokens(input, tokens)).toEqual(new Set(["foo"]))
    })
    it("does not detect partial tokens", () => {
        const input = "foobar = barfoo; foo = 1;"
        const tokens = new Set(["foo", "bar"])
        expect(detectTokens(input, tokens)).toEqual(new Set(["foo"]))
    })
    it("debug output for tokens inside strings", () => {
        const input = "foo = 'bar'; baz = 'foo'; qux = bar;"
        const tokens = new Set(["foo", "bar", "baz", "qux"])
        const detected = detectTokens(input, tokens)
        console.log("Detected tokens:", Array.from(detected))
    })
    it("does not detect tokens that only appear inside string literals", () => {
        const input = `
      modloader.installScriptExtension("res://Autobot/extends/MLMainHook.gd")
      modloader.installScriptExtension("res://Autobot/extends/Main.gd")
      modloader.installScriptExtension("res://Autobot/extends/CharacterSelect.gd")
    `
        const tokens = new Set(["Autobot"])
        expect(detectTokens(input, tokens)).toEqual(new Set([]))
    })
})

describe("replaceTokens (integration)", () => {
    it("replaces tokens outside string literals", () => {
        const input = "foo = bar;"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = baz;")
    })

    it("does not replace tokens inside string literals (single quotes)", () => {
        const input = "foo = 'bar';"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = 'bar';")
    })

    it("does not replace tokens inside string literals (double quotes)", () => {
        const input = "foo = \"bar\";"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = \"bar\";")
    })

    it("replaces multiple tokens outside strings", () => {
        const input = "foo = bar + qux;"
        const output = replaceTokens(input, { bar: "baz", qux: "quux" })
        expect(output).toBe("foo = baz + quux;")
    })

    it("does not replace partial tokens", () => {
        const input = "foobar = barfoo;"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foobar = barfoo;")
    })

    it("handles escaped quotes inside strings", () => {
        const input = "foo = \"ba\\\"r\"; bar = 1;"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = \"ba\\\"r\"; baz = 1;")
    })

    it("handles code with no replacements", () => {
        const input = "foo = bar;"
        const output = replaceTokens(input, {})
        expect(output).toBe("foo = bar;")
    })

    it("handles unterminated string literals gracefully", () => {
        const input = "foo = \"bar"
        const output = replaceTokens(input, { foo: "baz", bar: "qux" })
        expect(output).toBe("foo = \"bar")
    })

    it("replaces tokens next to punctuation", () => {
        const input = "bar, bar; bar!"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("baz, baz; baz!")
    })

    it("replaces longer tokens before shorter ones", () => {
        const input = "foobar foo"
        const output = replaceTokens(input, { foobar: "baz", foo: "qux" })
        expect(output).toBe("baz qux")
    })

    it("handles nested strings and escapes", () => {
        const input = "foo = \"bar 'baz' qux\"; bar = 1;"
        const output = replaceTokens(input, { bar: "BAR", qux: "QUX" })
        expect(output).toBe("foo = \"bar 'baz' qux\"; BAR = 1;")
    })

    it("handles multiline input", () => {
        const input = "foo = \"bar\";\nbar = foo;"
        const output = replaceTokens(input, { foo: "baz", bar: "qux" })
        expect(output).toBe("baz = \"bar\";\nqux = baz;")
    })

    it("handles empty input", () => {
        expect(replaceTokens("", { foo: "bar" })).toBe("")
    })
})

describe("replaceTokens (comment handling)", () => {
    it("does not replace tokens inside comments", () => {
        const input = "foo = bar # bar should not be replaced"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = baz # bar should not be replaced")
    })

    it("does not replace tokens after # outside strings, even if # is not at line start", () => {
        const input = "foo = bar; # bar after comment"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = baz; # bar after comment")
    })

    it("does replace tokens before # and not after, even with multiple lines", () => {
        const input = "foo = bar\n# bar\nbar = foo # bar again"
        const output = replaceTokens(input, { bar: "baz", foo: "qux" })
        expect(output).toBe("qux = baz\n# bar\nbaz = qux # bar again")
    })

    it("does not treat # inside strings as a comment", () => {
        const input = "foo = \"bar # not a comment\"; bar = 1 # real comment"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = \"bar # not a comment\"; baz = 1 # real comment")
    })
})
