import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { scalesState } from "../../atoms"
import { defaultCategoricalScheme } from "@graphique/util"

type Props = {
  scheme?: any
  reverse?: boolean
}

const ScaleStroke: React.FC<Props> = ({ scheme = defaultCategoricalScheme, reverse = false }) => {

  const setScalesState = useSetRecoilState(scalesState)

  useEffect(() => {
    setScalesState((scales: any) => {
      return (
        {
          ...scales,
          stroke: {
            scheme,
            reverse
          }
        }
      )
    })
  }, [setScalesState, scheme, reverse])

  return null
}

ScaleStroke.displayName = "ScaleStroke"
export { ScaleStroke }
