import * as konva_lib_Layer from 'konva/lib/Layer';
import Konva from 'konva';
import * as konva_lib_Group from 'konva/lib/Group';
import { Group } from 'konva/lib/Group';
import { thingTextInfo as thingTextInfo$1 } from '@/data/cdata';
import inleditor, { Theme as Theme$1 } from '@/main';
import { groupNames } from 'src/element/group';
import * as src_data_cdata from 'src/data/cdata';
import { CDATA } from 'src/data/cdata';
import * as konva_lib_Shape from 'konva/lib/Shape';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import * as konva_lib_Node from 'konva/lib/Node';
import * as konva_lib_Stage from 'konva/lib/Stage';
import { Thing as Thing$1 } from '@/data/thing';
import INLEDITOR$1 from '@/index';

type LayerTypes = "test" | "thing" | "line" | "util";
declare const LAYER: Record<LayerTypes, LayerTypes>;
declare const _default: (stage: Konva.Stage, type: keyof typeof LAYER) => konva_lib_Layer.Layer;

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

declare const createThingDefaultText: (themeType: Theme, data: thingTextInfo$1, position: {
    x: number;
    y: number;
}, group?: Konva.Group) => konva_lib_Group.Group;

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

type THINGTEXTINFO = {
    type: keyof typeof groupNames;
    info: thingTextInfo;
    position?: {
        x: number;
        y: number;
    };
};
type THINGTEXT = Array<THINGTEXTINFO>;
declare const getThingChildPosition: (stage: Konva.Stage, iu: string) => THINGTEXT;
declare const setThingScale: (stage: Konva.Stage, iu: string, scaleX: number, scaleY: number) => void;
declare const setThingChildPosition: (ie: inleditor, iu: string, themeType: Theme$1, arr: THINGTEXT) => void;

type AlignType = "moveToTop" | "moveToBottom" | "moveUp" | "moveDown" | "top" | "left" | "right" | "bottom" | "centerY" | "centerX" | "flipX" | "distributionY" | "distributionX" | "flipY";

declare const getCustomAttrs: (e: Konva.Stage | Konva.Group | Konva.Node) => CDATA;
declare const setCustomAttrs: (e: Konva.Stage | Konva.Group | Konva.Node, data: CDATA) => void;
declare const getLineInfo: (e: Konva.Node) => src_data_cdata.LINEINFO;

declare const fileToBase64: (files: FileList) => Promise<any[]>;
declare const getMouseOver: (point: {
    x: number;
    y: number;
}, stage: Konva.Stage) => konva_lib_Node.Node<konva_lib_Node.NodeConfig>;
declare const addMapTitle: (stage: Konva.Stage, title: string, themeType: Theme$1) => void;
declare const getThingImage: (thingGroup: Konva.Group) => konva_lib_Group.Group | konva_lib_Shape.Shape<konva_lib_Shape.ShapeConfig>;

type GroupNames = "thingGroup" | "thingTextGroup" | "thingDefTextGroup" | "thingInputGroup" | "thingSwitchGroup" | "thingButtonGroup";

type onSelectCallBackFun = (type: "thing" | "shape" | "thingText" | "stage" | string, e: {
    target: Konva.Group | Konva.Rect | Shape<ShapeConfig> | Konva.Stage;
    parent?: Konva.Group | Konva.Rect | Shape<ShapeConfig> | Konva.Stage;
}, data?: {
    iu?: string;
    codes?: Array<string>;
    ids?: Array<string>;
    attrs?: Konva.NodeConfig;
}) => void;

declare enum LineAnimateType {
    "default" = 0,
    "flow" = 1,
    "dot" = 2
}
interface LineAnimateOpt {
    line: Konva.Arrow;
    ie: INLEDITOR;
    direction: "inverse" | "obey";
    animateType: keyof typeof LineAnimateType;
    speed?: number;
}
interface LineAnimate {
    opt: LineAnimateOpt;
    start: () => void;
    stop: () => void;
    destroy: () => void;
}
declare class LineAnimate {
    constructor(opt: LineAnimateOpt);
    animateLayer: Konva.Layer;
    animateEl: Group | Shape<ShapeConfig>;
    start: () => void;
    stop: () => void;
    runState: boolean;
    destroy: () => void;
    opt: LineAnimateOpt;
    init(): void;
    speed: number;
    resetAnimate: Record<keyof typeof LineAnimateType, () => {
        start: () => void;
        stop: () => void;
    }>;
    reset(): void;
}

