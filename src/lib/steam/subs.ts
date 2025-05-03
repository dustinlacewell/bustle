import steam from "@/lib/steam/client.js"

const processSubscription = async (id: bigint) => {
    try {
        if (String(id).length !== 10) {
            return { type: "failure", id, error: "Mod ID must be 10 digits long." }
        }

        const subs = steam.workshop.getSubscribedItems()

        if (subs.includes(id)) {
            return { type: "already", id }
        }

        const data = await steam.workshop.getItem(id)

        if (data === undefined) {
            return { type: "failure", id, error: "Couldn't find mod. Check the ID." }
        }

        if (data === null) {
            return { type: "failure", id, error: "Mod is null." }
        }

        await steam.workshop.subscribe(id)

        // wait 2000 ms
        await new Promise(resolve => setTimeout(resolve, 2000))

        if (!steam.workshop.getSubscribedItems().includes(id)) {
            return { type: "failure", id, error: "Couldn't subscribe to mod!" }
        }

        return { type: "success", id }
    }
    catch (error) {
        return {
            type: "failure",
            id,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

export const subToAll = async (ids: bigint[]) => {
    const alreadyIds: bigint[] = []
    const successIds: bigint[] = []
    const failureIds: { id: bigint, error: string }[] = []
    const idSet = new Set(ids)

    // Process all subscriptions in parallel
    const results = await Promise.all(
        Array.from(idSet).map(id => processSubscription(id))
    )

    // Collect results
    for (const result of results) {
        if (result.type === "already") {
            alreadyIds.push(result.id)
        }
        else if (result.type === "success") {
            successIds.push(result.id)
        }
        else if (result.type === "failure") {
            failureIds.push({ id: result.id, error: result.error ?? "" })
        }
    }

    return { alreadyIds, successIds, failureIds }
}

const processUnsubscription = async (id: bigint) => {
    try {
        if (String(id).length !== 10) {
            return { type: "failure", id, error: "Mod ID must be 10 digits long." }
        }

        const subs = steam.workshop.getSubscribedItems()

        if (!subs.includes(id)) {
            return { type: "notsubbed", id }
        }

        await steam.workshop.unsubscribe(id)

        const delays: number[] = [
            250,
            500,
            1000,
            1500,
            2000
        ]
        while (delays.length > 0) {
            await new Promise(resolve => setTimeout(resolve, delays.shift()))

            if (!steam.workshop.getSubscribedItems().includes(id)) {
                return { type: "success", id }
            }
        }

        return { type: "failure", id, error: "Couldn't unsubscribe from mod!" }
    }
    catch (error) {
        return {
            type: "failure",
            id,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}

export const unsubFromAll = async (ids: bigint[]) => {
    const notSubbedIds: bigint[] = []
    const successIds: bigint[] = []
    const failureIds: { id: bigint, error: string }[] = []
    const idSet = new Set(ids)

    // Process all unsubscriptions in parallel
    const results = await Promise.all(
        Array.from(idSet).map(id => processUnsubscription(id))
    )

    // Collect results
    for (const result of results) {
        if (result.type === "notsubbed") {
            notSubbedIds.push(result.id)
        }
        else if (result.type === "success") {
            successIds.push(result.id)
        }
        else if (result.type === "failure") {
            failureIds.push({ id: result.id, error: result.error ?? "" })
        }
    }

    return { notSubbedIds, successIds, failureIds }
}
