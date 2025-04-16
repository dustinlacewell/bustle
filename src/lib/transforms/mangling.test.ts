import { generateMangledName } from "./mangling.js"

describe("generateMangledName", () => {
    it("should append 4 uppercase letters to the class name", () => {
        const usedNames = new Set<string>()
        const className = "Foo"
        const mangled = generateMangledName(className, usedNames)
        expect(mangled).toMatch(/^Foo[A-Z]{4}$/)
    })

    it("should not return a name in usedNames", () => {
        // This test must check that the returned name was not in usedNames before the call.
        const initialNames = new Set<string>(["BarABCD"])
        const className = "Bar"
        let mangled
        // Try multiple times to ensure it skips usedNames
        for (let i = 0; i < 10; i++) {
            // Make a copy of the set before calling
            const before = new Set(initialNames)
            mangled = generateMangledName(className, initialNames)
            if (!before.has(mangled)) break
        }
        // The returned name should not have been in the set before the call
        expect(mangled).not.toBe("BarABCD")
    })

    it("should produce different names for different class names", () => {
        const usedNames = new Set<string>()
        const mangledFoo = generateMangledName("Foo", usedNames)
        const mangledBar = generateMangledName("Bar", usedNames)
        expect(mangledFoo.startsWith("Foo")).toBe(true)
        expect(mangledBar.startsWith("Bar")).toBe(true)
        expect(mangledFoo).not.toBe(mangledBar)
    })

    it("should avoid collisions with multiple usedNames", () => {
        const className = "Baz"
        // Add several possible mangled names to usedNames
        const initialNames = new Set<string>(["BazAAAA", "BazBBBB", "BazCCCC"])
        let mangled
        for (let i = 0; i < 10; i++) {
            const before = new Set(initialNames)
            mangled = generateMangledName(className, initialNames)
            if (!before.has(mangled)) break
        }
        expect(["BazAAAA", "BazBBBB", "BazCCCC"]).not.toContain(mangled)
        expect(mangled).toMatch(/^Baz[A-Z]{4}$/)
    })
})
