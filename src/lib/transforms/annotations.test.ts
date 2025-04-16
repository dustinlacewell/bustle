import { describe, expect, it } from "vitest"

import {
    processMultiLineParamList,
    processSingleLineParamList,
    splitParamList,
    stringParamTypeHint,
    stripAllSignatures,
    stripAllVars,
    stripParamListTypeHints,
    stripReturnTypeAnnotation,
    stripSignatureTypeHints,
    stripTypes,
    stripVarTypeHint
} from "./annotations.js"

const classNames = ["Baz", "Bar", "Foo"]

describe("gdTypeStripper", () => {
    it("stripVarTypeHint removes type for listed class", () => {
        expect(stripVarTypeHint("var foo: Bar = 1", classNames)).toBe("var foo = 1")
        expect(stripVarTypeHint("const X: Foo = 2", classNames)).toBe("const X = 2")
        expect(stripVarTypeHint("onready var y: Baz = get()", classNames)).toBe("onready var y = get()")
        expect(stripVarTypeHint("var z: int = 3", classNames)).toBe("var z: int = 3")
    })

    it("stripParamTypeHint removes type for listed class", () => {
        expect(stringParamTypeHint("foo: Bar", classNames)).toBe("foo")
        expect(stringParamTypeHint("foo: Bar = 5", classNames)).toBe("foo = 5")
        expect(stringParamTypeHint("bar: Baz", classNames)).toBe("bar")
        expect(stringParamTypeHint("baz: int", classNames)).toBe("baz: int")
    })

    it("splitParamList splits params correctly", () => {
        expect(splitParamList("a, b, c")).toEqual(["a", " b", " c"])
        expect(splitParamList("a: Bar, b: Baz = 2")).toEqual(["a: Bar", " b: Baz = 2"])
        expect(splitParamList("a, b = (1, 2), c")).toEqual(["a", " b = (1, 2)", " c"])
        expect(splitParamList("foo(bar, baz), qux")).toEqual(["foo(bar, baz)", " qux"])
    })

    it("processSingleLineParamList strips types for listed classes", () => {
        expect(processSingleLineParamList("a: Bar, b: int, c: Baz", classNames)).toBe("a, b: int, c")
        expect(processSingleLineParamList("foo: Foo = 1, bar", classNames)).toBe("foo = 1, bar")
    })

    it("processMultiLineParamList strips types for listed classes", () => {
        const input = `    foo: Bar,\n    bar: Baz = 5,\n    baz: int = 6`
        const expected = `    foo,\n    bar = 5,\n    baz: int = 6`
        expect(processMultiLineParamList(input, classNames)).toBe(expected)
    })

    it("stripParamListTypeHints works for both single and multi-line", () => {
        expect(stripParamListTypeHints("foo: Bar, bar: Baz", classNames)).toBe("foo, bar")
        const multi = `  a: Bar,\n  b: Baz,\n  c: int`
        const multiExpected = `  a,\n  b,\n  c: int`
        expect(stripParamListTypeHints(multi, classNames)).toBe(multiExpected)
    })

    it("stripReturnTypeAnnotation removes return type for listed class", () => {
        expect(stripReturnTypeAnnotation(") -> Bar:", classNames)).toBe("):")
        expect(stripReturnTypeAnnotation(") -> int:", classNames)).toBe(") -> int:")
        expect(stripReturnTypeAnnotation(") -> Baz:", classNames)).toBe("):")
    })

    it("stripSignatureTypeHints strips param and return types", () => {
        expect(stripSignatureTypeHints("func foo(a: Bar, b: int) -> Baz:", classNames)).toBe("func foo(a, b: int):")
        expect(stripSignatureTypeHints("def bar(x: Foo, y: int) -> int:", classNames)).toBe("def bar(x, y: int) -> int:")
    })

    it("stripAllSignatures strips all function signatures in code", () => {
        const code = `func foo(a: Bar, b: int) -> Baz:\nfunc bar(x: Foo, y: int) -> int:`
        const expected = `func foo(a, b: int):\nfunc bar(x, y: int) -> int:`
        expect(stripAllSignatures(code, classNames)).toBe(expected)
    })

    it("stripAllVars strips all var/onready/const type hints", () => {
        const code = `var foo: Bar = 1\nonready var y: Baz = get()\nconst X: Foo = 2\nvar z: int = 3`
        const expected = `var foo = 1\nonready var y = get()\nconst X = 2\nvar z: int = 3`
        expect(stripAllVars(code, classNames)).toBe(expected)
    })

    it("stripTypes strips all types for listed classes in code", () => {
        const code = `func foo(a: Bar, b: int) -> Baz:\nvar foo: Bar = 1\nonready var y: Baz = get()\nconst X: Foo = 2`
        const expected = `func foo(a, b: int):\nvar foo = 1\nonready var y = get()\nconst X = 2`
        expect(stripTypes(code, classNames)).toBe(expected)
    })
})
