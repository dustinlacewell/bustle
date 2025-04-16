![logo.png](logo.png)

<p align="center">
<h1 align="center">YOMI Hustle Mod Build Tool</h1>
<div align="center">
  <p><s>Symlink management</s></p>
  <p>Development and Release zip management</p>
  <p>Automatic <code>.import</code> resource management</p>
  <p>Use <code>class_name</code> on your classes!</p>
</div>
</p>

<pre>
$ bustle --help
bustle &lt;subcommand&gt;
> A build tool for YOMI Hustle mods

where &lt;subcommand&gt; can be one of:

- dev - Build a development zip
- release - Build a release zip
- gather - Gather resource imports
- strip - Strip type-annotations & class_name from GDScript files
- zip - Create a zip file from path

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

# Usage

`bustle` is a command-line tool run from the terminal:

    bustle <subcommand>

Using it involes invoking one of its subcommands.

## Subcommands

### bustle release

Build a release zip.

- `--from` - Where the mod files are
- `--to` - Where the zip should go
- `--name` - The mod folder name
- `--importsIn` - Where in the zip imports should be copied (.import/ by default)
- `--project` - Path to Godot project, enables resource import gathering
- `--dry-run` - Pretend only
- `--keep` - Keep the build directory
- `--temp-dir` - Where to build

### bustle dev

Build a development zip.

The development zip only contains `_metadata` and `ModMain.gd`.

- `--from` - Where the mod files are
- `--to` - Where the zip should go
- `--name` - The mod folder name
- `--dry-run` - Pretend only
- `--keep` - Keep the build directory
- `--temp-dir` - Where to build

### bustle gather

Gather resource imports.

This will copy the `.stex` files named by the `.import` files of multimedia resources in your mod to the destination.

- `--from` - Where the mod files are
- `--to` - Where the .import files should go
- `--in` - Relative path for .import files
- `--project` - Path to Godot project
- `--dry-run` - Pretend only

### bustle strip

Strip type-annotations & class_name from GDScript files.

- `--from` - Where the mod files are
- `--to` - Where the stripped files should go
- `--dry-run` - Pretend only

### bustle zip

Create a zip file from path.

- `--from` - Where the files are
- `--to` - Where the zip should go
- `--dry-run` - Pretend only


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
    │   ├── bin
    │   ├── bustle.json
    │   └── mod
    │       ├── _metadata
    │       ├── ModMain.gd
    │       └── src
    ├── MyModGodotProject
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
- `MyModGodotProject` - Your mod's Godot project
- `MyModGodotProject/MyMod` - A symlink to `MyModRepo/mod`

## Symlinking Your Mod

Notice that my mod is in `MyModRepo/mod`. That means I can't just put `MyModRepo` into the Godot project. But by symlinking `MyModGodotProject/MyMod/` to `MyModRepo/mod`, there is no problem.


## Development Workflow

It would suck if you had to rebuild the mod zip every time you made a change.

Luckily, a zip containing only `_metadata` and `ModMain.gd` is all that is needed to trick Godot into recognizing your mod. As long as the rest of your mod files are in `MyModGodotProject/MyMod/`, everything just works out.

So, once you have copied or symlinked your mod files into `MyModGodotProject/MyMod/`, you can use `bustle dev` to build a development zip:

From inside your project:
```bash
bustle dev --from mod --to ../mods/ --name MyMod
```

**TIP** - *You can add the `--dry-run` flag to see what would be done without making changes.*

## Release Workflow

Bustle makes building a release zip a breeze:

From inside your project:
```bash
bustle release --from mod --to ../../mods/ --name MyMod
```
**TIP** - *You can add the `--dry-run` flag to see what would be done without making changes.*

This will perform the following steps:

1. Copy the mod files from `mod` to a temporary directory
2. Strip type-annotations & class_name from GDScript files
3. Copy all your `*.import` files to the temporary directory
4. Create a zip file from the temporary directory
5. Copy the zip file to the destination
6. Delete the temporary directory

**TIP** - *You can add the `--keep` flag to keep the temporary directory after build.*

This can be a useful way to test your mod against the retail version of YOMI Hustle.

## Using `bustle.json`

You can use a `bustle.json` file in the root of your mod repository to store your commands as aliases:

```json
{
    "release": {
        "name": "release",
        "args": {
            "from": "mod",
            "to": "../../mods",
            "project": "../MyModGodotProject",
            "name": "MyMod"
        }
    },
    "dev": {
        "name": "dev",
        "args": {
            "from": "mod",
            "to": "../mods",
            "name": "MyMod"
        }
    }
}
```

Now you can run just `bustle release` or `bustle dev`.

Hopefully the format is self-explanatory.

# What does `bustle gather` do?

Anytime you add a multimedia resource to your mod, like audio or textures, Godot creates a `.import` file next to it. This `.import` file contains a path to a cached indexed version of the resource ending in `.stex`.

When the game loads your mod, it loads much faster if these indexed versions are available. This command copies the `.stex` files named by the `.import` files of multimedia resources in your mod to the destination.

# What does `bustle strip` do?

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
