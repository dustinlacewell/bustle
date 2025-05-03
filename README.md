![logo.png](logo.png)

<p align="center">
<h1 align="center">YOMI Hustle Mod Build Tool</h1>
<div align="center">
  <p>Use <code>class_name</code> in your mod!</p>
  <p>Builds your dev and release zips!</p>
  <p>Symlinks your mod to the Godot project!</p>
  <p>Manages your <code>.import</code> files!</p>
  <p>Uploads your mod to the Steam Workshop!</p>
  <p>Subscribe and unsubscribe to community mod lists!</p>
</div>
</p>

<pre>
$ bustle --help
bustle &lt;subcommand&gt;
> A build tool for YOMI Hustle mods

where &lt;subcommand&gt; can be one of:

- dev - Build a development zip
- release - Build a release zip
- link - Link your mod to your Godot project
- gather - Gather resource imports
- zip - Zip a directory
- workshop - Steam Workshop commands

For more help, try running `bustle &lt;subcommand&gt; --help`
</pre>

<p align="center">
<h1 align="center"><b>!!!   THIS IS ALPHA SOFTWARE   !!!</b></h1>
</p>

# Installation

There are different ways to install.
## Windows

Download the [latest release](https://github.com/dustinlacewell/bustle/releases) and run the installer. You may need to restart your terminal / IDE after installation.

## Source / Linux

You'll need [NodeJS](https://nodejs.org/en/download) installed.

Clone or download this repository and then:

    npm i -g

# Quick Start

Configure Bustle by creating a `bustle.json` file in the root of your mod repository:

```
MyMod/
├── mod/          // Your actual mod files
├── bustle.json   // Bustle configuration
├── README.txt
└── ...
```

Tell Bustle all about your mod.  All paths must be relative to `bustle.json`:

```jsonc
{
    // These are REQUIRED:
    "modName": "MyMod",            // The name of your mod
    "modDir": "mod",               // Directory containing your mod files
    "godotDir": "../GodotDecomp",  // Your decompiled YOMIH Godot project
    "buildDir": "build",           // Temp directory to perform the build in
    "putDevIn": "../mods",         // Your Godot editor mods/ directory
    "putReleaseIn": "../../mods",  // Your Steam YOMIH mods/ directory
    // These are optional:
    "strip": true,                 // Whether to strip your script class names
    "gather": ".import",           // Whether/where to gather resource imports
    "cleanup": true,               // Whether remove build directory after build
    "optimized": true,             // Whether to omit resource sources
    "include": ["*.import"],       // Import resources to include in optimized builds
    "dryRun": false                // Only pretend to do things
}
```

Link your `mod/` directory to your Godot project:

```bash
$ bustle link
[ACTION] Creating symlink: ..\GodotDecomp\MyMod -> mod
```

Create a development zip so ModLoader loads your mod in Godot:

```bash
$ bustle dev
bustle dev
[ACTION] Ensuring directory exists: build\MyMod
[ACTION] Copying mod\ModMain.gd to build\MyMod\ModMain.gd
[ACTION] Copying metadata from mod\_metadata to build\MyMod\_metadata
[ACTION] Creating zip archive: ..\mods\MyMod.zip from build
[ACTION] Adding folder: MyMod
[ACTION] Writing zip file: ..\mods\MyMod.zip
```

Work on your mod. When you're ready, build a release zip to test against retail Steam version of YOMI Hustle:

```bash
$ bustle release
[ACTION] Removing directory: build
[ACTION] Ensuring directory exists: build\MyMod
[ACTION] Copying files from mod to build\MyMod
[INFO] Loaded import file: mod\character.png.import
[INFO] Stripping scripts from build\MyMod to build
[ACTION] Stripping file: build\MyMod\ModMain.gd
[ACTION] Stripping file: build\MyMod\MyCoolClass.gd

...

[ACTION] Creating zip archive: ..\..\mods\MyMod.zip from build
[ACTION] Adding folder: MyMod
[ACTION] Writing zip file: ..\..\mods\MyMod.zip
```

# Usage

`bustle` is a command-line tool run from the terminal:

    bustle <subcommand>

## With `bustle.json`

If you have a `bustle.json` file, just run the following commands:

- `bustle dev` - Build a development zip
- `bustle release` - Build a release zip
- `bustle link` - Link your mod to your Godot project
- `bustle gather` - Gather resource imports

Bustle will use the values from `bustle.json` to run the commands.

## Options and Flags

Commands can be run with options and flags to modify their behavior.

Options are specified with an accompanying value:  `--option <value>` 

While flags are specified without a value: `--flag`

### Universal Flags

- `--dry-run` - *Show what would be done without making changes*
- `--verbose` - *Show verbose output*

### Required Options

Options with a bold description are required.

Options with an italic description are optional.

Options with an `*` can be specified multiple times.

## Subcommands

### bustle release

Build a release zip.

The overall process is:
- Copy your mod files to the build directory
- Strip class names from scripts
- Gather resource imports
- Create a zip archive
- Clean up the build directory

**OPTIONS**:
- `--mod-name` - **The name of your mod**
- `--mod-dir` - **Directory containing your mod files**
- `--godot-dir` - **Your Godot project directory**
- `--build-dir` - *Where to perform the build*
- `--put-release-in` - *Where to put the release zip file*
- `--gather-dir` - *Directory relative to build-dir to put imports in*
- `--include`* - *Import resources to include in optimized builds*

**FLAGS**:
- `--optimized` - *Don't include imported resources in the zip file*
- `--strip` - *Whether to strip your class names from GDScript files*
- `--dry-run` - *Show what would be done without making changes*
- `--cleanup` - *Delete the build directory after build*

### bustle dev

Build a development zip.

The development zip only contains `_metadata` and `ModMain.gd`. This is to trick ModLoader into recognizing your mod. Even though the rest of your mod files are in the Godot project, ModLoader will only recognize the mod if it can find your `ModMain.gd` and `_metadata` files inside a zip in the `mods/` folder.

**OPTIONS**:
- `--mod-name` - **The name of your mod**
- `--mod-dir` - **Directory containing your mod files**
- `--build-dir` - *Where to perform the build*
- `--put-dev-in` - *Where to put the development zip file*

**FLAGS**:
- `--dry-run` - *Show what would be done without making changes*
- `--cleanup` - *Delete the build directory after build*

### bustle gather

Gather resource imports.

This will copy the `.stex` files named by the `.import` files of multimedia resources in your mod to the destination.

**OPTIONS**:
- `--mod-name` - **The name of your mod**
- `--mod-dir` - **Directory containing your mod files**
- `--build-dir` - *Where to perform the build*
- `--gather-dir` - *Directory relative to build-dir to put imports in*
- `--godot-dir` - *Your Godot project directory*

**FLAGS**:
- `--dry-run` - *Show what would be done without making changes*

## bustle link

Link your mod to your Godot project.

This will create a symlink from the Godot project to your mod directory 

For example: `mod/` -> `../GodotDecomp/MyMod/`.

**OPTIONS**:
- `--mod-name` - **The name of your mod**
- `--mod-dir` - **Directory containing your mod files**
- `--godot-dir` - **Your Godot project directory**

**FLAGS**:
- `--dry-run` - *Show what would be done without making changes*

### bustle zip

Zip a directory.

**OPTIONS**:
- `--from` - **Source directory**
- `--to` - **Destination file**

**FLAGS**:
- `--dry-run` - *Show what would be done without making changes*

# User Guide

You don't have to do things this way, but this is how I do it.

Let's say your retail Steam YOMI Hustle folder is:

    E:\SteamLibrary\steamapps\common\YourOnlyMoveIsHUSTLE\

And your mod folder is:

    E:\SteamLibrary\steamapps\common\YourOnlyMoveIsHUSTLE\mods\

I do all my mod development in `moddev`:

    E:\SteamLibrary\steamapps\common\YourOnlyMoveIsHUSTLE\moddev\

In there, I have:

    moddev
    ├── MyModRepo
    │   ├── README.md
    │   ├── bustle.json
    │   └── mod
    │       ├── _metadata
    │       ├── ModMain.gd
    │       └── src/
    ├── GodotDecomp
    │   ├── MyMod -> ../MyModRepo/mod
    ├── editor_data
    ├── gdre_tools.exe
    ├── gdre_tools.pck
    ├── mods
    │   └── MyMod.zip
    ├── steam_api64.dll
    ├── steam_appid.txt
    ├── windows-351-debug-template-64bit.exe
    ├── windows-351-editor-64bit.exe
    └── windows-351-template-64bit.exe

You can see there are the decompilation tools, Godot editor binaries, the Godot editor's `mods/` folder and:

- `MyModRepo` - Your mod repository
- `GodotDecomp` - Your mod's Godot project
- `GodotDecomp/MyMod` - A symlink to `MyModRepo/mod`

## Adding `bustle.json`

A `bustle.json` file tells Bustle everything it needs to know to build your mod.

```jsonc
{
    "modName": "MyMod",
    "modDir": "mod",
    "godotDir": "../GodotDecomp",
    "putDevIn": "../mods",
    "putReleaseIn": "../../mods"
}
```

## Symlinking Your Mod

Creating a symlink from the Godot project to your mod directory allows you to:
- Keep your projects seperate from the Godot project.
- Seperate your README and other files from your actual mod files by keeping your mod files in a subdirectory.

```
MyModRepo
    ├── README.md
    ├── bustle.json
    └── mod
        ├── _metadata
        ├── ModMain.gd
        └── CoolClass.gd
```

Since you created a `bustle.json`, to symlink your mod, you can use `bustle link`:

```bash
$ bustle link
```

## Creating a Development Zip

Once you have copied or symlinked your mod files into `GodotDecomp/MyMod/`, you can use `bustle dev` to build a development zip:

```bash
$ bustle dev
```

## Working on your mod

- [x] Create a `bustle.json`
- [x] Symlinked your mod into the Godot project
- [x] Built a dev zip in Godot editor's `mods/` folder

At this point the Godot editor and ModLoader will recognize and load our mod.

So get to work!

## Building a release

Once you're happy with your mod, build a release zip:

```bash
$ bustle release
```

That will put a zip file in the `mods/` folder of your Steam YOMI Hustle installation.

Go test it out! If it's good, you can upload it to the Steam Workshop!


# What does `bustle gather` do?

Anytime you add a multimedia resource to your mod, like audio or textures, Godot creates a `.import` file next to it. This `.import` file contains a path to a cached indexed version of the resource ending in `.stex`.

When the game loads your mod, it loads much faster if these indexed versions are available. This command copies the `.stex` files named by the `.import` files of multimedia resources in your mod to the destination.

# What does stripping class names do?

One of the most significant limitations of the ModLoader / Godot modding is that you cannot utilize `class_name` to give your classes a name.

This makes mod code much more verbose and tedious to write.

Luckily, `class_name` *does* work during development. That means, as long as we remove it before we release, we can enjoy the benefits of things like type-annotations and IDE completions for our own classes.

If you want to know about how this works from a technical perspective, continue reading.

## What can I do with `class_name`?

You can use `class_name` to give your classes a name. At minimum, this let's you naturally refer to your classes.

```gdscript
class_name SomeClass
```

With that name, we can instantiate the class:

```gdscript
var instance = SomeClass.new()
```

We can specify that a variable is of a certain type:

```gdscript
var instance: SomeClass
```

Or that a function only works with a certain type:

```gdscript
func some_function(arg: SomeClass):
    pass
```

We can check if a variable is of a certain type:

```gdscript
if instance is SomeClass:
    print("yup!")
```

We can call static functions on the class:

```gdscript
SomeClass.some_static_function()
```

And finally, we can access any local classes:

```gdscript
var foo = SomeClass.InnerClass.new()
```

Needless to say, you can do a lot with classes.

So what happens if you can't use `class_name`?

Well, it sucks. But you can get by...

Firstly, you can't use type-annotations, so specifying the type of variables, or class fields just isn't possible.

Then, to get ahold of a class, you need to load it from a script:

```gdscript
var SomeClass = load("res://SomeClass.gd")
```

And you'll have to do that for every class in every file. It's actually a bit worse than this, but you get the idea.

## How does `bustle strip` help?

The `bustle strip` command will look at all of your GDScript files and create an index of any classes with a defined `class_name`, remembering which file they originally came from.

Then, it will process each file, removing any `class_name` declarations and type-annotations, and adding the necessary `load` statements to load the classes.

This allows any code that was using a named class to continue working.

For example, before:

```gdscript
class_name Foo

var name: String

func _init(name: String):
    self.name = name

func greet():
  print("Hello, " + name)

class Bar:
    static func uppercase(s: String):
        return s.upper()
```

```gdscript
func greet(who: String):
   var name = Foo.Bar.uppercase(who)
   var foo = Foo.new(name)
   foo.greet()
```

After:

```gdscript
var FooWFEIJ = load("res://Foo.gd")

func greet(who: String):
   var name = FooWFEIJ.Bar.uppercase(who)
   var foo = FooWFEIJ.new(name)
   foo.greet()
```
