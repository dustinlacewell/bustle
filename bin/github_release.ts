#!/usr/bin/env tsx

import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import * as path from 'path'

// Configuration
const getConfig = () => {
    const token = process.env.GITHUB_TOKEN
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')
    const isTag = process.env.IS_TAG === 'true'
    const tagName = process.env.TAG_NAME || 'none'
    const releaseName = process.env.RELEASE_NAME || (isTag ? `Version ${tagName}` : 'Development Build')
    const alsoTagAsLatest = process.env.ALSO_TAG_AS_LATEST === 'true'
    
    return {
        token,
        owner,
        repo,
        isTag,
        tagName,
        releaseName,
        alsoTagAsLatest
    }
}

// Create Octokit client
const createClient = (token: string) => {
    return new Octokit({ auth: token })
}

// Log configuration
const logConfig = (config: ReturnType<typeof getConfig>) => {
    console.log(`Repository: ${config.owner}/${config.repo}`)
    console.log(`Is tag: ${config.isTag}`)
    console.log(`Tag name: ${config.tagName}`)
    console.log(`Release name: ${config.releaseName}`)
    console.log(`Also tag as latest: ${config.alsoTagAsLatest}`)
}

// Check if a release exists by tag
const checkReleaseExists = async (
    client: Octokit,
    owner: string,
    repo: string,
    tag: string
): Promise<number | null> => {
    try {
        console.log(`Checking for existing '${tag}' release...`)
        
        const response = await client.repos.getReleaseByTag({
            owner,
            repo,
            tag
        })
        
        if (response.data && response.data.id) {
            console.log(`Found existing release with ID: ${response.data.id}`)
            return response.data.id
        }
    } catch (error) {
        console.log(`No existing release found for tag '${tag}'`)
    }
    
    return null
}

// Delete a tag
const deleteTag = async (
    client: Octokit,
    owner: string,
    repo: string,
    tag: string
): Promise<boolean> => {
    try {
        console.log(`Deleting tag '${tag}'...`)
        
        await client.git.deleteRef({
            owner,
            repo,
            ref: `tags/${tag}`
        })
        
        console.log('Successfully deleted tag.')
        return true
    } catch (error) {
        console.log(`Note: Tag '${tag}' might not exist or couldn't be deleted.`)
        return false
    }
}

// Delete a release
const deleteRelease = async (
    client: Octokit,
    owner: string,
    repo: string,
    releaseId: number
): Promise<boolean> => {
    try {
        console.log(`Deleting release with ID: ${releaseId}...`)
        
        await client.repos.deleteRelease({
            owner,
            repo,
            release_id: releaseId
        })
        
        console.log('Successfully deleted release.')
        return true
    } catch (error) {
        console.error(`Error deleting release: ${error}`)
        return false
    }
}

// Delete a release and its tag
const deleteReleaseAndTag = async (
    client: Octokit,
    owner: string,
    repo: string,
    tag: string
): Promise<void> => {
    const releaseId = await checkReleaseExists(client, owner, repo, tag)
    
    if (releaseId !== null) {
        await deleteRelease(client, owner, repo, releaseId)
    }
    
    await deleteTag(client, owner, repo, tag)
}

// Create a release
const createRelease = async (
    client: Octokit,
    owner: string,
    repo: string,
    tag: string,
    name: string,
    isPrerelease: boolean
): Promise<number | null> => {
    try {
        console.log(`Creating new '${tag}' release...`)
        
        const response = await client.repos.createRelease({
            owner,
            repo,
            tag_name: tag,
            name,
            draft: false,
            prerelease: isPrerelease,
            generate_release_notes: true
        })
        
        if (response.data && response.data.id) {
            console.log(`Successfully created release with ID: ${response.data.id}`)
            return response.data.id
        }
    } catch (error) {
        console.error(`Error creating release: ${error}`)
    }
    
    return null
}

// Delete all assets from a release
const deleteExistingAssets = async (
    client: Octokit,
    owner: string,
    repo: string,
    releaseId: number
): Promise<void> => {
    try {
        console.log(`Checking for existing assets on release ${releaseId}...`)
        
        const { data: assets } = await client.repos.listReleaseAssets({
            owner,
            repo,
            release_id: releaseId
        })
        
        if (assets.length > 0) {
            console.log(`Found ${assets.length} existing assets. Deleting...`)
            
            for (const asset of assets) {
                try {
                    console.log(`Deleting asset ${asset.name} (ID: ${asset.id})...`)
                    await client.repos.deleteReleaseAsset({
                        owner,
                        repo,
                        asset_id: asset.id
                    })
                    console.log(`Successfully deleted asset ${asset.name}`)
                } catch (error) {
                    console.error(`Error deleting asset ${asset.name}: ${error}`)
                }
            }
        } else {
            console.log('No existing assets found.')
        }
    } catch (error) {
        console.error(`Error listing assets: ${error}`)
    }
}

