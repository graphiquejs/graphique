import React from "react";
import { Aes } from "../ggBase";
import { LabelsProps } from "../labels";
import { ThemeProps } from "../theme";
export declare const dataState: import("recoil").RecoilState<never[]>;
export declare const aesState: import("recoil").RecoilState<Aes>;
export declare const labelsState: import("recoil").RecoilState<LabelsProps>;
export declare const scalesState: import("recoil").RecoilState<any>;
export declare type TooltipContent = {
    label?: string;
    group?: string;
    mark?: JSX.Element;
    x: any;
    y: any;
    formattedX?: string;
    formattedY?: string;
    datum?: unknown;
};
export declare type TooltipState = {
    x0?: any;
    y0?: any;
    datum?: unknown;
    position?: "top" | "data";
    keepInParent?: boolean;
    xFormat?: (d: any) => string;
    yFormat?: (d: any) => string;
    content?: ({ data }: {
        data: {
            label?: string;
            group?: string;
            mark?: JSX.Element;
            x: any;
            y: any;
            formattedY?: string;
            datum?: unknown;
        }[];
    }) => React.ReactNode | undefined;
    xAxis?: (({ x }: {
        x: any;
    }) => JSX.Element) | boolean;
};
export declare const tooltipState: import("recoil").RecoilState<TooltipState>;
declare type LayoutState = {
    parentWidth: number;
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    id: string;
};
export declare const layoutState: import("recoil").RecoilState<LayoutState>;
export declare const themeState: import("recoil").RecoilState<ThemeProps>;
export {};
