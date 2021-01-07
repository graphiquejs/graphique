import React, { useMemo } from "react"
import { GGBase, GGProps } from "./ggBase"
import { RecoilRoot } from "recoil"
import ReactResizeDetector from "react-resize-detector"
import { generateID } from "@graphique/util"
// import { Aes } from "./ggBase"


export const GG: React.FC<GGProps> = ({ children, ...props }) => {
  
  const id = useMemo(() => generateID(), [])

  return (
    <RecoilRoot>
      <ReactResizeDetector
        refreshMode="debounce"
        refreshRate={50}
        // onResize={(width, height) => console.log({width, height})}
      >
        {({width, targetRef}: {width: number, targetRef: any}) => {

          return (
            <div ref={targetRef}>
              <GGBase {...props} parentWidth={width} id={id}>
                {children}
              </GGBase>
            </div>
          )
        }}
      </ReactResizeDetector>
    </RecoilRoot>
  )
}
