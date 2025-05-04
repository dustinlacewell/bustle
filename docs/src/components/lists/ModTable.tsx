import { useState, useRef, useEffect } from 'react'
import { Mod, SortConfig } from './types'
import styles from '../../pages/lists.module.css'

// Component to prefetch images
const ImagePrefetcher = ({ urls }: { urls: string[] }) => {
    return (
        <div style={{ display: 'none' }}>
            {urls.map((url, index) => (
                <img key={index} src={url} alt="" />
            ))}
        </div>
    )
}

interface ModTableProps {
    mods: Mod[]
    sortConfig: SortConfig | null
    onSort: (key: keyof Mod) => void
    onSelectMod: (mod: Mod) => void
}

const ModTable = ({ 
    mods, 
    sortConfig, 
    onSort,
    onSelectMod
}: ModTableProps) => {
    const [hoveredMod, setHoveredMod] = useState<Mod | null>(null)
    const [isExiting, setIsExiting] = useState(false)
    const [visibleMods, setVisibleMods] = useState<Mod[]>([])
    const previewRef = useRef<HTMLDivElement>(null)
    const tableRef = useRef<HTMLTableElement>(null)
    const tbodyRef = useRef<HTMLTableSectionElement>(null)
    const lastMousePos = useRef({ x: 0, y: 0 })
    
    // Use Intersection Observer to track visible rows
    useEffect(() => {
        if (!tbodyRef.current) return
        
        const options = {
            root: null,
            rootMargin: '100px', // Start loading a bit before they come into view
            threshold: 0.1
        }
        
        const rowElements = tbodyRef.current.querySelectorAll('tr')
        const visibleModIds = new Set<string>()
        
        const observer = new IntersectionObserver((entries) => {
            let hasChanges = false
            
            entries.forEach(entry => {
                const row = entry.target as HTMLTableRowElement
                const modId = row.dataset.modId
                
                if (modId) {
                    if (entry.isIntersecting) {
                        visibleModIds.add(modId)
                        hasChanges = true
                    } else {
                        if (visibleModIds.has(modId)) {
                            visibleModIds.delete(modId)
                            hasChanges = true
                        }
                    }
                }
            })
            
            if (hasChanges) {
                const newVisibleMods = mods.filter(mod => visibleModIds.has(mod.id))
                setVisibleMods(newVisibleMods)
            }
        }, options)
        
        rowElements.forEach(row => observer.observe(row))
        
        return () => observer.disconnect()
    }, [mods])
    
    const getClassNamesFor = (name: keyof Mod): string => {
        if (!sortConfig) {
            return ""
        }
        return sortConfig.key === name ? styles[sortConfig.direction] : ""
    }

    // Track mouse position globally without React state updates
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Store mouse position in ref (no state update)
            lastMousePos.current = { x: e.clientX, y: e.clientY }
            
            // Update preview position if it exists
            if (previewRef.current) {
                updatePreviewPosition(e.clientX, e.clientY)
            }
        }
        
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])
    
    // Update preview position directly without state updates
    const updatePreviewPosition = (x: number, y: number) => {
        if (!previewRef.current) return
        
        const windowWidth = window.innerWidth
        const previewWidth = 220
        
        let left = x + 20
        if (left + previewWidth > windowWidth) {
            left = x - previewWidth - 20
        }
        
        // Apply position directly to the element's style
        previewRef.current.style.top = `${y - 100}px`
        previewRef.current.style.left = `${left}px`
    }
    
    // Handle mouse enter/leave for the entire tbody
    useEffect(() => {
        if (!tbodyRef.current) return
        
        const handleMouseLeave = () => {
            if (!hoveredMod) return
            
            setIsExiting(true)
            setTimeout(() => {
                setHoveredMod(null)
                setIsExiting(false)
            }, 200) // Match the animation duration
        }
        
        tbodyRef.current.addEventListener('mouseleave', handleMouseLeave)
        return () => {
            if (tbodyRef.current) {
                tbodyRef.current.removeEventListener('mouseleave', handleMouseLeave)
            }
        }
    }, [hoveredMod])
    
    // Handle scroll events to hide the preview
    useEffect(() => {
        if (!hoveredMod) return
        
        const handleScroll = () => {
            if (hoveredMod) {
                setIsExiting(true)
                setTimeout(() => {
                    setHoveredMod(null)
                    setIsExiting(false)
                }, 200)
            }
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [hoveredMod])
    
    // Handle row hover
    const handleRowMouseEnter = (mod: Mod) => {
        if (isExiting) {
            setIsExiting(false)
        }
        
        // Position the preview immediately before setting hoveredMod
        // This prevents the preview from appearing at the top-left first
        requestAnimationFrame(() => {
            setHoveredMod(mod)
            // Use the last known mouse position for initial positioning
            if (previewRef.current) {
                updatePreviewPosition(lastMousePos.current.x, lastMousePos.current.y)
            }
        })
    }
    
    // Get preview URLs for visible mods
    const previewUrls = visibleMods
        .filter(mod => mod.previewUrl)
        .map(mod => mod.previewUrl as string)

    return (
        <div className={styles.tableWrapper}>
            {/* Prefetch images for visible rows */}
            <ImagePrefetcher urls={previewUrls} />
            
            <table ref={tableRef} className={styles.characterTable}>
                <thead>
                    <tr>
                        <th 
                            className={getClassNamesFor("title")} 
                            onClick={() => onSort("title")}
                        >
                            Title
                        </th>
                        <th 
                            className={getClassNamesFor("author")} 
                            onClick={() => onSort("author")}
                        >
                            Author
                        </th>
                        <th 
                            className={getClassNamesFor("id")} 
                            onClick={() => onSort("id")}
                        >
                            ID
                        </th>
                        <th 
                            className={getClassNamesFor("upvotes")} 
                            onClick={() => onSort("upvotes")}
                        >
                            Upvotes
                        </th>
                        <th 
                            className={getClassNamesFor("downvotes")} 
                            onClick={() => onSort("downvotes")}
                        >
                            Downvotes
                        </th>
                        <th 
                            className={getClassNamesFor("score")} 
                            onClick={() => onSort("score")}
                        >
                            Score
                        </th>
                        <th 
                            className={getClassNamesFor("subscriptions")} 
                            onClick={() => onSort("subscriptions")}
                        >
                            Subscriptions
                        </th>
                        <th 
                            className={getClassNamesFor("favorites")} 
                            onClick={() => onSort("favorites")}
                        >
                            Favorites
                        </th>
                        <th 
                            className={getClassNamesFor("created")} 
                            onClick={() => onSort("created")}
                        >
                            Created
                        </th>
                        <th 
                            className={getClassNamesFor("updated")} 
                            onClick={() => onSort("updated")}
                        >
                            Updated
                        </th>
                        <th 
                            className={getClassNamesFor("decay")} 
                            onClick={() => onSort("decay")}
                            title="Time in years since the mod was last updated"
                        >
                            Decay
                        </th>
                        <th 
                            className={getClassNamesFor("comments")} 
                            onClick={() => onSort("comments")}
                        >
                            Comments
                        </th>
                    </tr>
                </thead>
                <tbody ref={tbodyRef}>
                    {mods.map((mod) => (
                        <tr 
                            key={mod.id} 
                            className={styles.clickableRow}
                            onClick={() => onSelectMod(mod)}
                            onMouseEnter={() => handleRowMouseEnter(mod)}
                            data-mod-id={mod.id}
                        >
                            <td>{mod.title}</td>
                            <td>{mod.author}</td>
                            <td>{mod.id}</td>
                            <td>{mod.upvotes}</td>
                            <td>{mod.downvotes}</td>
                            <td>{parseFloat(mod.score.toString()).toFixed(2)}</td>
                            <td>{mod.subscriptions}</td>
                            <td>{mod.favorites}</td>
                            <td>{mod.created}</td>
                            <td>{mod.updated}</td>
                            <td>{mod.decay}</td>
                            <td>{mod.comments}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {hoveredMod && hoveredMod.previewUrl && (
                <div 
                    ref={previewRef}
                    className={isExiting ? `${styles.imagePreview} ${styles.imagePreviewExit}` : styles.imagePreview}
                    style={{ position: 'fixed' }}
                >
                    <img src={hoveredMod.previewUrl} alt={hoveredMod.title} />
                </div>
            )}
        </div>
    )
}

export default ModTable
