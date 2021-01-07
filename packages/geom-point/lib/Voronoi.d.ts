import React from "react";
declare type Props = {
    data: unknown[];
    x: (d: any) => number;
    y: (d: any) => number;
    onMouseOver?: (d: any) => void;
    onClick?: (d: any) => void;
    onMouseLeave?: () => void;
};
export declare const Voronoi: React.FC<Props>;
export {};
