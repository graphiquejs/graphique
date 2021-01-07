import React from "react";
export declare type LineProps = {
    data?: unknown[];
    stroke?: string;
    strokeOpacity?: number;
    strokeDashArray?: string;
    size?: number;
    scales?: any;
    id?: string;
    curve?: any;
    markerRadius?: number;
    hideTooltip?: boolean;
    animate?: boolean;
    onMouseOver?: ({ x0 }: any) => void;
    onMouseOut?: () => void;
};
declare const GeomLine: React.FC<LineProps>;
export { GeomLine };
