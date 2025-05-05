import React from 'react'
import styles from '../../pages/lists.module.css'

interface TagFilterProps {
    allTags: string[]
    selectedTags: string[]
    onTagToggle: (tag: string) => void
}

const TagFilter = ({ 
    allTags,
    selectedTags, 
    onTagToggle 
}: TagFilterProps) => {
    return (
        <div className={styles.tagFilter}>
            {allTags.map(tag => (
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
