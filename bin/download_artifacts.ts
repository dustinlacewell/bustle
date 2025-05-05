#!/usr/bin/env tsx

import { Octokit } from '@octokit/rest'
import * as fs from 'fs'
import { execSync } from 'child_process'

// Types
type ArtifactDownloadOptions = {
    token: string
    owner: string
    repo: string
    runId: number
}

type ReleaseInfo = {
    is_tag: boolean
    tag_name: string
    release_name: string
    also_tag_as_latest: boolean
}

// Main function to download artifacts and detect if this is a tag-based build
const downloadArtifactsAndDetectTag = async (options: ArtifactDownloadOptions): Promise<void> => {
    const { token, owner, repo, runId } = options
    
    // Initialize GitHub client
    const octokit = new Octokit({ auth: token })
    
    let releaseInfo: ReleaseInfo = {
        is_tag: false,
        tag_name: 'none',
        release_name: 'Development Build',
        also_tag_as_latest: false
    }
    
    try {
        // List artifacts from the workflow run
        console.log('Listing artifacts from workflow run...')
        const artifacts = await octokit.actions.listWorkflowRunArtifacts({
            owner,
            repo,
            run_id: runId
        })
        
        // Download executable
        await downloadArtifact(octokit, owner, repo, artifacts.data.artifacts, 'bustle-windows', 'bustle.exe')
        
        // Download installer
        await downloadArtifact(octokit, owner, repo, artifacts.data.artifacts, 'bustle-installer', 'BustleInstaller.exe')
        
        // Download compressed executable
        await downloadArtifact(octokit, owner, repo, artifacts.data.artifacts, 'bustle-windows-zip', 'bustle.zip')
        
        // Check for release-info artifact
        const releaseInfoArtifact = artifacts.data.artifacts.find(a => a.name === 'release-info')
        
        if (releaseInfoArtifact) {
            console.log('Found release-info artifact, downloading...')
            await downloadArtifact(octokit, owner, repo, artifacts.data.artifacts, 'release-info', 'release-info.zip')
            
            // Extract the release-info.zip
            console.log('Extracting release-info.zip...')
            execSync('unzip -o release-info.zip', { stdio: 'inherit' })
            
            // Check if the file exists and has content
            if (fs.existsSync('release-info.json')) {
                const fileContent = fs.readFileSync('release-info.json', 'utf8')
                console.log(`Release info file content: ${fileContent}`)
                
                if (fileContent.trim()) {
                    try {
                        releaseInfo = JSON.parse(fileContent)
                        console.log(`Found release information: ${JSON.stringify(releaseInfo, null, 2)}`)
                    } catch (e) {
                        console.error(`Error parsing release info JSON: ${e}`)
                        console.error(`Invalid JSON content: ${fileContent}`)
                    }
                } else {
                    console.error('Release info file is empty')
                }
            } else {
                console.log('Release info file not found after extraction')
            }
        } else {
            // Fallback to tag-info if release-info is not available
            const tagInfoArtifact = artifacts.data.artifacts.find(a => a.name === 'tag-info')
            
            if (tagInfoArtifact) {
                console.log('Found tag-info artifact, downloading...')
                await downloadArtifact(octokit, owner, repo, artifacts.data.artifacts, 'tag-info', 'tag-info.zip')
                
                // Extract the tag-info.zip
                console.log('Extracting tag-info.zip...')
                execSync('unzip -o tag-info.zip', { stdio: 'inherit' })
                
                // Check if the file exists and has content
                if (fs.existsSync('tag-info.json')) {
                    const fileContent = fs.readFileSync('tag-info.json', 'utf8')
                    console.log(`Tag info file content: ${fileContent}`)
                    
                    if (fileContent.trim()) {
                        try {
                            const tagInfo = JSON.parse(fileContent)
                            releaseInfo.is_tag = Boolean(tagInfo.is_tag)
                            releaseInfo.tag_name = tagInfo.tag_name || 'none'
                            releaseInfo.release_name = `Version ${releaseInfo.tag_name}`
                            releaseInfo.also_tag_as_latest = true
                            console.log(`Found tag information: ${JSON.stringify(releaseInfo, null, 2)}`)
                        } catch (e) {
                            console.error(`Error parsing tag info JSON: ${e}`)
                        }
                    } else {
                        console.error('Tag info file is empty')
                    }
                } else {
                    console.log('Tag info file not found after extraction')
                }
            } else {
                console.log('No release-info or tag-info artifacts found')
            }
        }
        
        // Set outputs for GitHub Actions
        console.log(`Final release determination: ${JSON.stringify(releaseInfo, null, 2)}`)
        
        if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `is_tag=${releaseInfo.is_tag}\n`)
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag_name=${releaseInfo.tag_name}\n`)
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `release_name=${releaseInfo.release_name}\n`)
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `also_tag_as_latest=${releaseInfo.also_tag_as_latest}\n`)
        }
        
        // Also set environment variables for local testing
        process.env.IS_TAG = releaseInfo.is_tag ? 'true' : 'false'
        process.env.TAG_NAME = releaseInfo.tag_name
        process.env.RELEASE_NAME = releaseInfo.release_name
        process.env.ALSO_TAG_AS_LATEST = releaseInfo.also_tag_as_latest ? 'true' : 'false'
    } catch (error) {
        console.error('Error downloading artifacts:', error)
        process.exit(1)
    }
}

// Helper function to download a specific artifact
const downloadArtifact = async (
    octokit: Octokit,
    owner: string,
    repo: string,
    artifacts: any[],
    artifactName: string,
    outputFileName: string
): Promise<void> => {
    const artifact = artifacts.find(a => a.name === artifactName)
    
    if (artifact) {
        console.log(`Downloading ${artifactName}...`)
        
        const download = await octokit.actions.downloadArtifact({
            owner,
            repo,
            artifact_id: artifact.id,
            archive_format: 'zip'
        })
        
        fs.writeFileSync(outputFileName, Buffer.from(download.data as any))
        console.log(`Successfully downloaded to ${outputFileName}`)
    } else {
        console.log(`Artifact ${artifactName} not found`)
    }
}

// Parse command line arguments
const parseArgs = (): ArtifactDownloadOptions => {
    const [, , token, owner, repo, runIdStr] = process.argv
    
    // Validate required arguments
    if (!token || !owner || !repo || !runIdStr) {
        console.error(`
Usage: download_artifacts.ts TOKEN OWNER REPO RUN_ID
Example: download_artifacts.ts ghp_123abc dustinlacewell bustle 12345
        `)
        process.exit(1)
    }
    
    const runId = parseInt(runIdStr, 10)
    
    if (isNaN(runId)) {
        console.error(`Invalid run ID: ${runIdStr}`)
        process.exit(1)
    }
    
    return {
        token,
        owner,
        repo,
        runId
    }
}

// Run the script
const options = parseArgs()
downloadArtifactsAndDetectTag(options).catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
})
