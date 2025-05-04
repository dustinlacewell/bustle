#!/usr/bin/env bash

# This script creates or updates a GitHub release
# It takes the following arguments:
# - $1: Token (GITHUB_TOKEN)
# - $2: Owner (GitHub username or organization)
# - $3: Repo (repository name)
# - $4: Is tag (true/false)
# - $5: Version/tag name
# - $6: Release name
# - $7: Also tag as latest (true/false)
# - $8: Executable path
# - $9: Installer path
# - $10: Zip path

TOKEN="$1"
OWNER="$2"
REPO="$3"
IS_TAG="$4"
VERSION="$5"
RELEASE_NAME="$6"
ALSO_TAG_AS_LATEST="$7"
EXE_PATH="$8"
INSTALLER_PATH="$9"
ZIP_PATH="${10}"

# Check if all required arguments are provided
if [ -z "$TOKEN" ] || [ -z "$OWNER" ] || [ -z "$REPO" ] || [ -z "$IS_TAG" ] || [ -z "$VERSION" ] || [ -z "$RELEASE_NAME" ]; then
    echo "Error: Missing required arguments"
    echo "Usage: $0 TOKEN OWNER REPO IS_TAG VERSION RELEASE_NAME ALSO_TAG_AS_LATEST EXE_PATH INSTALLER_PATH ZIP_PATH"
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

# Function to delete a release and its tag if it exists
delete_release_if_exists() {
    local TAG="$1"
    
    echo "Checking for existing '$TAG' release..."
    
    RELEASE_ID=$(curl -s -H "Authorization: token $TOKEN" \
        "https://api.github.com/repos/$OWNER/$REPO/releases/tags/$TAG" | \
        grep -o '"id": [0-9]*' | head -1 | sed 's/"id": //')
    
    if [ -n "$RELEASE_ID" ] && [ "$RELEASE_ID" != "null" ]; then
        echo "Deleting existing '$TAG' release (ID: $RELEASE_ID)..."
        
        # Delete the existing release
        curl -s -X DELETE \
            -H "Authorization: token $TOKEN" \
            "https://api.github.com/repos/$OWNER/$REPO/releases/$RELEASE_ID"
        
        # Sleep to ensure the deletion is processed
        sleep 2
        
        # Delete the tag if it exists
        curl -s -X DELETE \
            -H "Authorization: token $TOKEN" \
            "https://api.github.com/repos/$OWNER/$REPO/git/refs/tags/$TAG"
        
        # Sleep to ensure the tag deletion is processed
        sleep 2
    fi
}

# Function to create a release
create_release() {
    local TAG="$1"
    local NAME="$2"
    local IS_PRERELEASE="$3"
    
    # Create payload with the given tag
    local RELEASE_PAYLOAD=$(cat <<EOF
{
  "tag_name": "$TAG",
  "name": "$NAME",
  "draft": false,
  "prerelease": $IS_PRERELEASE,
  "generate_release_notes": true
}
EOF
)
    
    # Create a new release
    echo "Creating new '$TAG' release..."
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$RELEASE_PAYLOAD" \
        "https://api.github.com/repos/$OWNER/$REPO/releases")
    
    local NEW_RELEASE_ID=$(echo "$RESPONSE" | grep -o '"id": [0-9]*' | head -1 | sed 's/"id": //')
    
    if [ -z "$NEW_RELEASE_ID" ]; then
        echo "Error creating release. Response: $RESPONSE"
        return 1
    fi
    
    echo "$NEW_RELEASE_ID"
}

# Upload a single asset
upload_asset() {
    local FILE_PATH="$1"
    local RELEASE_ID="$2"
    local FILE_NAME=$(basename "$FILE_PATH")
    
    if [ -f "$FILE_PATH" ]; then
        echo "Uploading $FILE_NAME to release $RELEASE_ID..."
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

# Main release logic
if [ "$IS_TAG" = "true" ]; then
    # For tag-based releases
    echo "Creating version release with tag $VERSION..."
    RELEASE_ID=$(create_release "$VERSION" "$RELEASE_NAME" "false")
    
    # Upload assets to the version release
    upload_asset "$EXE_PATH" "$RELEASE_ID"
    upload_asset "$INSTALLER_PATH" "$RELEASE_ID"
    upload_asset "$ZIP_PATH" "$RELEASE_ID"
    
    # If also tagging as latest, update the latest release
    if [ "$ALSO_TAG_AS_LATEST" = "true" ]; then
        echo "Updating 'latest' release..."
        # Delete the existing latest release if it exists
        delete_release_if_exists "latest"
        
        # Create a new latest release
        LATEST_RELEASE_ID=$(create_release "latest" "Latest Release ($VERSION)" "false")
        
        # Upload assets to the latest release
        upload_asset "$EXE_PATH" "$LATEST_RELEASE_ID"
        upload_asset "$INSTALLER_PATH" "$LATEST_RELEASE_ID"
        upload_asset "$ZIP_PATH" "$LATEST_RELEASE_ID"
    fi
else
    # For development builds
    echo "Updating 'dev' release..."
    # Delete the existing dev release if it exists
    delete_release_if_exists "dev"
    
    # Create a new dev release
    DEV_RELEASE_ID=$(create_release "dev" "$RELEASE_NAME" "true")
    
    # Upload assets to the dev release
    upload_asset "$EXE_PATH" "$DEV_RELEASE_ID"
    upload_asset "$INSTALLER_PATH" "$DEV_RELEASE_ID"
    upload_asset "$ZIP_PATH" "$DEV_RELEASE_ID"
fi

echo "Release process completed successfully!!"
