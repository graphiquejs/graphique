import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { scalesState } from "../../atoms"

type Props = {
  values?: number[]
  range?: number[]
}

const ScaleSize: React.FC<Props> = ({ values, range }) => {

  const setScalesState = useSetRecoilState(scalesState)

  useEffect(() => {
    setScalesState((scales: any) => {
      return (
        {
          ...scales,
          size: {
            values,
            range
          }
        }
      )
    })
  }, [setScalesState, values, range])

  return null
}

ScaleSize.displayName = "ScaleSize"
export { ScaleSize }
