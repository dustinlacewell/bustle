#!/usr/bin/env bash

# This script creates or updates a GitHub release
# It takes the following arguments:
# - $1: Token (GITHUB_TOKEN)
# - $2: Owner (GitHub username or organization)
# - $3: Repo (repository name)
# - $4: Is tag (true/false)
# - $5: Version/tag name
# - $6: Release name
# - $7: Executable path
# - $8: Installer path
# - $9: Zip path

TOKEN="$1"
OWNER="$2"
REPO="$3"
IS_TAG="$4"
VERSION="$5"
RELEASE_NAME="$6"
EXE_PATH="$7"
INSTALLER_PATH="$8"
ZIP_PATH="$9"

# Check if all required arguments are provided
if [ -z "$TOKEN" ] || [ -z "$OWNER" ] || [ -z "$REPO" ] || [ -z "$IS_TAG" ] || [ -z "$VERSION" ] || [ -z "$RELEASE_NAME" ]; then
    echo "Error: Missing required arguments"
    echo "Usage: $0 TOKEN OWNER REPO IS_TAG VERSION RELEASE_NAME EXE_PATH INSTALLER_PATH ZIP_PATH"
    exit 1
fi

# Check if files exist
if [ ! -f "$EXE_PATH" ]; then
    echo "Warning: Executable file not found at $EXE_PATH"
fi

if [ ! -f "$INSTALLER_PATH" ]; then
    echo "Warning: Installer file not found at $INSTALLER_PATH"
fi

if [ ! -f "$ZIP_PATH" ]; then
    echo "Warning: Zip file not found at $ZIP_PATH"
fi

# Set prerelease flag based on whether this is a tag
if [ "$IS_TAG" = "true" ]; then
    PRERELEASE="false"
else
    PRERELEASE="true"
fi

# Create the release JSON payload
PAYLOAD=$(cat <<EOF
{
  "tag_name": "$VERSION",
  "name": "$RELEASE_NAME",
  "draft": false,
  "prerelease": $PRERELEASE,
  "generate_release_notes": true
}
EOF
)

# For non-tag builds, first delete the existing "latest" release if it exists
if [ "$IS_TAG" = "false" ] && [ "$VERSION" = "latest" ]; then
    echo "Checking for existing 'latest' release to delete..."
    
    # Get the release ID for the "latest" tag
    RELEASE_ID=$(curl -s -H "Authorization: token $TOKEN" \
        "https://api.github.com/repos/$OWNER/$REPO/releases/tags/$VERSION" | \
        grep -o '"id": [0-9]*' | head -1 | sed 's/"id": //')
    
    if [ -n "$RELEASE_ID" ] && [ "$RELEASE_ID" != "null" ]; then
        echo "Deleting existing 'latest' release (ID: $RELEASE_ID)..."
        
        # Delete the existing release
        curl -s -X DELETE \
            -H "Authorization: token $TOKEN" \
            "https://api.github.com/repos/$OWNER/$REPO/releases/$RELEASE_ID"
        
        # Sleep to ensure the deletion is processed
        sleep 2
        
        # Delete the tag if it exists
        curl -s -X DELETE \
            -H "Authorization: token $TOKEN" \
            "https://api.github.com/repos/$OWNER/$REPO/git/refs/tags/$VERSION"
        
        # Sleep to ensure the tag deletion is processed
        sleep 2
    fi
    
    # Create a new release
    echo "Creating new 'latest' release..."
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" \
        "https://api.github.com/repos/$OWNER/$REPO/releases")
    
    RELEASE_ID=$(echo "$RESPONSE" | grep -o '"id": [0-9]*' | head -1 | sed 's/"id": //')
    
    if [ -z "$RELEASE_ID" ]; then
        echo "Error creating release. Response: $RESPONSE"
        exit 1
    fi
else
    # For tag-based releases, just create a new release
    echo "Creating new release with tag $VERSION..."
    
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" \
        "https://api.github.com/repos/$OWNER/$REPO/releases")
    
    RELEASE_ID=$(echo "$RESPONSE" | grep -o '"id": [0-9]*' | head -1 | sed 's/"id": //')
    
    if [ -z "$RELEASE_ID" ]; then
        echo "Error creating release. Response: $RESPONSE"
        exit 1
    fi
fi

# Upload assets
upload_asset() {
    local FILE_PATH="$1"
    local FILE_NAME=$(basename "$FILE_PATH")
    
    if [ -f "$FILE_PATH" ]; then
        echo "Uploading $FILE_NAME..."
        curl -s -X POST \
            -H "Authorization: token $TOKEN" \
            -H "Content-Type: application/octet-stream" \
            --data-binary @"$FILE_PATH" \
            "https://uploads.github.com/repos/$OWNER/$REPO/releases/$RELEASE_ID/assets?name=$FILE_NAME"
        echo ""
    else
        echo "Skipping upload of $FILE_NAME (file not found)"
    fi
}

# Upload the assets
upload_asset "$EXE_PATH"
upload_asset "$INSTALLER_PATH"
upload_asset "$ZIP_PATH"

echo "Release process completed successfully!!"
