
# echo "Characters"
# npx tsx src/index.ts workshop top --character --max 10000 --json > docs/static/characters.json

# echo "Textures"
# npx tsx src/index.ts workshop top --texture --max 10000 --json > docs/static/textures.json

# echo "Sounds"
# npx tsx src/index.ts workshop top --sound --max 10000 --json > docs/static/sounds.json

# echo "Gamemodes"
# npx tsx src/index.ts workshop top --gamemode --max 10000 --json > docs/static/gamemodes.json

# echo "Stages"
# npx tsx src/index.ts workshop top --stage --max 10000 --json > docs/static/stages.json

# echo "Tweaks"
# npx tsx src/index.ts workshop top --tweaks --max 10000 --json > docs/static/tweaks.json

# echo "Tools"
# npx tsx src/index.ts workshop top --tool --max 10000 --json > docs/static/tools.json

# echo "Overhauls"
# npx tsx src/index.ts workshop top --overhaul --max 10000 --json > docs/static/overhauls.json

# echo "Clientside"
# npx tsx src/index.ts workshop top --clientside --max 10000 --json > docs/static/clientside.json

# # echo "Style"
# # npx tsx src/index.ts workshop top --style --max 20000 --json > docs/static/style.json

npx tsx bin/merge.ts \
    docs/static/characters.json \
    docs/static/textures.json \
    docs/static/sounds.json \
    docs/static/gamemodes.json \
    docs/static/stages.json \
    docs/static/tweaks.json \
    docs/static/tools.json \
    docs/static/overhauls.json \
    docs/static/clientside.json \
    --output docs/static/mods.json