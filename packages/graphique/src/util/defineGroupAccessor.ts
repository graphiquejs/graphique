import type { Aes } from "../gg";

export const defineGroupAccessor = <Datum>(aes: Aes<Datum>, allowUndefined = false) => {
    if (!aes && allowUndefined) return undefined
    return (
        aes?.group ||
        aes?.fill ||
        aes?.stroke ||
        aes?.strokeDasharray ||
        (allowUndefined ? undefined : () => '__group')
    )
}