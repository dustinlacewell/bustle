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

interface SortIndicatorProps {
    column: string
    sortConfig: SortConfig | null
}

const SortIndicator = ({ column, sortConfig }: SortIndicatorProps) => {
    const isSorted = sortConfig?.key === column
    const direction = sortConfig?.direction

    return (
        <span className={styles.sortIndicator} style={{ opacity: isSorted ? 1 : 0 }}>
            <span className={styles.sortArrow}>{direction === 'ascending' ? '▲' : '▼'}</span>
        </span>
    )
}

interface ModTableProps {
    mods: Mod[]
    sortConfig: SortConfig | null
    onSort: (key: keyof Mod) => void
    onSelectMod: (mod: Mod) => void
    previewMode: 'hover' | 'inline'
}

const ModTable = ({
    mods,
    sortConfig,
    onSort,
    onSelectMod,
    previewMode
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

    // We don't need the getClassNamesFor function anymore since we're using the SortIndicator component
    // But we'll keep it for now with empty returns to avoid breaking existing code
    const getClassNamesFor = (name: string) => {
        return '';
    };

    // Track mouse position globally without React state updates
    useEffect(() => {
        if (previewMode !== 'hover') return

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
    }, [previewMode])

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
        if (previewMode !== 'hover' || !tbodyRef.current) return

        const handleMouseLeave = () => {
            if (!hoveredMod) return

            setIsExiting(true)
            setTimeout(() => {
                setHoveredMod(null)
                setIsExiting(false)
            }, 200) // Match the animation duration
        }

        const handleScroll = () => {
            if (hoveredMod) {
                setIsExiting(true)
                setTimeout(() => {
                    setHoveredMod(null)
                    setIsExiting(false)
                }, 200)
            }
        }

        tbodyRef.current.addEventListener('mouseleave', handleMouseLeave)
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            if (tbodyRef.current) {
                tbodyRef.current.removeEventListener('mouseleave', handleMouseLeave)
            }
            window.removeEventListener('scroll', handleScroll)
        }
    }, [hoveredMod, previewMode])

    // Handle row hover
    const handleRowMouseEnter = (mod: Mod) => {
        if (previewMode !== 'hover') return

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

    // Render thumbnail for inline preview mode
    const renderThumbnail = (mod: Mod) => {
        if (!mod.previewUrl) {
            return <div className={styles.inlinePreviewPlaceholder} />
        }

        return (
            <div className={styles.inlinePreview}>
                <img src={mod.previewUrl} alt={mod.title} />
            </div>
        )
    }

    const formatDate = (date: string) => {
        return date;
    }

    return (
        <div className={styles.tableWrapper}>
            {/* Prefetch images for visible rows */}
            <ImagePrefetcher urls={previewUrls} />

            <table ref={tableRef} className={styles.characterTable}>
                <thead>
                    <tr>
                        {previewMode === 'inline' && (
                            <th className={styles.colPreview}>
                                {/* photo emoji */}
                                <div>📸</div>                                
                            </th>
                        )}
                        <th
                            className={styles.colTitle}
                            onClick={() => onSort("title")}
                        >
                            Title
                            <SortIndicator column="title" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colAuthor}
                            onClick={() => onSort("author")}
                        >
                            Author
                            <SortIndicator column="author" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colId}
                            onClick={() => onSort("id")}
                        >
                            ID
                            <SortIndicator column="id" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colUpvotes}
                            onClick={() => onSort("upvotes")}
                        >
                            Upvotes
                            <SortIndicator column="upvotes" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colDownvotes}
                            onClick={() => onSort("downvotes")}
                        >
                            Downvotes
                            <SortIndicator column="downvotes" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colScore}
                            onClick={() => onSort("score")}
                        >
                            Score
                            <SortIndicator column="score" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colSubscriptions}
                            onClick={() => onSort("subscriptions")}
                        >
                            Subscriptions
                            <SortIndicator column="subscriptions" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colFavorites}
                            onClick={() => onSort("favorites")}
                        >
                            Favorites
                            <SortIndicator column="favorites" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colCreated}
                            onClick={() => onSort("created")}
                        >
                            Created
                            <SortIndicator column="created" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colUpdated}
                            onClick={() => onSort("updated")}
                        >
                            Updated
                            <SortIndicator column="updated" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colDecay}
                            onClick={() => onSort("decay")}
                            title="Time in years since the mod was last updated"
                        >
                            Decay
                            <SortIndicator column="decay" sortConfig={sortConfig} />
                        </th>
                        <th
                            className={styles.colComments}
                            onClick={() => onSort("comments")}
                        >
                            Comments
                            <SortIndicator column="comments" sortConfig={sortConfig} />
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
                            {previewMode === 'inline' && (
                                <td className={styles.previewCell}>
                                    {renderThumbnail(mod)}
                                </td>
                            )}
                            <td className={styles.colTitle}>
                                {mod.title}
                            </td>
                            <td className={styles.colAuthor}>{mod.author}</td>
                            <td className={styles.colId}>{mod.id}</td>
                            <td className={styles.colUpvotes}>{mod.upvotes.toLocaleString()}</td>
                            <td className={styles.colDownvotes}>{mod.downvotes.toLocaleString()}</td>
                            <td className={styles.colScore}>{parseFloat(mod.score.toString()).toFixed(2)}</td>
                            <td className={styles.colSubscriptions}>{mod.subscriptions.toLocaleString()}</td>
                            <td className={styles.colFavorites}>{mod.favorites.toLocaleString()}</td>
                            <td className={styles.colCreated}>{formatDate(mod.created)}</td>
                            <td className={styles.colUpdated}>{formatDate(mod.updated)}</td>
                            <td className={styles.colDecay}>{Number(mod.decay).toFixed(1)}</td>
                            <td className={styles.colComments}>{mod.comments.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {previewMode === 'hover' && hoveredMod && hoveredMod.previewUrl && (
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
