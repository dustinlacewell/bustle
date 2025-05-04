import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import { useEffect, useState, useMemo, useCallback } from "react"

import styles from "./lists.module.css"

interface Character {
    id: string
    author: string
    subscriptions: string
    favorites: string
    followers: string
    uniqueSubscriptions: string
    uniqueFavorites: string
    uniqueFollowers: string
    uniqueWebsiteViews: string
    reportScore: string
    secondsPlayed: string
    playtimeSessions: string
    comments: string
    secondsPlayedDuringTimePeriod: string
    playtimeSessionsDuringTimePeriod: string
    publishedFileId: string
    creatorAppId: number
    consumerAppId: number
    title: string
    description: string
    owner: {
        steamId64: string
        steamId32: string
        accountId: number
    }
    timeCreated: number
    timeUpdated: number
    timeAddedToUserList: number
    visibility: number
    banned: boolean
    acceptedForUse: boolean
    tags: string[]
    tagsTruncated: boolean
    url: string
    numUpvotes: number
    numDownvotes: number
    numChildren: number
    previewUrl: string
    upvotes: number
    downvotes: number
    score: number
    created: string
    updated: string
    decay: string
    uniqueViews: string
    playtime: string
    sessions: string
    votes: string
}

interface CommunityList {
    filename: string
    baseName: string
    displayName: string
    description: string
}

interface SortConfig {
    key: keyof Character
    direction: 'ascending' | 'descending'
}

