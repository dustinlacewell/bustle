import { Mod, CommunityList } from './types'

export const fetchMods = async (): Promise<Mod[]> => {
    try {
        // Fetch the raw text first
        const response = await fetch("/mods.json")
        if (!response.ok) {
            console.error("Failed to fetch mods:", response.statusText)
            return []
        }
        
        const text = await response.text()
        
        // Find the start of the JSON array
        const arrayStart = text.indexOf('[')
        if (arrayStart === -1) {
            console.error("Could not find start of array in mods.json")
            return []
        }
        
        // Parse only the array part
        try {
            const jsonText = text.substring(arrayStart)
            const data = JSON.parse(jsonText)
            
            if (Array.isArray(data)) {
                return data
            } else {
                console.error("Parsed data is not an array:", data)
                return []
            }
        } catch (parseError) {
            console.error("Error parsing JSON array:", parseError)
            return []
        }
    } catch (error) {
        console.error("Error fetching mods:", error)
        return []
    }
}

export const fetchCommunityLists = async (): Promise<CommunityList[]> => {
    const response = await fetch("https://raw.githubusercontent.com/dustinlacewell/bustle-community-lists/main/lists.txt")
    const text = await response.text()
    return text.split("\n")
        .filter(line => line.trim() !== "")
        .map(line => {
            const [filename, description] = line.split(" ", 2)
            const restOfDescription = line.substring(filename.length + 1)
            
            // Get base name without extension and capitalize it
            const baseName = filename.replace(/\.txt$/, "")
            const capitalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1)
            
            return {
                filename,
                baseName,
                displayName: capitalizedName,
                description: restOfDescription
            }
        })
}

export const fetchCommunityList = async (filename: string): Promise<string[]> => {
    const response = await fetch(`https://raw.githubusercontent.com/dustinlacewell/bustle-community-lists/main/lists/${filename}`)
    const text = await response.text()
    return text.split("\n")
        .filter(line => line.trim() !== "")
        .map(line => line.trim()) // Ensure IDs are trimmed
}

export const normalizeId = (id: string | number): string => {
    return String(id).trim()
}

export const calculateDecay = (updatedTimestamp: number): string => {
    const now = new Date()
    const updated = new Date(updatedTimestamp * 1000)
    const diffInMs = now.getTime() - updated.getTime()
    const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25)
    return diffInYears.toFixed(2)
}
