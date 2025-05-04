---
sidebar_position: 3
---

# Getting Help

If you're having trouble, first try the `--help` flag.

For example, try `bustle --help`:

<div class="screenshots">

![help.png](/screenshots/bustle-help.png)

</div>

This will show you a list of available subcommands.

You can get help for a specific subcommand by running `bustle <subcommand> --help`.

For example, try `bustle zip --help`:

![zip-help.png](/screenshots/zip-help.png)

This will show you the available arguments for the `zip` subcommand.

We can see that we'd need to provide a `from` and `to` argument.

For example, try `bustle zip --from .\mod --to .\mod.zip`

But wait, we don't have anything to zip yet! Let's make a mod first.