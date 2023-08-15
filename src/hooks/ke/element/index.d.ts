import * as konva_lib_Group from 'konva/lib/Group';
import Konva from 'konva';
import * as konva_lib_shapes_Line from 'konva/lib/shapes/Line';
import { LineConfig } from 'konva/lib/shapes/Line';
import * as konva_lib_Node from 'konva/lib/Node';
import * as konva_lib_Context from 'konva/lib/Context';
import * as konva_lib_Shape from 'konva/lib/Shape';
import * as konva_lib_types from 'konva/lib/types';
import * as konva_lib_shapes_Rect from 'konva/lib/shapes/Rect';
import { RectConfig } from 'konva/lib/shapes/Rect';

type Theme = "light" | "dark";

interface Thing {
    iu?: string;
    ic?: string;
    tc?: string;
    img?: string;
    fullImg?: string;
    name?: string;
    type?: string;
    id?: string;
}

interface thingTextInfo {
    v?: string;
    code?: string;
    label?: string;
    showLabel?: boolean;
    unit?: string;
    id?: string;
    btns?: string[];
    switchOpt?: {
        checkedLabel: string;
        checkedValue: string;
        unCheckedLabel: string;
        unCheckedValue: string;
    };
}

type GroupNames = "thingGroup" | "thingTextGroup" | "thingDefTextGroup" | "thingInputGroup" | "thingSwitchGroup" | "thingButtonGroup";
declare const groupNames: Record<GroupNames, GroupNames>;
type Parent = Konva.Group | Konva.Layer | Konva.Stage;
type Child = Konva.Group | Konva.Layer | Konva.Line | Konva.Circle | Konva.Rect | Konva.Text;
declare const createThingGroup: (useThing: Thing, id?: string) => konva_lib_Group.Group;
declare const getThingGroups: (parent: Parent) => Array<Konva.Group>;
declare const getThingGroup: (parent: Parent, iu: string) => Konva.Group;
declare const createThingTextGroup: (data: thingTextInfo, name: keyof typeof groupNames, position: {
    x: number;
    y: number;
}) => konva_lib_Group.Group;
declare const getThingTextGroup: (group: Konva.Group, name?: keyof typeof groupNames) => konva_lib_Group.Group[];
declare const setThingTextGroupTheme: (ea: Konva.Group, themeType: Theme) => void;
declare const setThingDefTextGroupTheme: (ea: Konva.Group, themeType: Theme) => void;
declare const setThingGroupTheme: (stage: Konva.Stage, themeType: Theme) => void;

declare const createImage: (img: string) => Promise<Konva.Image>;
declare const changeThingComponentState: (stage: Konva.Stage, node: Konva.Image, state: string | number) => void;
declare const changeThingImage: (imageNode: Konva.Image, src: string, state: string) => Promise<void>;

declare const createSubLine: (conf: LineConfig, themeType?: Theme) => konva_lib_shapes_Line.Line<{
    stroke: any;
    strokeWidth: any;
    name: string;
    dash: any;
    points?: number[] | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
    tension?: number;
    closed?: boolean;
    bezier?: boolean;
    fill?: string;
    fillPatternImage?: HTMLImageElement;
    fillPatternX?: number;
    fillPatternY?: number;
    fillPatternOffset?: konva_lib_types.Vector2d;
    fillPatternOffsetX?: number;
    fillPatternOffsetY?: number;
    fillPatternScale?: konva_lib_types.Vector2d;
    fillPatternScaleX?: number;
    fillPatternScaleY?: number;
    fillPatternRotation?: number;
    fillPatternRepeat?: string;
    fillLinearGradientStartPoint?: konva_lib_types.Vector2d;
    fillLinearGradientStartPointX?: number;
    fillLinearGradientStartPointY?: number;
    fillLinearGradientEndPoint?: konva_lib_types.Vector2d;
    fillLinearGradientEndPointX?: number;
    fillLinearGradientEndPointY?: number;
    fillLinearGradientColorStops?: (string | number)[];
    fillRadialGradientStartPoint?: konva_lib_types.Vector2d;
    fillRadialGradientStartPointX?: number;
    fillRadialGradientStartPointY?: number;
    fillRadialGradientEndPoint?: konva_lib_types.Vector2d;
    fillRadialGradientEndPointX?: number;
    fillRadialGradientEndPointY?: number;
    fillRadialGradientStartRadius?: number;
    fillRadialGradientEndRadius?: number;
    fillRadialGradientColorStops?: (string | number)[];
    fillEnabled?: boolean;
    fillPriority?: string;
    fillAfterStrokeEnabled?: boolean;
    hitStrokeWidth?: string | number;
    strokeScaleEnabled?: boolean;
    strokeHitEnabled?: boolean;
    strokeEnabled?: boolean;
    lineJoin?: konva_lib_Shape.LineJoin;
    lineCap?: konva_lib_Shape.LineCap;
    sceneFunc?: (con: konva_lib_Context.Context, shape: konva_lib_Shape.Shape<konva_lib_Shape.ShapeConfig>) => void;
    hitFunc?: (con: konva_lib_Context.Context, shape: konva_lib_Shape.Shape<konva_lib_Shape.ShapeConfig>) => void;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffset?: konva_lib_types.Vector2d;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
    shadowEnabled?: boolean;
    shadowForStrokeEnabled?: boolean;
    dashOffset?: number;
    dashEnabled?: boolean;
    perfectDrawEnabled?: boolean;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
    listening?: boolean;
    id?: string;
    opacity?: number;
    scale?: konva_lib_types.Vector2d;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    rotationDeg?: number;
    offset?: konva_lib_types.Vector2d;
    offsetX?: number;
    offsetY?: number;
    draggable?: boolean;
    dragDistance?: number;
    dragBoundFunc?: (this: konva_lib_Node.Node<konva_lib_Node.NodeConfig>, pos: konva_lib_types.Vector2d) => konva_lib_types.Vector2d;
    preventDefault?: boolean;
    globalCompositeOperation?: "" | "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "copy" | "xor" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";
    filters?: konva_lib_Node.Filter[];
}>;
declare const getSubLine: (stage: Konva.Stage | Konva.Layer, themeType?: Theme) => konva_lib_Node.Node<konva_lib_Node.NodeConfig>[];

declare const createSelectionBox: (stage: Konva.Stage, themeType?: Theme) => konva_lib_Node.Node<konva_lib_Node.NodeConfig> | konva_lib_shapes_Rect.Rect;
declare const removeSelectionBox: (stage: Konva.Stage) => void;
declare const defaultRect: (position: RectConfig, themeType?: Theme) => konva_lib_shapes_Rect.Rect;

declare const createComponentThingGoup: (parent: Konva.Group | Konva.Layer, useThing: Thing, image: Konva.Group) => konva_lib_Group.Group;
declare const createThingImageGroup: (parent: Konva.Group | Konva.Layer, useThing: Thing, x: number, y: number) => Promise<konva_lib_Group.Group>;

export { Child, GroupNames, Parent, changeThingComponentState, changeThingImage, createComponentThingGoup, createImage, createSelectionBox, createSubLine, createThingGroup, createThingImageGroup, createThingTextGroup, defaultRect, getSubLine, getThingGroup, getThingGroups, getThingTextGroup, groupNames, removeSelectionBox, setThingDefTextGroupTheme, setThingGroupTheme, setThingTextGroupTheme };