type DrawState = "Line" | "dottedLine" | "rightAngleLine" | "rightAngleDottedLine" | "editLine" | "Rect" | "Text" | "img" | "dragStage" | "fieldSelect" | "default";
declare enum SpecialCode {
    all = "allOfThem"
}
type onDropCb = (s: Thing, p: {
    x: number;
    y: number;
}, parent?: Konva.Group) => void;
type onCreateLineCb = (id: string) => void;
interface OPT$1 {
    id: string;
    theme?: Theme;
    onDropCb?: onDropCb;
    onCreateLineCb?: onCreateLineCb;
    onRemoveCb?: () => void;
    onTransform?: () => void;
    isPreview?: boolean;
    json?: string;
    scale?: "show" | "hide";
}
interface INLEDITOR {
    [ket: string]: any;
    opt: OPT$1;
    components: {
        [ket: string]: ComponentFac;
    };
}
declare class INLEDITOR {
    constructor(opt: OPT$1);
    init(json?: string | null): Promise<void>;
    keyUp: (e: any) => void;
    keyDown: (e: any) => void;
    historyArr: any[];
    thingLayer: any;
    componentArr: any[];
    protected theme: Theme;
    getTheme(): Theme;
    protected event(): void;
    protected stage: Konva.Stage;
    getStage(): konva_lib_Stage.Stage;
    setStage(c: Konva.Stage): void;
    setField(stage: any, height: number, width: number): void;
    protected container: HTMLDivElement;
    getContainer(): HTMLDivElement;
    setContainer(c: HTMLDivElement): void;
    protected drawState: DrawState;
    drawInfo: {
        type?: string;
        url?: string;
        dotted?: number[];
    };
    protected stateChangeCb: (state: DrawState) => void | undefined;
    onDrawStateChange(cb: (state: DrawState) => {}): void;
    getDrawState(): DrawState;
    setDrawState(state: DrawState, info?: {
        type: string;
        url: string;
    }): void;
    removeNode: (node: Konva.Group) => void;
    disableStageMove(): void;
    createLineGroup: (line: any, useThing: Thing) => konva_lib_Group.Group;
    createThingText: (iu: string, type?: "thing" | "line") => {
        addText?: undefined;
        batchAddText?: undefined;
    } | {
        addText: (data: thingTextInfo, type: GroupNames, cb?: (thingTextGroup: konva_lib_Group.Group, i: THINGTEXTINFO) => void, i?: THINGTEXTINFO) => any;
        batchAddText: (list: {
            type: GroupNames;
            info: thingTextInfo;
        }[], cb: (g: konva_lib_Group.Group, i: THINGTEXTINFO) => void) => void;
    };
    setComponentScale: (iu: string, scale: number) => void;
    changeTheme(themeType: Theme, cb?: (stage: Konva.Stage) => {}): void;
    setVal(iu: string, propertyId: string, val: string): void;
    changeLabel: (iu: string, propertyId: string, val: boolean) => void;
    resetText(iu: string, propertyId: string, info: thingTextInfo, type: string): void;
    resetTexts: (arr: {
        iu: string;
        propertyId: string;
        info: thingTextInfo;
        type: string;
    }[]) => void;
    removeText(iu: string, ids: Array<string | SpecialCode.all>): void;
    getAllIus(): string[];
    getThingState(iu: string): string | number;
    setThingState(iu: string, setStateVal: string | number, src?: string): Promise<void>;
    use(component: ComponentFac): void;
    getComponent<T extends ComponentFac>(s: string): T;
    toJson(source?: string): {
        res: boolean;
        mapJson?: undefined;
        image?: undefined;
    } | {
        mapJson: string;
        image: string;
        res?: undefined;
    };
    deleteAllPoint(): void;
    loadJson(json?: string | null, cb?: any): Promise<void>;
    toImage(): string;
    getCodeById(iu: string): any[];
    selectCb: onSelectCallBackFun;
    onselect(cb: onSelectCallBackFun): void;
    getRelations(): any[];
    getRelation(line: any): any[];
    updateLineColor(key: any, line: any): void;
    updateLineOption(line: any, key: any, option: {
        color?: string;
        dotted?: number[];
    }): void;
    toFit(): void;
    hasChange: boolean;
    onStageChange: (ie: any, cb?: () => void) => void;
    changeElementsPosition(type: AlignType): void;
    render(opt?: {
        width: number;
        height: number;
    }): void;
}
declare const Animate: typeof LineAnimate;

