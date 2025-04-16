import { assign, createActor, setup } from "xstate"

// Import action functions
import { flushCurrentSegment } from "./actions/flushCurrentSegment.js"
import { processComment } from "./actions/processComment.js"
import { processEndOfFile } from "./actions/processEndOfFile.js"
import { processInsideString } from "./actions/processInsideString.js"
import { processNormalCharacter } from "./actions/processNormalCharacter.js"
import { startString } from "./actions/startString.js"
// Import guard functions
import { hasMoreChars } from "./guards/hasMoreChars.js"
import { isCommentStart } from "./guards/isCommentStart.js"
import { isInString } from "./guards/isInString.js"
import { isStringDelimiter } from "./guards/isStringDelimiter.js"
import { GDScriptParserContext } from "./types.js"

export function processGDScript(
    text: string,
    processor: (segment: string, ctx: { line: number, col: number }) => string | void,
    options?: { collectResult?: boolean }
): string | string[] {
    // Create a machine with the context directly in the config
    const machine = setup({
        types: {
            context: {} as GDScriptParserContext,
            events: {} as { type: "NEXT" | "PROCESS_CHAR" | "END" }
        },
        actions: {
            flushCurrentSegment: assign(flushCurrentSegment),
            startString: assign(startString),
            processInsideString: assign(processInsideString),
            processComment: assign(processComment),
            processNormalCharacter: assign(processNormalCharacter),
            processEndOfFile: assign(processEndOfFile)
        },
        guards: {
            hasMoreChars,
            isStringDelimiter,
            isInString,
            isCommentStart
        }
    }).createMachine({
        id: "gdscriptParser",
        context: {
            text,
            processor,
            options,
            result: "",
            results: [],
            currentSegment: "",
            inString: false,
            stringDelimiter: null,
            unterminatedStringStart: null,
            i: 0,
            line: 1,
            col: 1
        },
        initial: "processing",
        states: {
            processing: {
                always: [
                    { target: "end", guard: ({ context }) => context.i >= context.text.length }
                ],
                on: {
                    PROCESS_CHAR: [
                        {
                            guard: "isStringDelimiter",
                            actions: ["flushCurrentSegment", "startString"]
                        },
                        {
                            guard: "isInString",
                            actions: "processInsideString"
                        },
                        {
                            guard: "isCommentStart",
                            actions: ["flushCurrentSegment", "processComment"]
                        },
                        {
                            actions: "processNormalCharacter"
                        }
                    ],
                    NEXT: {
                        target: "processing",
                        actions: () => {
                            // This is just a marker event to trigger the next iteration
                        }
                    }
                }
            },
            end: {
                entry: ["flushCurrentSegment", "processEndOfFile"],
                type: "final"
            }
        }
    })

    const actor = createActor(machine)
    actor.start()

    // Process each character
    while (actor.getSnapshot().can({ type: "PROCESS_CHAR" })) {
        actor.send({ type: "PROCESS_CHAR" })
        actor.send({ type: "NEXT" })
    }

    const ctx = actor.getSnapshot().context
    return ctx.options?.collectResult ? ctx.results : ctx.result
}
