import Konva from 'konva';

interface ThingTextType {
    def: {
        val: Konva.NodeConfig;
    };
    advanced: {
        val: Konva.NodeConfig;
        unit: Konva.NodeConfig;
        label: Konva.NodeConfig;
    };
}
declare const ThingText: Record<Theme, ThingTextType>;

interface ThemeInfo {
    scale: Konva.NodeConfig;
    background: string;
    subLine: Konva.NodeConfig;
    rect: Konva.NodeConfig;
    selection: Konva.NodeConfig;
    thingText: ThingTextType;
    text: Konva.TextConfig;
    MapTitleTheme: Konva.TextConfig;
}
type Theme = "light" | "dark";
declare const defaultTheme: Theme;
declare const thtmeInfo: Record<Theme, ThemeInfo>;

declare const LineTheme: Record<Theme, Konva.NodeConfig>;
declare const lineState: {
    default: string;
    light: {
        RAW_COAL: string;
        CLEAN_COAL: string;
        REJECT: string;
        SLURRY: string;
        DILUTE_MEDIUM: string;
        MIDDLINGS: string;
        SLIME: string;
        CLARIFIED_WATER: string;
        CORRECT_MEDIUM: string;
        AIR: string;
    };
    dark: {
        RAW_COAL: string;
        CLEAN_COAL: string;
        REJECT: string;
        SLURRY: string;
        DILUTE_MEDIUM: string;
        MIDDLINGS: string;
        SLIME: string;
        CLARIFIED_WATER: string;
        CORRECT_MEDIUM: string;
        AIR: string;
    };
};
declare const subLineTheme: Record<Theme, Konva.NodeConfig>;

declare const RectTheme: Record<Theme, Konva.NodeConfig>;

interface ScaleThemeType extends Konva.NodeConfig {
}
declare const ScaleTheme: Record<Theme, ScaleThemeType>;

declare const SelectionTheme: Record<Theme, Konva.NodeConfig>;

declare const aniLineState: {
    light: {
        RAW_COAL: string;
        CLEAN_COAL: string;
        REJECT: string;
        SLURRY: string;
        DILUTE_MEDIUM: string;
        MIDDLINGS: string;
        SLIME: string;
        CLARIFIED_WATER: string;
        CORRECT_MEDIUM: string;
        AIR: string;
    };
    dark: {
        RAW_COAL: string;
        CLEAN_COAL: string;
        REJECT: string;
        SLURRY: string;
        DILUTE_MEDIUM: string;
        MIDDLINGS: string;
        SLIME: string;
        CLARIFIED_WATER: string;
        CORRECT_MEDIUM: string;
        AIR: string;
    };
};
declare const lineAni: {
    flow: {
        light: {
            stroke: string;
        };
        dark: {
            stroke: string;
        };
    };
    dotted: {
        light: {
            stroke: string;
        };
        dark: {
            stroke: string;
        };
    };
    dot: {
        light: {
            fill: string;
        };
        dark: {
            fill: string;
        };
    };
};

declare const MapTitleTheme: Record<Theme, Konva.NodeConfig>;

export { LineTheme, MapTitleTheme, RectTheme, ScaleTheme, ScaleThemeType, SelectionTheme, Theme, ThingText, ThingTextType, aniLineState, defaultTheme, lineAni, lineState, subLineTheme, thtmeInfo };
