import React from "react";
export declare type ThemeProps = {
    titleColor?: string;
    markerStroke?: string;
    defaultStroke?: string;
    defaultFill?: string;
    font?: {
        family?: string;
    };
    grid?: {
        stroke?: string | null;
    };
    axis?: {
        labelColor?: string;
        stroke?: string;
        tickLabelColor?: string;
        tickStroke?: string;
        hideAxisLines?: boolean;
    };
    axisX?: {
        labelColor?: string;
        stroke?: string;
        tickLabelColor?: string;
        tickStroke?: string;
        hideAxisLine?: boolean;
    };
    axisY?: {
        labelColor?: string;
        stroke?: string;
        tickLabelColor?: string;
        tickStroke?: string;
        hideAxisLine?: boolean;
    };
};
declare const Theme: React.FC<ThemeProps>;
export { Theme };
