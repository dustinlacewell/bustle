---
sidebar_position: 6
---

# Gathering .import Files

Anytime you add a multimedia resource to your mod, like audio or textures, Godot creates a `.import` file next to it. This `.import` file contains a path to a cached indexed version of the resource ending in `.stex`.

When the game loads your mod, it loads much faster if these indexed versions are available in the zip. 

If you provide a path to a directory in `gather` in `bustle.json`, Bustle will copy the `.stex` files named by the `.import` files of multimedia resources in your mod to that directory.

## The `gather` directory

The `gather` directory is relative to the `buildDir` in `bustle.json`.

For example, if your `bustle.json` has:

```json
{
    "buildDir": "build",
    "gather": ".import"
}
```

And your mod has a `character.png` file, Bustle will copy the `.stex` file named by the `.import` file of `character.png` to `build/.import/character.png.stex`.

Your resulting zip file structure will look like this:

```
MyMod.zip
├── MyMod
│   ├── _metadata
│   ├── ModMain.gd
│   ├── character.png
│   └── character.png.import
└── .import
    └── character.png.stex
```

Using the path `.import` is the safest option, as this is the same path that Godot uses.

### Custom Gather Directory

You can provide a custom gather directory in `bustle.json`:

```json
{
    "buildDir": "build",
    "gather": "MyMod/.import"
}
```

And your resulting zip file structure will look like this:

```
MyMod.zip
├── MyMod
    ├── _metadata
    ├── ModMain.gd
    ├── character.png
    ├── character.png.import
    └── .import
        └── character.png.stex
```

**THIS WILL UPDATE EACH .import FILE TO POINT TO THE NEW LOCATION OF THE .stex FILE**

## Optimized Builds

If you enable `optimized` in `bustle.json`, Bustle will not include original resource media files in the zip file.

For example, if your `bustle.json` has:

```json
{
    "buildDir": "build",
    "gather": ".import",
    "optimized": true
}
```

Then your resulting zip file structure will look like this:

```
MyMod.zip
├── MyMod
│   ├── _metadata
│   ├── ModMain.gd
│   └── character.png.import
└── .import
    └── character.png.stex
```

Notice how the `character.png` file is missing? This will make the zip file smaller and faster to load.

### Include Resources

If you're using `optimized` and you want to include certain resources in the zip file, you can use the `include` option in `bustle.json`.

For example, if your `bustle.json` has:

```json
{
    "buildDir": "build",
    "gather": ".import",
    "optimized": true,
    "include": ["character.png"]
}
```

Then your resulting zip file structure will look like this:

```
MyMod.zip
├── MyMod
│   ├── _metadata
│   ├── ModMain.gd
│   ├── character.png
│   └── character.png.import
└── .import
    └── character.png.stex
```

The `character.png` file is included in the zip file despite `optimized` being enabled.