#!/usr/bin/env bash

rm -fr dist

./bin/build.sh

# get the version from package.json into VERSION
VERSION=$(node -e "console.log(require('./package.json').version)")

echo "Version: $VERSION"

# replace the version in win-installer.iss
sed -i "s/AppVersion=.*$/AppVersion=$VERSION/" "bin\\win-installer.iss"

"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "bin\\win-installer.iss" && \

echo "Done."

