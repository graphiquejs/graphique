import { Aes } from "../gg";

export const defineGroupAccessor = (aes: Aes, allowUndefined = false) => {
    if (!aes || allowUndefined) return undefined
    return (
        aes.group ||
        aes.fill ||
        aes.stroke ||
        aes.strokeDasharray ||
        (allowUndefined ? undefined : () => '__group')
    )
}