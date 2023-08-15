const LineTheme = {
    light: {
        pointerLength: 10,
        pointerWidth: 10,
        fill: "green",
        stroke: "green",
        strokeWidth: 4,
        borderOuter: "#DCE2ED",
        borderInner: "#F4F6F9",
    },
    dark: {
        pointerLength: 10,
        pointerWidth: 10,
        fill: "black",
        stroke: "black",
        strokeWidth: 4,
        borderOuter: "#7C87A1",
        borderInner: "#354468",
    },
};
const lineState = {
    default: "CLEAN_COAL",
    light: {
        RAW_COAL: "#EA5858",
        CLEAN_COAL: "#3FCC83",
        REJECT: "#6554C0",
        SLURRY: "#A52337",
        DILUTE_MEDIUM: "#9095A2",
        MIDDLINGS: "#FF9214",
        SLIME: "#729918",
        CLARIFIED_WATER: "#1CDDEB",
        CORRECT_MEDIUM: "#354052",
        AIR: "#D439D4",
    },
    dark: {
        RAW_COAL: "#EA5858",
        CLEAN_COAL: "#3FCC83",
        REJECT: "#6554C0",
        SLURRY: "#A52337",
        DILUTE_MEDIUM: "#9095A2",
        MIDDLINGS: "#FF9214",
        SLIME: "#729918",
        CLARIFIED_WATER: "#1CDDEB",
        CORRECT_MEDIUM: "#354052",
        AIR: "#D439D4",
    },
};
const subLineTheme = {
    light: {
        stroke: "rgb(0, 161, 255)",
        strokeWidth: 1,
        name: "guid-line",
        dash: [4, 6],
    },
    dark: {
        stroke: "rgb(0, 161, 255)",
        strokeWidth: 1,
        name: "guid-line",
        dash: [4, 6],
    },
};

const RectTheme = {
    light: {
        fill: "#D8D8D8",
        stroke: "#D8D8D8",
        strokeWidth: 1,
        draggable: true,
        strokeScaleEnabled: false,
    },
    dark: {
        fill: "#D8D8D8",
        stroke: "#D8D8D8",
        strokeWidth: 1,
        draggable: true,
        strokeScaleEnabled: false,
    },
};

const ScaleTheme = {
    light: {
        background: "#fff",
        thickness: 20,
        lineFill: "#000",
        fontColor: "#354052",
        fontOpacity: 0.5,
    },
    dark: {
        background: "#fff",
        thickness: 20,
        lineFill: "#000",
        fontColor: "#354052",
        fontOpacity: 0.5,
    },
};

const SelectionTheme = {
    light: {
        fill: "transparent",
        stroke: "black",
    },
    dark: {
        fill: "transparent",
        stroke: "#fff",
    },
};

const ThingText = {
    light: {
        def: {
            val: {
                fill: "#354052",
                size: 14,
            },
        },
        advanced: {
            val: {
                fill: "#5C667D",
                size: 14,
                rectFill: "#FFFFFF",
                rectStroke: "#B9C2D5",
                rectHeight: 24,
                rectWidth: 47,
            },
            unit: {
                fill: "#5C667D",
                size: 12,
                opacity: 0.5,
            },
            label: {
                fill: "#5C667D",
                size: 14,
            },
        },
    },
    dark: {
        def: {
            val: {
                fill: "#9CA9C7",
                size: 14,
            },
        },
        advanced: {
            val: {
                fill: "white",
                size: 14,
                rectFill: "#2A6BDB",
                rectStroke: "#1D56A1",
                rectHeight: 24,
                rectWidth: 47,
            },
            unit: {
                fill: "#fff",
                size: 12,
                opacity: 0.5,
            },
            label: {
                fill: "#9CA9C7",
                size: 14,
            },
        },
    },
};

const defaultText = "文本";
const Text = {
    light: {
        fill: "#354052",
        text: defaultText,
        fontSize: 40,
    },
    dark: {
        fill: "#9CA9C7",
        text: defaultText,
        fontSize: 40,
    },
};

const MapTitleTheme = {
    light: {
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientColorStops: [
            0,
            "#BCE7FF ",
            0.5,
            "#4DD8FF ",
            1,
            "#BCE7FF",
        ],
    },
    dark: {
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientColorStops: [
            0,
            "#BCE7FF ",
            0.5,
            "#4DD8FF ",
            1,
            "#BCE7FF",
        ],
    },
};

const defaultTheme = "dark";
const thtmeInfo = {
    light: {
        scale: ScaleTheme.light,
        background: "#EFF2F6",
        subLine: subLineTheme.light,
        rect: RectTheme.light,
        selection: SelectionTheme.light,
        thingText: ThingText.light,
        text: Text.light,
        MapTitleTheme: MapTitleTheme.light,
    },
    dark: {
        scale: ScaleTheme.dark,
        background: "#000F37",
        subLine: subLineTheme.dark,
        rect: RectTheme.dark,
        selection: SelectionTheme.dark,
        thingText: ThingText.dark,
        text: Text.dark,
        MapTitleTheme: MapTitleTheme.dark,
    },
};

const aniLineState = {
    light: {
        RAW_COAL: "#FAD3D3",
        CLEAN_COAL: "#B2EDD4",
        REJECT: "#DCD7F4",
        SLURRY: "#EACDD2",
        DILUTE_MEDIUM: "#E3E7F0",
        MIDDLINGS: "#FFE2C1",
        SLIME: "#CCDEA3",
        CLARIFIED_WATER: "#BEEFF3",
        CORRECT_MEDIUM: "#CCD5E4",
        AIR: "#F1C9F1",
    },
    dark: {
        RAW_COAL: "#4B2943",
        CLEAN_COAL: "#144C50",
        REJECT: "#232863",
        SLURRY: "#371A3A",
        DILUTE_MEDIUM: "#495471",
        MIDDLINGS: "#523B2E",
        SLIME: "#273D30",
        CLARIFIED_WATER: "#175070",
        CORRECT_MEDIUM: "#212F51",
        AIR: "#452069",
    },
};
const lineAni = {
    flow: {
        light: {
            stroke: "lightgreen",
        },
        dark: {
            stroke: "green",
        },
    },
    dotted: {
        light: {
            stroke: "lightskyblue",
        },
        dark: {
            stroke: "blue",
        },
    },
    dot: {
        light: {
            fill: "orange",
        },
        dark: {
            fill: "brown",
        },
    },
};

export { LineTheme, MapTitleTheme, RectTheme, ScaleTheme, SelectionTheme, ThingText, aniLineState, defaultTheme, lineAni, lineState, subLineTheme, thtmeInfo };
