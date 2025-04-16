import { readFile } from "fs/promises"
import { describe, expect, it, vi } from "vitest"

import * as fsUtils from "@/lib/fs-utils.js"
import * as pathUtils from "@/lib/path-utils.js"

import { findClassName, locateGDFiles, locateTSCNFiles } from "./mapping.js"

// --- Fix for fs/promises mocking ---
vi.mock("fs/promises", () => ({
    readFile: vi.fn()
}))

vi.mock("@/lib/fs-utils.js")

describe("locateGDFiles", () => {
    it("should call getFilesRecursively with the correct arguments", async () => {
        const mockGetFilesRecursively = vi.spyOn(fsUtils, "getFilesRecursively").mockResolvedValue(["file1.gd", "file2.gd"])
        const result = await locateGDFiles("testDir")
        expect(mockGetFilesRecursively).toHaveBeenCalledWith("testDir", ".gd")
        expect(result).toEqual(["file1.gd", "file2.gd"])
    })
})

describe("locateTSCNFiles", () => {
    it("should call getFilesRecursively with the correct arguments", async () => {
        const mockGetFilesRecursively = vi.spyOn(fsUtils, "getFilesRecursively").mockResolvedValue(["file1.tscn", "file2.tscn"])
        const result = await locateTSCNFiles("testDir")
        expect(mockGetFilesRecursively).toHaveBeenCalledWith("testDir", ".tscn")
        expect(result).toEqual(["file1.tscn", "file2.tscn"])
    })
})

describe("findClassName", () => {
    it("should return the class name when `class_name` is found", () => {
        const text = "class_name MyClass"
        const result = findClassName(text)
        expect(result).toBe("MyClass")
    })

    it("should return null when `class_name` is not found", () => {
        const text = "some other text"
        const result = findClassName(text)
        expect(result).toBe(null)
    })
})

describe("buildClassMap", () => {
    const mockFiles = [
        "/some/path/Alpha.gd",
        "/some/path/Beta.gd",
        "/some/path/NoClass.gd"
    ]
    const fileContents: Record<string, string> = {
        "/some/path/Alpha.gd": "class_name Alpha\nvar x = 1",
        "/some/path/Beta.gd": "class_name Beta\nvar y = 2",
        "/some/path/NoClass.gd": "var z = 3"
    }

    beforeEach(() => {
        vi.resetAllMocks()
        vi.spyOn(fsUtils, "getFilesRecursively").mockResolvedValue(mockFiles)
        vi.spyOn(pathUtils, "makeRelativePath").mockImplementation((file: string, dir: string) => file.replace(dir, ""));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (readFile as any).mockImplementation((file: any) => Promise.resolve(fileContents[file as string]))
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("should build a class map for files with class_name", async () => {
        const { buildClassMap } = await import("./mapping.js")
        const result = await buildClassMap("/some/path")
        expect(result).toEqual({
            Alpha: "/Alpha.gd",
            Beta: "/Beta.gd"
        })
        expect(fsUtils.getFilesRecursively).toHaveBeenCalledWith("/some/path", ".gd")
        expect(pathUtils.makeRelativePath).toHaveBeenCalledTimes(2)
    })

    it("should return an empty object if no files have class_name", async () => {
        vi.spyOn(fsUtils, "getFilesRecursively").mockResolvedValue(["/some/path/NoClass.gd"]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (readFile as any).mockResolvedValue("var z = 3")
        const { buildClassMap } = await import("./mapping.js")
        const result = await buildClassMap("/some/path")
        expect(result).toEqual({})
    })
})