type EditorCom = {
    thingGroup?: Konva.Group;
    imgGroup?: Konva.Group;
};
declare class ComponentFac {
    name: string;
    editor: INLEDITOR;
    version: string;
    stage: any;
    constructor(stage: any);
    product(position: {
        x: number;
        y: number;
    }, size: {
        width: number;
        height: number;
    }, thingInfo?: Thing$1): EditorCom;
}

interface BELT {
    stage: Konva.Stage;
    group: Konva.Group;
    thingGroup: Konva.Group;
    brect: Konva.Rect;
    brect1: Konva.Rect;
    brect2: Konva.Rect;
    circle: Konva.Circle;
    circle1: Konva.Circle;
}
declare class BELT {
    constructor(stage: Konva.Stage, info: {
        thingInfo: Thing;
        p?: {
            x: number;
            y: number;
        };
    });
    name: string;
    createThingGroup(thingInfo: Thing, p?: {
        x: number;
        y: number;
    }): void;
    config: any;
    render(stateType: number): void;
    protected draw: {
        event: () => void;
        init: () => void;
        render: (stateType: number | string) => void;
    };
}
declare const changeBeltState: (stage: Konva.Stage, stateType: string | number, iu: string) => konva_lib_Group.Group;
declare const setBeltScale: (ie: INLEDITOR$1, iu: string, thingGroup: any, scale: number) => void;

interface ScaleOpt {
}
interface Scale {
    opt: ScaleOpt;
}
declare class Scale extends ComponentFac {
    name: string;
    constructor(editor: any);
    visible: boolean;
    syd: HTMLDivElement;
    sxd: HTMLDivElement;
    scaleX: Konva.Stage;
    scaleY: Konva.Stage;
    scaleLayerX: Konva.Layer;
    scaleLayerY: Konva.Layer;
    hide(): void;
    show(): void;
    changeVisable(): void;
    render(): void;
    createScaleLine(): void;
    computedSXY(width: number, height: number, offsetx: number, offsety: number, fiveScale: number, maxw: number, scaleTheme: any): {
        linesx: any[];
        linesy: any[];
    };
    moveStageByCanvasOffset(): void;
    onChange(): void;
    createDom(): void;
    createStage(): void;
    destroy(): void;
}

interface Pool {
    setLevel: (id: string, percent: number) => void;
}
declare class Pool extends ComponentFac {
    name: string;
    pools: any[];
    constructor(stage: any);
    add(thingInfo: Thing$1, p?: {
        x: number;
        y: number;
    }, eleGroup?: Konva.Group): void;
    draw(thingInfo: Thing$1, p: {
        x: number;
        y: number;
    }): konva_lib_Group.Group;
    setLevel: (id: string, percent: number) => void;
}

interface VideoNode {
}
declare class VideoNode extends ComponentFac {
    constructor(stage: any);
    name: string;
    width: number;
    height: number;
    elements: any[];
    add: (thingInfo: Thing$1, p?: {
        x: number;
        y: number;
    }, isPreview?: boolean, eleGroup?: Konva.Group) => Promise<void>;
    destory: () => void;
    draw: (thingInfo: Thing$1, imgUrl: string, p: {
        x: number;
        y: number;
    }) => Promise<void>;
}

