import steam from "@/lib/steam/client.js"

export const getCollection = async (ids: bigint[]) => {
    const work = await Promise.all(ids.map(id => steam.workshop.getItem(id)))
    return work
        .filter(item => item !== null)
        .map((item, idx) => ({ ...item, id: ids[idx] }))
}
