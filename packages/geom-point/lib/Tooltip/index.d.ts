import React from "react";
declare type Props = {
    scales: {
        x: any;
        y: any;
    };
    group: (d: any) => string;
    datum?: {
        _id?: number;
    };
};
export declare const Tooltip: React.FC<Props>;
export {};
