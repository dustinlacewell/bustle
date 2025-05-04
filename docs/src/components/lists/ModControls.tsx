import React from 'react'
import { CommunityList } from './types'
import styles from '../../pages/lists.module.css'

interface ModControlsProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    communityLists: CommunityList[]
    selectedList: string
    setSelectedList: (list: string) => void
}

const ModControls = ({ 
    searchTerm, 
    setSearchTerm, 
    communityLists, 
    selectedList, 
    setSelectedList 
}: ModControlsProps) => {
    return (
        <div className={styles.controls}>
            <div className={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Search mods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={styles.listSelector}>
                <select 
                    value={selectedList} 
                    onChange={(e) => setSelectedList(e.target.value)}
                >
                    <option value="" title="Every mod on the workshop">All Mods</option>
                    {communityLists.map((list) => (
                        <option 
                            key={list.filename} 
                            value={list.filename}
                            title={list.description}
                        >
                            {list.displayName}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default ModControls