declare const changeState: (stage: Konva.Stage, stateType: string | number, iu: string) => konva_lib_Group.Group;
interface Scraper {
    stage: Konva.Stage;
    group: Konva.Group;
    thingGroup: Konva.Group;
    rect: Konva.Rect;
}
declare class Scraper {
    constructor(stage: Konva.Stage, info: {
        thingInfo: Thing;
        p?: {
            x: number;
            y: number;
        };
    });
    name: string;
    createThingGroup(thingInfo: Thing, p?: {
        x: number;
        y: number;
    }): void;
    config: any;
    render(stateType: number): void;
    protected draw: {
        event: () => void;
        changeWidth: () => void;
        init: () => void;
        render: (stateType: number | string) => Promise<void>;
    };
}
declare const setScraperScale: (ie: INLEDITOR$1, iu: string, thingGroup: any, scale: number) => Promise<void>;

interface StoreHouse {
    setLevel: (id: string, percent: number) => void;
}
declare class StoreHouse extends ComponentFac {
    constructor(stage: any);
    name: string;
    arr: any[];
    add(thingInfo: Thing$1, p?: {
        x: number;
        y: number;
    }, eleGroup?: Konva.Group): void;
    refreshImg: (thingInfo: any, thingImage: any) => void;
    draw(thingInfo: Thing$1, p: {
        x: number;
        y: number;
    }): konva_lib_Group.Group;
    setLevel: (id: string, percent: number) => void;
}

interface Technique {
    stage: Konva.Stage;
    group: Konva.Group;
    thingGroup: Konva.Group;
    rect: Konva.Rect;
}
declare class Technique {
    constructor(stage: Konva.Stage, info: {
        thingInfo: Thing;
        p?: {
            x: number;
            y: number;
        };
    });
    name: string;
    createThingGroup(thingInfo: Thing, p?: {
        x: number;
        y: number;
    }): void;
    config: any;
    render(stateType: number): void;
    protected draw: {
        event: () => void;
        init: () => void;
        render: (stateType: number | string) => Promise<void>;
    };
}
declare const setText: (stage: Konva.Stage, text: string, iu: string) => void;

declare const isComponentChild: (node: Konva.Node) => {
    node: konva_lib_Node.Node<konva_lib_Node.NodeConfig>;
};
declare const isComponentChildren: (node: Konva.Node) => boolean;
declare const componentsName: string[];

declare const setLineWidth: (line: Konva.Node, size: number) => void;
declare const getLineWidth: (line: Konva.Node) => any;

declare const addLineText: (stage: Konva.Stage, line: Konva.Arrow, text: string) => void;

interface OPT {
    stage: Konva.Stage;
    uuid: string;
    imgUrl?: string;
    autoPlay?: boolean;
    direction?: "left" | "right";
}
interface COALANIM {
    autoPlay: boolean;
    animEl: Konva.Node;
    stage: Konva.Stage;
    animGroup: Konva.Group;
    cacheCoal: Konva.Star | Konva.Image;
    tim: any;
    movejl: number;
    direction: "left" | "right";
}
declare class COALANIM {
    constructor(opt: OPT);
    init(autoPlay: any, uuid: any, imgUrl: any): Promise<void>;
    movejl: number;
    reset(uuid: string, imgUrl: string): Promise<void>;
    runState: boolean;
    start(): void;
    stop(): void;
    destroy(): void;
    anim(): void;
}

export { AlignType, Animate, BELT, COALANIM, ComponentFac, DrawState, Pool, Scale, Scraper, StoreHouse, Technique, Theme, VideoNode, addLineText, addMapTitle, changeBeltState, changeState, componentsName, createThingDefaultText, INLEDITOR as default, defaultTheme, fileToBase64, getCustomAttrs, _default as getLayer, getLineInfo, getLineWidth, getMouseOver, getThingChildPosition, getThingImage, INLEDITOR as inleditor, isComponentChild, isComponentChildren, onCreateLineCb, onDropCb, setBeltScale, setCustomAttrs, setLineWidth, setScraperScale, setText, setThingChildPosition, setThingScale, thtmeInfo };
