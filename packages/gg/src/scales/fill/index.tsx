import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { scalesState } from "../../atoms"

type Props = {
  scheme?: any
  reverse?: boolean
}

const ScaleFill: React.FC<Props> = ({ scheme, reverse = false }) => {

  const setScalesState = useSetRecoilState(scalesState)

  useEffect(() => {
    setScalesState((scales: any) => {
      return {
        ...scales,
        fill: {
          scheme,
          reverse,
        },
      }
    })
  }, [setScalesState, scheme, reverse])

  return null
}

ScaleFill.displayName = "ScaleFill"
export { ScaleFill }
