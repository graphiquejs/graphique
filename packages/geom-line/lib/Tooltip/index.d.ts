import React from "react";
declare type Props = {
    data: any[];
    group: (d: any) => string;
    x: (d: any) => number;
    y: (d: any) => number;
    b: (d: any) => number;
    markerRadius: number;
    strokeOpacity: number;
    thisStrokeScale: (d: any) => string;
    thisSizeScale: (d: any) => number;
    thisDashArrayScale: (d: any) => string;
    stroke: string;
};
export declare const Tooltip: React.FC<Props>;
export {};
