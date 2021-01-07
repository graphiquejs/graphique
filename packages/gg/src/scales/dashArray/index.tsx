import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { scalesState } from "../../atoms"

type Props = {
  values?: (string | undefined)[]
}

const ScaleDashArray: React.FC<Props> = ({ values }) => {

  const setScalesState = useSetRecoilState(scalesState)

  useEffect(() => {
    setScalesState((scales: any) => {
      return (
        {
          ...scales,
          dashArray: {
            values
          }
        }
      )
    })
  }, [setScalesState, values])

  return null
}

ScaleDashArray.displayName = "ScaleDashArray"
export { ScaleDashArray }
