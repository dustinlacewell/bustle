import { describe, expect, it } from "vitest"

import { moveExtendsToTop } from "./extends.js"

describe("moveExtendsToTop", () => {
    it("moves the extends line to the top", () => {
        const input = `class_name MyClass\n# comment\nextends Foo\nfunc bar():\n    pass`
        const expected = `extends Foo\nclass_name MyClass\n# comment\nfunc bar():\n    pass`
        expect(moveExtendsToTop(input)).toBe(expected)
    })

    it("does nothing if extends is already at the top", () => {
        const input = `extends Foo\nclass_name MyClass\nfunc _ready(): pass`
        expect(moveExtendsToTop(input)).toBe(input)
    })

    it("does nothing if there is no extends line", () => {
        const input = `class_name MyClass\nfunc _ready(): pass`
        expect(moveExtendsToTop(input)).toBe(input)
    })

    it("ignores commented extends lines", () => {
        const input = `# extends Foo\nclass_name MyClass\nfunc _ready(): pass`
        expect(moveExtendsToTop(input)).toBe(input)
    })

    it("moves only the first extends line if multiple are present", () => {
        const input = `class_name MyClass\nextends Foo\nfunc _ready(): pass\nextends Bar`
        const expected = `extends Foo\nclass_name MyClass\nfunc _ready(): pass\nextends Bar`
        expect(moveExtendsToTop(input)).toBe(expected)
    })
})
