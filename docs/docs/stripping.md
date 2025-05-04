---
sidebar_position: 7
---

# Using `class_name`

If you set `strip` to `true` in `bustle.json`, you can use `class_name` to give your classes a name.

## Huh?

One of the most significant limitations of the ModLoader / Godot 3.5 modding is that you cannot utilize `class_name` to give your classes a name.

This makes mod code much more verbose and tedious to write.

Luckily, `class_name` *does* work during development. That means, as long as we remove it before we release, we can enjoy the benefits of things like type-annotations and IDE completions for our own classes. With `strip` set to `true` in `bustle.json`, we can do just that.

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

## How does Bustle help?

During release, Bustle will look at all of your GDScript files and create an index of any classes with a defined `class_name`, remembering which file they originally came from.

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



