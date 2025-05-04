import React from 'react'
import styles from '../../pages/lists.module.css'

interface TagFilterProps {
    availableTags: string[]
    selectedTags: string[]
    onTagToggle: (tag: string) => void
    onClearTags: () => void
}

const TagFilter = ({ 
    availableTags, 
    selectedTags, 
    onTagToggle, 
    onClearTags 
}: TagFilterProps) => {
    return (
        <div className={styles.tagFilter}>
            <button 
                className={`${styles.tagButton} ${selectedTags.length === 0 ? styles.tagButtonActive : ''}`}
                onClick={onClearTags}
            >
                All
            </button>
            {availableTags.map(tag => (
                <button 
                    key={tag}
                    className={`${styles.tagButton} ${selectedTags.includes(tag) && selectedTags.length === 1 ? styles.tagButtonActive : ''}`}
                    onClick={() => onTagToggle(tag)}
                >
                    {tag}
                </button>
            ))}
        </div>
    )
}

export default TagFilter
