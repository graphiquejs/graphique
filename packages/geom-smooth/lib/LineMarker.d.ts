import React from "react";
declare type Props = {
    left: number;
    y: (d: any) => number;
    markerRadius: number;
    markerFill: (g: string) => string;
    lineVals: any[];
    strokeOpacity: number;
};
export declare const LineMarker: React.FC<Props>;
export {};
