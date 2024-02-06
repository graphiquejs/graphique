import type { Aes } from "../gg";

export const defineGroupAccessor = <Datum>(aes: Aes<Datum>, allowUndefined = false) => {
    if (!aes && allowUndefined) return undefined
    return (
        aes?.fill ||
        aes?.stroke ||
        aes?.strokeDasharray ||
        aes?.group ||
        (allowUndefined ? undefined : () => '__group')
    )
}