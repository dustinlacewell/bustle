import { describe, expect, it } from "vitest"

import { replaceTokens } from "./replaceTokens.js"

describe("replaceTokens", () => {
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

    it("handles multiple escaped quotes inside strings", () => {
        const input = "foo = \"ba\\\"r and \\\"bar\\\" end\"; bar = 1;"
        const output = replaceTokens(input, { bar: "baz" })
        expect(output).toBe("foo = \"ba\\\"r and \\\"bar\\\" end\"; baz = 1;")
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
        const output = replaceTokens(input, { foobar: "bazbaz", foo: "baz" })
        expect(output).toBe("bazbaz baz")
    })
})
