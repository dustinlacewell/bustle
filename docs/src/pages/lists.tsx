import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import { useEffect, useState, useMemo, useCallback } from "react"
import Head from "@docusaurus/Head"

import styles from "./lists.module.css"
import {
    Mod,
    ModTable,
    ModModal,
    ModControls,
    TagFilter,
    useSortableData,
    fetchMods,
    fetchCommunityLists,
    fetchCommunityList,
    normalizeId,
    calculateDecay,
    CommunityList
} from "../components/lists"

const ModLists = () => {
    const [mods, setMods] = useState<Mod[]>([])
    const [communityLists, setCommunityLists] = useState<CommunityList[]>([])
    const [selectedList, setSelectedList] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [listItems, setListItems] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [selectedMod, setSelectedMod] = useState<Mod | null>(null)
    const [availableTags, setAvailableTags] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [previewMode, setPreviewMode] = useState<'hover' | 'inline'>('hover')

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [modsData, listsData] = await Promise.all([
                    fetchMods(),
                    fetchCommunityLists()
                ])
                
                // Add decay calculation to each mod
                const processedMods = modsData.map(mod => ({
                    ...mod,
                    decay: calculateDecay(mod.timeUpdated)
                }))
                
                // Extract all unique tags
                const allTags = new Set<string>()
                processedMods.forEach(mod => {
                    if (mod.tags && Array.isArray(mod.tags)) {
                        mod.tags.forEach(tag => allTags.add(tag))
                    }
                })
                
                setMods(processedMods)
                setCommunityLists(listsData)
                setAvailableTags(Array.from(allTags).sort())
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

    const handleTagToggle = useCallback((tag: string) => {
        setSelectedTags(prev => {
            // If this tag is already selected and it's the only one, deselect it
            if (prev.includes(tag) && prev.length === 1) {
                return []
            }
            // Otherwise, select only this tag
            return [tag]
        })
    }, [])
    
    const handleClearTags = useCallback(() => {
        setSelectedTags([])
    }, [])

    const filteredMods = useMemo(() => {
        // First apply only the list filter to get the total count for the current list
        const listFilteredMods = mods.filter(mod => {
            return selectedList === "" || 
                listItems.some(item => normalizeId(item) === normalizeId(mod.publishedFileId))
        })
        
        // Then apply all filters for the actual display
        const filtered = mods.filter(mod => {
            // Filter by search term
            const matchesSearch = searchTerm === "" || 
                mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mod.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mod.id.includes(searchTerm)
            
            // Filter by community list
            const matchesList = selectedList === "" || 
                listItems.some(item => normalizeId(item) === normalizeId(mod.publishedFileId))
            
            // Filter by selected tags
            const matchesTags = selectedTags.length === 0 || 
                (mod.tags && selectedTags.some(tag => mod.tags.includes(tag)))
            
            return matchesSearch && matchesList && matchesTags
        })
        
        if (selectedList && listItems.length > 0) {
            console.log(`Filtered ${filtered.length} mods from ${listFilteredMods.length} in list`)
        }
        
        return { 
            filtered,
            listTotal: listFilteredMods.length
        }
    }, [mods, searchTerm, selectedList, listItems, selectedTags])

    const { items: sortedMods, requestSort, sortConfig } = useSortableData(
        filteredMods.filtered,
        { key: "subscriptions", direction: "descending" }
    )
    
    const handleSelectMod = useCallback((mod: Mod) => {
        setSelectedMod(mod)
    }, [])
    
    const handleCloseModal = useCallback(() => {
        setSelectedMod(null)
    }, [])

    const { siteConfig } = useDocusaurusContext()
    
    return (
        <Layout
            description="Bustle Community Mod Lists"
        >
            <Head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" />
            </Head>
            <div className={styles.container}>
                <h1>Community Mod Lists</h1>
                
                {loading ? (
                    <div className={styles.loading}>Loading mod data...</div>
                ) : (
                    <>
                        <div className={styles.controlsContainer}>
                            <ModControls 
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                selectedList={selectedList}
                                onSelectList={setSelectedList}
                                communityLists={communityLists}
                                previewMode={previewMode}
                                onPreviewModeChange={setPreviewMode}
                            />
                        </div>
                        
                        <TagFilter 
                            allTags={availableTags}
                            selectedTags={selectedTags}
                            onTagToggle={handleTagToggle}
                        />
                        
                        <div className={styles.selectedListDescription}>
                            {selectedList ? (
                                <>
                                    <h2>
                                        {communityLists.find(list => list.filename === selectedList)?.displayName}&nbsp;({filteredMods.listTotal})
                                    </h2>
                                    <p>{communityLists.find(list => list.filename === selectedList)?.description}</p>
                                </>
                            ) : (
                                <>
                                    <h2>All Mods ({mods.length})</h2>
                                    <p>Every mod on the workshop</p>
                                </>
                            )}
                        </div>
                        
                        <div className={styles.stats}>
                            {sortedMods.length === filteredMods.listTotal ? (
                                `All ${sortedMods.length} mods shown.`
                            ) : sortedMods.length > 0 ? (
                                `${sortedMods.length} of ${filteredMods.listTotal} total mods shown.`
                            ) : (
                                `No mods match the current filters.`
                            )}
                        </div>
                        
                        {sortedMods.length > 0 ? (
                            <div className={styles.tableContainer}>
                                <ModTable 
                                    mods={sortedMods} 
                                    sortConfig={sortConfig}
                                    onSort={requestSort}
                                    onSelectMod={handleSelectMod}
                                    previewMode={previewMode}
                                />
                            </div>
                        ) : (
                            <div className={styles.noResults}>
                                <p>Try adjusting your filters to see more mods.</p>
                            </div>
                        )}
                        
                        {selectedMod && (
                            <ModModal 
                                mod={selectedMod}
                                onClose={handleCloseModal}
                            />
                        )}
                    </>
                )}
            </div>
        </Layout>
    )
}

export default ModLists
