import { Table } from "console-table-printer"

const colors = [
    "red",
    "green",
    "yellow",
    "white",
    "blue",
    "magenta",
    "cyan",
    "white_bold"
]

function hashStringToColorIndex(str: string, colorArrayLength: number) {
    // Simple hash function that sums character codes
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
    }

    // Ensure positive value and get modulo to fit any array length
    return Math.abs(hash) % colorArrayLength
}

const getColorForString = (str: string, colors: string[]) => {
    const index = hashStringToColorIndex(str, colors.length)
    return colors[index]
}

export const printTable = <T extends object>(results: T[], fields: Array<keyof T>) => {
    const table = new Table({
        columns: [
            ...fields.map(field => ({
                name: field.toString(),
                color: getColorForString(field.toString(), colors)
            }))
        ]
    })

    results.forEach((item) => {
        const data = {} as Record<keyof T, string>
        fields.forEach((field) => {
            const value = item[field]
            data[field] = String(typeof value === "number" ? value.toFixed(2) : value)
        })
        table.addRow(data)
    })
    table.printTable()
}