const fetchCharacters = async (): Promise<Character[]> => {
    try {
        // Fetch the raw text first
        const response = await fetch("/characters.json")
        if (!response.ok) {
            console.error("Failed to fetch characters:", response.statusText)
            return []
        }
        
        const text = await response.text()
        
        // Find the start of the JSON array
        const arrayStart = text.indexOf('[')
        if (arrayStart === -1) {
            console.error("Could not find start of array in characters.json")
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
        console.error("Error fetching characters:", error)
        return []
    }
}

const fetchCommunityLists = async (): Promise<CommunityList[]> => {
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

const fetchCommunityList = async (filename: string): Promise<string[]> => {
    const response = await fetch(`https://raw.githubusercontent.com/dustinlacewell/bustle-community-lists/main/lists/${filename}`)
    const text = await response.text()
    return text.split("\n")
        .filter(line => line.trim() !== "")
        .map(line => line.trim()) // Ensure IDs are trimmed
}

const normalizeId = (id: string | number): string => {
    return String(id).trim()
}

const calculateDecay = (updatedTimestamp: number): string => {
    const now = new Date()
    const updated = new Date(updatedTimestamp * 1000)
    const diffInMs = now.getTime() - updated.getTime()
    const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25)
    return diffInYears.toFixed(2)
}

interface CharacterModalProps {
    character: Character | null
    onClose: () => void
}

const CharacterModal = ({ character, onClose }: CharacterModalProps) => {
    if (!character) return null
    
    // Close modal when clicking outside content
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }
    
    // Close modal on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])
    
    // Format timestamp to readable date
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString()
    }
    
    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <button className={styles.modalClose} onClick={onClose}>×</button>
                
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderLeft}>
                        <h2 className={styles.modalTitle}>{character.title}</h2>
                        <div>by {character.author}</div>
                    </div>
                    
                    {character.tags && character.tags.length > 0 && (
                        <div className={styles.modalTags}>
                            {character.tags.map((tag, index) => (
                                <span key={index} className={styles.modalTag}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className={styles.modalLayout}>
                    <div className={styles.modalInfoColumn}>
                        <div className={styles.modalInfoGrid}>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>ID</span>
                                <span className={styles.modalInfoValue}>{character.publishedFileId}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Views</span>
                                <span className={styles.modalInfoValue}>{character.uniqueViews}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Votes</span>
                                <span className={styles.modalInfoValue}>{character.upvotes} / {character.downvotes}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Score</span>
                                <span className={styles.modalInfoValue}>{parseFloat(character.score.toString()).toFixed(2)}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Subscriptions</span>
                                <span className={styles.modalInfoValue}>{character.subscriptions}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Favorites</span>
                                <span className={styles.modalInfoValue}>{character.favorites}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Created</span>
                                <span className={styles.modalInfoValue}>{character.created}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Updated</span>
                                <span className={styles.modalInfoValue}>{character.updated}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Comments</span>
                                <span className={styles.modalInfoValue}>{character.comments}</span>
                            </div>
                            
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Workshop</span>
                                <a 
                                    href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${character.publishedFileId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View on Steam
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    {character.previewUrl && (
                        <div className={styles.modalImageColumn}>
                            <img 
                                src={character.previewUrl} 
                                alt={character.title} 
                                className={styles.modalImage}
                            />
                        </div>
                    )}
                </div>
                
                {character.description && (
                    <div className={styles.modalDescription}>
                        <h3>Description</h3>
                        <div>{character.description}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

interface CharacterTableProps {
    characters: Character[]
    sortConfig: SortConfig | null
    onSort: (key: keyof Character) => void
    onSelectCharacter: (character: Character) => void
}

const CharacterTable = ({ 
    characters, 
    sortConfig, 
    onSort,
    onSelectCharacter
}: CharacterTableProps) => {
    const getClassNamesFor = (name: keyof Character): string => {
        if (!sortConfig) {
            return ""
        }
        return sortConfig.key === name ? styles[sortConfig.direction] : ""
    }

    return (
        <table className={styles.characterTable}>
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
                    >
                        Decay (years)
                    </th>
                    <th 
                        className={getClassNamesFor("comments")} 
                        onClick={() => onSort("comments")}
                    >
                        Comments
                    </th>
                </tr>
            </thead>
            <tbody>
                {characters.map((character) => (
                    <tr 
                        key={character.id} 
                        className={styles.clickableRow}
                        onClick={() => onSelectCharacter(character)}
                    >
                        <td>{character.title}</td>
                        <td>{character.author}</td>
                        <td>{character.id}</td>
                        <td>{character.upvotes}</td>
                        <td>{character.downvotes}</td>
                        <td>{parseFloat(character.score.toString()).toFixed(2)}</td>
                        <td>{character.subscriptions}</td>
                        <td>{character.favorites}</td>
                        <td>{character.created}</td>
                        <td>{character.updated}</td>
                        <td>{character.decay}</td>
                        <td>{character.comments}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

const useSortableData = (items: Character[], config: SortConfig | null = null) => {
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

    const requestSort = (key: keyof Character) => {
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

interface CharacterControlsProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    communityLists: CommunityList[]
    selectedList: string
    setSelectedList: (list: string) => void
}

const CharacterControls = ({ 
    searchTerm, 
    setSearchTerm, 
    communityLists, 
    selectedList, 
    setSelectedList 
}: CharacterControlsProps) => {
    return (
        <div className={styles.controls}>
            <div className={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={styles.listSelector}>
                <select 
                    value={selectedList} 
                    onChange={(e) => setSelectedList(e.target.value)}
                >
                    <option value="">All Characters</option>
                    {communityLists.map((list) => (
                        <option key={list.filename} value={list.filename}>
                            {list.displayName}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

const CommunityLists = () => {
    const [characters, setCharacters] = useState<Character[]>([])
    const [communityLists, setCommunityLists] = useState<CommunityList[]>([])
    const [selectedList, setSelectedList] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [listItems, setListItems] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [charactersData, listsData] = await Promise.all([
                    fetchCharacters(),
                    fetchCommunityLists()
                ])
                
                // Add decay calculation to each character
                const processedCharacters = charactersData.map(char => ({
                    ...char,
                    decay: calculateDecay(char.timeUpdated)
                }))
                
                setCharacters(processedCharacters)
                setCommunityLists(listsData)
                setLoading(false)
            } catch (error) {
                console.error("Error loading data:", error)
                setLoading(false)
            }
        }
        
        loadData()
    }, [])

    useEffect(() => {
        const loadListItems = async () => {
            if (selectedList) {
                try {
                    const items = await fetchCommunityList(selectedList)
                    console.log(`Loaded ${items.length} items from list ${selectedList}:`, items)
                    setListItems(items)
                } catch (error) {
                    console.error(`Error loading list ${selectedList}:`, error)
                    setListItems([])
                }
            } else {
                setListItems([])
            }
        }
        
        loadListItems()
    }, [selectedList])

    const filteredCharacters = useMemo(() => {
        const filtered = characters.filter(character => {
            const matchesSearch = searchTerm === "" || 
                character.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                character.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                character.id.includes(searchTerm)
            
            // Check if the character's publishedFileId is in the list
            // Both need to be strings for the comparison
            const matchesList = selectedList === "" || 
                listItems.some(item => normalizeId(item) === normalizeId(character.publishedFileId))
            
            return matchesSearch && matchesList
        })
        
        if (selectedList && listItems.length > 0) {
            console.log(`Filtered ${filtered.length} characters from ${characters.length} total`)
            
            // Debug the first few items that should match but don't
            if (filtered.length === 0) {
                console.log("List items:", listItems)
                console.log("Sample character publishedFileIds:", 
                    characters.slice(0, 5).map(c => c.publishedFileId))
            }
        }
        
        return filtered
    }, [characters, searchTerm, selectedList, listItems])

    const { items: sortedCharacters, requestSort, sortConfig } = useSortableData(filteredCharacters)

    const handleSelectCharacter = useCallback((character: Character) => {
        setSelectedCharacter(character)
    }, [])
    
    const handleCloseModal = useCallback(() => {
        setSelectedCharacter(null)
    }, [])

    const { siteConfig } = useDocusaurusContext()
    
    return (
        <Layout
            description="Bustle Community Character Lists"
        >
            <div className={styles.container}>
                <h1>Community Character Lists</h1>
                
                {loading ? (
                    <div className={styles.loading}>Loading character data...</div>
                ) : (
                    <>
                        <CharacterControls 
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            communityLists={communityLists}
                            selectedList={selectedList}
                            setSelectedList={setSelectedList}
                        />
                        
                        <div className={styles.selectedListDescription}>
                            {selectedList ? (
                                <>
                                    <h2>
                                        {communityLists.find(list => list.filename === selectedList)?.displayName}
                                    </h2>
                                    <p>{communityLists.find(list => list.filename === selectedList)?.description}</p>
                                </>
                            ) : (
                                <>
                                    <h2>All Characters</h2>
                                    <p>All {characters.length} character mods</p>
                                </>
                            )}
                        </div>
                        
                        <div className={styles.tableContainer}>
                            <CharacterTable 
                                characters={sortedCharacters} 
                                sortConfig={sortConfig}
                                onSort={requestSort}
                                onSelectCharacter={handleSelectCharacter}
                            />
                        </div>
                        
                        <div className={styles.stats}>
                            Showing {sortedCharacters.length} of {characters.length} characters
                        </div>
                        
                        {selectedCharacter && (
                            <CharacterModal 
                                character={selectedCharacter}
                                onClose={handleCloseModal}
                            />
                        )}
                    </>
                )}
            </div>
        </Layout>
    )
}

export default CommunityLists
