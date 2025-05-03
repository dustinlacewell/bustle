import { subcommands } from "cmd-ts"

import { getItem } from "./get.js"
import { list } from "./list/index.js"
import { pubs } from "./pubs.js"
import { search } from "./search.js"
import { sub } from "./sub.js"
import { subs } from "./subs.js"
import { top } from "./top.js"
import { unsub } from "./unsub.js"
import { upload } from "./upload.js"
import { user } from "./user.js"
import { wrap } from "./wrap.js"

export const workshop = subcommands({
    name: "workshop",
    description: "Steam Workshop commands",
    cmds: {
        user: wrap(user),
        upload: wrap(upload),
        sub: wrap(sub),
        unsub: wrap(unsub),
        subs: wrap(subs),
        pubs: wrap(pubs),
        get: wrap(getItem),
        search: wrap(search),
        top: wrap(top),
        list: list
    }
})
