---
sidebar_position: 4
---

# Bustle Projects

Bustle works best when your mod project has a particular structure:

```bash
<MyModProject>/
├── mod/                # Your -actual- mod files
│   ├── _metadata
│   ├── ModMain.gd
│   └── CoolClass.gd
├── bustle.json         # Your Bustle config
├── workshop.json       # Your Steam Workshop config
├── preview.png         # Workshop preview image
└── change-notes.txt    # Change notes for upcoming release
```

You can keep your mod project wherever you like, but one option is the following:

```bash
steamapps/
└── common/
    └── YourOnlyMoveIsHUSTLE/                   # Your retail YOMI Hustle folder
        └── mods/                               # Your reail mods folder
        │   └── MyMod.zip
        └── moddev/                             # All your yomi modding stuff
            ├── MyModProject/                   # Your mod project
            │   ├── README.md
            │   ├── bustle.json                 # Your Bustle config
            │   ├── workshop.json               # Your Steam Workshop config
            │   ├── preview.png                 # Workshop preview image
            │   ├── change-notes.txt            # Change notes for upcoming release
            │   └── mod                         # Your actual mod files
            │       ├── _metadata
            │       ├── ModMain.gd
            │       └── CoolClass.gd
            ├── windows-351-editor-64bit.exe    # Godot editor binary
            └── GodotDecomp/                    # Decompiled Godot project
            │   ├── MyMod/                      # Symlink to your mod project
            │   └── ...
            └── mods/
                └── MyMod.dev.zip               # Development zip
```

This is the structure I use, it makes it very easy to configure my `bustle.json` file.

# `bustle.json`

The `bustle.json` file is a JSON file that contains all the information Bustle needs to know about your mod.

> **Note:** All paths in `bustle.json` are relative to the `bustle.json` file.

Here's an example `bustle.json` file for the example structure above:

```json
{
    // These are REQUIRED:
    "modName": "MyMod",            // The name of your mod
    "modDir": "mod",               // Directory containing your mod files
    "godotDir": "../GodotDecomp",  // Your decompiled yomi Godot project
    "buildDir": "build",           // Temp directory to perform the build in
    "putDevIn": "../mods",         // Your Godot editor mods/ directory
    "putReleaseIn": "../../mods",  // Your Steam yomi mods/ directory

    // These are optional:
    "strip": true,                 // Whether to strip your script class names
    "gather": ".import",           // Whether/where to gather resource imports
    "cleanup": true,               // Whether remove build directory after build
    "optimized": true,             // Whether to omit resource sources
    "include": ["*.import"],       // Import resources to include in optimized builds
    "dryRun": false                // Only pretend to do things
}
```

## `workshop.json`

The `workshop.json` file is a JSON file that contains all the information Steam Workshop needs to know about your mod.

Here's an example `workshop.json` file for the example structure above:

```json
{
    "id": "1234567890",                     // Your mod's Steam Workshop ID
    "title": "MyMod",                       // Your mod's title
    "preview": "preview.png",               // Your mod's preview image
    "description": "My mod description.",   // Your mod's description
    "visibility": "public",                 // Your mod's visibility
    "tags": [                               // Your mod's tags
        "Character"
    ]
}
```

Now that Bustle knows all about your mod, it's ready to go!

## Linking Your Mod

With Bustle, your mod doesn't have to literally be inside the Godot project. You can keep it wherever you like. Using the `bustle link` command, you can create a symlink from the Godot project to your mod directory. This allows you to:

- Keep your projects seperate from the Godot project.
- Seperate your README and other files from your actual mod files by keeping your mod files in a subdirectory.

```
$ bustle link
[ACTION] Creating symlink: ../GodotDecomp/MyMod -> mod
```

## Building a Development Zip

Even though your mod is linked to the Godot project, ModLoader will only recognize your mod if it can find your `ModMain.gd` and `_metadata` files inside a zip in the `mods/` folder. So you'll need to build a development zip.

```
$ bustle dev
[ACTION] Ensuring directory exists: build\MyMod
[ACTION] Copying mod\ModMain.gd to build\MyMod\ModMain.gd
[ACTION] Copying metadata from mod\_metadata to build\MyMod\_metadata
[ACTION] Creating zip archive: ..\mods\MyMod.zip from build
[ACTION] Adding folder: MyMod
[ACTION] Writing zip file: ..\mods\MyMod.zip
```

Congratulations! You're ready to go!

Godot should now recognize your mod and ModLoader should load it when you run the game.