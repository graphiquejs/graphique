import React from "react";
export declare type Aes = {
    x: (d: any) => any;
    y: (d: any) => any;
    stroke?: (d: any) => any;
    size?: (d: any) => any;
    fill?: (d: any) => any;
    group?: (d: any) => any;
    label?: (d: any) => string;
    key?: (d: any) => unknown;
};
export declare type GGProps = {
    /** the data used to create the base, an array of objects */
    data: unknown[];
    /** the mapping of data characteristics to visual characteristics */
    aes: Aes;
    width?: number;
    height?: number;
    margin?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
    parentWidth?: number;
    useParentWidth?: boolean;
    onMouseOver?: ({ x0, y0 }: {
        x0?: any;
        y0?: any;
    }) => void;
    onMouseOut?: () => void;
    id?: string;
};
export declare const GGBase: React.FC<GGProps>;
