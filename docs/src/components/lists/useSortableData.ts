import { useState, useMemo } from 'react'
import { Mod, SortConfig } from './types'

const useSortableData = (items: Mod[], config: SortConfig | null = null) => {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(config)
    
    const sortedItems = useMemo(() => {
        const sortableItems = [...items]
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key]
                const bValue = b[sortConfig.key]
                
                // Handle numeric comparisons
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === "ascending" 
                        ? aValue - bValue 
                        : bValue - aValue
                }
                
                // Handle string comparisons
                const aString = String(aValue).toLowerCase()
                const bString = String(bValue).toLowerCase()
                
                if (aString < bString) {
                    return sortConfig.direction === "ascending" ? -1 : 1
                }
                if (aString > bString) {
                    return sortConfig.direction === "ascending" ? 1 : -1
                }
                return 0
            })
        }
        return sortableItems
    }, [items, sortConfig])

    const requestSort = (key: keyof Mod) => {
        let direction: 'ascending' | 'descending' = "descending"
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "descending"
        ) {
            direction = "ascending"
        }
        setSortConfig({ key, direction })
    }

    return { items: sortedItems, requestSort, sortConfig }
}

export default useSortableData
