import { AreaPositions } from "@graphique/graphique"
import { GeomAes } from "../types"

interface SpecificationErrorProps {
  geomAes?: GeomAes
  shouldStack?: boolean
  position?: AreaPositions
}

const GEOM = 'GeomArea'

const useHandleSpecificationErrors = ({ 
  geomAes, shouldStack, position,
 }: SpecificationErrorProps) => {
  if (shouldStack && !geomAes?.y) {
    throw new Error(`${GEOM}: aes.y is required when using position="${position}"`)
  }

  if (geomAes?.y1 && !geomAes?.y0) {
    throw new Error(`${GEOM}: aes.y1 can only be specified when combined with aes.y0`)
  }

  if (geomAes?.y0 && !geomAes.y1 && !geomAes.y) {
    throw new Error(`${GEOM}: aes.y0 needs to be specified with aes.y1 or aes.y`)
  }

  if (!geomAes?.y && !(geomAes?.y0 && geomAes?.y1)) {
    throw new Error(`${GEOM}: need to specify at least aes.y, or some combination of (aes.y, aes.y0) | (aes.y0, aes.y1)`)
  }
}

export { useHandleSpecificationErrors }
