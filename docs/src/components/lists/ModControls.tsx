import { CommunityList } from './types'
import styles from '../../pages/lists.module.css'

interface ModControlsProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    selectedList: string
    onSelectList: (list: string) => void
    communityLists: CommunityList[]
    previewMode: 'hover' | 'inline'
    onPreviewModeChange: (mode: 'hover' | 'inline') => void
}

const ModControls = ({ 
    searchTerm,
    setSearchTerm,
    selectedList, 
    onSelectList, 
    communityLists, 
    previewMode, 
    onPreviewModeChange 
}: ModControlsProps) => {
    const togglePreviewMode = () => {
        onPreviewModeChange(previewMode === 'hover' ? 'inline' : 'hover')
    }
    
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
                    onChange={(e) => onSelectList(e.target.value)}
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
            <div className={styles.spacer}></div>
            <div className={styles.previewToggle}>
                <button 
                    className={styles.previewButton}
                    onClick={togglePreviewMode}
                    title={previewMode === 'hover' ? "Switch to inline previews" : "Switch to hover previews"}
                >
                    {previewMode === 'hover' ? "Inline Previews" : "Hover Previews"}
                </button>
            </div>
        </div>
    )
}

export default ModControls
