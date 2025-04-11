export type ClassMap = Record<string, string>
export type MangledNames = Record<string, Set<string>>

export interface StripProcessingOptions {
    from: string
    to: string
    dryRun?: boolean
}
