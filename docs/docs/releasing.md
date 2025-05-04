---
sidebar_position: 5
---

# Releasing Your Mod

Finally, it's time to release your mod!

Bustle can build your release zip with the `bustle release` command:

```
$ bustle release
[ACTION] Ensuring directory exists: build\MyMod
[ACTION] Copying mod\ModMain.gd to build\MyMod\ModMain.gd
[ACTION] Copying metadata from mod\_metadata to build\MyMod\_metadata
[ACTION] Creating zip archive: ..\mods\MyMod.zip from build
[ACTION] Adding folder: MyMod
[ACTION] Writing zip file: ..\mods\MyMod.zip

...

[ACTION] Creating zip archive: ..\..\mods\MyMod.zip from build
[ACTION] Adding folder: MyMod
[ACTION] Writing zip file: ..\..\mods\MyMod.zip
```

### What Does `bustle release` Do?

Here's an overview the release process:

- Copy your mod files to the build directory
- (*Optionally*) Strip class names from scripts
- (*Optionally*) Gather resource imports
- Create a zip archive
- Clean up the build directory

The zip will be created in the directory specified by `putReleaseIn`, which is typically your Steam retail YOMI Hustle mods directory.

Make sure to test your release zip in the retail YOMI Hustle one last time before uploading it to the Steam Workshop.

## Uploading to the Steam Workshop

Upload your release zip to the Steam Workshop using the `bustle workshop upload` command:

```
$ bustle workshop upload ..\..\mods\BustleTestMod.zip

[ACTION] Creating new workshop item...
[ACTION] Writing new workshop ID to workshop.json: 3472535019
[ACTION] Updating workshop item 3472535019...

https://steamcommunity.com/sharedfiles/filedetails/?id=3472535019
```


