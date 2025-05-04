import React, { useEffect } from 'react'
import { Mod } from './types'
import styles from '../../pages/lists.module.css'

interface ModModalProps {
    mod: Mod | null
    onClose: () => void
}

const ModModal = ({ mod, onClose }: ModModalProps) => {
    if (!mod) return null
    
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }
    
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])
    
    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modalContent}>
                <button className={styles.modalClose} onClick={onClose}>×</button>
                
                <div className={styles.modalHeader}>
                    <div className={styles.modalHeaderLeft}>
                        <h2 className={styles.modalTitle}>{mod.title}</h2>
                        <div>by {mod.author}</div>
                    </div>
                    
                    {mod.tags && mod.tags.length > 0 && (
                        <div className={styles.modalTags}>
                            {mod.tags.map((tag, index) => (
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
                                <span className={styles.modalInfoValue}>{mod.publishedFileId}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Views</span>
                                <span className={styles.modalInfoValue}>{mod.uniqueViews}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Votes</span>
                                <span className={styles.modalInfoValue}>{mod.upvotes} / {mod.downvotes}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Score</span>
                                <span className={styles.modalInfoValue}>{parseFloat(mod.score.toString()).toFixed(2)}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Subscriptions</span>
                                <span className={styles.modalInfoValue}>{mod.subscriptions}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Favorites</span>
                                <span className={styles.modalInfoValue}>{mod.favorites}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Created</span>
                                <span className={styles.modalInfoValue}>{mod.created}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Updated</span>
                                <span className={styles.modalInfoValue}>{mod.updated}</span>
                            </div>
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Comments</span>
                                <span className={styles.modalInfoValue}>{mod.comments}</span>
                            </div>
                            
                            <div className={styles.modalInfoItem}>
                                <span className={styles.modalInfoLabel}>Workshop</span>
                                <a 
                                    href={`https://steamcommunity.com/sharedfiles/filedetails/?id=${mod.publishedFileId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View on Steam
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    {mod.previewUrl && (
                        <div className={styles.modalImageColumn}>
                            <img 
                                src={mod.previewUrl} 
                                alt={mod.title} 
                                className={styles.modalImage}
                            />
                        </div>
                    )}
                </div>
                
                {mod.description && (
                    <div className={styles.modalDescription}>
                        <h3>Description</h3>
                        <div>{mod.description}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModModal
