#!/usr/bin/env bash

rm -fr dist

npm run build && \

cd dist && \

mkdir -p win && \

cd win && \

node ../../bin/build.cjs && \

node --experimental-sea-config ../../sea-config.json && \

node -e "require('fs').copyFileSync(process.execPath, 'bustle.exe')" && \

npx postject bustle.exe NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA && \

"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" "..\\..\\bin\\win-installer.iss" && \

echo "Done."

