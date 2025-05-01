import { subcommands } from "cmd-ts"

// import { pubs } from "./pubs.js"
// import { search } from "./search/index.js"
// import { subs } from "./subs.js"
// import { upload } from "./upload/index.js"
import { user } from "./user/index.js"

export const workshop = subcommands({
    name: "workshop",
    description: "Steam Workshop commands",
    cmds: {
        // subs,
        // pubs,
        user
        // upload,
        // search
    }
})
