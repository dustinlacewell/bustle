#!/usr/bin/env bash

rm -fr ./dist

npx tsup

cp -r ./steamworks/dist ./dist/steamworks

sed -i 's|./dist/win64/|./steamworks/win64/|g' ./dist/index.js

export PKG_CACHE_PATH=".pkg"
npx pkg ./dist/index.js -c pkg.json --targets node20-win-x64 --output ./dist/win/bustle.exe # --debug