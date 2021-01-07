import React, { CSSProperties } from "react";
declare type Props = {
    data?: unknown[];
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    opacity?: number;
    strokeOpacity?: number;
    size?: number;
    scales?: any;
    hideTooltip?: boolean;
    focused?: any;
    focusedStyle?: CSSProperties;
    unfocusedStyle?: CSSProperties;
    onFocus?: ({ data }: {
        data: unknown;
    }) => void;
    onFocusSelection?: ({ data }: {
        data: unknown;
    }) => void;
    onExit?: () => void;
};
declare const GeomPoint: React.FC<Props>;
export { GeomPoint };
