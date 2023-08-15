import * as konva_lib_Node from 'konva/lib/Node';
import Konva from 'konva';
import { groupNames } from 'src/element/group';
import * as konva_lib_Group from 'konva/lib/Group';
import * as konva_lib_Stage from 'konva/lib/Stage';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Thing as Thing$1 } from '@/data/thing';
import INLEDITOR$1 from '@/index';

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

type Theme = "light" | "dark";

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

type AlignType = "moveToTop" | "moveToBottom" | "moveUp" | "moveDown" | "top" | "left" | "right" | "bottom" | "centerY" | "centerX" | "flipX" | "distributionY" | "distributionX" | "flipY";

type DrawState = "Line" | "dottedLine" | "rightAngleLine" | "rightAngleDottedLine" | "editLine" | "Rect" | "Text" | "img" | "dragStage" | "fieldSelect" | "default";
declare enum SpecialCode {
    all = "allOfThem"
}
type onDropCb = (s: Thing, p: {
    x: number;
    y: number;
}, parent?: Konva.Group) => void;
type onCreateLineCb = (id: string) => void;
interface OPT {
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
    opt: OPT;
    components: {
        [ket: string]: ComponentFac;
    };
}
declare class INLEDITOR {
    constructor(opt: OPT);
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

export { BELT, ComponentFac, Pool, Scale, Scraper, StoreHouse, Technique, VideoNode, changeBeltState, changeState, componentsName, isComponentChild, isComponentChildren, setBeltScale, setScraperScale, setText };
