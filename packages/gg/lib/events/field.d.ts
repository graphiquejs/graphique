import React from "react";
declare type Props = {
    xScale: any;
    yScale: any;
    onMouseOver?: ({ x0 }: any) => void;
    onMouseOut?: () => void;
};
declare const EventField: React.FC<Props>;
export { EventField };