// Upload a single asset to a release
const uploadAsset = async (
    client: Octokit,
    owner: string,
    repo: string,
    releaseId: number,
    filePath: string
): Promise<boolean> => {
    try {
        const fileName = path.basename(filePath)
        
        if (!fs.existsSync(filePath)) {
            console.log(`Skipping upload of ${fileName} (file not found)`)
            return false
        }
        
        console.log(`Uploading ${fileName} to release ${releaseId}...`)
        
        const fileContent = fs.readFileSync(filePath)
        const contentLength = fs.statSync(filePath).size
        
        const response = await client.repos.uploadReleaseAsset({
            owner,
            repo,
            release_id: releaseId,
            name: fileName,
            data: fileContent as any,
            headers: {
                'content-type': 'application/octet-stream',
                'content-length': contentLength
            }
        })
        
        if (response.data && response.data.id) {
            console.log(`Successfully uploaded ${fileName}.`)
            return true
        }
    } catch (error) {
        console.error(`Error uploading asset: ${error}`)
    }
    
    return false
}

// Get list of assets to upload
const getAssetPaths = (): string[] => {
    // List files in current directory
    console.log('Looking for assets in current directory:')
    const files = fs.readdirSync('.')
    console.log(files.join('\n'))
    
    return [
        './bustle.exe',
        './BustleInstaller.exe',
        './bustle.zip'
    ]
}

// Upload all assets to a release
const uploadAllAssets = async (
    client: Octokit,
    owner: string,
    repo: string,
    releaseId: number
): Promise<boolean> => {
    await deleteExistingAssets(client, owner, repo, releaseId)
    
    const assetPaths = getAssetPaths()
    let allSucceeded = true
    
    for (const assetPath of assetPaths) {
        const success = await uploadAsset(client, owner, repo, releaseId, assetPath)
        if (!success) {
            allSucceeded = false
        }
    }
    
    return allSucceeded
}

// Handle tag-based release
const handleTagRelease = async (
    client: Octokit,
    owner: string,
    repo: string,
    tagName: string,
    releaseName: string,
    alsoTagAsLatest: boolean
): Promise<boolean> => {
    console.log(`Processing tag-based release for '${tagName}'...`)
    
    // Create or update the versioned release
    let releaseId = await checkReleaseExists(client, owner, repo, tagName)
    
    if (releaseId === null) {
        releaseId = await createRelease(
            client, 
            owner, 
            repo, 
            tagName, 
            releaseName, 
            false
        )
    }
    
    if (releaseId === null) {
        console.error('Failed to create or find release')
        return false
    }
    
    const uploadSuccess = await uploadAllAssets(client, owner, repo, releaseId)
    
    // Also update the 'latest' release if requested
    if (alsoTagAsLatest) {
        console.log("Updating 'latest' release...")
        await deleteReleaseAndTag(client, owner, repo, 'latest')
        
        const latestReleaseId = await createRelease(
            client, 
            owner, 
            repo, 
            'latest', 
            `Latest (${tagName})`, 
            false
        )
        
        if (latestReleaseId === null) {
            console.error("Failed to create 'latest' release")
            return uploadSuccess
        }
        
        const latestUploadSuccess = await uploadAllAssets(client, owner, repo, latestReleaseId)
        
        return uploadSuccess && latestUploadSuccess
    }
    
    return uploadSuccess
}

// Handle dev release
const handleDevRelease = async (
    client: Octokit,
    owner: string,
    repo: string,
    releaseName: string
): Promise<boolean> => {
    console.log("Updating 'dev' release...")
    
    await deleteReleaseAndTag(client, owner, repo, 'dev')
    
    const releaseId = await createRelease(
        client, 
        owner, 
        repo, 
        'dev', 
        releaseName, 
        true
    )
    
    if (releaseId === null) {
        console.error("Failed to create 'dev' release")
        return false
    }
    
    return await uploadAllAssets(client, owner, repo, releaseId)
}

// Main function
const main = async (): Promise<void> => {
    const config = getConfig()
    logConfig(config)
    
    if (!config.token) {
        console.error('GITHUB_TOKEN environment variable is required')
        process.exit(1)
    }
    
    const client = createClient(config.token)
    
    try {
        let success = false
        
        if (config.isTag) {
            success = await handleTagRelease(
                client, 
                config.owner, 
                config.repo, 
                config.tagName, 
                config.releaseName, 
                config.alsoTagAsLatest
            )
        } else {
            success = await handleDevRelease(
                client, 
                config.owner, 
                config.repo, 
                config.releaseName
            )
        }
        
        if (success) {
            console.log('Release process completed successfully!')
            process.exit(0)
        } else {
            console.error('Release process completed with errors')
            process.exit(1)
        }
    } catch (error) {
        console.error(`Error in release process: ${error}`)
        process.exit(1)
    }
}

// Run the main function
main()
