import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { scalesState } from "../../atoms"

type Props = {
  type?: any
  format?: any
  numTicks?: number
  domain?: any[]
}

const ScaleX: React.FC<Props> = ({ type, format, numTicks, domain}) => {

  const setScalesState = useSetRecoilState(scalesState)

  useEffect(() => {
    setScalesState((scales: any) => {
      return (
        {
          ...scales,
          x: {
            ...scales.x,
            type,
            format,
            numTicks,
            domain
          }
        }
      )
    })
  }, [setScalesState, type, format, numTicks, domain])

  return null
}

ScaleX.displayName = "ScaleX"
export { ScaleX }
