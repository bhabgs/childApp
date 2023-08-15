import Konva from 'konva';
import _, { uniqWith, isEqual } from 'lodash';
import axios from 'axios';

const LAYER = {
    test: "test",
    thing: "thing",
    line: "line",
    util: "util",
};
var layer = (stage, type) => {
    let layer = stage.find(`.${type}`)[0];
    if (!layer) {
        layer = new Konva.Layer({
            name: type,
            draggable: false,
        });
        stage.add(layer);
    }
    return layer;
};

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

const getCustomAttrs = (e) => {
    return e?.getAttr("cdata") || {};
};
const setCustomAttrs = (e, data) => {
    const cdata = getCustomAttrs(e);
    e?.setAttr("cdata", _.cloneDeep(Object.assign(cdata, data)));
};
const getLineInfo = (e) => {
    const cd = getCustomAttrs(e);
    if (!cd.lineInfo) {
        setCustomAttrs(e, {
            lineInfo: {
                outLineIds: [],
                inLineIds: [],
            },
        });
    }
    const { lineInfo } = getCustomAttrs(e);
    return lineInfo;
};

const groupNames = {
    thingGroup: "thingGroup",
    thingTextGroup: "thingTextGroup",
    thingDefTextGroup: "thingDefTextGroup",
    thingButtonGroup: "thingButtonGroup",
    thingInputGroup: "thingInputGroup",
    thingSwitchGroup: "thingSwitchGroup",
};
// 创建thing 的组
const createThingGroup = (useThing, id) => {
    const group = new Konva.Group({
        draggable: true,
        id: id || useThing?.iu,
        name: useThing.type || groupNames.thingGroup,
    });
    setCustomAttrs(group, { thing: useThing, type: groupNames.thingGroup });
    return group;
};
// 查询thing的组
const getThingGroups = (parent) => {
    return parent.find(`.${groupNames.thingGroup}`);
};
// 创建thingtext 的组
const createThingTextGroup = (data, name, position) => {
    const { x, y } = position;
    const { code, id } = data;
    const group = new Konva.Group({
        name: name,
        draggable: true,
        x: x || 0,
        y: y || 0,
    });
    setCustomAttrs(group, {
        thingTextInfo: data,
        state: "defalut",
        propertyId: id,
        propertyCode: code,
    });
    return group;
};
// 查询 thingText的租
const getThingTextGroup = (group, name) => {
    if (name)
        return group.find(`.${name}`);
    return group.children.filter((ele) => ele.name() !== "thingImage");
};
// 设置复杂thing text 的组主题
const setThingTextGroupTheme = (ea, themeType) => {
    const t = thtmeInfo[themeType];
    const label = ea.findOne(".label");
    const rect = ea.findOne(".rect");
    const val = ea.findOne(".val");
    const unit = ea.findOne(".unit");
    if (label) {
        label.setAttrs({
            fill: t.thingText.advanced.label.fill,
        });
    }
    if (rect) {
        rect.setAttrs({
            fill: t.thingText.advanced.val.rectFill,
            stroke: t.thingText.advanced.val.rectStroke,
        });
    }
    if (val) {
        val.setAttrs({
            fill: t.thingText.advanced.val.fill,
        });
    }
    if (unit) {
        unit.setAttrs({
            fill: t.thingText.advanced.unit.fill,
            opacity: t.thingText.advanced.unit.opacity,
        });
    }
};
const setThingDefTextGroupTheme = (ea, themeType) => {
    const t = thtmeInfo[themeType];
    const val = ea.findOne(".val");
    if (val) {
        val.setAttrs({
            fill: t.thingText.def.val.fill,
        });
    }
};
// 设置 Thing 组的样式
const setThingGroupTheme = (stage, themeType) => {
    const thingLayer = layer(stage, LAYER.thing);
    getThingGroups(thingLayer).forEach((item) => {
        getThingTextGroup(item, groupNames.thingTextGroup).forEach((ea) => {
            setThingTextGroupTheme(ea, themeType);
        });
        getThingTextGroup(item, groupNames.thingDefTextGroup).forEach((ea) => {
            setThingDefTextGroupTheme(ea, themeType);
        });
        // 还需要处理其他样式主题
    });
    const lineLayer = layer(stage, LAYER.line);
    getThingGroups(lineLayer).forEach((item) => {
        getThingTextGroup(item, groupNames.thingTextGroup).forEach((ea) => {
            setThingTextGroupTheme(ea, themeType);
        });
        getThingTextGroup(item, groupNames.thingDefTextGroup).forEach((ea) => {
            setThingDefTextGroupTheme(ea, themeType);
        });
        // 还需要处理其他样式主题
    });
};

const createText = (config, id) => new Konva.Text({
    fontFamily: "Calibri",
    fill: "black",
    fontSize: 14,
    verticalAlign: "middle",
    id,
    ...config,
});

const createThingDefaultText = (themeType, data, position, group) => {
    const t = thtmeInfo[themeType];
    const { v, unit, id } = data;
    group =
        group || createThingTextGroup(data, groupNames.thingDefTextGroup, position);
    const textEl = createText({
        fill: t.thingText.def.val.fill,
        fontSize: t.thingText.def.val.size,
        text: v + (unit || ""),
        align: "center",
        height: t.thingText.advanced.val.rectHeight,
        name: "val",
    }, id);
    group.add(textEl);
    return group;
};

const UUID = (n = 16) => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(n);
    });
};

const createSelectionBox = (stage, themeType) => {
    const layer = stage.findOne(`.selection`);
    if (layer)
        return layer;
    const t = thtmeInfo[themeType || "light"];
    const rect1 = defaultRect({
        name: "selection",
        strokeWidth: 1,
        strokeScaleEnabled: false,
        ...t.selection,
    });
    const layer1 = new Konva.Layer({
        name: "selectionBox",
    });
    layer1.add(rect1);
    stage.add(layer1);
    return rect1;
};
const removeSelectionBox = (stage) => {
    const layer = stage.findOne(`.selectionBox`);
    layer?.remove();
};
const defaultRect = (position, themeType) => {
    const t = thtmeInfo[themeType || "light"];
    const rect = new Konva.Rect({
        id: UUID(),
        cornerRadius: 0,
        ...t.rect,
        ...position,
    });
    setCustomAttrs(rect, {
        lineInfo: {
            outLineIds: [],
            inLineIds: [],
        },
    });
    return rect;
};

var buttonText = {
    add: (themeType, data, position, group) => {
        const { label, v, unit, id } = data;
        group =
            group ||
                createThingTextGroup(data, groupNames.thingButtonGroup, position);
        const t = thtmeInfo[themeType];
        const { advanced } = t.thingText;
        const labelText = createText({
            fill: advanced.label.fill,
            fontSize: advanced.label.size,
            text: label + "：",
            draggable: false,
            height: advanced.val.rectHeight,
            name: "label",
        });
        const btnText = createText({
            fill: "white",
            fontSize: advanced.val.size,
            text: data.btns[0],
            draggable: false,
            x: labelText.width() + 5,
            y: 1,
            align: "center",
            height: advanced.val.rectHeight,
            name: "btn",
        }, id);
        const valRect = defaultRect({
            fill: "#1D33A2",
            stroke: "#1D33A2",
            strokeWidth: 1,
            height: advanced.val.rectHeight,
            width: btnText.width() + 10,
            draggable: false,
            x: labelText.width(),
            cornerRadius: 3,
            name: "rect",
        });
        group.add(valRect, labelText, btnText);
        return group;
    },
};

const changeTextLabel = (textGroup, state) => {
    const label = textGroup.children.find((ele) => ele.name() === "label");
    if (state === label.visible()) {
        return;
    }
    if (state) {
        label.visible(true);
        const width = label.width() + 5;
        textGroup.children.forEach((ele) => {
            if (ele.name() !== "label") {
                ele.setAttrs({ x: ele.x() + width });
            }
        });
    }
    else {
        const width = label.width() + 5;
        textGroup.children.forEach((ele) => {
            if (ele.name() !== "label") {
                ele.setAttrs({ x: ele.x() - width });
            }
        });
        label.visible(false);
    }
};

const obj$1 = {
    changeVal: (group, info) => {
        const value = info.v;
        let val, unit;
        group.children.forEach((ele) => {
            if (ele.name() === "val") {
                val = ele;
            }
            else if (ele.name() === "unit") {
                unit = ele;
            }
        });
        val.setAttrs({ text: value });
        unit.setAttrs({ x: val.x() + val.width() + 5 });
        // group.getLayer().batchDraw();
    },
};
// 创建复杂的thing文字
const createThingAdvancedText = (themeType, data, position, group) => {
    const { label, v, unit, id } = data;
    group =
        group || createThingTextGroup(data, groupNames.thingTextGroup, position);
    const t = thtmeInfo[themeType];
    const { advanced } = t.thingText;
    const labelText = createText({
        fill: advanced.label.fill,
        fontSize: advanced.label.size,
        text: label + "：",
        draggable: false,
        height: advanced.val.rectHeight,
        name: "label",
    });
    const valtext = createText({
        fill: advanced.val.fill,
        fontSize: advanced.val.size,
        text: v,
        draggable: false,
        x: labelText.width() + 5,
        align: "center",
        height: advanced.val.rectHeight,
        name: "val",
    }, id);
    const unitText = createText({
        fill: advanced.unit.fill,
        fontSize: advanced.unit.size,
        opacity: advanced.unit.opacity,
        text: unit,
        x: valtext.x() + valtext.width() + 5,
        draggable: false,
        height: advanced.val.rectHeight,
        name: "unit",
    });
    group.add(labelText, valtext, unitText);
    if (!data.showLabel) {
        changeTextLabel(group, data.showLabel);
    }
    return group;
};

const obj = {
    add: (themeType, data, position, group) => {
        const { label, v, unit, id } = data;
        group =
            group || createThingTextGroup(data, groupNames.thingInputGroup, position);
        const t = thtmeInfo[themeType];
        const { advanced } = t.thingText;
        // lebel
        const labelText = createText({
            fill: advanced.label.fill,
            fontSize: advanced.label.size,
            text: label + "：",
            draggable: false,
            height: advanced.val.rectHeight,
            name: "label",
        });
        // 值
        const valtext = createText({
            fill: advanced.val.fill,
            fontSize: advanced.val.size,
            text: v,
            draggable: false,
            x: labelText.width() + 5,
            align: "center",
            height: advanced.val.rectHeight,
            name: "val",
        }, id);
        // 单位
        const unitText = createText({
            fill: advanced.unit.fill,
            fontSize: advanced.unit.size,
            opacity: advanced.unit.opacity,
            text: unit,
            x: valtext.x() + valtext.width() + 5,
            draggable: false,
            height: advanced.val.rectHeight,
            name: "unit",
        });
        // 输入文本
        const inputText = createText({
            fill: "black",
            fontSize: advanced.val.size,
            text: "",
            draggable: false,
            x: unitText.x() + unitText.width() + 10,
            align: "center",
            height: advanced.val.rectHeight,
            name: "input",
        });
        // 输入框
        const inputRect = defaultRect({
            fill: "white",
            stroke: "grey",
            strokeWidth: 1,
            height: advanced.val.rectHeight,
            width: 50,
            draggable: false,
            x: unitText.x() + unitText.width() + 5,
            cornerRadius: 3,
            name: "inputBg",
        });
        // 按钮字
        const btnText = createText({
            fill: "white",
            fontSize: advanced.val.size,
            text: data.btns[0],
            draggable: false,
            x: inputRect.x() + inputRect.width() + 10,
            y: 1,
            align: "center",
            height: advanced.val.rectHeight,
            name: "btn",
        });
        // 按钮背景
        const btnRect = defaultRect({
            fill: "#1D33A2",
            stroke: "#1D33A2",
            strokeWidth: 1,
            height: advanced.val.rectHeight,
            width: btnText.width() + 10,
            draggable: false,
            x: inputRect.x() + inputRect.width() + 5,
            cornerRadius: 3,
            name: "btnBg",
        });
        group.add(labelText, valtext, unitText, inputRect, inputText, btnText, btnRect);
        btnText.moveUp();
        return group;
    },
    changeVal: (group, info) => {
        const value = info.v;
        const val = group.findOne(".val");
        const oldWidth = val.width();
        val.setAttrs({ text: value });
        const newWidth = val.width();
        group.children.forEach((ele) => {
            if (ele.name() !== "label" && ele.name() !== "val") {
                ele.setAttrs({ x: ele.x() + (newWidth - oldWidth) });
            }
        });
        // group.getLayer().batchDraw();
    },
    focus: (item) => {
        const input = item.children.find((ele) => ele.name() === "input");
        const cursor = new Konva.Line({
            points: [
                input.x() + input.width() + 2,
                input.y() + 2,
                input.x() + input.width() + 2,
                input.y() + input.height() - 4,
            ],
            stroke: "black",
            strokeWidth: 1,
            name: "cursor",
        });
        cursor.attrs.interval = setInterval(() => {
            cursor.visible(!cursor.visible());
        }, 500);
        item.add(cursor);
    },
    blur: (item) => {
        const cursor = item.children.find((ele) => ele.name() === "cursor");
        clearInterval(cursor?.attrs.interval);
        cursor?.remove();
    },
    keyIn: (e, item) => {
        const input = item.children.find((ele) => ele.name() === "input");
        const cursor = item.children.find((ele) => ele.name() === "cursor");
        let val = input.attrs.text;
        if (e.key.length === 1) {
            input.setAttrs({ text: val + e.key });
        }
        else if (e.key === "Backspace") {
            if (val) {
                val = val.slice(0, val.length - 1);
                input.setAttrs({ text: val });
            }
        }
        cursor.setAttrs({
            points: [
                input.x() + input.width() + 2,
                input.y() + 2,
                input.x() + input.width() + 2,
                input.y() + input.height() - 4,
            ],
        });
    },
};

const changeVal = (group, thingTextInfo) => {
    const { switchOpt: { checkedLabel, checkedValue, unCheckedLabel }, v, } = thingTextInfo;
    const val = v === checkedLabel || v === checkedValue;
    let btnRect, btnText, checkRect;
    group.children.forEach((ele) => {
        if (ele.name() === "btnRect") {
            btnRect = ele;
        }
        else if (ele.name() === "btnText") {
            btnText = ele;
        }
        else if (ele.name() === "checkRect") {
            checkRect = ele;
        }
    });
    if (val) {
        btnText.setAttrs({ x: btnRect.x() + 5, text: checkedLabel });
        checkRect.setAttrs({ x: btnText.x() + btnText.width() + 5 });
        btnRect.setAttrs({
            fill: "#1D33A2",
            width: btnText.width() + checkRect.width() + 15,
        });
    }
    else {
        checkRect.setAttrs({ x: btnRect.x() + 5 });
        btnText.setAttrs({
            x: checkRect.x() + checkRect.width() + 5,
            text: unCheckedLabel,
        });
        btnRect.setAttrs({
            fill: "#99A0B6",
            width: btnText.width() + checkRect.width() + 15,
        });
    }
    // group.getLayer().batchDraw();
};
var switchText = {
    add: (themeType, data, position, group) => {
        const { label, v, unit, id } = data;
        group =
            group ||
                createThingTextGroup(data, groupNames.thingSwitchGroup, position);
        const t = thtmeInfo[themeType];
        const { advanced } = t.thingText;
        const labelText = createText({
            fill: advanced.label.fill,
            fontSize: advanced.label.size,
            text: label + "：",
            draggable: false,
            height: advanced.val.rectHeight,
            name: "label",
        });
        const btnText = createText({
            fill: "white",
            fontSize: advanced.val.size,
            text: data.switchOpt.checkedLabel,
            draggable: false,
            x: labelText.width() + 5,
            y: 1,
            align: "center",
            height: advanced.val.rectHeight,
            name: "btnText",
        });
        const checkRect = defaultRect({
            fill: "white",
            // stroke: advanced.val.rectStroke,
            strokeWidth: 0,
            height: advanced.val.rectHeight - 8,
            width: advanced.val.rectHeight - 8,
            draggable: false,
            x: btnText.x() + btnText.width() + 5,
            y: 4,
            cornerRadius: 3,
            name: "checkRect",
        });
        const btnRect = defaultRect({
            fill: "#1D33A2",
            // stroke: advanced.val.rectStroke,
            strokeWidth: 0,
            height: advanced.val.rectHeight,
            width: btnText.width() + checkRect.width() + 15,
            draggable: false,
            x: labelText.width(),
            cornerRadius: 3,
            name: "btnRect",
        });
        group.add(labelText, btnText, btnRect, checkRect);
        btnText.moveToTop();
        changeVal(group, data);
        return group;
    },
    changeVal,
};

const createTextFun = {};
createTextFun[groupNames.thingDefTextGroup] = createThingDefaultText;
createTextFun[groupNames.thingTextGroup] = createThingAdvancedText;
createTextFun[groupNames.thingButtonGroup] = buttonText.add;
createTextFun[groupNames.thingInputGroup] = obj.add;
createTextFun[groupNames.thingSwitchGroup] = switchText.add;
// 根据 组插入文字
const createThingTextByGroup = (group, texts, themeType) => {
    for (let i of texts) {
        if (i.type === "thingDefTextGroup") {
            group.add(createThingDefaultText(themeType, i.info, i.position));
        }
        else {
            group.add(createThingAdvancedText(themeType, i.info, i.position));
        }
    }
};
// 创建可编辑的文本
const createEditableText = (stage, position, themeType) => {
    const thingLayer = layer(stage, "thing");
    const Text = thtmeInfo[themeType].text;
    const { x, y } = position;
    const textNode = createText({
        ...Text,
        name: "selfText",
        draggable: true,
        editable: true,
        width: 200,
        x,
        y,
    });
    thingLayer.add(textNode);
    return textNode;
};
const editorText = (textNode, stage) => {
    const textPosition = textNode.getAbsolutePosition();
    // then lets find position of stage container on the page:
    const stageBox = stage.container().getBoundingClientRect();
    const areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
    };
    const textarea = document.createElement("textarea");
    textarea.value = textNode.text();
    textarea.style.position = "absolute";
    textarea.style.top = areaPosition.y + "px";
    textarea.style.left = areaPosition.x + "px";
    textarea.style.width = textNode.width() + "px";
    textarea.style.backgroundColor = "white";
    textarea.style.color = "black";
    document.body.appendChild(textarea);
    textNode.opacity(0);
    textarea.focus();
    textarea.addEventListener("keydown", function (e) {
        // hide on enter
        if (e.keyCode === 13) {
            textNode.text(textarea.value);
            stage.draw();
            document.body.removeChild(textarea);
            textNode.opacity(1);
        }
    });
    textarea.addEventListener("blur", function (e) {
        textNode.text(textarea.value);
        stage.draw();
        document.body.removeChild(textarea);
        textNode.opacity(1);
    });
};
// 创建文字
const createThingTexts = (ie, iu, themeType) => {
    const stage = ie.getStage();
    const thingGroup = (stage.findOne(`#${iu}`) ||
        stage.findOne(`#line${iu}`));
    if (!thingGroup)
        return {};
    const thing = thingGroup.findOne(".thingImage");
    let line;
    if (!thing) {
        line = thingGroup.children.find((node) => node.className === "Arrow");
    }
    const addText = (data, type, cb, i) => {
        let point;
        if (thing) {
            point = {
                x: (thingGroup.getClientRect().x - thingGroup.getAbsolutePosition().x) /
                    stage.scaleX(),
                y: (thingGroup.getClientRect().y -
                    thingGroup.getAbsolutePosition().y +
                    thingGroup.getClientRect().height +
                    5) /
                    stage.scaleX(),
            };
        }
        else {
            point = {
                x: line.attrs.points[0],
                y: line.attrs.points[1] + (thingGroup.children.length - 1) * 25 + 5,
            };
        }
        const group = createTextFun[type](themeType, data, {
            x: point.x,
            y: point.y,
        });
        thingGroup.add(group);
        cb ? cb(group, i) : null;
        return group;
    };
    return {
        addText,
        // 批量添加文字
        batchAddText: (list, cb) => {
            for (let i of list) {
                const { type, info } = i;
                addText(info, type, cb, i);
            }
        },
    };
};

const computedXYByEvent = (canvas, event) => {
    let { layerX, layerY } = event;
    return computedXY(canvas, layerX, layerY);
};
const computedXY = (canvas, layerX, layerY) => {
    const zoom = canvas.scaleX();
    if (canvas.attrs.x || canvas.attrs.y) {
        layerX = layerX - canvas.attrs.x;
        layerY = layerY - canvas.attrs.y;
    }
    else if (canvas._lastPos) {
        layerX = layerX - canvas._lastPos.x;
        layerY = layerY - canvas._lastPos.y;
    }
    return {
        x: layerX / zoom,
        y: layerY / zoom,
    };
};
// 根据两点画出矩形
const computedPoint = (p1, p2) => {
    return {
        y: p1.y,
        x: p1.x,
        width: p2.x - p1.x,
        height: p2.y - p1.y,
    };
};

const getTransferData = (st) => {
    let transferdata;
    try {
        transferdata = JSON.parse(st);
    }
    catch (error) {
    }
    return transferdata;
};
// 获取物模型的所有文字内容
const getThingChildPosition = (stage, iu) => {
    const thing = stage.findOne(`#${iu}`);
    const childText = thing
        .getChildren()
        .filter((item) => !item.hasName("thingImage") && item.className !== "Arrow");
    const childImage = thing
        .getChildren()
        .find((item) => item.hasName("thingImage"));
    const childLine = thing
        .getChildren()
        .find((item) => item.className === "Arrow");
    const { x, y } = childImage
        ? childImage.getAbsolutePosition()
        : {
            x: childLine.attrs.points[0],
            y: childLine.attrs.points[1],
        };
    const thingXY = computedXY(stage, x, y);
    const arr = [];
    for (let text of childText) {
        const iRect = text.getAbsolutePosition();
        const ItemXY = computedXY(stage, iRect.x, iRect.y);
        const thingTextInfo = getCustomAttrs(text).thingTextInfo;
        arr.push({
            type: text.name(),
            position: {
                x: ItemXY.x - thingXY.x,
                y: ItemXY.y - thingXY.y,
            },
            info: thingTextInfo,
        });
    }
    return arr;
};
// 设置物模型图片的缩放
const setThingScale = (stage, iu, scaleX, scaleY) => {
    const thingLayer = layer(stage, "thing");
    const thing = thingLayer.findOne(`#${iu}`);
    thing.children[0].setAttrs({ scaleX, scaleY });
};
// 设置物模型的文字位置 !!组件需要延迟调用！！
const setThingChildPosition = (ie, iu, themeType, arr) => {
    const stage = ie.getStage();
    const thing = stage.findOne(`#${iu}`);
    const creatext = createThingTexts(ie, iu, themeType);
    const { width, height, x, y } = thing.getClientRect();
    const cb = (g, i) => {
        if (!i.position) {
            const xy = computedXY(stage, x + (width - g.getClientRect().width) / 2, y + height);
            g.setPosition({
                x: xy.x,
                y: xy.y,
            });
        }
        else {
            const xy = computedXY(stage, x, y);
            g.setPosition({
                x: i.position.x + xy.x,
                y: i.position.y + xy.y,
            });
        }
    };
    creatext.batchAddText(arr, cb);
};

const cacheImgList = {};
const createImage = (img) => {
    if (!img || img === "null") {
        img = "/micro-assets/platform-web/close.png";
    }
    if (cacheImgList[img]) {
        const image = cacheImgList[img].clone();
        image.setId(UUID());
        return Promise.resolve(image);
    }
    return new Promise((res, rej) => {
        Konva.Image.fromURL(img, (darthNode) => {
            const { width, height } = darthNode.attrs.image;
            darthNode.setAttrs({
                myWidth: width,
                myHeight: height,
                src: img,
                name: "thingImage",
                id: UUID(),
            });
            darthNode.cache();
            cacheImgList[img] = darthNode;
            res(cacheImgList[img].clone());
        }, (err) => {
            img = "/micro-assets/platform-web/close.png";
            Konva.Image.fromURL(img, (darthNode) => {
                const { width, height } = darthNode.attrs.image;
                darthNode.setAttrs({
                    myWidth: width,
                    myHeight: height,
                    src: img,
                    name: "thingImage",
                    id: UUID(),
                });
                darthNode.cache();
                cacheImgList[img] = darthNode;
                res(cacheImgList[img].clone());
            });
        });
    });
};
const changeThingComponentState = (stage, node, state) => {
    const { thing } = getCustomAttrs(node.parent);
    const { componentName } = node.getAttrs();
    if (componentName && componentName === "BELT") {
        // const belt = new BELT(stage, { thingInfo: thing });
        // belt.render(state as number);
        changeBeltState(stage, state, thing.iu);
    }
    if (componentName && componentName === "Scraper") {
        // const belt = new BELT(stage, { thingInfo: thing });
        // belt.render(state as number);
        changeState(stage, state, thing.iu);
    }
};
const changeThingImage = async (imageNode, src, state) => {
    const parent = imageNode.parent;
    const data = _.cloneDeep(imageNode.getAttrs());
    imageNode.destroy();
    const newImage = await createImage(src);
    newImage.getAttrs().image.src = src;
    delete data.image;
    newImage.setAttrs(data);
    parent?.add(newImage);
};

const createSubLine = (conf, themeType) => {
    const { subLine } = thtmeInfo[themeType || defaultTheme];
    return new Konva.Line({
        ...conf,
        stroke: subLine.stroke,
        strokeWidth: subLine.strokeWidth,
        name: subLine.name,
        dash: subLine.dash,
    });
};
const getSubLine = (stage, themeType) => {
    const { subLine } = thtmeInfo[themeType || defaultTheme];
    return stage.find(`.${subLine.name}`);
};

const cData = {};

const createComponentThingGoup = (parent, useThing, image) => {
    const group = createThingGroup(useThing);
    group.add(image);
    parent.add(group);
    return group;
};
const createThingImageGroup = async (parent, useThing, x, y) => {
    const group = createThingGroup(useThing);
    const { img } = useThing;
    const image = await createImage(img);
    const { width, height } = image.attrs.image;
    image.setAttrs({
        x: x - width / 2,
        y: y - height / 2,
    });
    setCustomAttrs(image, cData);
    group.add(image);
    parent.add(group);
    parent.draw();
    return Promise.resolve(group);
};

class ComponentFac {
    name = "comp";
    editor;
    version = "0.0.1";
    stage;
    constructor(stage) {
        this.stage = stage;
    }
    product(position, size, thingInfo) {
        const editorCom = {};
        const lay = layer(this.stage, "thing");
        editorCom.imgGroup = new Konva.Group({
            ...position,
            ...size,
            draggable: false,
            name: "thingImage",
            componentName: this.name,
            id: UUID(),
        });
        editorCom.thingGroup = createComponentThingGoup(lay, thingInfo, editorCom.imgGroup);
        return editorCom;
    }
}
const useComponent = (ie, component) => {
    component.editor = ie;
    // component.init(ie.getStage());
    if (!ie.components) {
        ie.components = {};
    }
    ie.components[component.name] = component;
};

var state$1 = [
    {
        rect1: {
            bj: ["#777F89", "#EEEFF1", "#575F69"],
            border: "#000000",
        },
        rect2: {
            bj: ["#EEEFF1"],
            border: "#000000",
        },
        rect3: {
            bj: ["#E3E3E3", "#FFFFFF", "#B0B0B0"],
            border: "#88909A",
        },
        round: {
            bj: ["#88909A"],
        },
    },
    {
        rect1: {
            bj: ["#55DBA8", "#92E6C7", "#197D50"],
            border: "#000000",
        },
        rect2: {
            bj: ["#EEEFF1"],
            border: "#000000",
        },
        rect3: {
            bj: ["#E3E3E3", "#FFFFFF", "#B0B0B0"],
            border: "#2FB790",
        },
        round: {
            bj: ["#52DDAB"],
        },
    },
    {
        rect1: {
            bj: ["#6C0A0A", "#FC8181", "#BA3636"],
            border: "#000000",
        },
        rect2: {
            bj: ["#EEEFF1"],
            border: "#000000",
        },
        rect3: {
            bj: ["#E3E3E3", "#FFFFFF", "#B0B0B0"],
            border: "#B72525",
        },
        round: {
            bj: ["#F04C4C"],
        },
    },
    {
        rect1: {
            bj: ["#305EB6", "#8AB8FA", "#5A8EF6"],
            border: "#000000",
        },
        rect2: {
            bj: ["#EEEFF1"],
            border: "#000000",
        },
        rect3: {
            bj: ["#E3E3E3", "#FFFFFF", "#B0B0B0"],
            border: "#5A8EF6",
        },
        round: {
            bj: ["#629DE3"],
        },
    },
];

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

const fileToBase64 = (files) => {
    const promises = [];
    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
            promises.push(new Promise((res, rej) => {
                try {
                    let fileRead = new FileReader();
                    fileRead.readAsDataURL(file);
                    fileRead.onload = (data) => {
                        res(data.target.result);
                    };
                }
                catch (error) {
                    rej(error);
                }
            }));
        }
    }
    return Promise.all(promises);
};
const getMouseOver = (point, stage) => {
    let node = layer(stage, "thing").getIntersection(point);
    if (isComponentChildren(node)) {
        return node.parent;
    }
    if (node.name() === "field") {
        node = undefined;
    }
    return node;
};
const addMapTitle = (stage, title, themeType) => {
    const tt = stage.findOne(".mapTitle");
    if (tt) {
        tt.remove();
    }
    const texta = new Konva.Text({
        text: title,
        fontSize: 24,
        name: "mapTitle",
    });
    const tattrs = texta.getAttrs();
    delete tattrs.fill;
    const mtt = MapTitleTheme[themeType];
    const attr = {
        ...mtt,
        ...tattrs,
        fillLinearGradientEndPoint: { x: texta.width(), y: 0 },
    };
    const scale = stage.scaleX();
    const { x, y } = stage.getPosition();
    const stageWidth = stage.width();
    const text = new Konva.Text({
        ...attr,
        x: (x + (stageWidth - texta.width()) / 2) / scale,
        y: y / scale,
        draggable: true,
    });
    texta.remove();
    const lay = layer(stage, "thing");
    lay.add(text);
};
const getThingImage = (thingGroup) => {
    return thingGroup.children.find((node) => node.name() === "thingImage");
};

class BELT {
    constructor(stage, info) {
        this.stage = stage;
        this.createThingGroup(info.thingInfo, info.p);
        this.config.iu = info.thingInfo.iu;
    }
    name = "BELT";
    createThingGroup(thingInfo, p) {
        if (p) {
            this.config.left = p.x;
            this.config.top = p.y;
        }
        const thingLayer = layer(this.stage, "thing");
        const thingGroup = thingLayer.findOne(`#${thingInfo.iu}`);
        if (thingGroup) {
            this.thingGroup = thingGroup;
            this.group = this.thingGroup.findOne(".thingImage");
            this.config.width =
                this.group.getClientRect().width / this.stage.scaleX();
            // 赋值缩放比例
            setCustomAttrs(this.group, {
                scale: this.config.width / this.config.defaultWidth,
            });
            this.draw.event();
        }
        else {
            this.group = new Konva.Group({
                width: this.config.width,
                height: this.config.height,
                x: this.config.left || 0,
                y: this.config.top || 0,
                draggable: false,
                name: "thingImage",
                componentName: this.name,
                id: UUID(),
            });
            this.thingGroup = createComponentThingGoup(thingLayer, thingInfo, this.group);
            this.draw.init();
        }
    }
    config = {
        defaultWidth: 180,
        width: 180,
        height: 25,
        left: 0,
        top: 0,
        theme: 0,
        iu: undefined,
    };
    render(stateType) {
        this.config.theme = stateType;
        this.group.removeChildren();
        this.config.theme = getCustomAttrs(this.group).state || 0;
        this.draw.render(this.config.theme);
    }
    draw = {
        event: () => {
            this.group.on("transform", (e) => {
                this.group.off("transform");
                const { width, x, y } = getTran(this.stage).position;
                this.config.width = (width * this.group.scaleX()) / this.stage.scaleX();
                this.config.left = x;
                this.config.top = y;
                // 赋值缩放
                setCustomAttrs(this.group, {
                    scale: this.config.width / this.config.defaultWidth,
                });
                this.group.scale({
                    x: 1,
                    y: 1,
                });
                this.config.theme = getCustomAttrs(this.group).state || 0;
                this.group.removeChildren();
                this.draw.render(this.config.theme);
            });
        },
        init: () => {
            this.draw.render(0);
        },
        render: (stateType) => {
            const theme = state$1[stateType || 0];
            // 最大的
            this.brect = new Konva.Rect({
                fillLinearGradientStartPoint: { x: 0, y: 0 },
                fillLinearGradientEndPoint: { x: 0, y: this.config.height },
                fillLinearGradientColorStops: [
                    0,
                    theme.rect1.bj[0],
                    0.3,
                    theme.rect1.bj[1],
                    1,
                    theme.rect1.bj[2],
                ],
                width: this.config.width,
                height: this.config.height,
                cornerRadius: [13, 13, 26, 26],
                stroke: "black",
                name: "block",
                strokeWidth: 0.5,
            });
            this.brect1 = new Konva.Rect({
                x: 3,
                y: 3,
                fill: theme.rect2.bj[0],
                width: this.config.width - 6,
                height: this.config.height - 6,
                cornerRadius: [10, 10, 20, 20],
                stroke: "black",
                strokeWidth: 0.5,
                draggable: false,
            });
            this.brect2 = new Konva.Rect({
                x: 6,
                y: 6,
                fillLinearGradientStartPoint: { x: 6, y: 6 },
                fillLinearGradientEndPoint: { x: 6, y: this.config.height - 6 },
                fillLinearGradientColorStops: [
                    0,
                    theme.rect3.bj[0],
                    0.5,
                    theme.rect3.bj[1],
                    1,
                    theme.rect3.bj[2],
                ],
                draggable: false,
                width: this.config.width - 12,
                height: this.config.height - 12,
                cornerRadius: [6, 6, 13, 13],
                stroke: theme.rect3.border,
                strokeWidth: 1,
            });
            this.circle = new Konva.Circle({
                x: 13,
                y: 12.5,
                radius: 5,
                fill: theme.round.bj[0],
                draggable: false,
            });
            this.circle1 = new Konva.Circle({
                x: this.config.width - 13,
                y: 12.5,
                radius: 5,
                fill: theme.round.bj[0],
                draggable: false,
            });
            this.group.add(this.brect, this.brect1, this.brect2, this.circle, this.circle1);
            setCustomAttrs(this.thingGroup, { state: this.config.theme });
            this.thingGroup.add(this.group);
            this.draw.event();
        },
    };
}
const changeBeltState = (stage, stateType, iu) => {
    const thingLayer = layer(stage, "thing");
    const thingGroup = thingLayer.findOne(`#${iu}`);
    const thingImage = thingGroup.findOne(`.thingImage`);
    const block = thingImage.findOne(".block");
    const thingIrect = block.getAttrs();
    const width = thingIrect.width;
    const height = thingIrect.height;
    const theme = state$1[stateType];
    thingImage.removeChildren();
    const brect = new Konva.Rect({
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: height },
        fillLinearGradientColorStops: [
            0,
            theme.rect1.bj[0],
            0.3,
            theme.rect1.bj[1],
            1,
            theme.rect1.bj[2],
        ],
        width: width,
        height: height,
        cornerRadius: [13, 13, 26, 26],
        stroke: "black",
        name: "block",
        strokeWidth: 0.5,
    });
    const brect1 = new Konva.Rect({
        x: 3,
        y: 3,
        fill: theme.rect2.bj[0],
        width: width - 6,
        height: height - 6,
        cornerRadius: [10, 10, 20, 20],
        stroke: "black",
        strokeWidth: 0.5,
        draggable: false,
    });
    const brect2 = new Konva.Rect({
        x: 6,
        y: 6,
        fillLinearGradientStartPoint: { x: 6, y: 6 },
        fillLinearGradientEndPoint: { x: 6, y: height - 6 },
        fillLinearGradientColorStops: [
            0,
            theme.rect3.bj[0],
            0.5,
            theme.rect3.bj[1],
            1,
            theme.rect3.bj[2],
        ],
        draggable: false,
        width: width - 12,
        height: height - 12,
        cornerRadius: [6, 6, 13, 13],
        stroke: theme.rect3.border,
        strokeWidth: 1,
    });
    const circle = new Konva.Circle({
        x: 13,
        y: 12.5,
        radius: 5,
        fill: theme.round.bj[0],
        draggable: false,
    });
    const circle1 = new Konva.Circle({
        x: width - 13,
        y: 12.5,
        radius: 5,
        fill: theme.round.bj[0],
        draggable: false,
    });
    setCustomAttrs(thingGroup, { state: stateType });
    thingImage.add(brect, brect1, brect2, circle, circle1);
    return thingImage;
};
const setBeltScale = (ie, iu, thingGroup, scale) => {
    const thingImage = getThingImage(thingGroup);
    setCustomAttrs(thingImage, { scale });
    const comClass = ie.componentArr.find((ele) => ele.config.iu === iu);
    comClass.config.width = comClass.config.defaultWidth * scale;
    comClass.render(comClass.config.theme);
    toSelectOne(ie, thingImage);
};

class Scale extends ComponentFac {
    name = "scale";
    constructor(editor) {
        super(editor.getStage());
        this.editor = editor;
        this.createDom();
        this.createStage();
        this.onChange();
    }
    visible = true;
    syd;
    sxd;
    scaleX;
    scaleY;
    scaleLayerX;
    scaleLayerY;
    hide() {
        this.scaleX.visible(false);
        this.scaleY.visible(false);
        this.sxd.style.display = "none";
        this.syd.style.display = "none";
        this.visible = false;
    }
    show() {
        this.scaleX.visible(true);
        this.scaleY.visible(true);
        this.sxd.style.display = "block";
        this.syd.style.display = "block";
        this.visible = true;
    }
    changeVisable() {
        if (this.visible) {
            this.hide();
        }
        else {
            this.show();
        }
    }
    render() {
        this.syd.innerHTML = "";
        this.sxd.innerHTML = "";
        this.createStage();
        this.onChange();
    }
    createScaleLine() {
        const stage = this.editor.getStage();
        const themeType = this.editor.getTheme();
        const width = stage.width() / 2;
        const height = stage.height();
        stage.scaleX();
        const { x, y } = stage.position();
        const scaleTheme = thtmeInfo[themeType].scale; // 主题
        const fiveScale = 5;
        const maxw = 50;
        this.scaleLayerX.removeChildren();
        this.scaleLayerY.removeChildren();
        const { linesx, linesy } = this.computedSXY(width, height, x, y, fiveScale, maxw, scaleTheme);
        this.scaleLayerX.add(...linesx);
        this.scaleLayerY.add(...linesy);
    }
    computedSXY(width, height, offsetx, offsety, fiveScale, maxw, scaleTheme) {
        let cl = new Konva.Line({
            points: [],
            stroke: scaleTheme.lineFill,
            strokeWidth: 1,
            name: "line",
        });
        let ct = new Konva.Text({
            text: ``,
            fontSize: 10,
            y: 2,
        });
        cl.cache();
        // ct.cache();
        const linesx = [];
        const { thickness } = scaleTheme;
        const xwww = width;
        for (let i = -xwww; i < xwww; i++) {
            const x = i * fiveScale;
            if (x % maxw == 0) {
                const cloneLine = cl.clone({ points: [x, 2, x, thickness] });
                const cloneText = ct.clone({ x: x + 2, text: i });
                linesx.push(cloneLine, cloneText);
            }
            else {
                const cloneLine = cl.clone({
                    points: [x, thickness / 1.5, x, thickness],
                    strokeWidth: 0.5,
                });
                linesx.push(cloneLine);
            }
        }
        const linesy = [];
        const ywww = height;
        for (let i = -ywww; i < ywww; i++) {
            const y = i * fiveScale;
            if (y % maxw == 0) {
                const text = ct.clone({ y, x: 2, text: i });
                text.setAttrs({
                    y: y + text.width() + 2,
                    rotation: -90,
                });
                const cloneLine = cl.clone({
                    points: [2, y, thickness, y],
                });
                linesy.push(cloneLine, text);
            }
            else {
                const cloneLine = cl.clone({
                    points: [thickness / 1.5, y, thickness, y],
                    strokeWidth: 0.5,
                });
                linesy.push(cloneLine);
            }
        }
        return { linesx, linesy };
    }
    moveStageByCanvasOffset() {
        const { x, y } = this.editor.getStage().position();
        this.scaleX.setPosition({ x, y: 0 });
        this.scaleY.setPosition({ x: 0, y });
    }
    onChange() {
        let n;
        const stage = this.editor.getStage();
        stage.on("dragmove", (e) => {
            // 性能有点低, 可以优化.
            if (e.target === stage) {
                n ? clearTimeout(n) : null;
                n = setTimeout(() => {
                    this.moveStageByCanvasOffset();
                }, 1);
            }
        });
    }
    createDom() {
        const dom = document.getElementById(this.editor.opt.id);
        const themeType = this.editor.getTheme();
        const { scale } = thtmeInfo[themeType];
        const scaleX = document.createElement("div");
        const scaleY = document.createElement("div");
        scaleX.id = "scalex";
        // left: ${scale.thickness}px;
        scaleX.setAttribute("style", `top: 0;  overflow:hidden; right: 0; height: ${scale.thickness}px; position: absolute;z-index: 1;background:${scale.background};`);
        scaleY.setAttribute("style", `top: ${scale.thickness}px; left: 0; overflow:hidden; bottom: 0; width: ${scale.thickness}px; position: absolute; z-index: 1; background:${scale.background};`);
        scaleY.id = "scaleY";
        dom?.appendChild(scaleX);
        dom?.appendChild(scaleY);
        this.sxd = scaleX;
        this.syd = scaleY;
    }
    createStage() {
        const stage = this.editor.getStage();
        const themeType = this.editor.getTheme();
        const width = stage.width();
        const height = stage.height();
        const scaleTheme = thtmeInfo[themeType].scale;
        this.scaleX = new Konva.Stage({
            width,
            height: scaleTheme.thickness,
            container: this.sxd,
        });
        this.scaleLayerX = new Konva.Layer({
            name: "scalelayerx",
        });
        this.scaleX.add(this.scaleLayerX);
        this.scaleY = new Konva.Stage({
            width: scaleTheme.thickness,
            height,
            container: this.syd,
        });
        this.scaleLayerY = new Konva.Layer({
            name: "scalelayery",
        });
        this.scaleY.add(this.scaleLayerY);
        this.createScaleLine();
    }
    destroy() { }
}

// 计算两点之间的距离
const computedPointLength = (p1, p2) => {
    const x = Math.abs(p1.x - p2.x);
    const y = Math.abs(p1.y - p2.y);
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};
// 计算两点之间的速度
const computedDurationByLength = (p1, p2, speed, distance) => {
    const length = computedPointLength(p1, p2);
    const duration = (speed / distance) * length;
    return duration;
};
const getTotalDistance = (p) => {
    const animLength = p.length / 2;
    let pointRes = [];
    let distance = 0; // 总长度
    for (let i = 0; i < animLength; i++) {
        const p1 = { x: p[i * 2], y: p[i * 2 + 1] };
        pointRes.push(p1);
    }
    for (let i = 0; i < pointRes.length; i++) {
        const p1 = pointRes[i];
        const p2 = pointRes[i + 1];
        if (p2) {
            distance += computedPointLength(p1, p2) || 0;
        }
    }
    return distance;
};
const computedDuration = (p, speed) => {
    const animLength = p.length / 2;
    let pointRes = [];
    let distance = 0; // 总长度
    for (let i = 0; i < animLength; i++) {
        const p1 = { x: p[i * 2], y: p[i * 2 + 1], duration: 1 };
        pointRes.push(p1);
    }
    for (let i = 0; i < pointRes.length; i++) {
        const p1 = pointRes[i];
        const p2 = pointRes[i + 1];
        if (p2) {
            distance += computedPointLength(p1, p2) || 0;
        }
    }
    for (let i = 0; i < pointRes.length; i++) {
        const p1 = pointRes[i - 1];
        const p2 = pointRes[i];
        if (!p1) {
            p2.duration = 0;
        }
        else {
            p2.duration = computedDurationByLength(p1, p2, speed, distance);
        }
    }
    return { pointRes, distance };
};

const movePartOfLine = (points, clickIndex, point) => {
    const prev = points[clickIndex - 1];
    const next = points[clickIndex];
    // 横线
    if (prev.y === next.y) {
        // 首节点需加点
        if (clickIndex === 1) {
            points?.splice(clickIndex, 0, {
                x: prev.x,
                y: point.y,
            });
            clickIndex = 2;
        }
        else {
            prev.y = point.y;
        }
        // 尾节点需加点
        if (clickIndex === points.length - 1) {
            points?.splice(clickIndex, 0, {
                x: next.x,
                y: point.y,
            });
        }
        else {
            next.y = point.y;
        }
    }
    // 竖线
    if (prev.x === next.x) {
        // 首节点需加点
        if (clickIndex === 1) {
            points?.splice(clickIndex, 0, {
                x: point.x,
                y: prev.y,
            });
            clickIndex = 2;
        }
        else {
            prev.x = point.x;
        }
        // 尾节点需加点
        if (clickIndex === points.length - 1) {
            points?.splice(clickIndex, 0, {
                x: point.x,
                y: next.y,
            });
        }
        else {
            next.x = point.x;
        }
    }
    return points;
};
// 获取点应该添加到的下标
const getInsertIndex = (points, point) => {
    let index = 0;
    let distance = undefined;
    // 两点之前直线最短
    for (let i = 0; i <= points.length - 2; i++) {
        const point1 = points[i];
        const point2 = points[i + 1];
        const num = Math.sqrt(Math.pow(point.x - point1.x, 2) + Math.pow(point.y - point1.y, 2)) +
            Math.sqrt(Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2)) -
            Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        if (distance === undefined || num < distance) {
            distance = num;
            index = i;
        }
    }
    return index + 1;
};
// 获取线的中点，暂且为中点所在折线段的中点
const getLineMiddle = (line) => {
    const pointArr = getUsePoint(line.attrs.points);
    const distance = getTotalDistance(line.attrs.points);
    let distanceCounter = 0;
    const res = { x: 0, y: 0 };
    for (let i = 0; i < pointArr.length; i++) {
        const distanceCurrent = computedPointLength(pointArr[i], pointArr[i + 1]);
        distanceCounter += distanceCurrent;
        if (distanceCounter > distance / 2) {
            res.x = (pointArr[i].x + pointArr[i + 1].x) / 2;
            res.y = (pointArr[i].y + pointArr[i + 1].y) / 2;
            break;
        }
    }
    return res;
};

const updateLineColor = (key, line, theme) => {
    const info = getLineInfo(line);
    info.state = key;
    line.setAttrs({
        stroke: lineState[theme][key],
        fill: lineState[theme][key],
    });
};
const addLineText = (stage, line, text) => {
    const point = getLineMiddle(line);
    const lineText = new Konva.Text({
        ...point,
        text,
        fontSize: 30,
        fill: "green",
        name: "lineText",
    });
    setCustomAttrs(lineText, { lineId: line.id() });
    const lay = layer(stage, "line");
    lay.add(lineText);
};
// 连接到新块修改关系
const connectNewRect = (line, controlIndex, newParent, point, stage) => {
    const lineInfo = getCustomAttrs(line).lineInfo;
    const newInfo = getLineInfo(newParent);
    const xy = computedXY(stage, newParent.absolutePosition().x, newParent.absolutePosition().y);
    if (controlIndex === 0) {
        const oldRect = stage.findOne("#" + lineInfo.from);
        const oldRectInfo = getCustomAttrs(oldRect).lineInfo;
        oldRectInfo?.outLineIds?.splice(oldRectInfo.outLineIds.indexOf(line.id()), 1);
        lineInfo.from = newParent.id();
        lineInfo.fromExcursionX = point.x - xy.x;
        lineInfo.fromExcursionY = point.y - xy.y;
        newInfo?.outLineIds?.push(line.id());
    }
    else {
        const oldRect = stage.findOne("#" + lineInfo.to);
        const oldRectInfo = getCustomAttrs(oldRect).lineInfo;
        oldRectInfo?.inLineIds?.splice(oldRectInfo.inLineIds.indexOf(line.id()), 1);
        lineInfo.to = newParent.id();
        lineInfo.toExcursionX = point.x - xy.x;
        lineInfo.toExcursionY = point.y - xy.y;
        newInfo?.inLineIds?.push(line.id());
    }
};
// 根据konva点转换正常点
const getUsePoint = (p, i) => {
    const l = p.length;
    if (l % 2 !== 0) {
        console.warn("非原始点");
        return [];
    }
    const usePoint = [];
    for (let i = 0; i < l / 2; i++) {
        const p1 = { x: p[i * 2], y: p[i * 2 + 1], i };
        usePoint.push(p1);
    }
    if (i === 0 || i) {
        return [usePoint[i]];
    }
    return usePoint;
};
// 根据正常点转konva点
const getUsePointUn = (p) => {
    const arr = [];
    for (let i of p) {
        arr.push(i.x, i.y);
    }
    return arr;
};

class Pool extends ComponentFac {
    name = "Pool";
    pools = [];
    constructor(stage) {
        super(stage);
    }
    add(thingInfo, p, eleGroup) {
        // 拖入
        if (p) {
            this.pools.push(this.draw(thingInfo, p));
            // 反序列化
        }
        else if (eleGroup) {
            this.pools.push(eleGroup);
        }
    }
    draw(thingInfo, p) {
        const com = this.product(p, { width: width$1, height: height$1 }, thingInfo);
        const poly = new Konva.Line({
            id: UUID(),
            points: getUsePointUn(points),
            fill: "grey",
            stroke: "#AEBCC6",
            strokeWidth: 3,
            closed: true,
        });
        const rect = new Konva.Rect({
            id: UUID(),
            x: thickness,
            y: 0,
            name: "water",
            width: width$1 - 2 * thickness,
            height: height$1 - thickness,
            fill: "#5ED4EE",
        });
        com.imgGroup.add(rect);
        com.imgGroup.add(poly);
        return com.thingGroup;
    }
    setLevel = (iu, percent) => {
        const thingGroup = this.stage.findOne("#" + iu);
        const imgGroup = thingGroup.children.find((ele) => ele.attrs.name === "thingImage");
        const img = imgGroup.children.find((ele) => ele.attrs.name === "water");
        img.setAttrs({
            height: (height$1 - thickness) * percent * 0.01,
            y: (height$1 - thickness) * (1 - percent * 0.01),
        });
    };
}
const thickness = 10;
const width$1 = 100;
const height$1 = 75;
const points = [
    {
        x: 0,
        y: 0,
    },
    {
        x: thickness,
        y: 0,
    },
    {
        x: thickness,
        y: height$1 - thickness,
    },
    {
        x: width$1 - thickness,
        y: height$1 - thickness,
    },
    {
        x: width$1 - thickness,
        y: 0,
    },
    {
        x: width$1,
        y: 0,
    },
    {
        x: width$1,
        y: height$1,
    },
    {
        x: 0,
        y: height$1,
    },
];

const Events$1 = {
  WEBRTC_NOT_SUPPORT: "WEBRTC_NOT_SUPPORT",
  WEBRTC_ICE_CANDIDATE_ERROR: "WEBRTC_ICE_CANDIDATE_ERROR",
  WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED: "WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED",
  WEBRTC_ON_REMOTE_STREAMS: "WEBRTC_ON_REMOTE_STREAMS",
  WEBRTC_ON_LOCAL_STREAM: "WEBRTC_ON_LOCAL_STREAM",
  WEBRTC_ON_CONNECTION_STATE_CHANGE: "WEBRTC_ON_CONNECTION_STATE_CHANGE",
  CAPTURE_STREAM_FAILED: "CAPTURE_STREAM_FAILED",
};

// Copyright (C) <2018> Intel Corporation
//
// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line require-jsdoc
function isFirefox() {
  return window.navigator.userAgent.match("Firefox") !== null;
} // eslint-disable-next-line require-jsdoc

function isChrome() {
  return window.navigator.userAgent.match("Chrome") !== null;
} // eslint-disable-next-line require-jsdoc

function isEdge() {
  return window.navigator.userAgent.match(/Edge\/(\d+).(\d+)$/) !== null;
} // eslint-disable-next-line require-jsdoc

// Copyright (C) <2018> Intel Corporation
/**
 * @class AudioSourceInfo
 * @classDesc Source info about an audio track. Values: 'mic', 'screen-cast', 'file', 'mixed'.
 * @memberOf Owt.Base
 * @readonly
 * @enum {string}
 */

const AudioSourceInfo = {
  MIC: "mic",
  SCREENCAST: "screen-cast",
  FILE: "file",
  MIXED: "mixed",
};
/**
 * @class VideoSourceInfo
 * @classDesc Source info about a video track. Values: 'camera', 'screen-cast', 'file', 'mixed'.
 * @memberOf Owt.Base
 * @readonly
 * @enum {string}
 */

const VideoSourceInfo = {
  CAMERA: "camera",
  SCREENCAST: "screen-cast",
  FILE: "file",
  MIXED: "mixed",
};
/**
 * @class Resolution
 * @memberOf Owt.Base
 * @classDesc The Resolution defines the size of a rectangle.
 * @constructor
 * @param {number} width
 * @param {number} height
 */

class Resolution {
  // eslint-disable-next-line require-jsdoc
  constructor(width, height) {
    /**
     * @member {number} width
     * @instance
     * @memberof Owt.Base.Resolution
     */
    this.width = width;
    /**
     * @member {number} height
     * @instance
     * @memberof Owt.Base.Resolution
     */

    this.height = height;
  }
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

let logDisabled_ = true;
let deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object (or false to prevent
// the event).
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  const proto = window.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function (nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [
      nativeEventName,
      wrappedCallback,
    ]);
  };

  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function (nativeEventName, cb) {
    if (
      nativeEventName !== eventNameToWrap ||
      !this._eventMap ||
      !this._eventMap[eventNameToWrap]
    ) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [
      nativeEventName,
      unwrappedCb,
    ]);
  };

  Object.defineProperty(proto, "on" + eventNameToWrap, {
    get() {
      return this["_on" + eventNameToWrap];
    },
    set(cb) {
      if (this["_on" + eventNameToWrap]) {
        this.removeEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap]
        );
        delete this["_on" + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(
          eventNameToWrap,
          (this["_on" + eventNameToWrap] = cb)
        );
      }
    },
    enumerable: true,
    configurable: true,
  });
}

function disableLog(bool) {
  if (typeof bool !== "boolean") {
    return new Error(
      "Argument type: " + typeof bool + ". Please use a boolean."
    );
  }
  logDisabled_ = bool;
  return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
}

/**
 * Disable or enable deprecation warnings
 * @param {!boolean} bool set to true to disable warnings.
 */
function disableWarnings(bool) {
  if (typeof bool !== "boolean") {
    return new Error(
      "Argument type: " + typeof bool + ". Please use a boolean."
    );
  }
  deprecationWarnings_ = !bool;
  return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
}

function log$1() {
  if (typeof window === "object") {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log.apply(console, arguments);
    }
  }
}

/**
 * Shows a deprecation warning suggesting the modern and spec-compatible API.
 */
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(
    oldMethod + " is deprecated, please use " + newMethod + " instead."
  );
}

/**
 * Browser detector.
 *
 * @return {object} result containing browser and version
 *     properties.
 */
function detectBrowser(window) {
  // Returned result object.
  const result = { browser: null, version: null };

  // Fail early if it's not a browser
  if (typeof window === "undefined" || !window.navigator) {
    result.browser = "Not a browser.";
    return result;
  }

  const { navigator } = window;

  if (navigator.mozGetUserMedia) {
    // Firefox.
    result.browser = "firefox";
    result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1);
  } else if (
    navigator.webkitGetUserMedia ||
    (window.isSecureContext === false &&
      window.webkitRTCPeerConnection &&
      !window.RTCIceGatherer)
  ) {
    // Chrome, Chromium, Webview, Opera.
    // Version matches Chrome/WebRTC version.
    // Chrome 74 removed webkitGetUserMedia on http as well so we need the
    // more complicated fallback to webkitRTCPeerConnection.
    result.browser = "chrome";
    result.version = extractVersion(
      navigator.userAgent,
      /Chrom(e|ium)\/(\d+)\./,
      2
    );
  } else if (
    navigator.mediaDevices &&
    navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)
  ) {
    // Edge.
    result.browser = "edge";
    result.version = extractVersion(
      navigator.userAgent,
      /Edge\/(\d+).(\d+)$/,
      2
    );
  } else if (
    window.RTCPeerConnection &&
    navigator.userAgent.match(/AppleWebKit\/(\d+)\./)
  ) {
    // Safari.
    result.browser = "safari";
    result.version = extractVersion(
      navigator.userAgent,
      /AppleWebKit\/(\d+)\./,
      1
    );
    result.supportsUnifiedPlan =
      window.RTCRtpTransceiver &&
      "currentDirection" in window.RTCRtpTransceiver.prototype;
  } else {
    // Default fallthrough: not supported.
    result.browser = "Not a supported browser.";
    return result;
  }

  return result;
}

/**
 * Checks if something is an object.
 *
 * @param {*} val The something you want to check.
 * @return true if val is an object, false otherwise.
 */
function isObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}

/**
 * Remove all empty objects and undefined values
 * from a nested object -- an enhanced and vanilla version
 * of Lodash's `compact`.
 */
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }

  return Object.keys(data).reduce(function (accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === undefined || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, { [key]: value });
  }, {});
}

/* iterates the stats graph recursively. */
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach((name) => {
    if (name.endsWith("Id")) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith("Ids")) {
      base[name].forEach((id) => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}

/* filter getStats for a sender/receiver track. */
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
  const filteredResult = new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach((value) => {
    if (value.type === "track" && value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach((trackStat) => {
    result.forEach((stats) => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
const logging = log$1;

function shimGetUserMedia$3(window, browserDetails) {
  const navigator = window && window.navigator;

  if (!navigator.mediaDevices) {
    return;
  }

  const constraintsToChrome_ = function (c) {
    if (typeof c !== "object" || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach((key) => {
      if (key === "require" || key === "advanced" || key === "mediaSource") {
        return;
      }
      const r = typeof c[key] === "object" ? c[key] : { ideal: c[key] };
      if (r.exact !== undefined && typeof r.exact === "number") {
        r.min = r.max = r.exact;
      }
      const oldname_ = function (prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return name === "deviceId" ? "sourceId" : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r.ideal === "number") {
          oc[oldname_("min", key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key)] = r.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  const shimConstraints_ = function (constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === "object") {
      const remap = function (obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, "autoGainControl", "googAutoGainControl");
      remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === "object") {
      // Shim facingMode for mobile & surface pro.
      let face = constraints.video.facingMode;
      face = face && (typeof face === "object" ? face : { ideal: face });
      const getSupportedFacingModeLies = browserDetails.version < 66;

      if (
        face &&
        (face.exact === "user" ||
          face.exact === "environment" ||
          face.ideal === "user" ||
          face.ideal === "environment") &&
        !(
          navigator.mediaDevices.getSupportedConstraints &&
          navigator.mediaDevices.getSupportedConstraints().facingMode &&
          !getSupportedFacingModeLies
        )
      ) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === "environment" || face.ideal === "environment") {
          matches = ["back", "rear"];
        } else if (face.exact === "user" || face.ideal === "user") {
          matches = ["front"];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === "videoinput");
            let dev = devices.find((d) =>
              matches.some((match) => d.label.toLowerCase().includes(match))
            );
            if (!dev && devices.length && matches.includes("back")) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact
                ? { exact: dev.deviceId }
                : { ideal: dev.deviceId };
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging("chrome: " + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging("chrome: " + JSON.stringify(constraints));
    return func(constraints);
  };

  const shimError_ = function (e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name:
        {
          PermissionDeniedError: "NotAllowedError",
          PermissionDismissedError: "NotAllowedError",
          InvalidStateError: "NotAllowedError",
          DevicesNotFoundError: "NotFoundError",
          ConstraintNotSatisfiedError: "OverconstrainedError",
          TrackStartError: "NotReadableError",
          MediaDeviceFailedDueToShutdown: "NotAllowedError",
          MediaDeviceKillSwitchOn: "NotAllowedError",
          TabCaptureError: "AbortError",
          ScreenCaptureError: "AbortError",
          DeviceCaptureError: "AbortError",
        }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      },
    };
  };

  const getUserMedia_ = function (constraints, onSuccess, onError) {
    shimConstraints_(constraints, (c) => {
      navigator.webkitGetUserMedia(c, onSuccess, (e) => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator.getUserMedia = getUserMedia_.bind(navigator);

  // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
  // function which returns a Promise, it does not accept spec-style
  // constraints.
  if (navigator.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    );
    navigator.mediaDevices.getUserMedia = function (cs) {
      return shimConstraints_(cs, (c) =>
        origGetUserMedia(c).then(
          (stream) => {
            if (
              (c.audio && !stream.getAudioTracks().length) ||
              (c.video && !stream.getVideoTracks().length)
            ) {
              stream.getTracks().forEach((track) => {
                track.stop();
              });
              throw new DOMException("", "NotFoundError");
            }
            return stream;
          },
          (e) => Promise.reject(shimError_(e))
        )
      );
    };
  }
}

/*
 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
function shimGetDisplayMedia$2(window, getSourceId) {
  if (
    window.navigator.mediaDevices &&
    "getDisplayMedia" in window.navigator.mediaDevices
  ) {
    return;
  }
  if (!window.navigator.mediaDevices) {
    return;
  }
  // getSourceId is a function that returns a promise resolving with
  // the sourceId of the screen/window/tab to be shared.
  if (typeof getSourceId !== "function") {
    console.error(
      "shimGetDisplayMedia: getSourceId argument is not " + "a function"
    );
    return;
  }
  window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(
    constraints
  ) {
    return getSourceId(constraints).then((sourceId) => {
      const widthSpecified = constraints.video && constraints.video.width;
      const heightSpecified = constraints.video && constraints.video.height;
      const frameRateSpecified =
        constraints.video && constraints.video.frameRate;
      constraints.video = {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          maxFrameRate: frameRateSpecified || 3,
        },
      };
      if (widthSpecified) {
        constraints.video.mandatory.maxWidth = widthSpecified;
      }
      if (heightSpecified) {
        constraints.video.mandatory.maxHeight = heightSpecified;
      }
      return window.navigator.mediaDevices.getUserMedia(constraints);
    });
  };
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimMediaStream(window) {
  window.MediaStream = window.MediaStream || window.webkitMediaStream;
}

function shimOnTrack$1(window) {
  if (
    typeof window === "object" &&
    window.RTCPeerConnection &&
    !("ontrack" in window.RTCPeerConnection.prototype)
  ) {
    Object.defineProperty(window.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener("track", this._ontrack);
        }
        this.addEventListener("track", (this._ontrack = f));
      },
      enumerable: true,
      configurable: true,
    });
    const origSetRemoteDescription =
      window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription =
      function setRemoteDescription() {
        if (!this._ontrackpoly) {
          this._ontrackpoly = (e) => {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener("addtrack", (te) => {
              let receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers().find(
                  (r) => r.track && r.track.id === te.track.id
                );
              } else {
                receiver = { track: te.track };
              }

              const event = new Event("track");
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = { receiver };
              event.streams = [e.stream];
              this.dispatchEvent(event);
            });
            e.stream.getTracks().forEach((track) => {
              let receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers().find(
                  (r) => r.track && r.track.id === track.id
                );
              } else {
                receiver = { track };
              }
              const event = new Event("track");
              event.track = track;
              event.receiver = receiver;
              event.transceiver = { receiver };
              event.streams = [e.stream];
              this.dispatchEvent(event);
            });
          };
          this.addEventListener("addstream", this._ontrackpoly);
        }
        return origSetRemoteDescription.apply(this, arguments);
      };
  } else {
    // even if RTCRtpTransceiver is in window, it is only used and
    // emitted in unified-plan. Unfortunately this means we need
    // to unconditionally wrap the event.
    wrapPeerConnectionEvent(window, "track", (e) => {
      if (!e.transceiver) {
        Object.defineProperty(e, "transceiver", {
          value: { receiver: e.receiver },
        });
      }
      return e;
    });
  }
}

function shimGetSendersWithDtmf(window) {
  // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
  if (
    typeof window === "object" &&
    window.RTCPeerConnection &&
    !("getSenders" in window.RTCPeerConnection.prototype) &&
    "createDTMFSender" in window.RTCPeerConnection.prototype
  ) {
    const shimSenderWithDtmf = function (pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === undefined) {
            if (track.kind === "audio") {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc,
      };
    };

    // augment addTrack when getSenders is not available.
    if (!window.RTCPeerConnection.prototype.getSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice(); // return a copy of the internal state.
      };
      const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addTrack = function addTrack(
        track,
        stream
      ) {
        let sender = origAddTrack.apply(this, arguments);
        if (!sender) {
          sender = shimSenderWithDtmf(this, track);
          this._senders.push(sender);
        }
        return sender;
      };

      const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
      window.RTCPeerConnection.prototype.removeTrack = function removeTrack(
        sender
      ) {
        origRemoveTrack.apply(this, arguments);
        const idx = this._senders.indexOf(sender);
        if (idx !== -1) {
          this._senders.splice(idx, 1);
        }
      };
    }
    const origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };

    const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function removeStream(
      stream
    ) {
      this._senders = this._senders || [];
      origRemoveStream.apply(this, [stream]);

      stream.getTracks().forEach((track) => {
        const sender = this._senders.find((s) => s.track === track);
        if (sender) {
          // remove sender
          this._senders.splice(this._senders.indexOf(sender), 1);
        }
      });
    };
  } else if (
    typeof window === "object" &&
    window.RTCPeerConnection &&
    "getSenders" in window.RTCPeerConnection.prototype &&
    "createDTMFSender" in window.RTCPeerConnection.prototype &&
    window.RTCRtpSender &&
    !("dtmf" in window.RTCRtpSender.prototype)
  ) {
    const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    window.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => (sender._pc = this));
      return senders;
    };

    Object.defineProperty(window.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === undefined) {
          if (this.track.kind === "audio") {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      },
    });
  }
}

function shimGetStats(window) {
  if (!window.RTCPeerConnection) {
    return;
  }

  const origGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;

    // If selector is a function then we are in the old style stats so just
    // pass back the original getStats format to avoid breaking old users.
    if (arguments.length > 0 && typeof selector === "function") {
      return origGetStats.apply(this, arguments);
    }

    // When spec-style getStats is supported, return those when called with
    // either no arguments or the selector argument is null.
    if (
      origGetStats.length === 0 &&
      (arguments.length === 0 || typeof selector !== "function")
    ) {
      return origGetStats.apply(this, []);
    }

    const fixChromeStats_ = function (response) {
      const standardReport = {};
      const reports = response.result();
      reports.forEach((report) => {
        const standardStats = {
          id: report.id,
          timestamp: report.timestamp,
          type:
            {
              localcandidate: "local-candidate",
              remotecandidate: "remote-candidate",
            }[report.type] || report.type,
        };
        report.names().forEach((name) => {
          standardStats[name] = report.stat(name);
        });
        standardReport[standardStats.id] = standardStats;
      });

      return standardReport;
    };

    // shim getStats with maplike support
    const makeMapStats = function (stats) {
      return new Map(Object.keys(stats).map((key) => [key, stats[key]]));
    };

    if (arguments.length >= 2) {
      const successCallbackWrapper_ = function (response) {
        onSucc(makeMapStats(fixChromeStats_(response)));
      };

      return origGetStats.apply(this, [successCallbackWrapper_, selector]);
    }

    // promise-support
    return new Promise((resolve, reject) => {
      origGetStats.apply(this, [
        function (response) {
          resolve(makeMapStats(fixChromeStats_(response)));
        },
        reject,
      ]);
    }).then(onSucc, onErr);
  };
}

function shimSenderReceiverGetStats(window) {
  if (
    !(
      typeof window === "object" &&
      window.RTCPeerConnection &&
      window.RTCRtpSender &&
      window.RTCRtpReceiver
    )
  ) {
    return;
  }

  // shim sender stats.
  if (!("getStats" in window.RTCRtpSender.prototype)) {
    const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => (sender._pc = this));
        return senders;
      };
    }

    const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then((result) =>
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true)
      );
    };
  }

  // shim receiver stats.
  if (!("getStats" in window.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window.RTCPeerConnection.prototype.getReceivers =
        function getReceivers() {
          const receivers = origGetReceivers.apply(this, []);
          receivers.forEach((receiver) => (receiver._pc = this));
          return receivers;
        };
    }
    wrapPeerConnectionEvent(window, "track", (e) => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc
        .getStats()
        .then((result) => filterStats(result, receiver.track, false));
    };
  }

  if (
    !(
      "getStats" in window.RTCRtpSender.prototype &&
      "getStats" in window.RTCRtpReceiver.prototype
    )
  ) {
    return;
  }

  // shim RTCPeerConnection.getStats(track).
  const origGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    if (
      arguments.length > 0 &&
      arguments[0] instanceof window.MediaStreamTrack
    ) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach((s) => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach((r) => {
        if (r.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r;
          }
        }
        return r.track === track;
      });
      if (err || (sender && receiver)) {
        return Promise.reject(
          new DOMException(
            "There are more than one sender or receiver for the track.",
            "InvalidAccessError"
          )
        );
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(
        new DOMException(
          "There is no sender or receiver for the track.",
          "InvalidAccessError"
        )
      );
    }
    return origGetStats.apply(this, arguments);
  };
}

function shimAddTrackRemoveTrackWithNative(window) {
  // shim addTrack/removeTrack with native variants in order to make
  // the interactions with legacy getLocalStreams behave as in other browsers.
  // Keeps a mapping stream.id => [stream, rtpsenders...]
  window.RTCPeerConnection.prototype.getLocalStreams =
    function getLocalStreams() {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(
        (streamId) => this._shimmedLocalStreams[streamId][0]
      );
    };

  const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
  window.RTCPeerConnection.prototype.addTrack = function addTrack(
    track,
    stream
  ) {
    if (!stream) {
      return origAddTrack.apply(this, arguments);
    }
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};

    const sender = origAddTrack.apply(this, arguments);
    if (!this._shimmedLocalStreams[stream.id]) {
      this._shimmedLocalStreams[stream.id] = [stream, sender];
    } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
      this._shimmedLocalStreams[stream.id].push(sender);
    }
    return sender;
  };

  const origAddStream = window.RTCPeerConnection.prototype.addStream;
  window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};

    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException("Track already exists.", "InvalidAccessError");
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders().filter(
      (newSender) => existingSenders.indexOf(newSender) === -1
    );
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };

  const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
  window.RTCPeerConnection.prototype.removeStream = function removeStream(
    stream
  ) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    delete this._shimmedLocalStreams[stream.id];
    return origRemoveStream.apply(this, arguments);
  };

  const origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
  window.RTCPeerConnection.prototype.removeTrack = function removeTrack(
    sender
  ) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    if (sender) {
      Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
        const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
        if (idx !== -1) {
          this._shimmedLocalStreams[streamId].splice(idx, 1);
        }
        if (this._shimmedLocalStreams[streamId].length === 1) {
          delete this._shimmedLocalStreams[streamId];
        }
      });
    }
    return origRemoveTrack.apply(this, arguments);
  };
}

function shimAddTrackRemoveTrack(window, browserDetails) {
  if (!window.RTCPeerConnection) {
    return;
  }
  // shim addTrack and removeTrack.
  if (
    window.RTCPeerConnection.prototype.addTrack &&
    browserDetails.version >= 65
  ) {
    return shimAddTrackRemoveTrackWithNative(window);
  }

  // also shim pc.getLocalStreams when addTrack is shimmed
  // to return the original streams.
  const origGetLocalStreams =
    window.RTCPeerConnection.prototype.getLocalStreams;
  window.RTCPeerConnection.prototype.getLocalStreams =
    function getLocalStreams() {
      const nativeStreams = origGetLocalStreams.apply(this);
      this._reverseStreams = this._reverseStreams || {};
      return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
    };

  const origAddStream = window.RTCPeerConnection.prototype.addStream;
  window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};

    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException("Track already exists.", "InvalidAccessError");
      }
    });
    // Add identity mapping for consistency with addTrack.
    // Unless this is being used with a stream from addTrack.
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };

  const origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
  window.RTCPeerConnection.prototype.removeStream = function removeStream(
    stream
  ) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};

    origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
    delete this._reverseStreams[
      this._streams[stream.id] ? this._streams[stream.id].id : stream.id
    ];
    delete this._streams[stream.id];
  };

  window.RTCPeerConnection.prototype.addTrack = function addTrack(
    track,
    stream
  ) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    const streams = [].slice.call(arguments, 1);
    if (
      streams.length !== 1 ||
      !streams[0].getTracks().find((t) => t === track)
    ) {
      // this is not fully correct but all we can manage without
      // [[associated MediaStreams]] internal slot.
      throw new DOMException(
        "The adapter.js addTrack polyfill only supports a single " +
          " stream which is associated with the specified track.",
        "NotSupportedError"
      );
    }

    const alreadyExists = this.getSenders().find((s) => s.track === track);
    if (alreadyExists) {
      throw new DOMException("Track already exists.", "InvalidAccessError");
    }

    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    const oldStream = this._streams[stream.id];
    if (oldStream) {
      // this is using odd Chrome behaviour, use with caution:
      // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
      // Note: we rely on the high-level addTrack/dtmf shim to
      // create the sender with a dtmf sender.
      oldStream.addTrack(track);

      // Trigger ONN async.
      Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    } else {
      const newStream = new window.MediaStream([track]);
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      this.addStream(newStream);
    }
    return this.getSenders().find((s) => s.track === track);
  };

  // replace the internal stream id with the external one and
  // vice versa.
  function replaceInternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(internalStream.id, "g"), externalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp,
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp = sdp.replace(new RegExp(externalStream.id, "g"), internalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp,
    });
  }
  ["createOffer", "createAnswer"].forEach(function (method) {
    const nativeMethod = window.RTCPeerConnection.prototype[method];
    const methodObj = {
      [method]() {
        const args = arguments;
        const isLegacyCall =
          arguments.length && typeof arguments[0] === "function";
        if (isLegacyCall) {
          return nativeMethod.apply(this, [
            (description) => {
              const desc = replaceInternalStreamId(this, description);
              args[0].apply(null, [desc]);
            },
            (err) => {
              if (args[1]) {
                args[1].apply(null, err);
              }
            },
            arguments[2],
          ]);
        }
        return nativeMethod
          .apply(this, arguments)
          .then((description) => replaceInternalStreamId(this, description));
      },
    };
    window.RTCPeerConnection.prototype[method] = methodObj[method];
  });

  const origSetLocalDescription =
    window.RTCPeerConnection.prototype.setLocalDescription;
  window.RTCPeerConnection.prototype.setLocalDescription =
    function setLocalDescription() {
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(this, arguments);
      }
      arguments[0] = replaceExternalStreamId(this, arguments[0]);
      return origSetLocalDescription.apply(this, arguments);
    };

  // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

  const origLocalDescription = Object.getOwnPropertyDescriptor(
    window.RTCPeerConnection.prototype,
    "localDescription"
  );
  Object.defineProperty(
    window.RTCPeerConnection.prototype,
    "localDescription",
    {
      get() {
        const description = origLocalDescription.get.apply(this);
        if (description.type === "") {
          return description;
        }
        return replaceInternalStreamId(this, description);
      },
    }
  );

  window.RTCPeerConnection.prototype.removeTrack = function removeTrack(
    sender
  ) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    // We can not yet check for sender instanceof RTCRtpSender
    // since we shim RTPSender. So we check if sender._pc is set.
    if (!sender._pc) {
      throw new DOMException(
        "Argument 1 of RTCPeerConnection.removeTrack " +
          "does not implement interface RTCRtpSender.",
        "TypeError"
      );
    }
    const isLocal = sender._pc === this;
    if (!isLocal) {
      throw new DOMException(
        "Sender was not created by this connection.",
        "InvalidAccessError"
      );
    }

    // Search for the native stream the senders track belongs to.
    this._streams = this._streams || {};
    let stream;
    Object.keys(this._streams).forEach((streamid) => {
      const hasTrack = this._streams[streamid]
        .getTracks()
        .find((track) => sender.track === track);
      if (hasTrack) {
        stream = this._streams[streamid];
      }
    });

    if (stream) {
      if (stream.getTracks().length === 1) {
        // if this is the last track of the stream, remove the stream. This
        // takes care of any shimmed _senders.
        this.removeStream(this._reverseStreams[stream.id]);
      } else {
        // relying on the same odd chrome behaviour as above.
        stream.removeTrack(sender.track);
      }
      this.dispatchEvent(new Event("negotiationneeded"));
    }
  };
}

function shimPeerConnection$2(window, browserDetails) {
  if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
    // very basic support for old versions.
    window.RTCPeerConnection = window.webkitRTCPeerConnection;
  }
  if (!window.RTCPeerConnection) {
    return;
  }

  // shim implicit creation of RTCSessionDescription/RTCIceCandidate
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(
      function (method) {
        const nativeMethod = window.RTCPeerConnection.prototype[method];
        const methodObj = {
          [method]() {
            arguments[0] = new (
              method === "addIceCandidate"
                ? window.RTCIceCandidate
                : window.RTCSessionDescription
            )(arguments[0]);
            return nativeMethod.apply(this, arguments);
          },
        };
        window.RTCPeerConnection.prototype[method] = methodObj[method];
      }
    );
  }
}

// Attempt to fix ONN in plan-b mode.
function fixNegotiationNeeded(window, browserDetails) {
  wrapPeerConnectionEvent(window, "negotiationneeded", (e) => {
    const pc = e.target;
    if (
      browserDetails.version < 72 ||
      (pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b")
    ) {
      if (pc.signalingState !== "stable") {
        return;
      }
    }
    return e;
  });
}

var chromeShim = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  shimMediaStream: shimMediaStream,
  shimOnTrack: shimOnTrack$1,
  shimGetSendersWithDtmf: shimGetSendersWithDtmf,
  shimGetStats: shimGetStats,
  shimSenderReceiverGetStats: shimSenderReceiverGetStats,
  shimAddTrackRemoveTrackWithNative: shimAddTrackRemoveTrackWithNative,
  shimAddTrackRemoveTrack: shimAddTrackRemoveTrack,
  shimPeerConnection: shimPeerConnection$2,
  fixNegotiationNeeded: fixNegotiationNeeded,
  shimGetUserMedia: shimGetUserMedia$3,
  shimGetDisplayMedia: shimGetDisplayMedia$2,
});

/*
 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
function filterIceServers$1(iceServers, edgeVersion) {
  let hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter((server) => {
    if (server && (server.urls || server.url)) {
      let urls = server.urls || server.url;
      if (server.url && !server.urls) {
        deprecated("RTCIceServer.url", "RTCIceServer.urls");
      }
      const isString = typeof urls === "string";
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter((url) => {
        // filter STUN unconditionally.
        if (url.indexOf("stun:") === 0) {
          return false;
        }

        const validTurn =
          url.startsWith("turn") &&
          !url.startsWith("turn:[") &&
          url.includes("transport=udp");
        if (validTurn && !hasTurn) {
          hasTurn = true;
          return true;
        }
        return validTurn && !hasTurn;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
  return fn(module, module.exports), module.exports;
}

/* eslint-env node */

var sdp = createCommonjsModule(function (module) {
  // SDP helpers.
  var SDPUtils = {};

  // Generate an alphanumeric identifier for cname or mids.
  // TODO: use UUIDs instead? https://gist.github.com/jed/982883
  SDPUtils.generateIdentifier = function () {
    return Math.random().toString(36).substr(2, 10);
  };

  // The RTCP CNAME used by all peerconnections from the same JS.
  SDPUtils.localCName = SDPUtils.generateIdentifier();

  // Splits SDP into lines, dealing with both CRLF and LF.
  SDPUtils.splitLines = function (blob) {
    return blob
      .trim()
      .split("\n")
      .map(function (line) {
        return line.trim();
      });
  };
  // Splits SDP into sessionpart and mediasections. Ensures CRLF.
  SDPUtils.splitSections = function (blob) {
    var parts = blob.split("\nm=");
    return parts.map(function (part, index) {
      return (index > 0 ? "m=" + part : part).trim() + "\r\n";
    });
  };

  // returns the session description.
  SDPUtils.getDescription = function (blob) {
    var sections = SDPUtils.splitSections(blob);
    return sections && sections[0];
  };

  // returns the individual media sections.
  SDPUtils.getMediaSections = function (blob) {
    var sections = SDPUtils.splitSections(blob);
    sections.shift();
    return sections;
  };

  // Returns lines that start with a certain prefix.
  SDPUtils.matchPrefix = function (blob, prefix) {
    return SDPUtils.splitLines(blob).filter(function (line) {
      return line.indexOf(prefix) === 0;
    });
  };

  // Parses an ICE candidate line. Sample input:
  // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
  // rport 55996"
  SDPUtils.parseCandidate = function (line) {
    var parts;
    // Parse both variants.
    if (line.indexOf("a=candidate:") === 0) {
      parts = line.substring(12).split(" ");
    } else {
      parts = line.substring(10).split(" ");
    }

    var candidate = {
      foundation: parts[0],
      component: parseInt(parts[1], 10),
      protocol: parts[2].toLowerCase(),
      priority: parseInt(parts[3], 10),
      ip: parts[4],
      address: parts[4], // address is an alias for ip.
      port: parseInt(parts[5], 10),
      // skip parts[6] == 'typ'
      type: parts[7],
    };

    for (var i = 8; i < parts.length; i += 2) {
      switch (parts[i]) {
        case "raddr":
          candidate.relatedAddress = parts[i + 1];
          break;
        case "rport":
          candidate.relatedPort = parseInt(parts[i + 1], 10);
          break;
        case "tcptype":
          candidate.tcpType = parts[i + 1];
          break;
        case "ufrag":
          candidate.ufrag = parts[i + 1]; // for backward compability.
          candidate.usernameFragment = parts[i + 1];
          break;
        default:
          // extension handling, in particular ufrag
          candidate[parts[i]] = parts[i + 1];
          break;
      }
    }
    return candidate;
  };

  // Translates a candidate object into SDP candidate attribute.
  SDPUtils.writeCandidate = function (candidate) {
    var sdp = [];
    sdp.push(candidate.foundation);
    sdp.push(candidate.component);
    sdp.push(candidate.protocol.toUpperCase());
    sdp.push(candidate.priority);
    sdp.push(candidate.address || candidate.ip);
    sdp.push(candidate.port);

    var type = candidate.type;
    sdp.push("typ");
    sdp.push(type);
    if (type !== "host" && candidate.relatedAddress && candidate.relatedPort) {
      sdp.push("raddr");
      sdp.push(candidate.relatedAddress);
      sdp.push("rport");
      sdp.push(candidate.relatedPort);
    }
    if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
      sdp.push("tcptype");
      sdp.push(candidate.tcpType);
    }
    if (candidate.usernameFragment || candidate.ufrag) {
      sdp.push("ufrag");
      sdp.push(candidate.usernameFragment || candidate.ufrag);
    }
    return "candidate:" + sdp.join(" ");
  };

  // Parses an ice-options line, returns an array of option tags.
  // a=ice-options:foo bar
  SDPUtils.parseIceOptions = function (line) {
    return line.substr(14).split(" ");
  };

  // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
  // a=rtpmap:111 opus/48000/2
  SDPUtils.parseRtpMap = function (line) {
    var parts = line.substr(9).split(" ");
    var parsed = {
      payloadType: parseInt(parts.shift(), 10), // was: id
    };

    parts = parts[0].split("/");

    parsed.name = parts[0];
    parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
    parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
    // legacy alias, got renamed back to channels in ORTC.
    parsed.numChannels = parsed.channels;
    return parsed;
  };

  // Generate an a=rtpmap line from RTCRtpCodecCapability or
  // RTCRtpCodecParameters.
  SDPUtils.writeRtpMap = function (codec) {
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    var channels = codec.channels || codec.numChannels || 1;
    return (
      "a=rtpmap:" +
      pt +
      " " +
      codec.name +
      "/" +
      codec.clockRate +
      (channels !== 1 ? "/" + channels : "") +
      "\r\n"
    );
  };

  // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
  // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
  // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
  SDPUtils.parseExtmap = function (line) {
    var parts = line.substr(9).split(" ");
    return {
      id: parseInt(parts[0], 10),
      direction:
        parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
      uri: parts[1],
    };
  };

  // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
  // RTCRtpHeaderExtension.
  SDPUtils.writeExtmap = function (headerExtension) {
    return (
      "a=extmap:" +
      (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== "sendrecv"
        ? "/" + headerExtension.direction
        : "") +
      " " +
      headerExtension.uri +
      "\r\n"
    );
  };

  // Parses an ftmp line, returns dictionary. Sample input:
  // a=fmtp:96 vbr=on;cng=on
  // Also deals with vbr=on; cng=on
  SDPUtils.parseFmtp = function (line) {
    var parsed = {};
    var kv;
    var parts = line.substr(line.indexOf(" ") + 1).split(";");
    for (var j = 0; j < parts.length; j++) {
      kv = parts[j].trim().split("=");
      parsed[kv[0].trim()] = kv[1];
    }
    return parsed;
  };

  // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
  SDPUtils.writeFmtp = function (codec) {
    var line = "";
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.parameters && Object.keys(codec.parameters).length) {
      var params = [];
      Object.keys(codec.parameters).forEach(function (param) {
        if (codec.parameters[param]) {
          params.push(param + "=" + codec.parameters[param]);
        } else {
          params.push(param);
        }
      });
      line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
    }
    return line;
  };

  // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
  // a=rtcp-fb:98 nack rpsi
  SDPUtils.parseRtcpFb = function (line) {
    var parts = line.substr(line.indexOf(" ") + 1).split(" ");
    return {
      type: parts.shift(),
      parameter: parts.join(" "),
    };
  };
  // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
  SDPUtils.writeRtcpFb = function (codec) {
    var lines = "";
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
      // FIXME: special handling for trr-int?
      codec.rtcpFeedback.forEach(function (fb) {
        lines +=
          "a=rtcp-fb:" +
          pt +
          " " +
          fb.type +
          (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") +
          "\r\n";
      });
    }
    return lines;
  };

  // Parses an RFC 5576 ssrc media attribute. Sample input:
  // a=ssrc:3735928559 cname:something
  SDPUtils.parseSsrcMedia = function (line) {
    var sp = line.indexOf(" ");
    var parts = {
      ssrc: parseInt(line.substr(7, sp - 7), 10),
    };
    var colon = line.indexOf(":", sp);
    if (colon > -1) {
      parts.attribute = line.substr(sp + 1, colon - sp - 1);
      parts.value = line.substr(colon + 1);
    } else {
      parts.attribute = line.substr(sp + 1);
    }
    return parts;
  };

  SDPUtils.parseSsrcGroup = function (line) {
    var parts = line.substr(13).split(" ");
    return {
      semantics: parts.shift(),
      ssrcs: parts.map(function (ssrc) {
        return parseInt(ssrc, 10);
      }),
    };
  };

  // Extracts the MID (RFC 5888) from a media section.
  // returns the MID or undefined if no mid line was found.
  SDPUtils.getMid = function (mediaSection) {
    var mid = SDPUtils.matchPrefix(mediaSection, "a=mid:")[0];
    if (mid) {
      return mid.substr(6);
    }
  };

  SDPUtils.parseFingerprint = function (line) {
    var parts = line.substr(14).split(" ");
    return {
      algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
      value: parts[1],
    };
  };

  // Extracts DTLS parameters from SDP media section or sessionpart.
  // FIXME: for consistency with other functions this should only
  //   get the fingerprint line as input. See also getIceParameters.
  SDPUtils.getDtlsParameters = function (mediaSection, sessionpart) {
    var lines = SDPUtils.matchPrefix(
      mediaSection + sessionpart,
      "a=fingerprint:"
    );
    // Note: a=setup line is ignored since we use the 'auto' role.
    // Note2: 'algorithm' is not case sensitive except in Edge.
    return {
      role: "auto",
      fingerprints: lines.map(SDPUtils.parseFingerprint),
    };
  };

  // Serializes DTLS parameters to SDP.
  SDPUtils.writeDtlsParameters = function (params, setupType) {
    var sdp = "a=setup:" + setupType + "\r\n";
    params.fingerprints.forEach(function (fp) {
      sdp += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
    });
    return sdp;
  };

  // Parses a=crypto lines into
  //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members
  SDPUtils.parseCryptoLine = function (line) {
    var parts = line.substr(9).split(" ");
    return {
      tag: parseInt(parts[0], 10),
      cryptoSuite: parts[1],
      keyParams: parts[2],
      sessionParams: parts.slice(3),
    };
  };

  SDPUtils.writeCryptoLine = function (parameters) {
    return (
      "a=crypto:" +
      parameters.tag +
      " " +
      parameters.cryptoSuite +
      " " +
      (typeof parameters.keyParams === "object"
        ? SDPUtils.writeCryptoKeyParams(parameters.keyParams)
        : parameters.keyParams) +
      (parameters.sessionParams
        ? " " + parameters.sessionParams.join(" ")
        : "") +
      "\r\n"
    );
  };

  // Parses the crypto key parameters into
  //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*
  SDPUtils.parseCryptoKeyParams = function (keyParams) {
    if (keyParams.indexOf("inline:") !== 0) {
      return null;
    }
    var parts = keyParams.substr(7).split("|");
    return {
      keyMethod: "inline",
      keySalt: parts[0],
      lifeTime: parts[1],
      mkiValue: parts[2] ? parts[2].split(":")[0] : undefined,
      mkiLength: parts[2] ? parts[2].split(":")[1] : undefined,
    };
  };

  SDPUtils.writeCryptoKeyParams = function (keyParams) {
    return (
      keyParams.keyMethod +
      ":" +
      keyParams.keySalt +
      (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") +
      (keyParams.mkiValue && keyParams.mkiLength
        ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength
        : "")
    );
  };

  // Extracts all SDES paramters.
  SDPUtils.getCryptoParameters = function (mediaSection, sessionpart) {
    var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=crypto:");
    return lines.map(SDPUtils.parseCryptoLine);
  };

  // Parses ICE information from SDP media section or sessionpart.
  // FIXME: for consistency with other functions this should only
  //   get the ice-ufrag and ice-pwd lines as input.
  SDPUtils.getIceParameters = function (mediaSection, sessionpart) {
    var ufrag = SDPUtils.matchPrefix(
      mediaSection + sessionpart,
      "a=ice-ufrag:"
    )[0];
    var pwd = SDPUtils.matchPrefix(mediaSection + sessionpart, "a=ice-pwd:")[0];
    if (!(ufrag && pwd)) {
      return null;
    }
    return {
      usernameFragment: ufrag.substr(12),
      password: pwd.substr(10),
    };
  };

  // Serializes ICE parameters to SDP.
  SDPUtils.writeIceParameters = function (params) {
    return (
      "a=ice-ufrag:" +
      params.usernameFragment +
      "\r\n" +
      "a=ice-pwd:" +
      params.password +
      "\r\n"
    );
  };

  // Parses the SDP media section and returns RTCRtpParameters.
  SDPUtils.parseRtpParameters = function (mediaSection) {
    var description = {
      codecs: [],
      headerExtensions: [],
      fecMechanisms: [],
      rtcp: [],
    };
    var lines = SDPUtils.splitLines(mediaSection);
    var mline = lines[0].split(" ");
    for (var i = 3; i < mline.length; i++) {
      // find all codecs from mline[3..]
      var pt = mline[i];
      var rtpmapline = SDPUtils.matchPrefix(
        mediaSection,
        "a=rtpmap:" + pt + " "
      )[0];
      if (rtpmapline) {
        var codec = SDPUtils.parseRtpMap(rtpmapline);
        var fmtps = SDPUtils.matchPrefix(mediaSection, "a=fmtp:" + pt + " ");
        // Only the first a=fmtp:<pt> is considered.
        codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
        codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection,
          "a=rtcp-fb:" + pt + " "
        ).map(SDPUtils.parseRtcpFb);
        description.codecs.push(codec);
        // parse FEC mechanisms from rtpmap lines.
        switch (codec.name.toUpperCase()) {
          case "RED":
          case "ULPFEC":
            description.fecMechanisms.push(codec.name.toUpperCase());
            break;
        }
      }
    }
    SDPUtils.matchPrefix(mediaSection, "a=extmap:").forEach(function (line) {
      description.headerExtensions.push(SDPUtils.parseExtmap(line));
    });
    // FIXME: parse rtcp.
    return description;
  };

  // Generates parts of the SDP media section describing the capabilities /
  // parameters.
  SDPUtils.writeRtpDescription = function (kind, caps) {
    var sdp = "";

    // Build the mline.
    sdp += "m=" + kind + " ";
    sdp += caps.codecs.length > 0 ? "9" : "0"; // reject if no codecs.
    sdp += " UDP/TLS/RTP/SAVPF ";
    sdp +=
      caps.codecs
        .map(function (codec) {
          if (codec.preferredPayloadType !== undefined) {
            return codec.preferredPayloadType;
          }
          return codec.payloadType;
        })
        .join(" ") + "\r\n";

    sdp += "c=IN IP4 0.0.0.0\r\n";
    sdp += "a=rtcp:9 IN IP4 0.0.0.0\r\n";

    // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
    caps.codecs.forEach(function (codec) {
      sdp += SDPUtils.writeRtpMap(codec);
      sdp += SDPUtils.writeFmtp(codec);
      sdp += SDPUtils.writeRtcpFb(codec);
    });
    var maxptime = 0;
    caps.codecs.forEach(function (codec) {
      if (codec.maxptime > maxptime) {
        maxptime = codec.maxptime;
      }
    });
    if (maxptime > 0) {
      sdp += "a=maxptime:" + maxptime + "\r\n";
    }
    sdp += "a=rtcp-mux\r\n";

    if (caps.headerExtensions) {
      caps.headerExtensions.forEach(function (extension) {
        sdp += SDPUtils.writeExtmap(extension);
      });
    }
    // FIXME: write fecMechanisms.
    return sdp;
  };

  // Parses the SDP media section and returns an array of
  // RTCRtpEncodingParameters.
  SDPUtils.parseRtpEncodingParameters = function (mediaSection) {
    var encodingParameters = [];
    var description = SDPUtils.parseRtpParameters(mediaSection);
    var hasRed = description.fecMechanisms.indexOf("RED") !== -1;
    var hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;

    // filter a=ssrc:... cname:, ignore PlanB-msid
    var ssrcs = SDPUtils.matchPrefix(mediaSection, "a=ssrc:")
      .map(function (line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function (parts) {
        return parts.attribute === "cname";
      });
    var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
    var secondarySsrc;

    var flows = SDPUtils.matchPrefix(mediaSection, "a=ssrc-group:FID").map(
      function (line) {
        var parts = line.substr(17).split(" ");
        return parts.map(function (part) {
          return parseInt(part, 10);
        });
      }
    );
    if (
      flows.length > 0 &&
      flows[0].length > 1 &&
      flows[0][0] === primarySsrc
    ) {
      secondarySsrc = flows[0][1];
    }

    description.codecs.forEach(function (codec) {
      if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
        var encParam = {
          ssrc: primarySsrc,
          codecPayloadType: parseInt(codec.parameters.apt, 10),
        };
        if (primarySsrc && secondarySsrc) {
          encParam.rtx = { ssrc: secondarySsrc };
        }
        encodingParameters.push(encParam);
        if (hasRed) {
          encParam = JSON.parse(JSON.stringify(encParam));
          encParam.fec = {
            ssrc: primarySsrc,
            mechanism: hasUlpfec ? "red+ulpfec" : "red",
          };
          encodingParameters.push(encParam);
        }
      }
    });
    if (encodingParameters.length === 0 && primarySsrc) {
      encodingParameters.push({
        ssrc: primarySsrc,
      });
    }

    // we support both b=AS and b=TIAS but interpret AS as TIAS.
    var bandwidth = SDPUtils.matchPrefix(mediaSection, "b=");
    if (bandwidth.length) {
      if (bandwidth[0].indexOf("b=TIAS:") === 0) {
        bandwidth = parseInt(bandwidth[0].substr(7), 10);
      } else if (bandwidth[0].indexOf("b=AS:") === 0) {
        // use formula from JSEP to convert b=AS to TIAS value.
        bandwidth =
          parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95 - 50 * 40 * 8;
      } else {
        bandwidth = undefined;
      }
      encodingParameters.forEach(function (params) {
        params.maxBitrate = bandwidth;
      });
    }
    return encodingParameters;
  };

  // parses http://draft.ortc.org/#rtcrtcpparameters*
  SDPUtils.parseRtcpParameters = function (mediaSection) {
    var rtcpParameters = {};

    // Gets the first SSRC. Note tha with RTX there might be multiple
    // SSRCs.
    var remoteSsrc = SDPUtils.matchPrefix(mediaSection, "a=ssrc:")
      .map(function (line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function (obj) {
        return obj.attribute === "cname";
      })[0];
    if (remoteSsrc) {
      rtcpParameters.cname = remoteSsrc.value;
      rtcpParameters.ssrc = remoteSsrc.ssrc;
    }

    // Edge uses the compound attribute instead of reducedSize
    // compound is !reducedSize
    var rsize = SDPUtils.matchPrefix(mediaSection, "a=rtcp-rsize");
    rtcpParameters.reducedSize = rsize.length > 0;
    rtcpParameters.compound = rsize.length === 0;

    // parses the rtcp-mux attrіbute.
    // Note that Edge does not support unmuxed RTCP.
    var mux = SDPUtils.matchPrefix(mediaSection, "a=rtcp-mux");
    rtcpParameters.mux = mux.length > 0;

    return rtcpParameters;
  };

  // parses either a=msid: or a=ssrc:... msid lines and returns
  // the id of the MediaStream and MediaStreamTrack.
  SDPUtils.parseMsid = function (mediaSection) {
    var parts;
    var spec = SDPUtils.matchPrefix(mediaSection, "a=msid:");
    if (spec.length === 1) {
      parts = spec[0].substr(7).split(" ");
      return { stream: parts[0], track: parts[1] };
    }
    var planB = SDPUtils.matchPrefix(mediaSection, "a=ssrc:")
      .map(function (line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function (msidParts) {
        return msidParts.attribute === "msid";
      });
    if (planB.length > 0) {
      parts = planB[0].value.split(" ");
      return { stream: parts[0], track: parts[1] };
    }
  };

  // SCTP
  // parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
  // to draft-ietf-mmusic-sctp-sdp-05
  SDPUtils.parseSctpDescription = function (mediaSection) {
    var mline = SDPUtils.parseMLine(mediaSection);
    var maxSizeLine = SDPUtils.matchPrefix(mediaSection, "a=max-message-size:");
    var maxMessageSize;
    if (maxSizeLine.length > 0) {
      maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
    }
    if (isNaN(maxMessageSize)) {
      maxMessageSize = 65536;
    }
    var sctpPort = SDPUtils.matchPrefix(mediaSection, "a=sctp-port:");
    if (sctpPort.length > 0) {
      return {
        port: parseInt(sctpPort[0].substr(12), 10),
        protocol: mline.fmt,
        maxMessageSize: maxMessageSize,
      };
    }
    var sctpMapLines = SDPUtils.matchPrefix(mediaSection, "a=sctpmap:");
    if (sctpMapLines.length > 0) {
      var parts = SDPUtils.matchPrefix(mediaSection, "a=sctpmap:")[0]
        .substr(10)
        .split(" ");
      return {
        port: parseInt(parts[0], 10),
        protocol: parts[1],
        maxMessageSize: maxMessageSize,
      };
    }
  };

  // SCTP
  // outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
  // support by now receiving in this format, unless we originally parsed
  // as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
  // protocol of DTLS/SCTP -- without UDP/ or TCP/)
  SDPUtils.writeSctpDescription = function (media, sctp) {
    var output = [];
    if (media.protocol !== "DTLS/SCTP") {
      output = [
        "m=" +
          media.kind +
          " 9 " +
          media.protocol +
          " " +
          sctp.protocol +
          "\r\n",
        "c=IN IP4 0.0.0.0\r\n",
        "a=sctp-port:" + sctp.port + "\r\n",
      ];
    } else {
      output = [
        "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
        "c=IN IP4 0.0.0.0\r\n",
        "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n",
      ];
    }
    if (sctp.maxMessageSize !== undefined) {
      output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
    }
    return output.join("");
  };

  // Generate a session ID for SDP.
  // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
  // recommends using a cryptographically random +ve 64-bit value
  // but right now this should be acceptable and within the right range
  SDPUtils.generateSessionId = function () {
    return Math.random().toString().substr(2, 21);
  };

  // Write boilder plate for start of SDP
  // sessId argument is optional - if not supplied it will
  // be generated randomly
  // sessVersion is optional and defaults to 2
  // sessUser is optional and defaults to 'thisisadapterortc'
  SDPUtils.writeSessionBoilerplate = function (sessId, sessVer, sessUser) {
    var sessionId;
    var version = sessVer !== undefined ? sessVer : 2;
    if (sessId) {
      sessionId = sessId;
    } else {
      sessionId = SDPUtils.generateSessionId();
    }
    var user = sessUser || "thisisadapterortc";
    // FIXME: sess-id should be an NTP timestamp.
    return (
      "v=0\r\n" +
      "o=" +
      user +
      " " +
      sessionId +
      " " +
      version +
      " IN IP4 127.0.0.1\r\n" +
      "s=-\r\n" +
      "t=0 0\r\n"
    );
  };

  SDPUtils.writeMediaSection = function (transceiver, caps, type, stream) {
    var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

    // Map ICE parameters (ufrag, pwd) to SDP.
    sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters()
    );

    // Map DTLS parameters to SDP.
    sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === "offer" ? "actpass" : "active"
    );

    sdp += "a=mid:" + transceiver.mid + "\r\n";

    if (transceiver.direction) {
      sdp += "a=" + transceiver.direction + "\r\n";
    } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
      sdp += "a=sendrecv\r\n";
    } else if (transceiver.rtpSender) {
      sdp += "a=sendonly\r\n";
    } else if (transceiver.rtpReceiver) {
      sdp += "a=recvonly\r\n";
    } else {
      sdp += "a=inactive\r\n";
    }

    if (transceiver.rtpSender) {
      // spec.
      var msid =
        "msid:" + stream.id + " " + transceiver.rtpSender.track.id + "\r\n";
      sdp += "a=" + msid;

      // for Chrome.
      sdp +=
        "a=ssrc:" + transceiver.sendEncodingParameters[0].ssrc + " " + msid;
      if (transceiver.sendEncodingParameters[0].rtx) {
        sdp +=
          "a=ssrc:" +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          " " +
          msid;
        sdp +=
          "a=ssrc-group:FID " +
          transceiver.sendEncodingParameters[0].ssrc +
          " " +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          "\r\n";
      }
    }
    // FIXME: this should be written by writeRtpDescription.
    sdp +=
      "a=ssrc:" +
      transceiver.sendEncodingParameters[0].ssrc +
      " cname:" +
      SDPUtils.localCName +
      "\r\n";
    if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
      sdp +=
        "a=ssrc:" +
        transceiver.sendEncodingParameters[0].rtx.ssrc +
        " cname:" +
        SDPUtils.localCName +
        "\r\n";
    }
    return sdp;
  };

  // Gets the direction from the mediaSection or the sessionpart.
  SDPUtils.getDirection = function (mediaSection, sessionpart) {
    // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
    var lines = SDPUtils.splitLines(mediaSection);
    for (var i = 0; i < lines.length; i++) {
      switch (lines[i]) {
        case "a=sendrecv":
        case "a=sendonly":
        case "a=recvonly":
        case "a=inactive":
          return lines[i].substr(2);
        // FIXME: What should happen here?
      }
    }
    if (sessionpart) {
      return SDPUtils.getDirection(sessionpart);
    }
    return "sendrecv";
  };

  SDPUtils.getKind = function (mediaSection) {
    var lines = SDPUtils.splitLines(mediaSection);
    var mline = lines[0].split(" ");
    return mline[0].substr(2);
  };

  SDPUtils.isRejected = function (mediaSection) {
    return mediaSection.split(" ", 2)[1] === "0";
  };

  SDPUtils.parseMLine = function (mediaSection) {
    var lines = SDPUtils.splitLines(mediaSection);
    var parts = lines[0].substr(2).split(" ");
    return {
      kind: parts[0],
      port: parseInt(parts[1], 10),
      protocol: parts[2],
      fmt: parts.slice(3).join(" "),
    };
  };

  SDPUtils.parseOLine = function (mediaSection) {
    var line = SDPUtils.matchPrefix(mediaSection, "o=")[0];
    var parts = line.substr(2).split(" ");
    return {
      username: parts[0],
      sessionId: parts[1],
      sessionVersion: parseInt(parts[2], 10),
      netType: parts[3],
      addressType: parts[4],
      address: parts[5],
    };
  };

  // a very naive interpretation of a valid SDP.
  SDPUtils.isValidSDP = function (blob) {
    if (typeof blob !== "string" || blob.length === 0) {
      return false;
    }
    var lines = SDPUtils.splitLines(blob);
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
        return false;
      }
      // TODO: check the modifier a bit more.
    }
    return true;
  };

  // Expose public methods.
  {
    module.exports = SDPUtils;
  }
});

/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function fixStatsType(stat) {
  return (
    {
      inboundrtp: "inbound-rtp",
      outboundrtp: "outbound-rtp",
      candidatepair: "candidate-pair",
      localcandidate: "local-candidate",
      remotecandidate: "remote-candidate",
    }[stat.type] || stat.type
  );
}

function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
  var sdp$1 = sdp.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp$1 += sdp.writeIceParameters(transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp$1 += sdp.writeDtlsParameters(
    transceiver.dtlsTransport.getLocalParameters(),
    type === "offer" ? "actpass" : dtlsRole || "active"
  );

  sdp$1 += "a=mid:" + transceiver.mid + "\r\n";

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp$1 += "a=sendrecv\r\n";
  } else if (transceiver.rtpSender) {
    sdp$1 += "a=sendonly\r\n";
  } else if (transceiver.rtpReceiver) {
    sdp$1 += "a=recvonly\r\n";
  } else {
    sdp$1 += "a=inactive\r\n";
  }

  if (transceiver.rtpSender) {
    var trackId =
      transceiver.rtpSender._initialTrackId || transceiver.rtpSender.track.id;
    transceiver.rtpSender._initialTrackId = trackId;
    // spec.
    var msid = "msid:" + (stream ? stream.id : "-") + " " + trackId + "\r\n";
    sdp$1 += "a=" + msid;
    // for Chrome. Legacy should no longer be required.
    sdp$1 +=
      "a=ssrc:" + transceiver.sendEncodingParameters[0].ssrc + " " + msid;

    // RTX
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp$1 +=
        "a=ssrc:" + transceiver.sendEncodingParameters[0].rtx.ssrc + " " + msid;
      sdp$1 +=
        "a=ssrc-group:FID " +
        transceiver.sendEncodingParameters[0].ssrc +
        " " +
        transceiver.sendEncodingParameters[0].rtx.ssrc +
        "\r\n";
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp$1 +=
    "a=ssrc:" +
    transceiver.sendEncodingParameters[0].ssrc +
    " cname:" +
    sdp.localCName +
    "\r\n";
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp$1 +=
      "a=ssrc:" +
      transceiver.sendEncodingParameters[0].rtx.ssrc +
      " cname:" +
      sdp.localCName +
      "\r\n";
  }
  return sdp$1;
}

// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
function filterIceServers(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function (server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        console.warn("RTCIceServer.url is deprecated! Use urls instead.");
      }
      var isString = typeof urls === "string";
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function (url) {
        var validTurn =
          url.indexOf("turn:") === 0 &&
          url.indexOf("transport=udp") !== -1 &&
          url.indexOf("turn:[") === -1 &&
          !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return (
          url.indexOf("stun:") === 0 &&
          edgeVersion >= 14393 &&
          url.indexOf("?transport=udp") === -1
        );
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
}

// Determines the intersection of local and remote capabilities.
function getCommonCapabilities(localCapabilities, remoteCapabilities) {
  var commonCapabilities = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
  };

  var findCodecByPayloadType = function (pt, codecs) {
    pt = parseInt(pt, 10);
    for (var i = 0; i < codecs.length; i++) {
      if (
        codecs[i].payloadType === pt ||
        codecs[i].preferredPayloadType === pt
      ) {
        return codecs[i];
      }
    }
  };

  var rtxCapabilityMatches = function (lRtx, rRtx, lCodecs, rCodecs) {
    var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
    var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
    return (
      lCodec &&
      rCodec &&
      lCodec.name.toLowerCase() === rCodec.name.toLowerCase()
    );
  };

  localCapabilities.codecs.forEach(function (lCodec) {
    for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
      var rCodec = remoteCapabilities.codecs[i];
      if (
        lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
        lCodec.clockRate === rCodec.clockRate
      ) {
        if (
          lCodec.name.toLowerCase() === "rtx" &&
          lCodec.parameters &&
          rCodec.parameters.apt
        ) {
          // for RTX we need to find the local rtx that has a apt
          // which points to the same local codec as the remote one.
          if (
            !rtxCapabilityMatches(
              lCodec,
              rCodec,
              localCapabilities.codecs,
              remoteCapabilities.codecs
            )
          ) {
            continue;
          }
        }
        rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
        // number of channels is the highest common number of channels
        rCodec.numChannels = Math.min(lCodec.numChannels, rCodec.numChannels);
        // push rCodec so we reply with offerer payload type
        commonCapabilities.codecs.push(rCodec);

        // determine common feedback mechanisms
        rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function (fb) {
          for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
            if (
              lCodec.rtcpFeedback[j].type === fb.type &&
              lCodec.rtcpFeedback[j].parameter === fb.parameter
            ) {
              return true;
            }
          }
          return false;
        });
        // FIXME: also need to determine .parameters
        //  see https://github.com/openpeer/ortc/issues/569
        break;
      }
    }
  });

  localCapabilities.headerExtensions.forEach(function (lHeaderExtension) {
    for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
      var rHeaderExtension = remoteCapabilities.headerExtensions[i];
      if (lHeaderExtension.uri === rHeaderExtension.uri) {
        commonCapabilities.headerExtensions.push(rHeaderExtension);
        break;
      }
    }
  });

  // FIXME: fecMechanisms
  return commonCapabilities;
}

// is action=setLocalDescription with type allowed in signalingState
function isActionAllowedInSignalingState(action, type, signalingState) {
  return (
    {
      offer: {
        setLocalDescription: ["stable", "have-local-offer"],
        setRemoteDescription: ["stable", "have-remote-offer"],
      },
      answer: {
        setLocalDescription: ["have-remote-offer", "have-local-pranswer"],
        setRemoteDescription: ["have-local-offer", "have-remote-pranswer"],
      },
    }[type][action].indexOf(signalingState) !== -1
  );
}

function maybeAddCandidate(iceTransport, candidate) {
  // Edge's internal representation adds some fields therefore
  // not all fieldѕ are taken into account.
  var alreadyAdded = iceTransport
    .getRemoteCandidates()
    .find(function (remoteCandidate) {
      return (
        candidate.foundation === remoteCandidate.foundation &&
        candidate.ip === remoteCandidate.ip &&
        candidate.port === remoteCandidate.port &&
        candidate.priority === remoteCandidate.priority &&
        candidate.protocol === remoteCandidate.protocol &&
        candidate.type === remoteCandidate.type
      );
    });
  if (!alreadyAdded) {
    iceTransport.addRemoteCandidate(candidate);
  }
  return !alreadyAdded;
}

function makeError(name, description) {
  var e = new Error(description);
  e.name = name;
  // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
  e.code = {
    NotSupportedError: 9,
    InvalidStateError: 11,
    InvalidAccessError: 15,
    TypeError: undefined,
    OperationError: undefined,
  }[name];
  return e;
}

var rtcpeerconnection = function (window, edgeVersion) {
  // https://w3c.github.io/mediacapture-main/#mediastream
  // Helper function to add the track to the stream and
  // dispatch the event ourselves.
  function addTrackToStreamAndFireEvent(track, stream) {
    stream.addTrack(track);
    stream.dispatchEvent(
      new window.MediaStreamTrackEvent("addtrack", { track: track })
    );
  }

  function removeTrackFromStreamAndFireEvent(track, stream) {
    stream.removeTrack(track);
    stream.dispatchEvent(
      new window.MediaStreamTrackEvent("removetrack", { track: track })
    );
  }

  function fireAddTrack(pc, track, receiver, streams) {
    var trackEvent = new Event("track");
    trackEvent.track = track;
    trackEvent.receiver = receiver;
    trackEvent.transceiver = { receiver: receiver };
    trackEvent.streams = streams;
    window.setTimeout(function () {
      pc._dispatchEvent("track", trackEvent);
    });
  }

  var RTCPeerConnection = function (config) {
    var pc = this;

    var _eventTarget = document.createDocumentFragment();
    ["addEventListener", "removeEventListener", "dispatchEvent"].forEach(
      function (method) {
        pc[method] = _eventTarget[method].bind(_eventTarget);
      }
    );

    this.canTrickleIceCandidates = null;

    this.needNegotiation = false;

    this.localStreams = [];
    this.remoteStreams = [];

    this._localDescription = null;
    this._remoteDescription = null;

    this.signalingState = "stable";
    this.iceConnectionState = "new";
    this.connectionState = "new";
    this.iceGatheringState = "new";

    config = JSON.parse(JSON.stringify(config || {}));

    this.usingBundle = config.bundlePolicy === "max-bundle";
    if (config.rtcpMuxPolicy === "negotiate") {
      throw makeError(
        "NotSupportedError",
        "rtcpMuxPolicy 'negotiate' is not supported"
      );
    } else if (!config.rtcpMuxPolicy) {
      config.rtcpMuxPolicy = "require";
    }

    switch (config.iceTransportPolicy) {
      case "all":
      case "relay":
        break;
      default:
        config.iceTransportPolicy = "all";
        break;
    }

    switch (config.bundlePolicy) {
      case "balanced":
      case "max-compat":
      case "max-bundle":
        break;
      default:
        config.bundlePolicy = "balanced";
        break;
    }

    config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

    this._iceGatherers = [];
    if (config.iceCandidatePoolSize) {
      for (var i = config.iceCandidatePoolSize; i > 0; i--) {
        this._iceGatherers.push(
          new window.RTCIceGatherer({
            iceServers: config.iceServers,
            gatherPolicy: config.iceTransportPolicy,
          })
        );
      }
    } else {
      config.iceCandidatePoolSize = 0;
    }

    this._config = config;

    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
    // everything that is needed to describe a SDP m-line.
    this.transceivers = [];

    this._sdpSessionId = sdp.generateSessionId();
    this._sdpSessionVersion = 0;

    this._dtlsRole = undefined; // role for a=setup to use in answers.

    this._isClosed = false;
  };

  Object.defineProperty(RTCPeerConnection.prototype, "localDescription", {
    configurable: true,
    get: function () {
      return this._localDescription;
    },
  });
  Object.defineProperty(RTCPeerConnection.prototype, "remoteDescription", {
    configurable: true,
    get: function () {
      return this._remoteDescription;
    },
  });

  // set up event handlers on prototype
  RTCPeerConnection.prototype.onicecandidate = null;
  RTCPeerConnection.prototype.onaddstream = null;
  RTCPeerConnection.prototype.ontrack = null;
  RTCPeerConnection.prototype.onremovestream = null;
  RTCPeerConnection.prototype.onsignalingstatechange = null;
  RTCPeerConnection.prototype.oniceconnectionstatechange = null;
  RTCPeerConnection.prototype.onconnectionstatechange = null;
  RTCPeerConnection.prototype.onicegatheringstatechange = null;
  RTCPeerConnection.prototype.onnegotiationneeded = null;
  RTCPeerConnection.prototype.ondatachannel = null;

  RTCPeerConnection.prototype._dispatchEvent = function (name, event) {
    if (this._isClosed) {
      return;
    }
    this.dispatchEvent(event);
    if (typeof this["on" + name] === "function") {
      this["on" + name](event);
    }
  };

  RTCPeerConnection.prototype._emitGatheringStateChange = function () {
    var event = new Event("icegatheringstatechange");
    this._dispatchEvent("icegatheringstatechange", event);
  };

  RTCPeerConnection.prototype.getConfiguration = function () {
    return this._config;
  };

  RTCPeerConnection.prototype.getLocalStreams = function () {
    return this.localStreams;
  };

  RTCPeerConnection.prototype.getRemoteStreams = function () {
    return this.remoteStreams;
  };

  // internal helper to create a transceiver object.
  // (which is not yet the same as the WebRTC 1.0 transceiver)
  RTCPeerConnection.prototype._createTransceiver = function (kind, doNotAdd) {
    var hasBundleTransport = this.transceivers.length > 0;
    var transceiver = {
      track: null,
      iceGatherer: null,
      iceTransport: null,
      dtlsTransport: null,
      localCapabilities: null,
      remoteCapabilities: null,
      rtpSender: null,
      rtpReceiver: null,
      kind: kind,
      mid: null,
      sendEncodingParameters: null,
      recvEncodingParameters: null,
      stream: null,
      associatedRemoteMediaStreams: [],
      wantReceive: true,
    };
    if (this.usingBundle && hasBundleTransport) {
      transceiver.iceTransport = this.transceivers[0].iceTransport;
      transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
    } else {
      var transports = this._createIceAndDtlsTransports();
      transceiver.iceTransport = transports.iceTransport;
      transceiver.dtlsTransport = transports.dtlsTransport;
    }
    if (!doNotAdd) {
      this.transceivers.push(transceiver);
    }
    return transceiver;
  };

  RTCPeerConnection.prototype.addTrack = function (track, stream) {
    if (this._isClosed) {
      throw makeError(
        "InvalidStateError",
        "Attempted to call addTrack on a closed peerconnection."
      );
    }

    var alreadyExists = this.transceivers.find(function (s) {
      return s.track === track;
    });

    if (alreadyExists) {
      throw makeError("InvalidAccessError", "Track already exists.");
    }

    var transceiver;
    for (var i = 0; i < this.transceivers.length; i++) {
      if (
        !this.transceivers[i].track &&
        this.transceivers[i].kind === track.kind
      ) {
        transceiver = this.transceivers[i];
      }
    }
    if (!transceiver) {
      transceiver = this._createTransceiver(track.kind);
    }

    this._maybeFireNegotiationNeeded();

    if (this.localStreams.indexOf(stream) === -1) {
      this.localStreams.push(stream);
    }

    transceiver.track = track;
    transceiver.stream = stream;
    transceiver.rtpSender = new window.RTCRtpSender(
      track,
      transceiver.dtlsTransport
    );
    return transceiver.rtpSender;
  };

  RTCPeerConnection.prototype.addStream = function (stream) {
    var pc = this;
    if (edgeVersion >= 15025) {
      stream.getTracks().forEach(function (track) {
        pc.addTrack(track, stream);
      });
    } else {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      // Fixed in 15025 (or earlier)
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function (track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener("enabled", function (event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      clonedStream.getTracks().forEach(function (track) {
        pc.addTrack(track, clonedStream);
      });
    }
  };

  RTCPeerConnection.prototype.removeTrack = function (sender) {
    if (this._isClosed) {
      throw makeError(
        "InvalidStateError",
        "Attempted to call removeTrack on a closed peerconnection."
      );
    }

    if (!(sender instanceof window.RTCRtpSender)) {
      throw new TypeError(
        "Argument 1 of RTCPeerConnection.removeTrack " +
          "does not implement interface RTCRtpSender."
      );
    }

    var transceiver = this.transceivers.find(function (t) {
      return t.rtpSender === sender;
    });

    if (!transceiver) {
      throw makeError(
        "InvalidAccessError",
        "Sender was not created by this connection."
      );
    }
    var stream = transceiver.stream;

    transceiver.rtpSender.stop();
    transceiver.rtpSender = null;
    transceiver.track = null;
    transceiver.stream = null;

    // remove the stream from the set of local streams
    var localStreams = this.transceivers.map(function (t) {
      return t.stream;
    });
    if (
      localStreams.indexOf(stream) === -1 &&
      this.localStreams.indexOf(stream) > -1
    ) {
      this.localStreams.splice(this.localStreams.indexOf(stream), 1);
    }

    this._maybeFireNegotiationNeeded();
  };

  RTCPeerConnection.prototype.removeStream = function (stream) {
    var pc = this;
    stream.getTracks().forEach(function (track) {
      var sender = pc.getSenders().find(function (s) {
        return s.track === track;
      });
      if (sender) {
        pc.removeTrack(sender);
      }
    });
  };

  RTCPeerConnection.prototype.getSenders = function () {
    return this.transceivers
      .filter(function (transceiver) {
        return !!transceiver.rtpSender;
      })
      .map(function (transceiver) {
        return transceiver.rtpSender;
      });
  };

  RTCPeerConnection.prototype.getReceivers = function () {
    return this.transceivers
      .filter(function (transceiver) {
        return !!transceiver.rtpReceiver;
      })
      .map(function (transceiver) {
        return transceiver.rtpReceiver;
      });
  };

  RTCPeerConnection.prototype._createIceGatherer = function (
    sdpMLineIndex,
    usingBundle
  ) {
    var pc = this;
    if (usingBundle && sdpMLineIndex > 0) {
      return this.transceivers[0].iceGatherer;
    } else if (this._iceGatherers.length) {
      return this._iceGatherers.shift();
    }
    var iceGatherer = new window.RTCIceGatherer({
      iceServers: this._config.iceServers,
      gatherPolicy: this._config.iceTransportPolicy,
    });
    Object.defineProperty(iceGatherer, "state", {
      value: "new",
      writable: true,
    });

    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
    this.transceivers[sdpMLineIndex].bufferCandidates = function (event) {
      var end = !event.candidate || Object.keys(event.candidate).length === 0;
      // polyfill since RTCIceGatherer.state is not implemented in
      // Edge 10547 yet.
      iceGatherer.state = end ? "completed" : "gathering";
      if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
        pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
      }
    };
    iceGatherer.addEventListener(
      "localcandidate",
      this.transceivers[sdpMLineIndex].bufferCandidates
    );
    return iceGatherer;
  };

  // start gathering from an RTCIceGatherer.
  RTCPeerConnection.prototype._gather = function (mid, sdpMLineIndex) {
    var pc = this;
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer.onlocalcandidate) {
      return;
    }
    var bufferedCandidateEvents =
      this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
    iceGatherer.removeEventListener(
      "localcandidate",
      this.transceivers[sdpMLineIndex].bufferCandidates
    );
    iceGatherer.onlocalcandidate = function (evt) {
      if (pc.usingBundle && sdpMLineIndex > 0) {
        // if we know that we use bundle we can drop candidates with
        // ѕdpMLineIndex > 0. If we don't do this then our state gets
        // confused since we dispose the extra ice gatherer.
        return;
      }
      var event = new Event("icecandidate");
      event.candidate = { sdpMid: mid, sdpMLineIndex: sdpMLineIndex };

      var cand = evt.candidate;
      // Edge emits an empty object for RTCIceCandidateComplete‥
      var end = !cand || Object.keys(cand).length === 0;
      if (end) {
        // polyfill since RTCIceGatherer.state is not implemented in
        // Edge 10547 yet.
        if (iceGatherer.state === "new" || iceGatherer.state === "gathering") {
          iceGatherer.state = "completed";
        }
      } else {
        if (iceGatherer.state === "new") {
          iceGatherer.state = "gathering";
        }
        // RTCIceCandidate doesn't have a component, needs to be added
        cand.component = 1;
        // also the usernameFragment. TODO: update SDP to take both variants.
        cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

        var serializedCandidate = sdp.writeCandidate(cand);
        event.candidate = Object.assign(
          event.candidate,
          sdp.parseCandidate(serializedCandidate)
        );

        event.candidate.candidate = serializedCandidate;
        event.candidate.toJSON = function () {
          return {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment,
          };
        };
      }

      // update local description.
      var sections = sdp.getMediaSections(pc._localDescription.sdp);
      if (!end) {
        sections[event.candidate.sdpMLineIndex] +=
          "a=" + event.candidate.candidate + "\r\n";
      } else {
        sections[event.candidate.sdpMLineIndex] += "a=end-of-candidates\r\n";
      }
      pc._localDescription.sdp =
        sdp.getDescription(pc._localDescription.sdp) + sections.join("");
      var complete = pc.transceivers.every(function (transceiver) {
        return (
          transceiver.iceGatherer &&
          transceiver.iceGatherer.state === "completed"
        );
      });

      if (pc.iceGatheringState !== "gathering") {
        pc.iceGatheringState = "gathering";
        pc._emitGatheringStateChange();
      }

      // Emit candidate. Also emit null candidate when all gatherers are
      // complete.
      if (!end) {
        pc._dispatchEvent("icecandidate", event);
      }
      if (complete) {
        pc._dispatchEvent("icecandidate", new Event("icecandidate"));
        pc.iceGatheringState = "complete";
        pc._emitGatheringStateChange();
      }
    };

    // emit already gathered candidates.
    window.setTimeout(function () {
      bufferedCandidateEvents.forEach(function (e) {
        iceGatherer.onlocalcandidate(e);
      });
    }, 0);
  };

  // Create ICE transport and DTLS transport.
  RTCPeerConnection.prototype._createIceAndDtlsTransports = function () {
    var pc = this;
    var iceTransport = new window.RTCIceTransport(null);
    iceTransport.onicestatechange = function () {
      pc._updateIceConnectionState();
      pc._updateConnectionState();
    };

    var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
    dtlsTransport.ondtlsstatechange = function () {
      pc._updateConnectionState();
    };
    dtlsTransport.onerror = function () {
      // onerror does not set state to failed by itself.
      Object.defineProperty(dtlsTransport, "state", {
        value: "failed",
        writable: true,
      });
      pc._updateConnectionState();
    };

    return {
      iceTransport: iceTransport,
      dtlsTransport: dtlsTransport,
    };
  };

  // Destroy ICE gatherer, ICE transport and DTLS transport.
  // Without triggering the callbacks.
  RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function (
    sdpMLineIndex
  ) {
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer) {
      delete iceGatherer.onlocalcandidate;
      delete this.transceivers[sdpMLineIndex].iceGatherer;
    }
    var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
    if (iceTransport) {
      delete iceTransport.onicestatechange;
      delete this.transceivers[sdpMLineIndex].iceTransport;
    }
    var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
    if (dtlsTransport) {
      delete dtlsTransport.ondtlsstatechange;
      delete dtlsTransport.onerror;
      delete this.transceivers[sdpMLineIndex].dtlsTransport;
    }
  };

  // Start the RTP Sender and Receiver for a transceiver.
  RTCPeerConnection.prototype._transceive = function (transceiver, send, recv) {
    var params = getCommonCapabilities(
      transceiver.localCapabilities,
      transceiver.remoteCapabilities
    );
    if (send && transceiver.rtpSender) {
      params.encodings = transceiver.sendEncodingParameters;
      params.rtcp = {
        cname: sdp.localCName,
        compound: transceiver.rtcpParameters.compound,
      };
      if (transceiver.recvEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
      }
      transceiver.rtpSender.send(params);
    }
    if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
      // remove RTX field in Edge 14942
      if (
        transceiver.kind === "video" &&
        transceiver.recvEncodingParameters &&
        edgeVersion < 15019
      ) {
        transceiver.recvEncodingParameters.forEach(function (p) {
          delete p.rtx;
        });
      }
      if (transceiver.recvEncodingParameters.length) {
        params.encodings = transceiver.recvEncodingParameters;
      } else {
        params.encodings = [{}];
      }
      params.rtcp = {
        compound: transceiver.rtcpParameters.compound,
      };
      if (transceiver.rtcpParameters.cname) {
        params.rtcp.cname = transceiver.rtcpParameters.cname;
      }
      if (transceiver.sendEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
      }
      transceiver.rtpReceiver.receive(params);
    }
  };

  RTCPeerConnection.prototype.setLocalDescription = function (description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (["offer", "answer"].indexOf(description.type) === -1) {
      return Promise.reject(
        makeError("TypeError", 'Unsupported type "' + description.type + '"')
      );
    }

    if (
      !isActionAllowedInSignalingState(
        "setLocalDescription",
        description.type,
        pc.signalingState
      ) ||
      pc._isClosed
    ) {
      return Promise.reject(
        makeError(
          "InvalidStateError",
          "Can not set local " +
            description.type +
            " in state " +
            pc.signalingState
        )
      );
    }

    var sections;
    var sessionpart;
    if (description.type === "offer") {
      // VERY limited support for SDP munging. Limited to:
      // * changing the order of codecs
      sections = sdp.splitSections(description.sdp);
      sessionpart = sections.shift();
      sections.forEach(function (mediaSection, sdpMLineIndex) {
        var caps = sdp.parseRtpParameters(mediaSection);
        pc.transceivers[sdpMLineIndex].localCapabilities = caps;
      });

      pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
        pc._gather(transceiver.mid, sdpMLineIndex);
      });
    } else if (description.type === "answer") {
      sections = sdp.splitSections(pc._remoteDescription.sdp);
      sessionpart = sections.shift();
      var isIceLite = sdp.matchPrefix(sessionpart, "a=ice-lite").length > 0;
      sections.forEach(function (mediaSection, sdpMLineIndex) {
        var transceiver = pc.transceivers[sdpMLineIndex];
        var iceGatherer = transceiver.iceGatherer;
        var iceTransport = transceiver.iceTransport;
        var dtlsTransport = transceiver.dtlsTransport;
        var localCapabilities = transceiver.localCapabilities;
        var remoteCapabilities = transceiver.remoteCapabilities;

        // treat bundle-only as not-rejected.
        var rejected =
          sdp.isRejected(mediaSection) &&
          sdp.matchPrefix(mediaSection, "a=bundle-only").length === 0;

        if (!rejected && !transceiver.rejected) {
          var remoteIceParameters = sdp.getIceParameters(
            mediaSection,
            sessionpart
          );
          var remoteDtlsParameters = sdp.getDtlsParameters(
            mediaSection,
            sessionpart
          );
          if (isIceLite) {
            remoteDtlsParameters.role = "server";
          }

          if (!pc.usingBundle || sdpMLineIndex === 0) {
            pc._gather(transceiver.mid, sdpMLineIndex);
            if (iceTransport.state === "new") {
              iceTransport.start(
                iceGatherer,
                remoteIceParameters,
                isIceLite ? "controlling" : "controlled"
              );
            }
            if (dtlsTransport.state === "new") {
              dtlsTransport.start(remoteDtlsParameters);
            }
          }

          // Calculate intersection of capabilities.
          var params = getCommonCapabilities(
            localCapabilities,
            remoteCapabilities
          );

          // Start the RTCRtpSender. The RTCRtpReceiver for this
          // transceiver has already been started in setRemoteDescription.
          pc._transceive(transceiver, params.codecs.length > 0, false);
        }
      });
    }

    pc._localDescription = {
      type: description.type,
      sdp: description.sdp,
    };
    if (description.type === "offer") {
      pc._updateSignalingState("have-local-offer");
    } else {
      pc._updateSignalingState("stable");
    }

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.setRemoteDescription = function (description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (["offer", "answer"].indexOf(description.type) === -1) {
      return Promise.reject(
        makeError("TypeError", 'Unsupported type "' + description.type + '"')
      );
    }

    if (
      !isActionAllowedInSignalingState(
        "setRemoteDescription",
        description.type,
        pc.signalingState
      ) ||
      pc._isClosed
    ) {
      return Promise.reject(
        makeError(
          "InvalidStateError",
          "Can not set remote " +
            description.type +
            " in state " +
            pc.signalingState
        )
      );
    }

    var streams = {};
    pc.remoteStreams.forEach(function (stream) {
      streams[stream.id] = stream;
    });
    var receiverList = [];
    var sections = sdp.splitSections(description.sdp);
    var sessionpart = sections.shift();
    var isIceLite = sdp.matchPrefix(sessionpart, "a=ice-lite").length > 0;
    var usingBundle =
      sdp.matchPrefix(sessionpart, "a=group:BUNDLE ").length > 0;
    pc.usingBundle = usingBundle;
    var iceOptions = sdp.matchPrefix(sessionpart, "a=ice-options:")[0];
    if (iceOptions) {
      pc.canTrickleIceCandidates =
        iceOptions.substr(14).split(" ").indexOf("trickle") >= 0;
    } else {
      pc.canTrickleIceCandidates = false;
    }

    sections.forEach(function (mediaSection, sdpMLineIndex) {
      var lines = sdp.splitLines(mediaSection);
      var kind = sdp.getKind(mediaSection);
      // treat bundle-only as not-rejected.
      var rejected =
        sdp.isRejected(mediaSection) &&
        sdp.matchPrefix(mediaSection, "a=bundle-only").length === 0;
      var protocol = lines[0].substr(2).split(" ")[2];

      var direction = sdp.getDirection(mediaSection, sessionpart);
      var remoteMsid = sdp.parseMsid(mediaSection);

      var mid = sdp.getMid(mediaSection) || sdp.generateIdentifier();

      // Reject datachannels which are not implemented yet.
      if (
        rejected ||
        (kind === "application" &&
          (protocol === "DTLS/SCTP" || protocol === "UDP/DTLS/SCTP"))
      ) {
        // TODO: this is dangerous in the case where a non-rejected m-line
        //     becomes rejected.
        pc.transceivers[sdpMLineIndex] = {
          mid: mid,
          kind: kind,
          protocol: protocol,
          rejected: true,
        };
        return;
      }

      if (
        !rejected &&
        pc.transceivers[sdpMLineIndex] &&
        pc.transceivers[sdpMLineIndex].rejected
      ) {
        // recycle a rejected transceiver.
        pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
      }

      var transceiver;
      var iceGatherer;
      var iceTransport;
      var dtlsTransport;
      var rtpReceiver;
      var sendEncodingParameters;
      var recvEncodingParameters;
      var localCapabilities;

      var track;
      // FIXME: ensure the mediaSection has rtcp-mux set.
      var remoteCapabilities = sdp.parseRtpParameters(mediaSection);
      var remoteIceParameters;
      var remoteDtlsParameters;
      if (!rejected) {
        remoteIceParameters = sdp.getIceParameters(mediaSection, sessionpart);
        remoteDtlsParameters = sdp.getDtlsParameters(mediaSection, sessionpart);
        remoteDtlsParameters.role = "client";
      }
      recvEncodingParameters = sdp.parseRtpEncodingParameters(mediaSection);

      var rtcpParameters = sdp.parseRtcpParameters(mediaSection);

      var isComplete =
        sdp.matchPrefix(mediaSection, "a=end-of-candidates", sessionpart)
          .length > 0;
      var cands = sdp
        .matchPrefix(mediaSection, "a=candidate:")
        .map(function (cand) {
          return sdp.parseCandidate(cand);
        })
        .filter(function (cand) {
          return cand.component === 1;
        });

      // Check if we can use BUNDLE and dispose transports.
      if (
        (description.type === "offer" || description.type === "answer") &&
        !rejected &&
        usingBundle &&
        sdpMLineIndex > 0 &&
        pc.transceivers[sdpMLineIndex]
      ) {
        pc._disposeIceAndDtlsTransports(sdpMLineIndex);
        pc.transceivers[sdpMLineIndex].iceGatherer =
          pc.transceivers[0].iceGatherer;
        pc.transceivers[sdpMLineIndex].iceTransport =
          pc.transceivers[0].iceTransport;
        pc.transceivers[sdpMLineIndex].dtlsTransport =
          pc.transceivers[0].dtlsTransport;
        if (pc.transceivers[sdpMLineIndex].rtpSender) {
          pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
            pc.transceivers[0].dtlsTransport
          );
        }
        if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
          pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
            pc.transceivers[0].dtlsTransport
          );
        }
      }
      if (description.type === "offer" && !rejected) {
        transceiver =
          pc.transceivers[sdpMLineIndex] || pc._createTransceiver(kind);
        transceiver.mid = mid;

        if (!transceiver.iceGatherer) {
          transceiver.iceGatherer = pc._createIceGatherer(
            sdpMLineIndex,
            usingBundle
          );
        }

        if (cands.length && transceiver.iceTransport.state === "new") {
          if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
            transceiver.iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function (candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        if (edgeVersion < 15019) {
          localCapabilities.codecs = localCapabilities.codecs.filter(function (
            codec
          ) {
            return codec.name !== "rtx";
          });
        }

        sendEncodingParameters = transceiver.sendEncodingParameters || [
          {
            ssrc: (2 * sdpMLineIndex + 2) * 1001,
          },
        ];

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        var isNewTrack = false;
        if (direction === "sendrecv" || direction === "sendonly") {
          isNewTrack = !transceiver.rtpReceiver;
          rtpReceiver =
            transceiver.rtpReceiver ||
            new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

          if (isNewTrack) {
            var stream;
            track = rtpReceiver.track;
            // FIXME: does not work with Plan B.
            if (remoteMsid && remoteMsid.stream === "-");
            else if (remoteMsid) {
              if (!streams[remoteMsid.stream]) {
                streams[remoteMsid.stream] = new window.MediaStream();
                Object.defineProperty(streams[remoteMsid.stream], "id", {
                  get: function () {
                    return remoteMsid.stream;
                  },
                });
              }
              Object.defineProperty(track, "id", {
                get: function () {
                  return remoteMsid.track;
                },
              });
              stream = streams[remoteMsid.stream];
            } else {
              if (!streams.default) {
                streams.default = new window.MediaStream();
              }
              stream = streams.default;
            }
            if (stream) {
              addTrackToStreamAndFireEvent(track, stream);
              transceiver.associatedRemoteMediaStreams.push(stream);
            }
            receiverList.push([track, rtpReceiver, stream]);
          }
        } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
          transceiver.associatedRemoteMediaStreams.forEach(function (s) {
            var nativeTrack = s.getTracks().find(function (t) {
              return t.id === transceiver.rtpReceiver.track.id;
            });
            if (nativeTrack) {
              removeTrackFromStreamAndFireEvent(nativeTrack, s);
            }
          });
          transceiver.associatedRemoteMediaStreams = [];
        }

        transceiver.localCapabilities = localCapabilities;
        transceiver.remoteCapabilities = remoteCapabilities;
        transceiver.rtpReceiver = rtpReceiver;
        transceiver.rtcpParameters = rtcpParameters;
        transceiver.sendEncodingParameters = sendEncodingParameters;
        transceiver.recvEncodingParameters = recvEncodingParameters;

        // Start the RTCRtpReceiver now. The RTPSender is started in
        // setLocalDescription.
        pc._transceive(pc.transceivers[sdpMLineIndex], false, isNewTrack);
      } else if (description.type === "answer" && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex];
        iceGatherer = transceiver.iceGatherer;
        iceTransport = transceiver.iceTransport;
        dtlsTransport = transceiver.dtlsTransport;
        rtpReceiver = transceiver.rtpReceiver;
        sendEncodingParameters = transceiver.sendEncodingParameters;
        localCapabilities = transceiver.localCapabilities;

        pc.transceivers[sdpMLineIndex].recvEncodingParameters =
          recvEncodingParameters;
        pc.transceivers[sdpMLineIndex].remoteCapabilities = remoteCapabilities;
        pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

        if (cands.length && iceTransport.state === "new") {
          if (
            (isIceLite || isComplete) &&
            (!usingBundle || sdpMLineIndex === 0)
          ) {
            iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function (candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        if (!usingBundle || sdpMLineIndex === 0) {
          if (iceTransport.state === "new") {
            iceTransport.start(iceGatherer, remoteIceParameters, "controlling");
          }
          if (dtlsTransport.state === "new") {
            dtlsTransport.start(remoteDtlsParameters);
          }
        }

        // If the offer contained RTX but the answer did not,
        // remove RTX from sendEncodingParameters.
        var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities
        );

        var hasRtx = commonCapabilities.codecs.filter(function (c) {
          return c.name.toLowerCase() === "rtx";
        }).length;
        if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
          delete transceiver.sendEncodingParameters[0].rtx;
        }

        pc._transceive(
          transceiver,
          direction === "sendrecv" || direction === "recvonly",
          direction === "sendrecv" || direction === "sendonly"
        );

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        if (
          rtpReceiver &&
          (direction === "sendrecv" || direction === "sendonly")
        ) {
          track = rtpReceiver.track;
          if (remoteMsid) {
            if (!streams[remoteMsid.stream]) {
              streams[remoteMsid.stream] = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
            receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
          } else {
            if (!streams.default) {
              streams.default = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams.default);
            receiverList.push([track, rtpReceiver, streams.default]);
          }
        } else {
          // FIXME: actually the receiver should be created later.
          delete transceiver.rtpReceiver;
        }
      }
    });

    if (pc._dtlsRole === undefined) {
      pc._dtlsRole = description.type === "offer" ? "active" : "passive";
    }

    pc._remoteDescription = {
      type: description.type,
      sdp: description.sdp,
    };
    if (description.type === "offer") {
      pc._updateSignalingState("have-remote-offer");
    } else {
      pc._updateSignalingState("stable");
    }
    Object.keys(streams).forEach(function (sid) {
      var stream = streams[sid];
      if (stream.getTracks().length) {
        if (pc.remoteStreams.indexOf(stream) === -1) {
          pc.remoteStreams.push(stream);
          var event = new Event("addstream");
          event.stream = stream;
          window.setTimeout(function () {
            pc._dispatchEvent("addstream", event);
          });
        }

        receiverList.forEach(function (item) {
          var track = item[0];
          var receiver = item[1];
          if (stream.id !== item[2].id) {
            return;
          }
          fireAddTrack(pc, track, receiver, [stream]);
        });
      }
    });
    receiverList.forEach(function (item) {
      if (item[2]) {
        return;
      }
      fireAddTrack(pc, item[0], item[1], []);
    });

    // check whether addIceCandidate({}) was called within four seconds after
    // setRemoteDescription.
    window.setTimeout(function () {
      if (!(pc && pc.transceivers)) {
        return;
      }
      pc.transceivers.forEach(function (transceiver) {
        if (
          transceiver.iceTransport &&
          transceiver.iceTransport.state === "new" &&
          transceiver.iceTransport.getRemoteCandidates().length > 0
        ) {
          console.warn(
            "Timeout for addRemoteCandidate. Consider sending " +
              "an end-of-candidates notification"
          );
          transceiver.iceTransport.addRemoteCandidate({});
        }
      });
    }, 4000);

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.close = function () {
    this.transceivers.forEach(function (transceiver) {
      /* not yet
      if (transceiver.iceGatherer) {
        transceiver.iceGatherer.close();
      }
      */
      if (transceiver.iceTransport) {
        transceiver.iceTransport.stop();
      }
      if (transceiver.dtlsTransport) {
        transceiver.dtlsTransport.stop();
      }
      if (transceiver.rtpSender) {
        transceiver.rtpSender.stop();
      }
      if (transceiver.rtpReceiver) {
        transceiver.rtpReceiver.stop();
      }
    });
    // FIXME: clean up tracks, local streams, remote streams, etc
    this._isClosed = true;
    this._updateSignalingState("closed");
  };

  // Update the signaling state.
  RTCPeerConnection.prototype._updateSignalingState = function (newState) {
    this.signalingState = newState;
    var event = new Event("signalingstatechange");
    this._dispatchEvent("signalingstatechange", event);
  };

  // Determine whether to fire the negotiationneeded event.
  RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function () {
    var pc = this;
    if (this.signalingState !== "stable" || this.needNegotiation === true) {
      return;
    }
    this.needNegotiation = true;
    window.setTimeout(function () {
      if (pc.needNegotiation) {
        pc.needNegotiation = false;
        var event = new Event("negotiationneeded");
        pc._dispatchEvent("negotiationneeded", event);
      }
    }, 0);
  };

  // Update the ice connection state.
  RTCPeerConnection.prototype._updateIceConnectionState = function () {
    var newState;
    var states = {
      new: 0,
      closed: 0,
      checking: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0,
    };
    this.transceivers.forEach(function (transceiver) {
      if (transceiver.iceTransport && !transceiver.rejected) {
        states[transceiver.iceTransport.state]++;
      }
    });

    newState = "new";
    if (states.failed > 0) {
      newState = "failed";
    } else if (states.checking > 0) {
      newState = "checking";
    } else if (states.disconnected > 0) {
      newState = "disconnected";
    } else if (states.new > 0) {
      newState = "new";
    } else if (states.connected > 0) {
      newState = "connected";
    } else if (states.completed > 0) {
      newState = "completed";
    }

    if (newState !== this.iceConnectionState) {
      this.iceConnectionState = newState;
      var event = new Event("iceconnectionstatechange");
      this._dispatchEvent("iceconnectionstatechange", event);
    }
  };

  // Update the connection state.
  RTCPeerConnection.prototype._updateConnectionState = function () {
    var newState;
    var states = {
      new: 0,
      closed: 0,
      connecting: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0,
    };
    this.transceivers.forEach(function (transceiver) {
      if (
        transceiver.iceTransport &&
        transceiver.dtlsTransport &&
        !transceiver.rejected
      ) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      }
    });
    // ICETransport.completed and connected are the same for this purpose.
    states.connected += states.completed;

    newState = "new";
    if (states.failed > 0) {
      newState = "failed";
    } else if (states.connecting > 0) {
      newState = "connecting";
    } else if (states.disconnected > 0) {
      newState = "disconnected";
    } else if (states.new > 0) {
      newState = "new";
    } else if (states.connected > 0) {
      newState = "connected";
    }

    if (newState !== this.connectionState) {
      this.connectionState = newState;
      var event = new Event("connectionstatechange");
      this._dispatchEvent("connectionstatechange", event);
    }
  };

  RTCPeerConnection.prototype.createOffer = function () {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(
        makeError("InvalidStateError", "Can not call createOffer after close")
      );
    }

    var numAudioTracks = pc.transceivers.filter(function (t) {
      return t.kind === "audio";
    }).length;
    var numVideoTracks = pc.transceivers.filter(function (t) {
      return t.kind === "video";
    }).length;

    // Determine number of audio and video tracks we need to send/recv.
    var offerOptions = arguments[0];
    if (offerOptions) {
      // Reject Chrome legacy constraints.
      if (offerOptions.mandatory || offerOptions.optional) {
        throw new TypeError(
          "Legacy mandatory/optional constraints not supported."
        );
      }
      if (offerOptions.offerToReceiveAudio !== undefined) {
        if (offerOptions.offerToReceiveAudio === true) {
          numAudioTracks = 1;
        } else if (offerOptions.offerToReceiveAudio === false) {
          numAudioTracks = 0;
        } else {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
      }
      if (offerOptions.offerToReceiveVideo !== undefined) {
        if (offerOptions.offerToReceiveVideo === true) {
          numVideoTracks = 1;
        } else if (offerOptions.offerToReceiveVideo === false) {
          numVideoTracks = 0;
        } else {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
    }

    pc.transceivers.forEach(function (transceiver) {
      if (transceiver.kind === "audio") {
        numAudioTracks--;
        if (numAudioTracks < 0) {
          transceiver.wantReceive = false;
        }
      } else if (transceiver.kind === "video") {
        numVideoTracks--;
        if (numVideoTracks < 0) {
          transceiver.wantReceive = false;
        }
      }
    });

    // Create M-lines for recvonly streams.
    while (numAudioTracks > 0 || numVideoTracks > 0) {
      if (numAudioTracks > 0) {
        pc._createTransceiver("audio");
        numAudioTracks--;
      }
      if (numVideoTracks > 0) {
        pc._createTransceiver("video");
        numVideoTracks--;
      }
    }

    var sdp$1 = sdp.writeSessionBoilerplate(
      pc._sdpSessionId,
      pc._sdpSessionVersion++
    );
    pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
      // For each track, create an ice gatherer, ice transport,
      // dtls transport, potentially rtpsender and rtpreceiver.
      var track = transceiver.track;
      var kind = transceiver.kind;
      var mid = transceiver.mid || sdp.generateIdentifier();
      transceiver.mid = mid;

      if (!transceiver.iceGatherer) {
        transceiver.iceGatherer = pc._createIceGatherer(
          sdpMLineIndex,
          pc.usingBundle
        );
      }

      var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
      // filter RTX until additional stuff needed for RTX is implemented
      // in adapter.js
      if (edgeVersion < 15019) {
        localCapabilities.codecs = localCapabilities.codecs.filter(function (
          codec
        ) {
          return codec.name !== "rtx";
        });
      }
      localCapabilities.codecs.forEach(function (codec) {
        // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
        // by adding level-asymmetry-allowed=1
        if (
          codec.name === "H264" &&
          codec.parameters["level-asymmetry-allowed"] === undefined
        ) {
          codec.parameters["level-asymmetry-allowed"] = "1";
        }

        // for subsequent offers, we might have to re-use the payload
        // type of the last offer.
        if (
          transceiver.remoteCapabilities &&
          transceiver.remoteCapabilities.codecs
        ) {
          transceiver.remoteCapabilities.codecs.forEach(function (remoteCodec) {
            if (
              codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
              codec.clockRate === remoteCodec.clockRate
            ) {
              codec.preferredPayloadType = remoteCodec.payloadType;
            }
          });
        }
      });
      localCapabilities.headerExtensions.forEach(function (hdrExt) {
        var remoteExtensions =
          (transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.headerExtensions) ||
          [];
        remoteExtensions.forEach(function (rHdrExt) {
          if (hdrExt.uri === rHdrExt.uri) {
            hdrExt.id = rHdrExt.id;
          }
        });
      });

      // generate an ssrc now, to be used later in rtpSender.send
      var sendEncodingParameters = transceiver.sendEncodingParameters || [
        {
          ssrc: (2 * sdpMLineIndex + 1) * 1001,
        },
      ];
      if (track) {
        // add RTX
        if (
          edgeVersion >= 15019 &&
          kind === "video" &&
          !sendEncodingParameters[0].rtx
        ) {
          sendEncodingParameters[0].rtx = {
            ssrc: sendEncodingParameters[0].ssrc + 1,
          };
        }
      }

      if (transceiver.wantReceive) {
        transceiver.rtpReceiver = new window.RTCRtpReceiver(
          transceiver.dtlsTransport,
          kind
        );
      }

      transceiver.localCapabilities = localCapabilities;
      transceiver.sendEncodingParameters = sendEncodingParameters;
    });

    // always offer BUNDLE and dispose on return if not supported.
    if (pc._config.bundlePolicy !== "max-compat") {
      sdp$1 +=
        "a=group:BUNDLE " +
        pc.transceivers
          .map(function (t) {
            return t.mid;
          })
          .join(" ") +
        "\r\n";
    }
    sdp$1 += "a=ice-options:trickle\r\n";

    pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
      sdp$1 += writeMediaSection(
        transceiver,
        transceiver.localCapabilities,
        "offer",
        transceiver.stream,
        pc._dtlsRole
      );
      sdp$1 += "a=rtcp-rsize\r\n";

      if (
        transceiver.iceGatherer &&
        pc.iceGatheringState !== "new" &&
        (sdpMLineIndex === 0 || !pc.usingBundle)
      ) {
        transceiver.iceGatherer.getLocalCandidates().forEach(function (cand) {
          cand.component = 1;
          sdp$1 += "a=" + sdp.writeCandidate(cand) + "\r\n";
        });

        if (transceiver.iceGatherer.state === "completed") {
          sdp$1 += "a=end-of-candidates\r\n";
        }
      }
    });

    var desc = new window.RTCSessionDescription({
      type: "offer",
      sdp: sdp$1,
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.createAnswer = function () {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(
        makeError("InvalidStateError", "Can not call createAnswer after close")
      );
    }

    if (
      !(
        pc.signalingState === "have-remote-offer" ||
        pc.signalingState === "have-local-pranswer"
      )
    ) {
      return Promise.reject(
        makeError(
          "InvalidStateError",
          "Can not call createAnswer in signalingState " + pc.signalingState
        )
      );
    }

    var sdp$1 = sdp.writeSessionBoilerplate(
      pc._sdpSessionId,
      pc._sdpSessionVersion++
    );
    if (pc.usingBundle) {
      sdp$1 +=
        "a=group:BUNDLE " +
        pc.transceivers
          .map(function (t) {
            return t.mid;
          })
          .join(" ") +
        "\r\n";
    }
    sdp$1 += "a=ice-options:trickle\r\n";

    var mediaSectionsInOffer = sdp.getMediaSections(
      pc._remoteDescription.sdp
    ).length;
    pc.transceivers.forEach(function (transceiver, sdpMLineIndex) {
      if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
        return;
      }
      if (transceiver.rejected) {
        if (transceiver.kind === "application") {
          if (transceiver.protocol === "DTLS/SCTP") {
            // legacy fmt
            sdp$1 += "m=application 0 DTLS/SCTP 5000\r\n";
          } else {
            sdp$1 +=
              "m=application 0 " +
              transceiver.protocol +
              " webrtc-datachannel\r\n";
          }
        } else if (transceiver.kind === "audio") {
          sdp$1 +=
            "m=audio 0 UDP/TLS/RTP/SAVPF 0\r\n" + "a=rtpmap:0 PCMU/8000\r\n";
        } else if (transceiver.kind === "video") {
          sdp$1 +=
            "m=video 0 UDP/TLS/RTP/SAVPF 120\r\n" +
            "a=rtpmap:120 VP8/90000\r\n";
        }
        sdp$1 +=
          "c=IN IP4 0.0.0.0\r\n" +
          "a=inactive\r\n" +
          "a=mid:" +
          transceiver.mid +
          "\r\n";
        return;
      }

      // FIXME: look at direction.
      if (transceiver.stream) {
        var localTrack;
        if (transceiver.kind === "audio") {
          localTrack = transceiver.stream.getAudioTracks()[0];
        } else if (transceiver.kind === "video") {
          localTrack = transceiver.stream.getVideoTracks()[0];
        }
        if (localTrack) {
          // add RTX
          if (
            edgeVersion >= 15019 &&
            transceiver.kind === "video" &&
            !transceiver.sendEncodingParameters[0].rtx
          ) {
            transceiver.sendEncodingParameters[0].rtx = {
              ssrc: transceiver.sendEncodingParameters[0].ssrc + 1,
            };
          }
        }
      }

      // Calculate intersection of capabilities.
      var commonCapabilities = getCommonCapabilities(
        transceiver.localCapabilities,
        transceiver.remoteCapabilities
      );

      var hasRtx = commonCapabilities.codecs.filter(function (c) {
        return c.name.toLowerCase() === "rtx";
      }).length;
      if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
        delete transceiver.sendEncodingParameters[0].rtx;
      }

      sdp$1 += writeMediaSection(
        transceiver,
        commonCapabilities,
        "answer",
        transceiver.stream,
        pc._dtlsRole
      );
      if (
        transceiver.rtcpParameters &&
        transceiver.rtcpParameters.reducedSize
      ) {
        sdp$1 += "a=rtcp-rsize\r\n";
      }
    });

    var desc = new window.RTCSessionDescription({
      type: "answer",
      sdp: sdp$1,
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.addIceCandidate = function (candidate) {
    var pc = this;
    var sections;
    if (
      candidate &&
      !(candidate.sdpMLineIndex !== undefined || candidate.sdpMid)
    ) {
      return Promise.reject(new TypeError("sdpMLineIndex or sdpMid required"));
    }

    // TODO: needs to go into ops queue.
    return new Promise(function (resolve, reject) {
      if (!pc._remoteDescription) {
        return reject(
          makeError(
            "InvalidStateError",
            "Can not add ICE candidate without a remote description"
          )
        );
      } else if (!candidate || candidate.candidate === "") {
        for (var j = 0; j < pc.transceivers.length; j++) {
          if (pc.transceivers[j].rejected) {
            continue;
          }
          pc.transceivers[j].iceTransport.addRemoteCandidate({});
          sections = sdp.getMediaSections(pc._remoteDescription.sdp);
          sections[j] += "a=end-of-candidates\r\n";
          pc._remoteDescription.sdp =
            sdp.getDescription(pc._remoteDescription.sdp) + sections.join("");
          if (pc.usingBundle) {
            break;
          }
        }
      } else {
        var sdpMLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < pc.transceivers.length; i++) {
            if (pc.transceivers[i].mid === candidate.sdpMid) {
              sdpMLineIndex = i;
              break;
            }
          }
        }
        var transceiver = pc.transceivers[sdpMLineIndex];
        if (transceiver) {
          if (transceiver.rejected) {
            return resolve();
          }
          var cand =
            Object.keys(candidate.candidate).length > 0
              ? sdp.parseCandidate(candidate.candidate)
              : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === "tcp" && (cand.port === 0 || cand.port === 9)) {
            return resolve();
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component && cand.component !== 1) {
            return resolve();
          }
          // when using bundle, avoid adding candidates to the wrong
          // ice transport. And avoid adding candidates added in the SDP.
          if (
            sdpMLineIndex === 0 ||
            (sdpMLineIndex > 0 &&
              transceiver.iceTransport !== pc.transceivers[0].iceTransport)
          ) {
            if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
              return reject(
                makeError("OperationError", "Can not add ICE candidate")
              );
            }
          }

          // update the remoteDescription.
          var candidateString = candidate.candidate.trim();
          if (candidateString.indexOf("a=") === 0) {
            candidateString = candidateString.substr(2);
          }
          sections = sdp.getMediaSections(pc._remoteDescription.sdp);
          sections[sdpMLineIndex] +=
            "a=" + (cand.type ? candidateString : "end-of-candidates") + "\r\n";
          pc._remoteDescription.sdp =
            sdp.getDescription(pc._remoteDescription.sdp) + sections.join("");
        } else {
          return reject(
            makeError("OperationError", "Can not add ICE candidate")
          );
        }
      }
      resolve();
    });
  };

  RTCPeerConnection.prototype.getStats = function (selector) {
    if (selector && selector instanceof window.MediaStreamTrack) {
      var senderOrReceiver = null;
      this.transceivers.forEach(function (transceiver) {
        if (transceiver.rtpSender && transceiver.rtpSender.track === selector) {
          senderOrReceiver = transceiver.rtpSender;
        } else if (
          transceiver.rtpReceiver &&
          transceiver.rtpReceiver.track === selector
        ) {
          senderOrReceiver = transceiver.rtpReceiver;
        }
      });
      if (!senderOrReceiver) {
        throw makeError("InvalidAccessError", "Invalid selector.");
      }
      return senderOrReceiver.getStats();
    }

    var promises = [];
    this.transceivers.forEach(function (transceiver) {
      [
        "rtpSender",
        "rtpReceiver",
        "iceGatherer",
        "iceTransport",
        "dtlsTransport",
      ].forEach(function (method) {
        if (transceiver[method]) {
          promises.push(transceiver[method].getStats());
        }
      });
    });
    return Promise.all(promises).then(function (allStats) {
      var results = new Map();
      allStats.forEach(function (stats) {
        stats.forEach(function (stat) {
          results.set(stat.id, stat);
        });
      });
      return results;
    });
  };

  // fix low-level stat names and return Map instead of object.
  var ortcObjects = [
    "RTCRtpSender",
    "RTCRtpReceiver",
    "RTCIceGatherer",
    "RTCIceTransport",
    "RTCDtlsTransport",
  ];
  ortcObjects.forEach(function (ortcObjectName) {
    var obj = window[ortcObjectName];
    if (obj && obj.prototype && obj.prototype.getStats) {
      var nativeGetstats = obj.prototype.getStats;
      obj.prototype.getStats = function () {
        return nativeGetstats.apply(this).then(function (nativeStats) {
          var mapStats = new Map();
          Object.keys(nativeStats).forEach(function (id) {
            nativeStats[id].type = fixStatsType(nativeStats[id]);
            mapStats.set(id, nativeStats[id]);
          });
          return mapStats;
        });
      };
    }
  });

  // legacy callback shims. Should be moved to adapter.js some days.
  var methods = ["createOffer", "createAnswer"];
  methods.forEach(function (method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function () {
      var args = arguments;
      if (typeof args[0] === "function" || typeof args[1] === "function") {
        // legacy
        return nativeMethod.apply(this, [arguments[2]]).then(
          function (description) {
            if (typeof args[0] === "function") {
              args[0].apply(null, [description]);
            }
          },
          function (error) {
            if (typeof args[1] === "function") {
              args[1].apply(null, [error]);
            }
          }
        );
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  methods = ["setLocalDescription", "setRemoteDescription", "addIceCandidate"];
  methods.forEach(function (method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function () {
      var args = arguments;
      if (typeof args[1] === "function" || typeof args[2] === "function") {
        // legacy
        return nativeMethod.apply(this, arguments).then(
          function () {
            if (typeof args[1] === "function") {
              args[1].apply(null);
            }
          },
          function (error) {
            if (typeof args[2] === "function") {
              args[2].apply(null, [error]);
            }
          }
        );
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  // getStats is special. It doesn't have a spec legacy method yet we support
  // getStats(something, cb) without error callbacks.
  ["getStats"].forEach(function (method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function () {
      var args = arguments;
      if (typeof args[1] === "function") {
        return nativeMethod.apply(this, arguments).then(function () {
          if (typeof args[1] === "function") {
            args[1].apply(null);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  return RTCPeerConnection;
};

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetUserMedia$2(window) {
  const navigator = window && window.navigator;

  const shimError_ = function (e) {
    return {
      name: { PermissionDeniedError: "NotAllowedError" }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString() {
        return this.name;
      },
    };
  };

  // getUserMedia error shim.
  const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices
  );
  navigator.mediaDevices.getUserMedia = function (c) {
    return origGetUserMedia(c).catch((e) => Promise.reject(shimError_(e)));
  };
}

/*
 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetDisplayMedia$1(window) {
  if (!("getDisplayMedia" in window.navigator)) {
    return;
  }
  if (!window.navigator.mediaDevices) {
    return;
  }
  if (
    window.navigator.mediaDevices &&
    "getDisplayMedia" in window.navigator.mediaDevices
  ) {
    return;
  }
  window.navigator.mediaDevices.getDisplayMedia =
    window.navigator.getDisplayMedia.bind(window.navigator);
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimPeerConnection$1(window, browserDetails) {
  if (window.RTCIceGatherer) {
    if (!window.RTCIceCandidate) {
      window.RTCIceCandidate = function RTCIceCandidate(args) {
        return args;
      };
    }
    if (!window.RTCSessionDescription) {
      window.RTCSessionDescription = function RTCSessionDescription(args) {
        return args;
      };
    }
    // this adds an additional event listener to MediaStrackTrack that signals
    // when a tracks enabled property was changed. Workaround for a bug in
    // addStream, see below. No longer required in 15025+
    if (browserDetails.version < 15025) {
      const origMSTEnabled = Object.getOwnPropertyDescriptor(
        window.MediaStreamTrack.prototype,
        "enabled"
      );
      Object.defineProperty(window.MediaStreamTrack.prototype, "enabled", {
        set(value) {
          origMSTEnabled.set.call(this, value);
          const ev = new Event("enabled");
          ev.enabled = value;
          this.dispatchEvent(ev);
        },
      });
    }
  }

  // ORTC defines the DTMF sender a bit different.
  // https://github.com/w3c/ortc/issues/714
  if (window.RTCRtpSender && !("dtmf" in window.RTCRtpSender.prototype)) {
    Object.defineProperty(window.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === undefined) {
          if (this.track.kind === "audio") {
            this._dtmf = new window.RTCDtmfSender(this);
          } else if (this.track.kind === "video") {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      },
    });
  }
  // Edge currently only implements the RTCDtmfSender, not the
  // RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
  if (window.RTCDtmfSender && !window.RTCDTMFSender) {
    window.RTCDTMFSender = window.RTCDtmfSender;
  }

  const RTCPeerConnectionShim = rtcpeerconnection(
    window,
    browserDetails.version
  );
  window.RTCPeerConnection = function RTCPeerConnection(config) {
    if (config && config.iceServers) {
      config.iceServers = filterIceServers$1(
        config.iceServers,
        browserDetails.version
      );
      log$1("ICE servers after filtering:", config.iceServers);
    }
    return new RTCPeerConnectionShim(config);
  };
  window.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype;
}

function shimReplaceTrack(window) {
  // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
  if (
    window.RTCRtpSender &&
    !("replaceTrack" in window.RTCRtpSender.prototype)
  ) {
    window.RTCRtpSender.prototype.replaceTrack =
      window.RTCRtpSender.prototype.setTrack;
  }
}

var edgeShim = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  shimPeerConnection: shimPeerConnection$1,
  shimReplaceTrack: shimReplaceTrack,
  shimGetUserMedia: shimGetUserMedia$2,
  shimGetDisplayMedia: shimGetDisplayMedia$1,
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetUserMedia$1(window, browserDetails) {
  const navigator = window && window.navigator;
  const MediaStreamTrack = window && window.MediaStreamTrack;

  navigator.getUserMedia = function (constraints, onSuccess, onError) {
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    deprecated("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia");
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };

  if (
    !(
      browserDetails.version > 55 &&
      "autoGainControl" in navigator.mediaDevices.getSupportedConstraints()
    )
  ) {
    const remap = function (obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    const nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    );
    navigator.mediaDevices.getUserMedia = function (c) {
      if (typeof c === "object" && typeof c.audio === "object") {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, "autoGainControl", "mozAutoGainControl");
        remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function () {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, "mozAutoGainControl", "autoGainControl");
        remap(obj, "mozNoiseSuppression", "noiseSuppression");
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints =
        MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function (c) {
        if (this.kind === "audio" && typeof c === "object") {
          c = JSON.parse(JSON.stringify(c));
          remap(c, "autoGainControl", "mozAutoGainControl");
          remap(c, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}

/*
 *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimGetDisplayMedia(window, preferredMediaSource) {
  if (
    window.navigator.mediaDevices &&
    "getDisplayMedia" in window.navigator.mediaDevices
  ) {
    return;
  }
  if (!window.navigator.mediaDevices) {
    return;
  }
  window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(
    constraints
  ) {
    if (!(constraints && constraints.video)) {
      const err = new DOMException(
        "getDisplayMedia without video " + "constraints is undefined"
      );
      err.name = "NotFoundError";
      // from https://heycam.github.io/webidl/#idl-DOMException-error-names
      err.code = 8;
      return Promise.reject(err);
    }
    if (constraints.video === true) {
      constraints.video = { mediaSource: preferredMediaSource };
    } else {
      constraints.video.mediaSource = preferredMediaSource;
    }
    return window.navigator.mediaDevices.getUserMedia(constraints);
  };
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimOnTrack(window) {
  if (
    typeof window === "object" &&
    window.RTCTrackEvent &&
    "receiver" in window.RTCTrackEvent.prototype &&
    !("transceiver" in window.RTCTrackEvent.prototype)
  ) {
    Object.defineProperty(window.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      },
    });
  }
}

function shimPeerConnection(window, browserDetails) {
  if (
    typeof window !== "object" ||
    !(window.RTCPeerConnection || window.mozRTCPeerConnection)
  ) {
    return; // probably media.peerconnection.enabled=false in about:config
  }
  if (!window.RTCPeerConnection && window.mozRTCPeerConnection) {
    // very basic support for old versions.
    window.RTCPeerConnection = window.mozRTCPeerConnection;
  }

  if (browserDetails.version < 53) {
    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(
      function (method) {
        const nativeMethod = window.RTCPeerConnection.prototype[method];
        const methodObj = {
          [method]() {
            arguments[0] = new (
              method === "addIceCandidate"
                ? window.RTCIceCandidate
                : window.RTCSessionDescription
            )(arguments[0]);
            return nativeMethod.apply(this, arguments);
          },
        };
        window.RTCPeerConnection.prototype[method] = methodObj[method];
      }
    );
  }

  const modernStatsTypes = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate",
  };

  const nativeGetStats = window.RTCPeerConnection.prototype.getStats;
  window.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats
      .apply(this, [selector || null])
      .then((stats) => {
        if (browserDetails.version < 53 && !onSucc) {
          // Shim only promise getStats with spec-hyphens in type names
          // Leave callback version alone; misc old uses of forEach before Map
          try {
            stats.forEach((stat) => {
              stat.type = modernStatsTypes[stat.type] || stat.type;
            });
          } catch (e) {
            if (e.name !== "TypeError") {
              throw e;
            }
            // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
            stats.forEach((stat, i) => {
              stats.set(
                i,
                Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type,
                })
              );
            });
          }
        }
        return stats;
      })
      .then(onSucc, onErr);
  };
}

function shimSenderGetStats(window) {
  if (
    !(
      typeof window === "object" &&
      window.RTCPeerConnection &&
      window.RTCRtpSender
    )
  ) {
    return;
  }
  if (window.RTCRtpSender && "getStats" in window.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => (sender._pc = this));
      return senders;
    };
  }

  const origAddTrack = window.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track
      ? this._pc.getStats(this.track)
      : Promise.resolve(new Map());
  };
}

function shimReceiverGetStats(window) {
  if (
    !(
      typeof window === "object" &&
      window.RTCPeerConnection &&
      window.RTCRtpSender
    )
  ) {
    return;
  }
  if (window.RTCRtpSender && "getStats" in window.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach((receiver) => (receiver._pc = this));
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window, "track", (e) => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}

function shimRemoveStream(window) {
  if (
    !window.RTCPeerConnection ||
    "removeStream" in window.RTCPeerConnection.prototype
  ) {
    return;
  }
  window.RTCPeerConnection.prototype.removeStream = function removeStream(
    stream
  ) {
    deprecated("removeStream", "removeTrack");
    this.getSenders().forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.removeTrack(sender);
      }
    });
  };
}

function shimRTCDataChannel(window) {
  // rename DataChannel to RTCDataChannel (native fix in FF60):
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
  if (window.DataChannel && !window.RTCDataChannel) {
    window.RTCDataChannel = window.DataChannel;
  }
}

function shimAddTransceiver(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === "object" && window.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window.RTCPeerConnection.prototype.addTransceiver =
      function addTransceiver() {
        this.setParametersPromises = [];
        const initParameters = arguments[1];
        const shouldPerformCheck =
          initParameters && "sendEncodings" in initParameters;
        if (shouldPerformCheck) {
          // If sendEncodings params are provided, validate grammar
          initParameters.sendEncodings.forEach((encodingParam) => {
            if ("rid" in encodingParam) {
              const ridRegex = /^[a-z0-9]{0,16}$/i;
              if (!ridRegex.test(encodingParam.rid)) {
                throw new TypeError("Invalid RID value provided.");
              }
            }
            if ("scaleResolutionDownBy" in encodingParam) {
              if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1.0)) {
                throw new RangeError("scale_resolution_down_by must be >= 1.0");
              }
            }
            if ("maxFramerate" in encodingParam) {
              if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
                throw new RangeError("max_framerate must be >= 0.0");
              }
            }
          });
        }
        const transceiver = origAddTransceiver.apply(this, arguments);
        if (shouldPerformCheck) {
          // Check if the init options were applied. If not we do this in an
          // asynchronous way and save the promise reference in a global object.
          // This is an ugly hack, but at the same time is way more robust than
          // checking the sender parameters before and after the createOffer
          // Also note that after the createoffer we are not 100% sure that
          // the params were asynchronously applied so we might miss the
          // opportunity to recreate offer.
          const { sender } = transceiver;
          const params = sender.getParameters();
          if (
            !("encodings" in params) ||
            // Avoid being fooled by patched getParameters() below.
            (params.encodings.length === 1 &&
              Object.keys(params.encodings[0]).length === 0)
          ) {
            params.encodings = initParameters.sendEncodings;
            sender.sendEncodings = initParameters.sendEncodings;
            this.setParametersPromises.push(
              sender
                .setParameters(params)
                .then(() => {
                  delete sender.sendEncodings;
                })
                .catch(() => {
                  delete sender.sendEncodings;
                })
            );
          }
        }
        return transceiver;
      };
  }
}

function shimGetParameters(window) {
  if (!(typeof window === "object" && window.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window.RTCRtpSender.prototype.getParameters = function getParameters() {
      const params = origGetParameters.apply(this, arguments);
      if (!("encodings" in params)) {
        params.encodings = [].concat(this.sendEncodings || [{}]);
      }
      return params;
    };
  }
}

function shimCreateOffer(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === "object" && window.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
  window.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises)
        .then(() => {
          return origCreateOffer.apply(this, arguments);
        })
        .finally(() => {
          this.setParametersPromises = [];
        });
    }
    return origCreateOffer.apply(this, arguments);
  };
}

function shimCreateAnswer(window) {
  // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
  // Firefox ignores the init sendEncodings options passed to addTransceiver
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
  if (!(typeof window === "object" && window.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window.RTCPeerConnection.prototype.createAnswer;
  window.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises)
        .then(() => {
          return origCreateAnswer.apply(this, arguments);
        })
        .finally(() => {
          this.setParametersPromises = [];
        });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}

var firefoxShim = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  shimOnTrack: shimOnTrack,
  shimPeerConnection: shimPeerConnection,
  shimSenderGetStats: shimSenderGetStats,
  shimReceiverGetStats: shimReceiverGetStats,
  shimRemoveStream: shimRemoveStream,
  shimRTCDataChannel: shimRTCDataChannel,
  shimAddTransceiver: shimAddTransceiver,
  shimGetParameters: shimGetParameters,
  shimCreateOffer: shimCreateOffer,
  shimCreateAnswer: shimCreateAnswer,
  shimGetUserMedia: shimGetUserMedia$1,
  shimGetDisplayMedia: shimGetDisplayMedia,
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimLocalStreamsAPI(window) {
  if (typeof window !== "object" || !window.RTCPeerConnection) {
    return;
  }
  if (!("getLocalStreams" in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.getLocalStreams =
      function getLocalStreams() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
  }
  if (!("addStream" in window.RTCPeerConnection.prototype)) {
    const _addTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      // Try to emulate Chrome's behaviour of adding in audio-video order.
      // Safari orders by track id.
      stream
        .getAudioTracks()
        .forEach((track) => _addTrack.call(this, track, stream));
      stream
        .getVideoTracks()
        .forEach((track) => _addTrack.call(this, track, stream));
    };

    window.RTCPeerConnection.prototype.addTrack = function addTrack(
      track,
      ...streams
    ) {
      if (streams) {
        streams.forEach((stream) => {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
        });
      }
      return _addTrack.apply(this, arguments);
    };
  }
  if (!("removeStream" in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.removeStream = function removeStream(
      stream
    ) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      const index = this._localStreams.indexOf(stream);
      if (index === -1) {
        return;
      }
      this._localStreams.splice(index, 1);
      const tracks = stream.getTracks();
      this.getSenders().forEach((sender) => {
        if (tracks.includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
}

function shimRemoteStreamsAPI(window) {
  if (typeof window !== "object" || !window.RTCPeerConnection) {
    return;
  }
  if (!("getRemoteStreams" in window.RTCPeerConnection.prototype)) {
    window.RTCPeerConnection.prototype.getRemoteStreams =
      function getRemoteStreams() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
  }
  if (!("onaddstream" in window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener("addstream", this._onaddstream);
          this.removeEventListener("track", this._onaddstreampoly);
        }
        this.addEventListener("addstream", (this._onaddstream = f));
        this.addEventListener(
          "track",
          (this._onaddstreampoly = (e) => {
            e.streams.forEach((stream) => {
              if (!this._remoteStreams) {
                this._remoteStreams = [];
              }
              if (this._remoteStreams.includes(stream)) {
                return;
              }
              this._remoteStreams.push(stream);
              const event = new Event("addstream");
              event.stream = stream;
              this.dispatchEvent(event);
            });
          })
        );
      },
    });
    const origSetRemoteDescription =
      window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription =
      function setRemoteDescription() {
        const pc = this;
        if (!this._onaddstreampoly) {
          this.addEventListener(
            "track",
            (this._onaddstreampoly = function (e) {
              e.streams.forEach((stream) => {
                if (!pc._remoteStreams) {
                  pc._remoteStreams = [];
                }
                if (pc._remoteStreams.indexOf(stream) >= 0) {
                  return;
                }
                pc._remoteStreams.push(stream);
                const event = new Event("addstream");
                event.stream = stream;
                pc.dispatchEvent(event);
              });
            })
          );
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
  }
}

function shimCallbacksAPI(window) {
  if (typeof window !== "object" || !window.RTCPeerConnection) {
    return;
  }
  const prototype = window.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;

  prototype.createOffer = function createOffer(
    successCallback,
    failureCallback
  ) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateOffer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };

  prototype.createAnswer = function createAnswer(
    successCallback,
    failureCallback
  ) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateAnswer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };

  let withCallback = function (description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;

  withCallback = function (description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;

  withCallback = function (candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}

function shimGetUserMedia(window) {
  const navigator = window && window.navigator;

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // shim not needed in Safari 12.1
    const mediaDevices = navigator.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }

  if (
    !navigator.getUserMedia &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  ) {
    navigator.getUserMedia = function getUserMedia(constraints, cb, errcb) {
      navigator.mediaDevices.getUserMedia(constraints).then(cb, errcb);
    }.bind(navigator);
  }
}

function shimConstraints(constraints) {
  if (constraints && constraints.video !== undefined) {
    return Object.assign({}, constraints, {
      video: compactObject(constraints.video),
    });
  }

  return constraints;
}

function shimRTCIceServerUrls(window) {
  if (!window.RTCPeerConnection) {
    return;
  }
  // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
  const OrigPeerConnection = window.RTCPeerConnection;
  window.RTCPeerConnection = function RTCPeerConnection(
    pcConfig,
    pcConstraints
  ) {
    if (pcConfig && pcConfig.iceServers) {
      const newIceServers = [];
      for (let i = 0; i < pcConfig.iceServers.length; i++) {
        let server = pcConfig.iceServers[i];
        if (!server.hasOwnProperty("urls") && server.hasOwnProperty("url")) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
          server = JSON.parse(JSON.stringify(server));
          server.urls = server.url;
          delete server.url;
          newIceServers.push(server);
        } else {
          newIceServers.push(pcConfig.iceServers[i]);
        }
      }
      pcConfig.iceServers = newIceServers;
    }
    return new OrigPeerConnection(pcConfig, pcConstraints);
  };
  window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  // wrap static methods. Currently just generateCertificate.
  if ("generateCertificate" in OrigPeerConnection) {
    Object.defineProperty(window.RTCPeerConnection, "generateCertificate", {
      get() {
        return OrigPeerConnection.generateCertificate;
      },
    });
  }
}

function shimTrackEventTransceiver(window) {
  // Add event.transceiver member over deprecated event.receiver
  if (
    typeof window === "object" &&
    window.RTCTrackEvent &&
    "receiver" in window.RTCTrackEvent.prototype &&
    !("transceiver" in window.RTCTrackEvent.prototype)
  ) {
    Object.defineProperty(window.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      },
    });
  }
}

function shimCreateOfferLegacy(window) {
  const origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
  window.RTCPeerConnection.prototype.createOffer = function createOffer(
    offerOptions
  ) {
    if (offerOptions) {
      if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
        // support bit values
        offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
      }
      const audioTransceiver = this.getTransceivers().find(
        (transceiver) => transceiver.receiver.track.kind === "audio"
      );
      if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
        if (audioTransceiver.direction === "sendrecv") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("sendonly");
          } else {
            audioTransceiver.direction = "sendonly";
          }
        } else if (audioTransceiver.direction === "recvonly") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
        }
      } else if (
        offerOptions.offerToReceiveAudio === true &&
        !audioTransceiver
      ) {
        this.addTransceiver("audio");
      }

      if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
        // support bit values
        offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
      }
      const videoTransceiver = this.getTransceivers().find(
        (transceiver) => transceiver.receiver.track.kind === "video"
      );
      if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
        if (videoTransceiver.direction === "sendrecv") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("sendonly");
          } else {
            videoTransceiver.direction = "sendonly";
          }
        } else if (videoTransceiver.direction === "recvonly") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
        }
      } else if (
        offerOptions.offerToReceiveVideo === true &&
        !videoTransceiver
      ) {
        this.addTransceiver("video");
      }
    }
    return origCreateOffer.apply(this, arguments);
  };
}

function shimAudioContext(window) {
  if (typeof window !== "object" || window.AudioContext) {
    return;
  }
  window.AudioContext = window.webkitAudioContext;
}

var safariShim = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  shimLocalStreamsAPI: shimLocalStreamsAPI,
  shimRemoteStreamsAPI: shimRemoteStreamsAPI,
  shimCallbacksAPI: shimCallbacksAPI,
  shimGetUserMedia: shimGetUserMedia,
  shimConstraints: shimConstraints,
  shimRTCIceServerUrls: shimRTCIceServerUrls,
  shimTrackEventTransceiver: shimTrackEventTransceiver,
  shimCreateOfferLegacy: shimCreateOfferLegacy,
  shimAudioContext: shimAudioContext,
});

/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

function shimRTCIceCandidate(window) {
  // foundation is arbitrarily chosen as an indicator for full support for
  // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
  if (
    !window.RTCIceCandidate ||
    (window.RTCIceCandidate && "foundation" in window.RTCIceCandidate.prototype)
  ) {
    return;
  }

  const NativeRTCIceCandidate = window.RTCIceCandidate;
  window.RTCIceCandidate = function RTCIceCandidate(args) {
    // Remove the a= which shouldn't be part of the candidate string.
    if (
      typeof args === "object" &&
      args.candidate &&
      args.candidate.indexOf("a=") === 0
    ) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substr(2);
    }

    if (args.candidate && args.candidate.length) {
      // Augment the native candidate with the parsed fields.
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = sdp.parseCandidate(args.candidate);
      const augmentedCandidate = Object.assign(
        nativeCandidate,
        parsedCandidate
      );

      // Add a serializer that does not serialize the extra attributes.
      augmentedCandidate.toJSON = function toJSON() {
        return {
          candidate: augmentedCandidate.candidate,
          sdpMid: augmentedCandidate.sdpMid,
          sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
          usernameFragment: augmentedCandidate.usernameFragment,
        };
      };
      return augmentedCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

  // Hook up the augmented candidate in onicecandidate and
  // addEventListener('icecandidate', ...)
  wrapPeerConnectionEvent(window, "icecandidate", (e) => {
    if (e.candidate) {
      Object.defineProperty(e, "candidate", {
        value: new window.RTCIceCandidate(e.candidate),
        writable: "false",
      });
    }
    return e;
  });
}

function shimMaxMessageSize(window, browserDetails) {
  if (!window.RTCPeerConnection) {
    return;
  }

  if (!("sctp" in window.RTCPeerConnection.prototype)) {
    Object.defineProperty(window.RTCPeerConnection.prototype, "sctp", {
      get() {
        return typeof this._sctp === "undefined" ? null : this._sctp;
      },
    });
  }

  const sctpInDescription = function (description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = sdp.splitSections(description.sdp);
    sections.shift();
    return sections.some((mediaSection) => {
      const mLine = sdp.parseMLine(mediaSection);
      return (
        mLine &&
        mLine.kind === "application" &&
        mLine.protocol.indexOf("SCTP") !== -1
      );
    });
  };

  const getRemoteFirefoxVersion = function (description) {
    // TODO: Is there a better solution for detecting Firefox?
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    // Test for NaN (yes, this is ugly)
    return version !== version ? -1 : version;
  };

  const getCanSendMaxMessageSize = function (remoteIsFirefox) {
    // Every implementation we know can send at least 64 KiB.
    // Note: Although Chrome is technically able to send up to 256 KiB, the
    //       data does not reach the other peer reliably.
    //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === "firefox") {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          // FF < 57 will send in 16 KiB chunks using the deprecated PPID
          // fragmentation.
          canSendMaxMessageSize = 16384;
        } else {
          // However, other FF (and RAWRTC) can reassemble PPID-fragmented
          // messages. Thus, supporting ~2 GiB when sending.
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        // Currently, all FF >= 57 will reset the remote maximum message size
        // to the default value when a data channel is created at a later
        // stage. :(
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
        canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
      } else {
        // FF >= 60 supports sending ~2 GiB
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };

  const getMaxMessageSize = function (description, remoteIsFirefox) {
    // Note: 65536 bytes is the default value from the SDP spec. Also,
    //       every implementation we know supports receiving 65536 bytes.
    let maxMessageSize = 65536;

    // FF 57 has a slightly incorrect default remote max message size, so
    // we need to adjust it here to avoid a failure when sending.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
    if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }

    const match = sdp.matchPrefix(description.sdp, "a=max-message-size:");
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substr(19), 10);
    } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
      // If the maximum message size is not present in the remote SDP and
      // both local and remote are Firefox, the remote peer can receive
      // ~2 GiB.
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };

  const origSetRemoteDescription =
    window.RTCPeerConnection.prototype.setRemoteDescription;
  window.RTCPeerConnection.prototype.setRemoteDescription =
    function setRemoteDescription() {
      this._sctp = null;
      // Chrome decided to not expose .sctp in plan-b mode.
      // As usual, adapter.js has to do an 'ugly worakaround'
      // to cover up the mess.
      if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
        const { sdpSemantics } = this.getConfiguration();
        if (sdpSemantics === "plan-b") {
          Object.defineProperty(this, "sctp", {
            get() {
              return typeof this._sctp === "undefined" ? null : this._sctp;
            },
            enumerable: true,
            configurable: true,
          });
        }
      }

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        const isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        const canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        let maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        const sctp = {};
        Object.defineProperty(sctp, "maxMessageSize", {
          get() {
            return maxMessageSize;
          },
        });
        this._sctp = sctp;
      }

      return origSetRemoteDescription.apply(this, arguments);
    };
}

function shimSendThrowTypeError(window) {
  if (
    !(
      window.RTCPeerConnection &&
      "createDataChannel" in window.RTCPeerConnection.prototype
    )
  ) {
    return;
  }

  // Note: Although Firefox >= 57 has a native implementation, the maximum
  //       message size can be reset for all data channels at a later stage.
  //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (
        dc.readyState === "open" &&
        pc.sctp &&
        length > pc.sctp.maxMessageSize
      ) {
        throw new TypeError(
          "Message too large (can send a maximum of " +
            pc.sctp.maxMessageSize +
            " bytes)"
        );
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel =
    window.RTCPeerConnection.prototype.createDataChannel;
  window.RTCPeerConnection.prototype.createDataChannel =
    function createDataChannel() {
      const dataChannel = origCreateDataChannel.apply(this, arguments);
      wrapDcSend(dataChannel, this);
      return dataChannel;
    };
  wrapPeerConnectionEvent(window, "datachannel", (e) => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}

/* shims RTCConnectionState by pretending it is the same as iceConnectionState.
 * See https://bugs.chromium.org/p/webrtc/issues/detail?id=6145#c12
 * for why this is a valid hack in Chrome. In Firefox it is slightly incorrect
 * since DTLS failures would be hidden. See
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1265827
 * for the Firefox tracking bug.
 */
function shimConnectionState(window) {
  if (
    !window.RTCPeerConnection ||
    "connectionState" in window.RTCPeerConnection.prototype
  ) {
    return;
  }
  const proto = window.RTCPeerConnection.prototype;
  Object.defineProperty(proto, "connectionState", {
    get() {
      return (
        {
          completed: "connected",
          checking: "connecting",
        }[this.iceConnectionState] || this.iceConnectionState
      );
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(proto, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener(
          "connectionstatechange",
          this._onconnectionstatechange
        );
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener(
          "connectionstatechange",
          (this._onconnectionstatechange = cb)
        );
      }
    },
    enumerable: true,
    configurable: true,
  });

  ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function () {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = (e) => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event("connectionstatechange", e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener(
          "iceconnectionstatechange",
          this._connectionstatechangepoly
        );
      }
      return origMethod.apply(this, arguments);
    };
  });
}

function removeExtmapAllowMixed(window, browserDetails) {
  /* remove a=extmap-allow-mixed for webrtc.org < M71 */
  if (!window.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === "safari" && browserDetails.version >= 605) {
    return;
  }
  const nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;
  window.RTCPeerConnection.prototype.setRemoteDescription =
    function setRemoteDescription(desc) {
      if (
        desc &&
        desc.sdp &&
        desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1
      ) {
        const sdp = desc.sdp
          .split("\n")
          .filter((line) => {
            return line.trim() !== "a=extmap-allow-mixed";
          })
          .join("\n");
        // Safari enforces read-only-ness of RTCSessionDescription fields.
        if (
          window.RTCSessionDescription &&
          desc instanceof window.RTCSessionDescription
        ) {
          arguments[0] = new window.RTCSessionDescription({
            type: desc.type,
            sdp,
          });
        } else {
          desc.sdp = sdp;
        }
      }
      return nativeSRD.apply(this, arguments);
    };
}

function shimAddIceCandidateNullOrEmpty(window, browserDetails) {
  // Support for addIceCandidate(null or undefined)
  // as well as addIceCandidate({candidate: "", ...})
  // https://bugs.chromium.org/p/chromium/issues/detail?id=978582
  // Note: must be called before other polyfills which change the signature.
  if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate =
    window.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window.RTCPeerConnection.prototype.addIceCandidate =
    function addIceCandidate() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      // Firefox 68+ emits and processes {candidate: "", ...}, ignore
      // in older versions.
      // Native support for ignoring exists for Chrome M77+.
      // Safari ignores as well, exact version unknown but works in the same
      // version that also ignores addIceCandidate(null).
      if (
        ((browserDetails.browser === "chrome" && browserDetails.version < 78) ||
          (browserDetails.browser === "firefox" &&
            browserDetails.version < 68) ||
          browserDetails.browser === "safari") &&
        arguments[0] &&
        arguments[0].candidate === ""
      ) {
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
}

var commonShim = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  shimRTCIceCandidate: shimRTCIceCandidate,
  shimMaxMessageSize: shimMaxMessageSize,
  shimSendThrowTypeError: shimSendThrowTypeError,
  shimConnectionState: shimConnectionState,
  removeExtmapAllowMixed: removeExtmapAllowMixed,
  shimAddIceCandidateNullOrEmpty: shimAddIceCandidateNullOrEmpty,
});

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

// Shimming starts here.
function adapterFactory(
  { window } = {},
  options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true,
  }
) {
  // Utils.
  const logging = log$1;
  const browserDetails = detectBrowser(window);

  const adapter = {
    browserDetails,
    commonShim,
    extractVersion: extractVersion,
    disableLog: disableLog,
    disableWarnings: disableWarnings,
  };

  // Shim browser if found.
  switch (browserDetails.browser) {
    case "chrome":
      if (!chromeShim || !shimPeerConnection$2 || !options.shimChrome) {
        logging("Chrome shim is not included in this adapter release.");
        return adapter;
      }
      if (browserDetails.version === null) {
        logging("Chrome shim can not determine version, not shimming.");
        return adapter;
      }
      logging("adapter.js shimming chrome.");
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;

      // Must be called before shimPeerConnection.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);

      shimGetUserMedia$3(window, browserDetails);
      shimMediaStream(window);
      shimPeerConnection$2(window, browserDetails);
      shimOnTrack$1(window);
      shimAddTrackRemoveTrack(window, browserDetails);
      shimGetSendersWithDtmf(window);
      shimGetStats(window);
      shimSenderReceiverGetStats(window);
      fixNegotiationNeeded(window, browserDetails);

      shimRTCIceCandidate(window);
      shimConnectionState(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      removeExtmapAllowMixed(window, browserDetails);
      break;
    case "firefox":
      if (!firefoxShim || !shimPeerConnection || !options.shimFirefox) {
        logging("Firefox shim is not included in this adapter release.");
        return adapter;
      }
      logging("adapter.js shimming firefox.");
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;

      // Must be called before shimPeerConnection.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);

      shimGetUserMedia$1(window, browserDetails);
      shimPeerConnection(window, browserDetails);
      shimOnTrack(window);
      shimRemoveStream(window);
      shimSenderGetStats(window);
      shimReceiverGetStats(window);
      shimRTCDataChannel(window);
      shimAddTransceiver(window);
      shimGetParameters(window);
      shimCreateOffer(window);
      shimCreateAnswer(window);

      shimRTCIceCandidate(window);
      shimConnectionState(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      break;
    case "edge":
      if (!edgeShim || !shimPeerConnection$1 || !options.shimEdge) {
        logging("MS edge shim is not included in this adapter release.");
        return adapter;
      }
      logging("adapter.js shimming edge.");
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;

      shimGetUserMedia$2(window);
      shimGetDisplayMedia$1(window);
      shimPeerConnection$1(window, browserDetails);
      shimReplaceTrack(window);

      // the edge shim implements the full RTCIceCandidate object.

      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      break;
    case "safari":
      if (!safariShim || !options.shimSafari) {
        logging("Safari shim is not included in this adapter release.");
        return adapter;
      }
      logging("adapter.js shimming safari.");
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;

      // Must be called before shimCallbackAPI.
      shimAddIceCandidateNullOrEmpty(window, browserDetails);

      shimRTCIceServerUrls(window);
      shimCreateOfferLegacy(window);
      shimCallbacksAPI(window);
      shimLocalStreamsAPI(window);
      shimRemoteStreamsAPI(window);
      shimTrackEventTransceiver(window);
      shimGetUserMedia(window);
      shimAudioContext(window);

      shimRTCIceCandidate(window);
      shimMaxMessageSize(window, browserDetails);
      shimSendThrowTypeError(window);
      removeExtmapAllowMixed(window, browserDetails);
      break;
    default:
      logging("Unsupported browser!");
      break;
  }

  return adapter;
}

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

adapterFactory({ window: typeof window === "undefined" ? undefined : window });

/**
 * @class AudioTrackConstraints
 * @classDesc Constraints for creating an audio MediaStreamTrack.
 * @memberof Owt.Base
 * @constructor
 * @param {Owt.Base.AudioSourceInfo} source Source info of this audio track.
 */

class AudioTrackConstraints {
  // eslint-disable-next-line require-jsdoc
  constructor(source) {
    if (!Object.values(AudioSourceInfo).some((v) => v === source)) {
      throw new TypeError("Invalid source.");
    }
    /**
     * @member {string} source
     * @memberof Owt.Base.AudioTrackConstraints
     * @desc Values could be "mic", "screen-cast", "file" or "mixed".
     * @instance
     */

    this.source = source;
    /**
     * @member {string} deviceId
     * @memberof Owt.Base.AudioTrackConstraints
     * @desc Do not provide deviceId if source is not "mic".
     * @instance
     * @see https://w3c.github.io/mediacapture-main/#def-constraint-deviceId
     */

    this.deviceId = undefined;
  }
}
/**
 * @class VideoTrackConstraints
 * @classDesc Constraints for creating a video MediaStreamTrack.
 * @memberof Owt.Base
 * @constructor
 * @param {Owt.Base.VideoSourceInfo} source Source info of this video track.
 */

class VideoTrackConstraints {
  // eslint-disable-next-line require-jsdoc
  constructor(source) {
    if (!Object.values(VideoSourceInfo).some((v) => v === source)) {
      throw new TypeError("Invalid source.");
    }
    /**
     * @member {string} source
     * @memberof Owt.Base.VideoTrackConstraints
     * @desc Values could be "camera", "screen-cast", "file" or "mixed".
     * @instance
     */

    this.source = source;
    /**
     * @member {string} deviceId
     * @memberof Owt.Base.VideoTrackConstraints
     * @desc Do not provide deviceId if source is not "camera".
     * @instance
     * @see https://w3c.github.io/mediacapture-main/#def-constraint-deviceId
     */

    this.deviceId = undefined;
    /**
     * @member {Owt.Base.Resolution} resolution
     * @memberof Owt.Base.VideoTrackConstraints
     * @instance
     */

    this.resolution = undefined;
    /**
     * @member {number} frameRate
     * @memberof Owt.Base.VideoTrackConstraints
     * @instance
     */

    this.frameRate = undefined;
  }
}
/**
 * @class StreamConstraints
 * @classDesc Constraints for creating a MediaStream from screen mic and camera.
 * @memberof Owt.Base
 * @constructor
 * @param {?Owt.Base.AudioTrackConstraints} audioConstraints
 * @param {?Owt.Base.VideoTrackConstraints} videoConstraints
 */

class StreamConstraints {
  // eslint-disable-next-line require-jsdoc
  constructor(audioConstraints = false, videoConstraints = false) {
    /**
     * @member {Owt.Base.MediaStreamTrackDeviceConstraintsForAudio} audio
     * @memberof Owt.Base.MediaStreamDeviceConstraints
     * @instance
     */
    this.audio = audioConstraints;
    /**
     * @member {Owt.Base.MediaStreamTrackDeviceConstraintsForVideo} Video
     * @memberof Owt.Base.MediaStreamDeviceConstraints
     * @instance
     */

    this.video = videoConstraints;
  }
} // eslint-disable-next-line require-jsdoc

function isVideoConstrainsForScreenCast(constraints) {
  return (
    typeof constraints.video === "object" &&
    constraints.video.source === VideoSourceInfo.SCREENCAST
  );
}
/**
 * @class MediaStreamFactory
 * @classDesc A factory to create MediaStream. You can also create MediaStream by yourself.
 * @memberof Owt.Base
 */

class MediaStreamFactory {
  /**
   * @function createMediaStream
   * @static
   * @desc Create a MediaStream with given constraints. If you want to create a MediaStream for screen cast, please make sure both audio and video's source are "screen-cast".
   * @memberof Owt.Base.MediaStreamFactory
   * @return {Promise<MediaStream, Error>} Return a promise that is resolved when stream is successfully created, or rejected if one of the following error happened:
   * - One or more parameters cannot be satisfied.
   * - Specified device is busy.
   * - Cannot obtain necessary permission or operation is canceled by user.
   * - Video source is screen cast, while audio source is not.
   * - Audio source is screen cast, while video source is disabled.
   * @param {Owt.Base.StreamConstraints} constraints
   */
  static createMediaStream(constraints) {
    if (
      typeof constraints !== "object" ||
      (!constraints.audio && !constraints.video)
    ) {
      return Promise.reject(new TypeError("Invalid constrains"));
    }

    if (
      !isVideoConstrainsForScreenCast(constraints) &&
      typeof constraints.audio === "object" &&
      constraints.audio.source === AudioSourceInfo.SCREENCAST
    ) {
      return Promise.reject(
        new TypeError("Cannot share screen without video.")
      );
    }

    if (
      isVideoConstrainsForScreenCast(constraints) &&
      !isChrome() &&
      !isFirefox()
    ) {
      return Promise.reject(
        new TypeError("Screen sharing only supports Chrome and Firefox.")
      );
    }

    if (
      isVideoConstrainsForScreenCast(constraints) &&
      typeof constraints.audio === "object" &&
      constraints.audio.source !== AudioSourceInfo.SCREENCAST
    ) {
      return Promise.reject(
        new TypeError(
          "Cannot capture video from screen cast while capture audio from" +
            " other source."
        )
      );
    } // Check and convert constraints.

    if (!constraints.audio && !constraints.video) {
      return Promise.reject(
        new TypeError("At least one of audio and video must be requested.")
      );
    }

    const mediaConstraints = Object.create({});

    if (
      typeof constraints.audio === "object" &&
      constraints.audio.source === AudioSourceInfo.MIC
    ) {
      mediaConstraints.audio = Object.create({});

      if (isEdge()) {
        mediaConstraints.audio.deviceId = constraints.audio.deviceId;
      } else {
        mediaConstraints.audio.deviceId = {
          exact: constraints.audio.deviceId,
        };
      }
    } else {
      if (constraints.audio.source === AudioSourceInfo.SCREENCAST) {
        mediaConstraints.audio = true;
      } else {
        mediaConstraints.audio = constraints.audio;
      }
    }

    if (typeof constraints.video === "object") {
      mediaConstraints.video = Object.create({});

      if (typeof constraints.video.frameRate === "number") {
        mediaConstraints.video.frameRate = constraints.video.frameRate;
      }

      if (
        constraints.video.resolution &&
        constraints.video.resolution.width &&
        constraints.video.resolution.height
      ) {
        if (constraints.video.source === VideoSourceInfo.SCREENCAST) {
          mediaConstraints.video.width = constraints.video.resolution.width;
          mediaConstraints.video.height = constraints.video.resolution.height;
        } else {
          mediaConstraints.video.width = Object.create({});
          mediaConstraints.video.width.exact =
            constraints.video.resolution.width;
          mediaConstraints.video.height = Object.create({});
          mediaConstraints.video.height.exact =
            constraints.video.resolution.height;
        }
      }

      if (typeof constraints.video.deviceId === "string") {
        mediaConstraints.video.deviceId = {
          exact: constraints.video.deviceId,
        };
      }

      if (
        isFirefox() &&
        constraints.video.source === VideoSourceInfo.SCREENCAST
      ) {
        mediaConstraints.video.mediaSource = "screen";
      }
    } else {
      mediaConstraints.video = constraints.video;
    }

    if (isVideoConstrainsForScreenCast(constraints)) {
      return navigator.mediaDevices.getDisplayMedia(mediaConstraints);
    } else {
      return navigator.mediaDevices.getUserMedia(mediaConstraints);
    }
  }
}

let logger;
let errorLogger;
function setLogger() {
  /*eslint-disable */
  logger = console.log;
  errorLogger = console.error;
  /*eslint-enable */
}
function log(message, ...optionalParams) {
  if (logger) {
    logger(message, ...optionalParams);
  }
}
function error(message, ...optionalParams) {
  if (errorLogger) {
    errorLogger(message, ...optionalParams);
  }
}

class Event$1 {
  constructor(type) {
    this.listener = {};
    this.type = type | "";
  }

  on(event, fn) {
    if (!this.listener[event]) {
      this.listener[event] = [];
    }

    this.listener[event].push(fn);
    return true;
  }

  off(event, fn) {
    if (this.listener[event]) {
      var index = this.listener[event].indexOf(fn);

      if (index > -1) {
        this.listener[event].splice(index, 1);
      }

      return true;
    }

    return false;
  }

  offAll() {
    this.listener = {};
  }

  dispatch(event, data) {
    if (this.listener[event]) {
      this.listener[event].map((each) => {
        each.apply(null, [data]);
      });
      return true;
    }

    return false;
  }
}

class RTCEndpoint extends Event$1 {
  constructor(options) {
    super("RTCPusherPlayer");
    this.TAG = "[RTCPusherPlayer]";
    let defaults = {
      element: "",
      // html video element
      debug: false,
      // if output debug log
      zlmsdpUrl: "",
      simulcast: false,
      useCamera: true,
      audioEnable: true,
      videoEnable: true,
      recvOnly: false,
      resolution: {
        w: 0,
        h: 0,
      },
    };
    this.options = Object.assign({}, defaults, options);

    if (this.options.debug) {
      setLogger();
    }

    this.e = {
      onicecandidate: this._onIceCandidate.bind(this),
      ontrack: this._onTrack.bind(this),
      onicecandidateerror: this._onIceCandidateError.bind(this),
      onconnectionstatechange: this._onconnectionstatechange.bind(this),
    };
    this._remoteStream = null;
    this._localStream = null;
    this.pc = new RTCPeerConnection(null);
    this.pc.onicecandidate = this.e.onicecandidate;
    this.pc.onicecandidateerror = this.e.onicecandidateerror;
    this.pc.ontrack = this.e.ontrack;
    this.pc.onconnectionstatechange = this.e.onconnectionstatechange;
    if (
      !this.options.recvOnly &&
      (this.options.audioEnable || this.options.videoEnable)
    )
      this.start();
    else this.receive();
  }

  receive() {
    const AudioTransceiverInit = {
      direction: "recvonly",
      sendEncodings: [],
    };
    const VideoTransceiverInit = {
      direction: "recvonly",
      sendEncodings: [],
    };
    this.pc.addTransceiver("audio", AudioTransceiverInit);
    this.pc.addTransceiver("video", VideoTransceiverInit);
    this.pc
      .createOffer()
      .then((desc) => {
        log(this.TAG, "offer:", desc.sdp);
        this.pc.setLocalDescription(desc).then(() => {
          axios({
            method: "post",
            url: this.options.zlmsdpUrl,
            responseType: "json",
            data: desc.sdp,
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
          }).then((response) => {
            let ret = response.data; //JSON.parse(response.data);

            if (ret.code != 0) {
              // mean failed for offer/anwser exchange
              this.dispatch(Events$1.WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED, ret);
              return;
            }

            let anwser = {};
            anwser.sdp = ret.sdp;
            anwser.type = "answer";
            log(this.TAG, "answer:", ret.sdp);
            this.pc
              .setRemoteDescription(anwser)
              .then(() => {
                log(this.TAG, "set remote sucess");
              })
              .catch((e) => {
                error(this.TAG, e);
              });
          });
        });
      })
      .catch((e) => {
        error(this.TAG, e);
      });
  }

  start() {
    let videoConstraints = false;
    let audioConstraints = false;

    if (this.options.useCamera) {
      if (this.options.videoEnable)
        videoConstraints = new VideoTrackConstraints(VideoSourceInfo.CAMERA);
      if (this.options.audioEnable)
        audioConstraints = new AudioTrackConstraints(AudioSourceInfo.MIC);
    } else {
      if (this.options.videoEnable) {
        videoConstraints = new VideoTrackConstraints(
          VideoSourceInfo.SCREENCAST
        );
        if (this.options.audioEnable)
          audioConstraints = new AudioTrackConstraints(
            AudioSourceInfo.SCREENCAST
          );
      } else {
        if (this.options.audioEnable)
          audioConstraints = new AudioTrackConstraints(AudioSourceInfo.MIC);
        else {
          // error shared display media not only audio
          error(this.TAG, "error paramter");
        }
      }
    }

    if (
      this.options.resolution.w != 0 &&
      this.options.resolution.h != 0 &&
      typeof videoConstraints == "object"
    ) {
      videoConstraints.resolution = new Resolution(
        this.options.resolution.w,
        this.options.resolution.h
      );
    }

    MediaStreamFactory.createMediaStream(
      new StreamConstraints(audioConstraints, videoConstraints)
    )
      .then((stream) => {
        this._localStream = stream;
        this.dispatch(Events$1.WEBRTC_ON_LOCAL_STREAM, stream);
        const AudioTransceiverInit = {
          direction: "sendrecv",
          sendEncodings: [],
        };
        const VideoTransceiverInit = {
          direction: "sendrecv",
          sendEncodings: [],
        };

        if (this.options.simulcast && stream.getVideoTracks().length > 0) {
          VideoTransceiverInit.sendEncodings = [
            {
              rid: "h",
              active: true,
              maxBitrate: 1000000,
            },
            {
              rid: "m",
              active: true,
              maxBitrate: 500000,
              scaleResolutionDownBy: 2,
            },
            {
              rid: "l",
              active: true,
              maxBitrate: 200000,
              scaleResolutionDownBy: 4,
            },
          ];
        }

        if (stream.getAudioTracks().length > 0) {
          this.pc.addTransceiver(
            stream.getAudioTracks()[0],
            AudioTransceiverInit
          );
        } else {
          AudioTransceiverInit.direction = "recvonly";
          this.pc.addTransceiver("audio", AudioTransceiverInit);
        }

        if (stream.getVideoTracks().length > 0) {
          this.pc.addTransceiver(
            stream.getVideoTracks()[0],
            VideoTransceiverInit
          );
        } else {
          VideoTransceiverInit.direction = "recvonly";
          this.pc.addTransceiver("video", VideoTransceiverInit);
        }
        /*
      stream.getTracks().forEach((track,idx)=>{
          debug.log(this.TAG,track);
          this.pc.addTrack(track);
      });
      */

        this.pc
          .createOffer()
          .then((desc) => {
            log(this.TAG, "offer:", desc.sdp);
            this.pc.setLocalDescription(desc).then(() => {
              axios({
                method: "post",
                url: this.options.zlmsdpUrl,
                responseType: "json",
                data: desc.sdp,
                headers: {
                  "Content-Type": "text/plain;charset=utf-8",
                },
              }).then((response) => {
                let ret = response.data; //JSON.parse(response.data);

                if (ret.code != 0) {
                  // mean failed for offer/anwser exchange
                  this.dispatch(
                    Events$1.WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED,
                    ret
                  );
                  return;
                }

                let anwser = {};
                anwser.sdp = ret.sdp;
                anwser.type = "answer";
                log(this.TAG, "answer:", ret.sdp);
                this.pc
                  .setRemoteDescription(anwser)
                  .then(() => {
                    log(this.TAG, "set remote sucess");
                  })
                  .catch((e) => {
                    error(this.TAG, e);
                  });
              });
            });
          })
          .catch((e) => {
            error(this.TAG, e);
          });
      })
      .catch((e) => {
        this.dispatch(Events$1.CAPTURE_STREAM_FAILED); //debug.error(this.TAG,e);
      }); //const offerOptions = {};

    /*
    if (typeof this.pc.addTransceiver === 'function') {
        // |direction| seems not working on Safari.
        this.pc.addTransceiver('audio', { direction: 'recvonly' });
        this.pc.addTransceiver('video', { direction: 'recvonly' });
    } else {
        offerOptions.offerToReceiveAudio = true;
        offerOptions.offerToReceiveVideo = true;
    }
    */
  }

  _onIceCandidate(event) {
    if (event.candidate) {
      log("Remote ICE candidate: \n " + event.candidate.candidate); // Send the candidate to the remote peer
    }
  }

  _onTrack(event) {
    if (this.options.element && event.streams && event.streams.length > 0) {
      this.options.element.srcObject = event.streams[0];
      this._remoteStream = event.streams[0];
      this.dispatch(Events$1.WEBRTC_ON_REMOTE_STREAMS, event);
    } else {
      error("element pararm is failed");
    }
  }

  _onIceCandidateError(event) {
    this.dispatch(Events$1.WEBRTC_ICE_CANDIDATE_ERROR, event);
  }

  _onconnectionstatechange(event) {
    this.dispatch(
      Events$1.WEBRTC_ON_CONNECTION_STATE_CHANGE,
      this.pc.connectionState
    );
  }

  close() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    if (this.options) {
      this.options = null;
    }

    if (this._localStream) {
      this._localStream.getTracks().forEach((track, idx) => {
        track.stop();
      });
    }

    if (this._remoteStream) {
      this._remoteStream.getTracks().forEach((track, idx) => {
        track.stop();
      });
    }
  }

  get remoteStream() {
    return this._remoteStream;
  }

  get localStream() {
    return this._localStream;
  }
}
const Events = Events$1;
const Endpoint = RTCEndpoint;

const appName = "live";
const playOneWebRtcMt = async (uuid, domId, dom, token) => {
    let play;
    const res = await axios.get(`/api/vms/v1/camera/getByUuid?uuid=${uuid}`, {
        headers: {
            token: token || sessionStorage.getItem("token") || "",
        },
    });
    if (res.status === 200) {
        const camera = res.data.data;
        const { channel, streamType } = camera;
        let url = camera.webrtcTemplateMerged;
        url = url.replaceAll("${channel}", channel);
        url = url.replaceAll("${streamType}", streamType);
        play = new WebRtcMt({
            plays: {
                videoElm: domId,
                videoDom: dom,
                mediaServerAddr: camera.mediaServerPo.url,
                cameraUserName: camera.user,
                cameraPwd: camera.pass,
                cameraIp: camera.ip,
                cameraRtspPort: camera.rtspPort,
                cameraChannel: camera.channel,
                cameraStream: camera.streamType,
                addRtspProxyUrl: url,
            },
        });
    }
    return play;
};
class WebRtcMt {
    constructor(opt) {
        this.init(opt);
    }
    dom;
    p_player; // 返回播放视频数据
    instance = axios.create({
        timeout: 60000,
    });
    playerMap = new Map();
    streamMap = new Map();
    mediaServerAddrMap = new Map();
    config = {
        w: 100,
        h: 100,
        endpointConfig: {},
    };
    // 根据参数配置组装相关url
    createRtspUrl(plays) {
        const { cameraIp, cameraRtspPort, cameraChannel, cameraStream, mediaServerAddr, addRtspProxyUrl, } = plays;
        const stream = `v${cameraIp}-${cameraRtspPort}-${cameraChannel}-${cameraStream}`;
        const sdpUrl = `${mediaServerAddr}/index/api/webrtc?app=${appName}&stream=${stream}&type=play`;
        return { stream, addRtspProxyUrl, sdpUrl };
    }
    // 初始化
    init(opt) {
        // 初始化视频播放器配置
        if (opt.endpointConfig) {
            this.config.endpointConfig = opt.endpointConfig;
        }
        // 初始化视频播放器宽高分辨率
        if (opt.h)
            this.config.h = opt.h;
        if (opt.w)
            this.config.w = opt.w;
        // 判断是否是多个视频同时播放
        if (Object.prototype.toString.call(opt.plays) === "[object Object]") {
            // 单个视频播放
            this.p_player = this.createVideo(opt.plays);
        }
        else {
            // 多个视频播放
            for (const i of opt.plays) {
                this.createVideo(i);
            }
        }
    }
    // 拉流创建播放器
    createVideo(plays) {
        this.mediaServerAddrMap.set(plays.videoElm, plays);
        const { addRtspProxyUrl } = this.createRtspUrl(plays);
        return new Promise((resolve, reject) => {
            this.instance.get(addRtspProxyUrl).then((res) => {
                if (res.data.code === 0) {
                    // 拉流成功
                    this.startPlay(plays);
                    resolve(res.data);
                }
                else {
                    // 拉流失败删除缓存信息
                    this.mediaServerAddrMap.delete(plays.videoElm);
                    reject();
                    this.log("err", "从服务端拉流失败，请重试");
                }
            });
        });
    }
    log(type, text) {
        switch (type) {
            case "err":
                throw new Error(text);
            case "warn":
                console.warn(text);
                break;
            default:
                console.info(text);
        }
    }
    // 停止播放0
    stopPlay(id) {
        if (id) {
            // 关闭指定video
            let player = this.playerMap.get(id);
            if (player) {
                player.close();
                this.playerMap.delete(id);
                this.mediaServerAddrMap.delete(id);
                player = null;
            }
        }
        else {
            // 关闭所有video
            this.playerMap.forEach((item) => {
                item.close();
                item = null;
            });
            this.playerMap.clear();
            this.mediaServerAddrMap.clear();
        }
    }
    // 注册事件监听
    playEvent(player, videoElm, sdpUrl) {
        // 下边监听事件如果出现问题得重启一下服务器才行。
        player.on(Events.WEBRTC_ICE_CANDIDATE_ERROR, (e) => {
            // ICE 协商出错
            this.log("err", "ICE 协商出错");
            this.rePlay(videoElm);
        });
        player.on(Events.WEBRTC_ON_REMOTE_STREAMS, (e) => {
            // 获取到了远端流，可以播放
        });
        player.on(Events.WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED, (e) => {
            // offer anwser 交换失败,这里前端得重新调用添加视频拉流代码。
            this.log("warn", `offer anwser 交换失败，获取视频流失败, ${e}`);
            this.rePlay(videoElm);
        });
        player.on(Events.DISCONNECTED, (e) => {
            this.log("warn", `事件检测到连接断开${videoElm}`);
            this.rePlay(videoElm);
        });
        player.on(Events.LOST_SERVER, (e) => {
            this.log("warn", `事件检测到视频服务器丢失${videoElm}`);
            this.rePlay(videoElm);
        });
        player.on(Events.WEBRTC_ON_CONNECTION_STATE_CHANGE, (state) => {
            // RTC 状态变化 ,详情参考 https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/connectionState
            if (state === "disconnected" || state === "failed") {
                this.rePlay(videoElm);
            }
        });
    }
    // 重播
    rePlay(videoElm) {
        setTimeout(() => {
            this.play(videoElm);
        }, 3000);
    }
    // 播放
    play(videoElm) {
        const plays = this.mediaServerAddrMap.get(videoElm);
        const { sdpUrl } = this.createRtspUrl(plays);
        const { w, h } = this.config;
        const EndpointConfig = {
            element: plays.videoDom || document.getElementById(videoElm),
            debug: false,
            zlmsdpUrl: sdpUrl,
            simulcast: false,
            useCamera: false,
            audioEnable: false,
            videoEnable: true,
            recvOnly: true,
            resolution: { w, h },
        };
        const player = new Endpoint({
            ...Object.assign(EndpointConfig, this.config.endpointConfig),
        });
        this.playEvent(player, videoElm, sdpUrl);
        this.playerMap.set(videoElm, player);
    }
    // 开始播放
    startPlay(plays) {
        setTimeout(() => {
            this.play(plays.videoElm);
        }, 100);
    }
}

class VideoNode extends ComponentFac {
    constructor(stage) {
        super(stage);
    }
    name = "VideoNode";
    width = 150;
    height = 130;
    elements = [];
    add = async (thingInfo, p, isPreview, eleGroup) => {
        // 拖入
        if (p) {
            await this.draw(thingInfo, thingInfo.img, p);
            // 反序列化
        }
        else if (eleGroup && !isPreview) {
            const info = getCustomAttrs(eleGroup);
            const imgGroup = eleGroup.children.find((ele) => ele.attrs.name === "thingImage");
            const img = imgGroup.children[0];
            const imageObj = new Image();
            imageObj.src = info.thing.img;
            img?.setAttrs({ image: imageObj });
        }
        else {
            const video = document.createElement("video");
            video.id = thingInfo.iu;
            video.muted = true;
            video.autoplay = true;
            video.style.position = "fixed";
            video.width = 0;
            video.height = 0;
            document.getElementById("app").appendChild(video);
            playOneWebRtcMt(video.id, video.id);
            const thingGroup = this.stage.findOne("#" + thingInfo.iu);
            const imgGroup = thingGroup.children.find((ele) => ele.attrs.name === "thingImage");
            imgGroup.children[0].setAttrs({
                image: video,
                width: this.width,
                height: this.height,
            });
            const ani = new Konva.Animation(() => {
                // do nothing, animation just need to update the layer
            }, eleGroup.parent);
            ani.start();
            this.elements.push(video.id);
        }
    };
    destory = () => {
        this.elements.forEach((uuid) => {
            document.getElementById(uuid).remove();
        });
    };
    draw = async (thingInfo, imgUrl, p) => {
        const element = this.product(p, { width: this.width, height: this.height }, thingInfo);
        const image = await createImage(imgUrl);
        image.setAttrs({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
        });
        element.imgGroup.add(image);
    };
}

var state = [
    {
        middle: {
            color: "#D4D9DF",
        },
        img: {
            red: 0,
        },
    },
    {
        middle: {
            color: "#52DDAB",
        },
        img: {
            green: 50,
        },
    },
    {
        middle: {
            color: "#EA8080",
        },
        img: {
            red: 50,
        },
    },
    {
        middle: {
            color: "#8AB8FA",
        },
        img: {
            blue: 50,
        },
    },
];

var img$1 = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='UTF-8'%3f%3e%3csvg width='31px' height='26px' viewBox='0 0 31 26' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3e %3ctitle%3e%e5%88%ae%e6%9d%bf%e8%be%93%e9%80%81%e6%9c%ba_%e6%9c%ba%e5%a4%b4_%e7%81%b0%3c/title%3e %3cg id='2D%e8%ae%be%e5%a4%87%e5%9b%be' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3e %3cg id='%e5%88%ae%e6%9d%bf%e8%be%93%e9%80%81%e6%9c%ba' transform='translate(-136.000000%2c -377.000000)' stroke='%23010101'%3e %3cg id='%e5%88%ae%e6%9d%bf%e8%be%93%e9%80%81%e6%9c%ba_%e6%9c%ba%e5%a4%b4_%e7%81%b0' transform='translate(136.053590%2c 377.470000)'%3e %3cpath d='M29.5%2c21.5018266 L29.5%2c24.5 L0.5%2c24.5 L0.5%2c21.5018266 L29.5%2c21.5018266 Z' id='%e8%b7%af%e5%be%84' fill='%2388909A'%3e%3c/path%3e %3cpath d='M29.5%2c0.5 L29.5%2c21.4899535 L23.5%2c21.4899535 L23.5%2c0.5 L29.5%2c0.5 Z' id='%e8%b7%af%e5%be%84' fill='%23B0B9C4'%3e%3c/path%3e %3cpath d='M23.5%2c0.5 L23.5%2c21.5 L0.5%2c21.5 L0.5%2c0.5 L23.5%2c0.5 Z' id='%e8%b7%af%e5%be%84' fill='%23B0B9C4'%3e%3c/path%3e %3cpath d='M14.5%2c0.5 L14.5%2c21.4899535 L9.5%2c21.4899535 L9.5%2c0.5 L14.5%2c0.5 Z' id='%e8%b7%af%e5%be%84' fill='%23D4D9DF'%3e%3c/path%3e %3cpath d='M12.999315%2c-0.505023249 L12.999315%2c22.4949768 L11.000685%2c22.4949768 L11.000685%2c-0.505023249 L12.999315%2c-0.505023249 Z' id='%e8%b7%af%e5%be%84' fill='%23D4D9DF' transform='translate(12.000000%2c 10.994977) rotate(-90.000000) translate(-12.000000%2c -10.994977) '%3e%3c/path%3e %3cellipse id='%e6%a4%ad%e5%9c%86%e5%bd%a2' fill='%23D4D9DF' cx='12' cy='10.9949768' rx='4.5' ry='4.49771671'%3e%3c/ellipse%3e %3cellipse id='%e6%a4%ad%e5%9c%86%e5%bd%a2' fill='%23D4D9DF' cx='12' cy='10.9949768' rx='2.5' ry='2.49863002'%3e%3c/ellipse%3e %3c/g%3e %3c/g%3e %3c/g%3e%3c/svg%3e";

var img = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='UTF-8'%3f%3e%3csvg width='42px' height='26px' viewBox='0 0 42 26' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3e %3ctitle%3e%e5%88%ae%e6%9d%bf%e8%be%93%e9%80%81%e6%9c%ba_%e6%9c%ba%e5%b0%be_%e7%81%b0%3c/title%3e %3cg id='2D%e8%ae%be%e5%a4%87%e5%9b%be' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3e %3cg id='%e5%88%ae%e6%9d%bf%e8%be%93%e9%80%81%e6%9c%ba' transform='translate(-275.000000%2c -377.000000)'%3e %3cg id='%e5%88%ae%e6%9d%bf%e8%be%93%e9%80%81%e6%9c%ba_2D_%e7%81%b0' transform='translate(136.053590%2c 377.470000)'%3e %3cg id='%e5%88%ae%e6%9d%bf%e8%be%93%e9%80%81%e6%9c%ba_%e6%9c%ba%e5%b0%be_%e7%81%b0' transform='translate(139.000000%2c 0.000000)'%3e %3cpath d='M40.5%2c21.5 L40.5%2c24.5 L0.5%2c24.5 L0.5%2c21.5 L40.5%2c21.5 Z' id='%e8%b7%af%e5%be%84' stroke='%23010101' fill='%2388909A'%3e%3c/path%3e %3cpath d='M40.5%2c0.5 L40.5%2c21.5 L1.5%2c21.5 L1.5%2c0.5 L40.5%2c0.5 Z' id='%e8%b7%af%e5%be%84' stroke='%23010101' fill='%23B0B9C4'%3e%3c/path%3e %3cpath d='M40.5%2c5 L40.5%2c17 L0.647203837%2c17 L0.647203837%2c5 L40.5%2c5 Z' id='%e8%b7%af%e5%be%84' stroke='%23010101' fill='%23B0B9C4'%3e%3c/path%3e %3cpath d='M32.8283944%2c8.5 C33.5187503%2c8.5 34.1437503%2c8.77982203 34.5961613%2c9.23223305 C35.0485724%2c9.68464406 35.3283944%2c10.3096441 35.3283944%2c11 C35.3283944%2c11.6903559 35.0485724%2c12.3153559 34.5961613%2c12.767767 C34.1437503%2c13.220178 33.5187503%2c13.5 32.8283944%2c13.5 L32.8283944%2c13.5 L13.6376534%2c13.5 C12.9472975%2c13.5 12.3222975%2c13.220178 11.8698865%2c12.767767 C11.4174755%2c12.3153559 11.1376534%2c11.6903559 11.1376534%2c11 C11.1376534%2c10.3096441 11.4174755%2c9.68464406 11.8698865%2c9.23223305 C12.3222975%2c8.77982203 12.9472975%2c8.5 13.6376534%2c8.5 L13.6376534%2c8.5 Z' id='%e8%b7%af%e5%be%84' stroke='%23010101' fill='%23D4D9DF'%3e%3c/path%3e %3cpath d='M40.3895801%2c0.5 L40.3895801%2c21.5 L37.3895801%2c21.5 L37.3895801%2c0.5 L40.3895801%2c0.5 Z' id='%e8%b7%af%e5%be%84' stroke='%23010101' fill='%23B0B9C4'%3e%3c/path%3e %3cpath d='M9.37034594%2c8.47315502 C9.47614233%2c7.99814 10.1096154%2c7.95133397 10.3056492%2c8.35606039 L10.3406092%2c8.44970719 L11.243%2c11.746 L12.2372273%2c8.93222802 C12.3189445%2c8.70076992 12.5536942%2c8.56715106 12.7877324%2c8.6048822 L12.8751631%2c8.62720698 C13.1066212%2c8.70892421 13.2402401%2c8.94367392 13.2025089%2c9.17771214 L13.1801842%2c9.26514284 L11.6551803%2c13.5846046 C11.5029749%2c14.0157155 10.9168837%2c14.0237352 10.7341571%2c13.6387858 L10.7014804%2c13.5502928 L9.908%2c10.655 L9.27991519%2c13.4790911 C9.17818156%2c13.9358647 8.5779766%2c14.0031433 8.36126324%2c13.6261934 L8.32101585%2c13.5385991 L7.267%2c10.589 L6.81162581%2c13.4491093 C6.73315636%2c13.9413279 6.08073821%2c14.0150743 5.87394742%2c13.6026678 L5.83883306%2c13.5136845 L5.041%2c10.849 L4.64136535%2c13.4465799 C4.57123443%2c13.9014632 3.9910899%2c14.0152777 3.74286923%2c13.6658752 L3.69506639%2c13.5838687 L2.67123014%2c11.4153996 C2.55333096%2c11.165691 2.66018362%2c10.867686 2.90989223%2c10.7497868 C3.13185545%2c10.6449876 3.39197877%2c10.71777 3.52984803%2c10.910616 L3.57550504%2c10.9884489 L3.902%2c11.68 L4.39130811%2c8.50566619 C4.46745575%2c8.01175728 5.12190202%2c7.93608997 5.32928542%2c8.34936622 L5.36449745%2c8.43856166 L6.169%2c11.129 L6.5874848%2c8.5031368 C6.66386535%2c8.02402133 7.29183076%2c7.936262 7.513479%2c8.3287251 L7.55210726%2c8.41364702 L8.68%2c11.571 L9.37034594%2c8.47315502 Z' id='%e8%b7%af%e5%be%84-4' fill='%23010101' fill-rule='nonzero'%3e%3c/path%3e %3ccircle id='%e6%a4%ad%e5%9c%86%e5%bd%a2' stroke='%23010101' fill='%23D4D9DF' cx='13.6376534' cy='11' r='2.5'%3e%3c/circle%3e %3cpath d='M3.5%2c0.5 L3.5%2c21.5 L0.5%2c21.5 L0.5%2c0.5 L3.5%2c0.5 Z' id='%e8%b7%af%e5%be%84' stroke='%23010101' fill='%23B0B9C4'%3e%3c/path%3e %3c/g%3e %3c/g%3e %3c/g%3e %3c/g%3e%3c/svg%3e";

const changeState = (stage, stateType, iu) => {
    const thingLayer = layer(stage, "thing");
    const thingGroup = thingLayer.findOne(`#${iu}`);
    const thingImage = thingGroup.findOne(`.thingImage`);
    const theme = state[stateType];
    setCustomAttrs(thingGroup, { state: stateType });
    const middle = thingImage.children.find((ele) => ele.name() === "middle");
    middle.setAttrs({ fill: theme.middle.color });
    return thingImage;
};
class Scraper {
    constructor(stage, info) {
        this.stage = stage;
        this.createThingGroup(info.thingInfo, info.p);
        this.config.iu = info.thingInfo.iu;
    }
    name = "Scraper";
    createThingGroup(thingInfo, p) {
        if (p) {
            this.config.left = p.x;
            this.config.top = p.y;
        }
        const thingLayer = layer(this.stage, "thing");
        const thingGroup = thingLayer.findOne(`#${thingInfo.iu}`);
        if (thingGroup) {
            this.thingGroup = thingGroup;
            this.group = this.thingGroup.findOne(".thingImage");
            this.config.width =
                this.group.getClientRect().width / this.stage.scaleX();
            // 赋值缩放比例
            setCustomAttrs(this.group, {
                scale: this.config.width / this.config.defaultWidth,
            });
            this.draw.event();
        }
        else {
            this.group = new Konva.Group({
                width: this.config.width,
                height: this.config.height,
                x: this.config.left || 0,
                y: this.config.top || 0,
                draggable: false,
                name: "thingImage",
                componentName: this.name,
                id: UUID(),
            });
            this.thingGroup = createComponentThingGoup(thingLayer, thingInfo, this.group);
            this.draw.init();
        }
    }
    config = {
        defaultWidth: 192,
        width: 192,
        height: 26,
        left: 0,
        top: 0,
        theme: 0,
        iu: undefined,
        callBack: (group) => { },
    };
    render(stateType) {
        this.config.theme = stateType;
        this.group.removeChildren();
        this.config.theme = getCustomAttrs(this.group).state || 0;
        this.draw.render(this.config.theme);
    }
    draw = {
        event: () => {
            this.group.on("transform", (e) => {
                const { width, x, y } = getTran(this.stage).position;
                this.config.width = (width * this.group.scaleX()) / this.stage.scaleX();
                this.config.left = x;
                this.config.top = y;
                // 赋值缩放
                setCustomAttrs(this.group, {
                    scale: this.config.width / this.config.defaultWidth,
                });
                this.group.scale({
                    x: 1,
                    y: 1,
                });
                this.config.theme = getCustomAttrs(this.group).state || 0;
                this.draw.changeWidth();
            });
        },
        changeWidth: () => {
            const middle = this.group.children.find((ele) => ele.name() === "middle");
            middle.setAttrs({ width: this.config.width - 31 - 42 });
            const right = this.group.children.find((ele) => ele.name() === "right");
            right.setAttrs({ x: this.config.width - 42 });
        },
        init: () => {
            this.draw.render(0);
            this.config.callBack(this.group);
        },
        render: async (stateType) => {
            // 左
            let imageObj = new Image();
            imageObj.onload = () => {
                const img = new Konva.Image({
                    x: 0,
                    y: 0,
                    image: imageObj,
                    width: 31,
                    height: 26,
                    name: "left",
                });
                img.setAttrs({ src: img$1 });
                this.group.add(img);
            };
            imageObj.src = img$1;
            // 右
            let imageObj2 = new Image();
            imageObj2.onload = () => {
                const img$1 = new Konva.Image({
                    x: this.config.width - 42,
                    y: 0,
                    image: imageObj2,
                    width: 42,
                    height: 26,
                    name: "right",
                });
                img$1.setAttrs({ src: img });
                this.group.add(img$1);
            };
            imageObj2.src = img;
            // 中间
            this.rect = new Konva.Rect({
                name: "middle",
                x: 31,
                y: 0 + 2,
                fill: "#D4D9DF",
                width: this.config.width - 31 - 42,
                height: 20,
                stroke: "black",
                strokeWidth: 0.5,
                draggable: false,
            });
            this.group.add(this.rect);
            setCustomAttrs(this.thingGroup, { state: this.config.theme });
            this.thingGroup.add(this.group);
            this.draw.event();
        },
    };
}
const setScraperScale = async (ie, iu, thingGroup, scale) => {
    const thingImage = getThingImage(thingGroup);
    setCustomAttrs(thingImage, { scale });
    const comClass = ie.componentArr.find((ele) => ele.config.iu === iu);
    comClass.config.width = comClass.config.defaultWidth * scale;
    comClass.draw.changeWidth();
    toSelectOne(ie, thingImage);
};

class StoreHouse extends ComponentFac {
    constructor(stage) {
        super(stage);
    }
    name = "StoreHouse";
    arr = [];
    add(thingInfo, p, eleGroup) {
        // 拖入
        if (p) {
            this.arr.push(this.draw(thingInfo, p));
            // 反序列化
        }
        else if (eleGroup) {
            this.arr.push(eleGroup);
        }
    }
    refreshImg = (thingInfo, thingImage) => {
        thingImage.children.forEach((ele) => {
            ele.remove();
        });
        // 裁剪
        const clipGroup = new Konva.Group({
            clip: {
                x: 0,
                y: 90,
                width: 90,
                height: 1,
            },
            name: "clip",
        });
        // 图片
        let imageObj = new Image();
        imageObj.onload = () => {
            const img = new Konva.Image({
                x: 0,
                y: 0,
                image: imageObj,
                width: 90,
                height: 90,
                name: "empty",
            });
            img.setAttrs({ src: thingInfo.img });
            thingImage.add(img);
            img.moveDown();
        };
        imageObj.src = thingInfo.img;
        // 满图片
        let imageFull = new Image();
        imageFull.onload = () => {
            const img = new Konva.Image({
                x: 0,
                y: 0,
                image: imageFull,
                width: 90,
                height: 90,
                name: "full",
            });
            img.setAttrs({ src: thingInfo.fullImg });
            clipGroup.add(img);
            thingImage.add(clipGroup);
            clipGroup.moveUp();
        };
        imageFull.src = thingInfo.fullImg;
    };
    draw(thingInfo, p) {
        const com = this.product(p, { width, height }, thingInfo);
        // 裁剪
        const clipGroup = new Konva.Group({
            clip: {
                x: 0,
                y: 90,
                width: 90,
                height: 1,
            },
            name: "clip",
        });
        // 图片
        let imageObj = new Image();
        imageObj.onload = () => {
            const img = new Konva.Image({
                x: 0,
                y: 0,
                image: imageObj,
                width: 90,
                height: 90,
                name: "left",
            });
            img.setAttrs({ src: thingInfo.img });
            com.imgGroup.add(img);
            img.moveDown();
        };
        imageObj.src = thingInfo.img;
        // 满图片
        let imageFull = new Image();
        imageFull.onload = () => {
            const img = new Konva.Image({
                x: 0,
                y: 0,
                image: imageFull,
                width: 90,
                height: 90,
                name: "left",
            });
            img.setAttrs({ src: thingInfo.fullImg });
            clipGroup.add(img);
            com.imgGroup.add(clipGroup);
            clipGroup.moveUp();
        };
        imageFull.src = thingInfo.fullImg;
        return com.thingGroup;
    }
    setLevel = (iu, percent) => {
        const thingGroup = this.stage.findOne("#" + iu);
        const imgGroup = thingGroup.children.find((ele) => ele.attrs.name === "thingImage");
        const clip = imgGroup.children.find((ele) => ele.attrs.name === "clip");
        clip.moveUp();
        const val = 90 * percent * 0.01 + 1;
        clip.setAttrs({
            clipY: 90 - val,
            clipHeight: val,
        });
    };
}
const width = 90;
const height = 90;

var pointConfig = {
    radius: 6,
};

const createAnchors = (stage, anchors) => {
    return anchors.map((anchor) => {
        const circle = new Konva.Circle({
            x: anchor.point.x,
            y: anchor.point.y,
            name: anchor.type,
            radius: pointConfig.radius / stage.scaleX(),
            fill: "white",
            stroke: anchor.type === "out" ? "lightskyblue" : "lightyellow",
            strokeWidth: 0.5,
        });
        circle.hide();
        return circle;
    });
};
const showAnchor = (stage, type) => {
    stage.find(".out").forEach((node) => {
        node[type]();
    });
    stage.find(".in").forEach((node) => {
        node[type]();
    });
};
// 判断是不是入锚点
const judge = (stage, point, node) => {
    let ele = layer(stage, "thing").getIntersection(point);
    if (ele.name() === "in") {
        return true;
    }
    else {
        return false;
    }
};

class Technique {
    constructor(stage, info) {
        this.stage = stage;
        this.createThingGroup(info.thingInfo, info.p);
    }
    name = "Technique";
    createThingGroup(thingInfo, p) {
        if (p) {
            this.config.left = p.x;
            this.config.top = p.y;
        }
        const thingLayer = layer(this.stage, "thing");
        const thingGroup = thingLayer.findOne(`#${thingInfo.iu}`);
        if (thingGroup) {
            this.thingGroup = thingGroup;
            this.group = this.thingGroup.findOne(".thingImage");
            this.config.width =
                this.group.getClientRect().width / this.stage.scaleX();
            this.draw.event();
        }
        else {
            this.group = new Konva.Group({
                width: this.config.width,
                height: this.config.height,
                x: this.config.left || 0,
                y: this.config.top || 0,
                draggable: false,
                name: "thingImage",
                componentName: this.name,
                id: UUID(),
            });
            this.thingGroup = createComponentThingGoup(thingLayer, thingInfo, this.group);
            this.draw.init();
        }
    }
    config = {
        width: 80,
        height: 20,
        left: 0,
        top: 0,
        theme: 0,
        callBack: (group) => { },
    };
    render(stateType) {
        this.config.theme = stateType;
        this.group.removeChildren();
        this.config.theme = getCustomAttrs(this.group).state || 0;
        this.draw.render(this.config.theme);
    }
    draw = {
        event: () => {
            this.group.on("transform", (e) => {
                const { width, x, y } = getTran(this.stage).position;
                this.config.width = (width * this.group.scaleX()) / this.stage.scaleX();
                this.config.left = x;
                this.config.top = y;
                this.group.scale({
                    x: 1,
                    y: 1,
                });
                this.config.theme = getCustomAttrs(this.group).state || 0;
                this.group.children.forEach((ele) => {
                    if (ele.name() === "middle") {
                        ele.attrs.points[2] = this.config.width;
                    }
                    if (ele.name() === "right") {
                        ele.setAttrs({ x: this.config.width });
                    }
                    if (ele.name() === "text") {
                        ele.setAttrs({ x: this.config.width / 2 });
                    }
                });
            });
        },
        init: () => {
            this.draw.render(0);
            this.config.callBack(this.group);
        },
        render: async (stateType) => {
            // 左
            const left = new Konva.Line({
                name: "left",
                points: [0, 0, 0, 20],
                stroke: "black",
                strokeWidth: 1,
            });
            // 右
            const right = new Konva.Line({
                name: "right",
                points: [0, 0, 0, 20],
                x: 80,
                stroke: "black",
                strokeWidth: 1,
            });
            // 中间
            const line1 = new Konva.Line({
                name: "middle",
                points: [0, 2, 80, 2],
                stroke: "black",
                strokeWidth: 4,
            });
            const line2 = new Konva.Line({
                name: "middle",
                points: [0, 6, 80, 6],
                stroke: "black",
                strokeWidth: 1,
            });
            const line3 = new Konva.Line({
                name: "middle",
                points: [0, 19.5, 80, 19.5],
                stroke: "black",
                strokeWidth: 1,
            });
            // 文字
            const text = new Konva.Text({
                name: "text",
                x: this.config.width / 2,
                y: 7,
                text: "",
                fontSize: 14,
                fill: "black",
            });
            this.group.add(text);
            text.offsetX(text.width() / 2);
            this.group.add(left);
            this.group.add(right);
            this.group.add(line1);
            this.group.add(line2);
            this.group.add(line3);
            createAnchors(this.stage, [
                { type: "out", point: { x: 0, y: 0 } },
                { type: "out", point: { x: this.config.width, y: 0 } },
                {
                    type: "out",
                    point: { x: this.config.width / 2, y: this.config.height },
                },
                { type: "in", point: { x: this.config.width / 2, y: 0 } },
            ]).forEach((anchor) => {
                this.group.add(anchor);
            });
            setCustomAttrs(this.thingGroup, { state: this.config.theme });
            this.thingGroup.add(this.group);
            this.draw.event();
        },
    };
}
const setText = (stage, text, iu) => {
    const thingLayer = layer(stage, "thing");
    const thingGroup = thingLayer.findOne(`#${iu}`);
    const thingImage = thingGroup.findOne(`.thingImage`);
    const textNode = thingImage.children.find((ele) => ele.name() === "text");
    textNode.setAttrs({ text });
    textNode.offsetX(textNode.width() / 2);
};

const isComponentChild = (node) => {
    const parent = node.parent;
    const parentName = parent.name();
    return {
        node: parentName === "thingImage" ? parent : node,
    };
};
const isComponentChildren = (node) => {
    return node?.parent?.parent?.name() === "thingGroup";
};
const componentsName = ["POOL", "SCRAPER", "BELT", "ROUND_BUNKER"];

const getParentThingGroup = (node) => {
    if (node.name() === "thingGroup" || node.name() === "field") {
        return node;
    }
    else {
        return getParentThingGroup(node.parent);
    }
};
const getParentThingImage = (node) => {
    if (node.name() === "thingImage") {
        return node;
    }
    else {
        return getParentThingImage(node.parent);
    }
};

// 获取需要 框选的元素们
const getSelectNode = (selectTarget) => {
    let resNode;
    if (selectTarget.getParent().name() === groupNames.thingTextGroup ||
        selectTarget.getParent().name() === groupNames.thingInputGroup ||
        selectTarget.getParent().name() === groupNames.thingSwitchGroup ||
        selectTarget.getParent().name() === groupNames.thingButtonGroup) {
        resNode = selectTarget.getParent();
    }
    else {
        // ???
        resNode = isComponentChild(selectTarget).node;
    }
    // if (resNode.name() === "thingImage") {
    //   resNode = resNode.parent;
    // }
    return resNode;
};
const checkTarget = (e) => {
    let type = "other";
    if (e.className === "Arrow")
        return "line";
    return type;
};
// 初始化选择框
const createTran = (node, ie) => {
    const name = node?.getAttrs().componentName;
    const opt = {
        // centeredScaling: true,
        rotateEnabled: false,
        rotationSnaps: [0, 90, 180, 270],
    };
    if (name === "BELT" || name === "Scraper" || name === "Technique") {
        opt.enabledAnchors = ["middle-right"];
        opt.rotateEnabled = false;
    }
    else if (node?.className === "Arrow") {
        opt.draggable = false;
        opt.resizeEnabled = false;
    }
    else if (node?.name() === "thingImage" ||
        node?.name() === groupNames.thingTextGroup ||
        node?.name() === groupNames.thingInputGroup ||
        node?.name() === groupNames.thingButtonGroup ||
        node?.name() === groupNames.thingSwitchGroup) {
        opt.enabledAnchors = [
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
        ];
    }
    else if (node?.name() === "selfText") ;
    else {
        opt.resizeEnabled = false;
    }
    const tran = new Konva.Transformer(opt);
    tran.on("transform", () => {
        ie.opt.onTransform?.();
    });
    return tran;
};
// 获取 选择框
const getTran = (s) => {
    const Transformers = s.findOne("Transformer");
    if (!Transformers)
        return { nodes: [], Transformers: null };
    return {
        nodes: Transformers.getNodes(),
        position: Transformers.getClientRect(),
        Transformers,
    };
};
// 重置事件中心
const resetEvent = (stage) => {
    const Transformers = stage.findOne("Transformer");
    Transformers?.nodes().forEach((node) => {
        if (node.name() === "thingImage") {
            node.setAttrs({ draggable: false });
        }
    });
    const cursors = stage.find(".cursor");
    cursors.forEach((ele) => {
        obj.blur(ele.parent);
    });
    Transformers?.remove();
    Transformers?.destroy();
};
const clearTransFormer = (stage) => {
    const Transformers = stage.findOne("Transformer");
    Transformers?.remove();
    Transformers?.destroy();
    stage.draw();
};
const toSelectOne = (ie, node, cb) => {
    const stage = ie.getStage();
    resetEvent(stage);
    const Transformers = createTran(node, ie);
    Transformers.nodes([node]);
    layer(stage, "util").add(Transformers);
    cb?.("things", {}, {});
    return Transformers;
};
const toSelect = (ie, nodes, cb) => {
    if (nodes.length === 0)
        return;
    const stage = ie.getStage();
    resetEvent(stage);
    const Transformers = createTran(undefined, ie);
    Transformers.nodes(nodes);
    layer(stage, "util").add(Transformers);
    cb?.("things", {}, {});
    return Transformers;
};
// 选中单个元素动作
const selectEvent = (ie, e) => {
    const stage = ie.getStage();
    let Transformers = stage.findOne("Transformer");
    const node = getSelectNode(e.target);
    const nodes = [];
    const cursors = stage.find(".cursor");
    cursors.forEach((ele) => {
        obj.blur(ele.parent);
    });
    // shift选中组,暂未去重
    if (e.evt.shiftKey && Transformers) {
        const currentNodes = Transformers?.getNodes() || [];
        const res = [...currentNodes, node].map((node) => getParentThingGroup(node));
        Transformers.nodes(res);
        Transformers.draw();
    }
    else if (e.evt.ctrlKey && Transformers) {
        if (node.name() !== "field") {
            node.setAttrs({ draggable: true });
        }
        else {
            node.setAttrs({ draggable: true });
            setTimeout(() => {
                node.setAttrs({ draggable: false });
            }, 3000);
        }
        const currentNodes = Transformers?.getNodes();
        if (currentNodes.length === 1) {
            currentNodes[0].setAttrs({ draggable: true });
        }
        Transformers.nodes([...currentNodes, node]);
        Transformers.draw();
    }
    else {
        // 没有按住shift
        resetEvent(stage);
        nodes.push(node);
        if (ie.opt.isPreview && node.name() === groupNames.thingInputGroup) {
            obj.focus(node);
            return;
        }
        Transformers = createTran(node, ie);
        layer(stage, "util").add(Transformers);
        Transformers.nodes(nodes);
    }
};
var selectItem = (ie) => {
    const stage = ie.getStage();
    // 整体逻辑：如果点击画布直接清掉选择，如果是其他重置或者增加选择
    stage.on("click tap", (e) => {
        // 预览选择输入框
        if (ie.opt.isPreview &&
            e.target.getParent().name() !== groupNames.thingInputGroup) {
            resetEvent(stage);
            return;
        }
        const layer = e.target.getLayer();
        // 判断一下当元素类型
        if (getCustomAttrs(e.target).type === "control" ||
            stage.attrs.drawState === "fieldSelect")
            return;
        // const layer = stage.findOne(`.selectionBox`);
        if (!layer) {
            resetEvent(stage);
            return;
        }
        const tt = checkTarget(e.target);
        switch (tt) {
            // case "line":
            //   isLine();
            //   break;
            default:
                selectEvent(ie, e);
        }
    });
};

const getImgNode = (node) => {
    let res = node;
    if (node.name() === "thingGroup") {
        res = node.children.find((ele) => ele.name() === "thingImage");
    }
    return res;
};

// 直线合并中间无用折点
const mergeRightAngleLinePoint = (points) => {
    const range = 15;
    // 先合并首尾
    if (Math.abs(points[0].x - points[1].x) < range &&
        Math.abs(points[0].y - points[1].y) < range) {
        points.splice(0, 1);
    }
    const lastIndex = points.length - 1;
    if (Math.abs(points[lastIndex].x - points[lastIndex - 1].x) < range &&
        Math.abs(points[lastIndex].y - points[lastIndex - 1].y) < range) {
        points.splice(lastIndex, 1);
    }
    // 合并中间节点
    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const now = points[i];
        const next = points[i + 1];
        if (Math.abs(prev.x - now.x) < range && Math.abs(now.x - next.x) < range) {
            prev.x = now.x;
            points.splice(i--, 1);
        }
        else if (Math.abs(prev.y - now.y) < range &&
            Math.abs(now.y - next.y) < range) {
            prev.y = now.y;
            points.splice(i--, 1);
        }
    }
    return points;
};
// 直线首末点赋值并修改相邻点坐标保持直角
const setRightAngleLineBeginOrEnd = (points, index, target) => {
    let now;
    if (index === 0) {
        now = points[0];
        const next = points[1];
        // 如果直线加点
        if (points.length === 2) {
            // 用target避免斜向拖动问题
            points.splice(0, 0, { x: target.x, y: target.y });
        }
        else {
            // 横线
            if (now.y === next.y) {
                next.y = target.y;
                // 竖线
            }
            else if (now.x === next.x) {
                next.x = target.x;
            }
        }
        now.x = target.x;
        now.y = target.y;
    }
    else {
        // 修正加点问题
        index = points.length - 1;
        now = points[index];
        const prev = points[index - 1];
        // 如果直线加点
        if (points.length === 2) {
            // 用target避免斜向拖动问题
            points.push({ x: target.x, y: target.y });
        }
        else {
            // 横线
            if (now.y === prev.y) {
                prev.y = target.y;
                // 竖线
            }
            else if (now.x === prev.x) {
                prev.x = target.x;
            }
        }
        now.x = target.x;
        now.y = target.y;
    }
    return points;
};
// 根据两点返回折线坐标
const getLinePoints = (pointA, pointB) => {
    const arr = [pointA];
    // if (Math.abs(pointB.x - pointA.x) >= Math.abs(pointB.y - pointA.y)) {
    //   // X轴距离大,三折线
    //   const point1 = { x: (pointA.x + pointB.x) / 2, y: pointA.y };
    //   const point2 = { x: (pointA.x + pointB.x) / 2, y: pointB.y };
    //   arr.push(point1, point2);
    // } else {
    // const point1 = { y: (pointA.y + pointB.y) / 2, x: pointA.x };
    // const point2 = { y: (pointA.y + pointB.y) / 2, x: pointB.x };
    // arr.push(point1, point2);
    // Y轴距离大,二折线
    const point1 = { x: pointA.x, y: pointB.y };
    arr.push(point1);
    // }
    arr.push(pointB);
    return arr;
};

const dealRelation = (target, stage) => {
    const lineInfo = getLineInfo(target);
    const point = computedXY(stage, target.absolutePosition().x, target.absolutePosition().y);
    lineInfo.outLineIds?.forEach((lineId) => {
        const line = stage.findOne("#" + lineId);
        // 线随动前的点
        const oldPoint = {
            x: line.attrs.points[0],
            y: line.attrs.points[1],
        };
        const { lineInfo } = getCustomAttrs(line);
        const x = point.x + lineInfo.fromExcursionX;
        const y = point.y + lineInfo.fromExcursionY;
        const points = getUsePoint(line.attrs.points);
        if (lineInfo.type.toLowerCase().indexOf("rightangle") !== -1) {
            const pointsRes = setRightAngleLineBeginOrEnd(points, 0, { x, y });
            line.setAttrs({ points: getUsePointUn(pointsRes) });
        }
        else {
            points[0] = { x, y };
            line.setAttrs({ points: getUsePointUn(points) });
        }
        stage.batchDraw();
        // 线的字随动
        const distanceChange = {
            x: line.getAttr("points")[0] - oldPoint.x,
            y: line.getAttr("points")[1] - oldPoint.y,
        };
        const iu = getCustomAttrs(line.parent)?.thing?.iu;
        const group = stage.find("#line" + iu)[0];
        group?.children.forEach((textGroup) => {
            if (textGroup.className !== "Arrow" &&
                textGroup.className !== "Line" &&
                textGroup.name() !== "line") {
                const location = textGroup?.getAbsolutePosition();
                textGroup?.setAbsolutePosition({
                    x: location.x + distanceChange.x * stage.scaleX(),
                    y: location.y + distanceChange.y * stage.scaleX(),
                });
            }
        });
    });
    lineInfo.inLineIds?.forEach((lineId) => {
        const line = stage.findOne("#" + lineId);
        const { lineInfo } = getCustomAttrs(line);
        const x = point.x + lineInfo.toExcursionX;
        const y = point.y + lineInfo.toExcursionY;
        if (lineInfo.type.toLowerCase().indexOf("rightangle") !== -1) {
            const points = getUsePoint(line.attrs.points);
            const pointsRes = setRightAngleLineBeginOrEnd(points, points.length - 1, { x, y });
            line.setAttrs({ points: getUsePointUn(pointsRes) });
        }
        else {
            line.attrs.points[line.attrs.points.length - 2] = x;
            line.attrs.points[line.attrs.points.length - 1] = y;
            line.setAttrs({ points: line.attrs.points });
        }
    });
};

const flip = {
    flipX(node) {
        const x = node.scaleX();
        const w = node.width();
        node.scaleX(-x);
        node.offsetX(-x < 0 ? w : 0);
    },
    flipY(node) {
        const y = node.scaleY();
        const w = node.width();
        node.scaleY(-y);
        node.offsetY(-y < 0 ? w : 0);
    },
};
const setElPosition = {
    flipY() { },
    flipX() { },
    moveToTop() { },
    moveToBottom() { },
    moveUp() { },
    moveDown() { },
    top(stage, nodes, { minY }) {
        nodes.forEach((element) => {
            const imgEle = getImgNode(element);
            const y = imgEle.absolutePosition().y / stage.scaleY();
            element.move({ x: 0, y: minY - y });
        });
    },
    bottom(stage, nodes, { maxY }) {
        nodes.forEach((element) => {
            const imgEle = getImgNode(element);
            const MAXY = (imgEle.absolutePosition().y + imgEle.height()) / stage.scaleY();
            element.move({ x: 0, y: maxY - MAXY });
        });
    },
    left(stage, nodes, { minX }) {
        nodes.forEach((element) => {
            const imgEle = getImgNode(element);
            const x = imgEle.absolutePosition().x / stage.scaleX();
            element.move({ x: minX - x, y: 0 });
        });
    },
    right(stage, nodes, { maxX }) {
        nodes.forEach((element) => {
            const imgEle = getImgNode(element);
            const MAXX = (imgEle.absolutePosition().x + imgEle.width()) / stage.scaleX();
            element.move({ x: maxX - MAXX, y: 0 });
        });
    },
    centerY(stage, nodes, { maxY, minY }) {
        nodes.forEach((element) => {
            const imgEle = getImgNode(element);
            const y = imgEle.absolutePosition().y / stage.scaleY();
            element.move({
                x: 0,
                y: (minY + maxY) / 2 - y - imgEle.height() / stage.scaleY() / 2,
            });
        });
    },
    centerX(stage, nodes, { minX, maxX }) {
        nodes.forEach((element) => {
            const imgEle = getImgNode(element);
            const x = imgEle.absolutePosition().x / stage.scaleX();
            element.move({
                x: (minX + maxX) / 2 - x - imgEle.width() / stage.scaleX() / 2,
                y: 0,
            });
        });
    },
    distributionY(stage, nodes, { minY, maxY, totalY }) {
        const signal = (maxY - minY - totalY) / nodes.length;
        let counter = 0;
        nodes.forEach((element, index) => {
            const imgEle = getImgNode(element);
            const y = imgEle.absolutePosition().y / stage.scaleY();
            element.move({
                x: 0,
                y: minY + counter + index * signal - y,
            });
            counter += imgEle.height() / stage.scaleY();
        });
    },
    distributionX(stage, nodes, { minX, maxX, totalX }) {
        const signal = (maxX - minX - totalX) / nodes.length;
        let counter = 0;
        nodes.forEach((element, index) => {
            const imgEle = getImgNode(element);
            const x = imgEle.absolutePosition().x / stage.scaleX();
            element.move({
                x: minX + counter + index * signal - x,
                y: 0,
            });
            counter += imgEle.width() / stage.scaleX();
        });
    },
};
var changeElementsPosition = (stage, type) => {
    const { Transformers } = getTran(stage);
    const nodes = Transformers.nodes();
    // 翻转
    if (type === "flipX" || type === "flipY") {
        nodes.forEach((node) => {
            if (node.attrs.componentName === "BELT") {
                if (type === "flipX") {
                    let backward = getCustomAttrs(node).backward;
                    setCustomAttrs(node, {
                        backward: !backward,
                    });
                }
                return;
            }
            flip[type](node);
        });
        return;
    }
    // 层级
    if (type === "moveToTop" ||
        type === "moveToBottom" ||
        type === "moveUp" ||
        type === "moveDown") {
        nodes.forEach((node) => {
            if (node.name() === "thingImage" || node.name() === "customImage") {
                node.parent[type]();
            }
            else {
                node[type]();
            }
        });
        stage.findOne(".field")?.moveToBottom();
        return;
    }
    let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE, maxX = Number.MIN_VALUE, totalX = 0, totalY = 0;
    const imgNodes = [];
    nodes.forEach((thingGroup) => {
        // 如果是组转回thingImage
        const imgEle = getImgNode(thingGroup);
        imgNodes.push(imgEle);
        const x = imgEle.absolutePosition().x / stage.scaleX();
        const y = imgEle.absolutePosition().y / stage.scaleY();
        const MAXX = (imgEle.absolutePosition().x + imgEle.width()) / stage.scaleX();
        const MAXY = (imgEle.absolutePosition().y + imgEle.height()) / stage.scaleY();
        totalX += imgEle.width() / stage.scaleX();
        totalY += imgEle.height() / stage.scaleY();
        if (MAXX > maxX) {
            maxX = MAXX;
        }
        if (MAXY > maxY) {
            maxY = MAXY;
        }
        if (x < minX) {
            minX = x;
        }
        if (minY > y) {
            minY = y;
        }
    });
    setElPosition[type](stage, nodes, {
        maxX,
        maxY,
        minX,
        minY,
        totalX,
        totalY,
    });
    imgNodes.forEach((element) => {
        dealRelation(element, stage);
    });
};

var dropThingImage = (stage, themeType, e, cb) => {
    let data = e.dataTransfer?.getData("thing");
    const { thing, thingText } = getTransferData(data);
    const { x, y } = computedXYByEvent(stage, e);
    const layerThing = layer(stage, "thing");
    // 上传thing
    if (thing) {
        // 创建thing group
        createThingImageGroup(layerThing, thing, x, y).then((group) => {
            if (thingText) {
                createThingTextByGroup(group, thingText, themeType);
            }
            cb ? cb(getCustomAttrs(group).thing, { x, y }, group) : null;
        });
    }
};

// 拖拽或直传url
var customAddImage = async (stage, e, info) => {
    let urls;
    if (info) {
        urls = [info.url];
    }
    else {
        urls = await fileToBase64(e.dataTransfer.files);
    }
    const thingLayer = layer(stage, "thing");
    for (let i of urls) {
        const image = await createImage(i);
        image.draggable(true);
        image.name("customImage");
        const { width, height } = image.getAttrs().image;
        const { x, y } = computedXYByEvent(stage, e);
        image.setAttrs({
            x: x - width / 2,
            y: y - height / 2,
        });
        const group = new Konva.Group({
            id: UUID(),
            name: "customImageGroup",
        });
        group.add(image);
        thingLayer.add(group);
        if (info) {
            setCustomAttrs(image, { imgCode: info.type });
        }
    }
};

var ondrop = (ie, dom, callback) => {
    const stage = ie.getStage();
    dom.ondragenter = function (e) {
        e.preventDefault();
    };
    dom.ondragover = function (e) {
        e.preventDefault();
    };
    dom.ondragleave = function (e) {
        e.preventDefault();
    };
    // 撤销待改
    dom.ondrop = (e) => {
        e.preventDefault();
        // 自定义组件拦截+回调
        const isCustomComponent = e.dataTransfer?.getData("customComponent");
        const data = e.dataTransfer?.getData("thing");
        if (isCustomComponent) {
            const { x, y } = computedXY(ie.getStage(), e.offsetX, e.offsetY);
            ie.opt.onDropCb
                ? ie.opt.onDropCb(JSON.parse(data).thing, { x, y })
                : null;
            return;
        }
        if (e.dataTransfer.files.length > 0 && !data) {
            customAddImage(stage, e);
        }
        else {
            dropThingImage(stage, ie.getTheme(), e, ie.opt.onDropCb);
        }
        callback ? callback(e) : null;
    };
};

const scaleBy = 1.1;
var changeZoom = (deltaY, stage) => {
    const oldScale = stage.scaleX();
    const position = stage.getPointerPosition();
    const mousePointTo = {
        x: position.x / oldScale - stage.x() / oldScale,
        y: position.y / oldScale - stage.y() / oldScale,
    };
    const newScale = deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
        x: -(mousePointTo.x - position.x / newScale) * newScale,
        y: -(mousePointTo.y - position.y / newScale) * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
};

const resetNodeSize = (stage) => {
    const circles = stage.find("Circle");
    circles.forEach((circle) => {
        if (getCustomAttrs(circle).type === "control") {
            circle.setAttrs({
                radius: 5 / stage.scaleX(),
            });
        }
    });
};

var onwheel = (ie, cb) => {
    ie.getStage().on("wheel", (e) => {
        e.evt.preventDefault();
        if (ie.opt.isPreview) {
            return;
        }
        changeZoom(e.evt.deltaY, ie.getStage());
        resetNodeSize(ie.getStage());
        cb ? cb() : null;
    });
};

const bindPointEvent = (point, controlIndex, line, stage) => {
    setCustomAttrs(point, { type: "control" });
    let oldPoint = { x: 0, y: 0 };
    point.on("dragmove", (e) => {
        const { x, y } = e.target.attrs;
        const points = getUsePoint(line.attrs.points);
        // 处理线上字逻辑
        if (controlIndex === 0) {
            oldPoint = getUsePoint(line.attrs.points)[0];
        }
        let resPoints = [];
        const lineInfo = getCustomAttrs(line).lineInfo;
        // 直角线
        if (lineInfo.type.toLowerCase().indexOf("rightangle") !== -1) {
            resPoints = setRightAngleLineBeginOrEnd(points, controlIndex, {
                x: x,
                y: y,
            });
        }
        else {
            // 斜线
            // shift
            if (e.evt.shiftKey) {
                // 开始点
                if (controlIndex === 0) {
                    // x远
                    if (Math.abs(x - points[1].x) - Math.abs(y - points[1].y) > 0) {
                        points[controlIndex] = { x, y: points[1].y };
                    }
                    else {
                        points[controlIndex] = { x: points[1].x, y };
                    }
                }
                else {
                    if (Math.abs(x - points[0].x) - Math.abs(y - points[0].y) > 0) {
                        points[controlIndex] = { x, y: points[0].y };
                    }
                    else {
                        points[controlIndex] = { x: points[0].x, y };
                    }
                }
            }
            else {
                points[controlIndex] = { x, y };
            }
            resPoints = points;
        }
        const arr = getUsePointUn(resPoints);
        line.setAttrs({ points: arr });
        // 线上字跟随
        if (controlIndex === 0) {
            const distanceChange = {
                x: line.getAttr("points")[0] - oldPoint.x,
                y: line.getAttr("points")[1] - oldPoint.y,
            };
            const iu = getCustomAttrs(line.parent)?.thing?.iu;
            const group = stage.find("#line" + iu)[0];
            group?.children.forEach((textGroup) => {
                if (textGroup.className !== "Arrow") {
                    const location = textGroup?.getAbsolutePosition();
                    textGroup?.setAbsolutePosition({
                        x: location.x + distanceChange.x * stage.scaleX(),
                        y: location.y + distanceChange.y * stage.scaleX(),
                    });
                }
            });
        }
        stage.batchDraw();
    });
    point.on("dragend", (e) => {
        let position;
        getUsePoint(line.attrs.points);
        const newParent = getMouseOver({ x: e.evt.layerX, y: e.evt.layerY }, stage);
        const lineInfo = getCustomAttrs(line).lineInfo;
        if (controlIndex === 0) {
            position = {
                x: line.attrs.points[0],
                y: line.attrs.points[1],
            };
        }
        else {
            position = {
                x: line.attrs.points[line.attrs.points.length - 2],
                y: line.attrs.points[line.attrs.points.length - 1],
            };
        }
        // 合并重合的
        lineMouseUp(e, stage);
        if (newParent && newParent.name() === "thingImage") {
            connectNewRect(line, controlIndex, newParent, position, stage);
        }
        else {
            if (controlIndex === 0) {
                const rectOut = stage.findOne("#" + lineInfo.from);
                const xy = computedXY(stage, rectOut.absolutePosition().x, rectOut.absolutePosition().y);
                lineInfo.fromExcursionX = position.x - xy.x;
                lineInfo.fromExcursionY = position.y - xy.y;
            }
            else {
                const rectIn = stage.findOne("#" + lineInfo.to);
                const xy = computedXY(stage, rectIn.absolutePosition().x, rectIn.absolutePosition().y);
                lineInfo.toExcursionX = position.x - xy.x;
                lineInfo.toExcursionY = position.y - xy.y;
            }
        }
        // stage.draw();
        enterEditLine(line, stage);
    });
};
const addPoint = (stage, point) => {
    const utilLayer = layer(stage, "util");
    utilLayer.moveToTop();
    const circle = new Konva.Circle({
        x: point.x,
        y: point.y,
        draggable: true,
        radius: pointConfig.radius / stage.scaleX(),
        fill: "white",
        stroke: "lightskyblue",
        strokeWidth: 0.5,
    });
    utilLayer.add(circle);
    return circle;
};

const turnDrag = (stage, state) => {
    const lay = layer(stage, "thing");
    lay.children?.forEach((ele) => {
        if (ele.name() !== "field") {
            ele.setAttrs({ draggable: state });
        }
    });
};

let editLine;
let controls = [];
let clickIndex;
// 退出线编辑状态
const exitEditLine = (stage) => {
    turnDrag(stage, true);
    controls.forEach((point) => {
        point.remove();
    });
    editLine?.off("mouseenter");
    editLine?.off("mouseleave");
    controls = [];
    editLine = undefined;
};
// 进入线编辑状态
const enterEditLine = (line, stage) => {
    if (line === editLine) {
        // return;
        exitEditLine(stage);
    }
    // 关闭拖动
    turnDrag(stage, false);
    editLine = line;
    editLine.on("mouseenter", function () {
        stage.container().style.cursor = "move";
    });
    editLine.on("mouseleave", function () {
        stage.container().style.cursor = "default";
    });
    const length = line.attrs.points.length;
    const pBegin = addPoint(stage, {
        x: line.attrs.points[0],
        y: line.attrs.points[1],
    });
    const pEnd = addPoint(stage, {
        x: line.attrs.points[length - 2],
        y: line.attrs.points[length - 1],
    });
    controls.push(pBegin, pEnd);
    const points = getUsePoint(editLine.attrs.points);
    bindPointEvent(pBegin, 0, editLine, stage);
    bindPointEvent(pEnd, points.length - 1, editLine, stage);
};
// 线编辑点击线
const lineMouseDown = (e, stage) => {
    const arr = getUsePoint(editLine.attrs.points);
    const { x, y } = computedXYByEvent(stage, e.evt);
    clickIndex = getInsertIndex(arr, {
        x,
        y,
    });
    stage.on("mousemove", (e) => {
        const { x, y } = computedXYByEvent(stage, e.evt);
        const arr = getUsePoint(editLine.attrs.points);
        const points = movePartOfLine(arr, clickIndex, {
            x,
            y,
        });
        if (clickIndex === 1) {
            clickIndex = 2;
        }
        editLine.setAttrs({ points: getUsePointUn(points) });
    });
};
const getPointIndex = (arr, circle) => {
    let num = -1;
    controls.forEach((ele, index) => {
        if (ele === circle) {
            num = index;
        }
    });
    return num;
};
// 线编辑状态按下鼠标
const editMouseDown = (e, stage) => {
    if (e.target === editLine) {
        lineMouseDown(e, stage);
    }
};
// 线编辑状态抬起鼠标
const lineMouseUp = (e, stage) => {
    const points = getUsePoint(editLine.attrs.points);
    const resPoints = mergeRightAngleLinePoint(points);
    editLine.setAttrs({ points: getUsePointUn(resPoints) });
    stage.off("mousemove");
};
// 检查是否继续编辑
const checkKeepEdit = (e) => {
    if (e.target === editLine || getPointIndex(controls, e.target) != -1) {
        return true;
    }
    else {
        return false;
    }
};

var remove = (ie, e) => {
    const Transformers = ie
        .getStage()
        .find("Transformer")[0];
    const nodes = Transformers?.getNodes() || [];
    for (let i of nodes) {
        const isThing = i.hasName("thingImage");
        const isThingText = i.getParent().hasName(groupNames.thingDefTextGroup);
        Transformers.destroy();
        removeRelevance(i, ie.getStage());
        if (isThing || isThingText) {
            i.getParent().remove();
        }
        else {
            // 删除关联关系
            i.remove();
        }
        ie.opt.onRemoveCb?.();
        ie.getStage().draw();
    }
};
const removeRelevance = (obj, stage) => {
    if (obj.className === "Arrow" || obj.className === "Line") {
        const line = obj.parent.findOne(".line");
        const lineInfo = getCustomAttrs(line).lineInfo;
        const rectOut = stage.findOne("#" + lineInfo.from);
        const rectIn = stage.findOne("#" + lineInfo.to);
        const outInfo = getCustomAttrs(rectOut).lineInfo;
        const inInfo = getCustomAttrs(rectIn).lineInfo;
        outInfo?.outLineIds?.splice(outInfo.outLineIds.indexOf(lineInfo.from), 1);
        inInfo?.inLineIds?.splice(inInfo.inLineIds.indexOf(lineInfo.to), 1);
        if (obj.parent.name() === "thingGroup") {
            obj.parent.remove();
        }
    }
    if (obj.className === "Rect" ||
        obj.className === "Image" ||
        obj.name() === "thingImage") {
        const lineInfo = getCustomAttrs(obj).lineInfo;
        [...(lineInfo?.outLineIds || []), ...(lineInfo?.inLineIds || [])]?.forEach((id) => {
            const line = stage.findOne("#" + id);
            removeRelevance(line, stage);
            const isThing = line.getParent().hasName(groupNames.thingGroup);
            if (isThing) {
                line.parent.remove();
            }
            line.remove();
        });
    }
};

const keydown = (e, ie) => {
    const stage = ie.getStage();
    const trans = stage.findOne("Transformer");
    const nodes = trans?.getNodes();
    if (ie.opt.isPreview) {
        const input = stage.findOne(".cursor");
        if (input) {
            obj.keyIn(e, input.parent);
        }
        return;
    }
    if (e.code === "Delete") {
        exitEditLine(ie.getStage());
        remove(ie);
    }
    else if (nodes?.length === 1 &&
        nodes[0].name() === groupNames.thingInputGroup) {
        // 输入框
        obj.keyIn(e, nodes[0]);
    }
    else if (e.code === "Backspace") {
        exitEditLine(ie.getStage());
        remove(ie);
    }
    else if (e.code === "Space") {
        const eles = document.getElementById("myCanvas").children;
        Array.from(eles).forEach((element) => {
            element.style.cursor = "grab";
        });
        ie.getStage().setAttrs({ draggable: true });
        ie.setDrawState("dragStage");
    }
};
const keyup = (e, ie) => {
    if (e.code === "Space") {
        const eles = document.getElementById("myCanvas").children;
        Array.from(eles).forEach((element) => {
            element.style.cursor = "default";
        });
        ie.getStage().setAttrs({ draggable: false });
        ie.setDrawState("default");
    }
    else if (e.ctrlKey && e.code === "KeyZ") {
        // 撤销
        if (ie.historyArr.length >= 2) {
            ie.historyArr.pop();
            ie.init(ie.historyArr[ie.historyArr.length - 1]);
        }
    }
};
var keyDown = (ie, bind) => {
    const container = ie.getContainer();
    if (bind !== false) {
        container.addEventListener("keydown", ie.keyDown);
        container.addEventListener("keyup", ie.keyUp);
    }
    else {
        container.removeEventListener("keydown", ie.keyDown);
        container.removeEventListener("keyup", ie.keyUp);
    }
};

const setLineWidth = (line, size) => {
    const coreLine = line.parent.findOne(".line");
    const info = getCustomAttrs(coreLine);
    // 管道
    if (info.lineInfo.type.toLocaleLowerCase().indexOf("dotted") === -1) {
        const borderOuter = line.parent.findOne(".borderOuter");
        borderOuter.setAttrs({ strokeWidth: size });
        const borderInner = line.parent.findOne(".borderInner");
        borderInner.setAttrs({ strokeWidth: size / 2 });
        coreLine.setAttrs({ strokeWidth: size / 4 });
        info.lineInfo.width = size;
    }
    else {
        line.setAttrs({ strokeWidth: size });
    }
};
const getLineWidth = (line) => {
    const coreLine = line.parent.findOne(".line");
    const info = getCustomAttrs(coreLine);
    // 管道
    if (info.lineInfo.type.toLocaleLowerCase().indexOf("dotted") === -1) {
        const borderOuter = line.parent.findOne(".borderOuter");
        return borderOuter.attrs.strokeWidth;
    }
    else {
        return line.attrs.strokeWidth;
    }
};

const addLineBorder = (line, ie) => {
    line.setAttrs({
        pointerWidth: 0,
        strokeWidth: 2,
        dash: line.attrs.dash || [8, 8, 8, 8],
    });
    // const border = new Konva.Shape({
    //   id: UUID(),
    //   points: line.attrs.points,
    //   stroke: "red",
    //   strokeWidth: 4,
    //   name: "border",
    //   sceneFunc: function (context, shape) {
    //     const attrs = shape.attrs;
    //     const points = getUsePoint(attrs.points);
    //     context.beginPath();
    //     context.lineWidth = 6;
    //     context.strokeStyle = LineTheme[ie.getTheme()].borderInner;
    //     context.moveTo(attrs.points[0], attrs.points[1]);
    //     points.forEach((point, index) => {
    //       if (index !== 0) {
    //         context.lineTo(point.x, point.y);
    //       }
    //     });
    //     context.stroke();
    //   },
    // });
    // border.attrs.cdata = {};
    // line.parent.add(border);
    // border.moveToBottom();
    const borderInner = line.clone({
        id: UUID(),
        strokeWidth: 6,
        stroke: LineTheme[ie.getTheme()].borderInner,
        name: "borderInner",
        dashEnabled: false,
    });
    borderInner.attrs.cdata = {};
    line.parent.add(borderInner);
    borderInner.moveToBottom();
    const borderOut = line.clone({
        id: UUID(),
        strokeWidth: 8,
        stroke: LineTheme[ie.getTheme()].borderOuter,
        name: "borderOuter",
        dashEnabled: false,
    });
    borderOut.attrs.cdata = {};
    line.parent.add(borderOut);
    borderOut.moveToBottom();
    const oldSet = line.setAttrs;
    function newSet(config) {
        if (config.points) {
            const borderOut = this.parent.findOne(".borderOuter");
            borderOut.setAttrs({ points: config.points });
            const borderInner = this.parent.findOne(".borderInner");
            borderInner.setAttrs({ points: config.points });
        }
        return oldSet.bind(this)(config);
    }
    line.setAttrs = newSet;
};
const resetLine = (ie) => {
    const stage = ie.getStage();
    const lineLayer = layer(stage, "line");
    const lineArr = [...lineLayer.find("Arrow"), ...lineLayer.find("Line")];
    for (let i = 0; i < lineArr.length; i++) {
        const line = lineArr[i];
        if (line.name().indexOf("border") > -1) {
            line.remove();
        }
        else {
            line.name("line");
            if (line.parent.name() !== "thingGroup") {
                const group = createThingGroup({});
                group.setAttrs({ draggable: false });
                line.getLayer().add(group);
                group.add(line);
            }
            const info = getCustomAttrs(line);
            // 管道 重置border和线
            if (info.lineInfo.type.toLowerCase().indexOf("dotted") === -1) {
                const newLine = new Konva.Line(line.attrs);
                const data = getCustomAttrs(line);
                setCustomAttrs(newLine, data);
                line.parent.add(newLine);
                line.destroy();
                addLineBorder(newLine, ie);
                if (info.lineInfo.width) {
                    setLineWidth(newLine, info.lineInfo.width);
                }
            }
        }
    }
};

// 创建线完成
const finishLine = (ie, begin, line, lineType) => {
    const stage = ie.getStage();
    // 设备
    if (begin.className === "Image" && begin.parent?.nodeType === "Group") {
        begin.parent?.setAttrs({ draggable: true });
        //组件
    }
    else if (isComponentChildren(begin)) {
        begin.parent.parent.setAttrs({ draggable: true });
        begin = begin.parent;
    }
    else {
        begin.setAttrs({ draggable: true });
    }
    let pos = stage.getPointerPosition();
    let end = getMouseOver(pos, stage);
    if (end?.attrs.componentName === "Technique") {
        if (!judge(stage, pos)) {
            end = undefined;
        }
    }
    if (begin === end) {
        end = undefined;
    }
    if (end && end.name() === "thingImage") {
        end.setAttrs({ strokeWidth: 0 });
        const beginInfo = getLineInfo(begin);
        const endInfo = getLineInfo(end);
        const xya = computedXY(stage, begin.absolutePosition().x, begin.absolutePosition().y);
        const xyb = computedXY(stage, end.absolutePosition().x, end.absolutePosition().y);
        const data = {
            from: begin.id(),
            fromExcursionX: line.attrs.points[0] - xya.x,
            fromExcursionY: line.attrs.points[1] - xya.y,
            to: end.id(),
            toExcursionX: line.attrs.points[line.attrs.points.length - 2] - xyb.x,
            toExcursionY: line.attrs.points[line.attrs.points.length - 1] - xyb.y,
            type: lineType,
            state: lineState.default,
        };
        setCustomAttrs(line, {
            lineInfo: data,
        });
        const group = createThingGroup({});
        group.setAttrs({ draggable: false });
        line.getLayer().add(group);
        group.add(line);
        if (lineType.toLowerCase().indexOf("dotted") === -1) {
            addLineBorder(line, ie);
        }
        beginInfo?.outLineIds?.push(line.id());
        endInfo?.inLineIds?.push(line.id());
        if (lineType.indexOf("rightAngle") >= 0) {
            const points = getUsePoint(line.attrs.points);
            const resPoints = mergeRightAngleLinePoint(points);
            line.setAttrs({ points: getUsePointUn(resPoints) });
        }
        const cb = ie.opt.onCreateLineCb;
        cb?.(line.id());
    }
    else {
        line.remove();
    }
};
// 创建线过程中移动
const createLineMove = (line, point, opt, e) => {
    if (opt.drawState.toLowerCase().indexOf("rightangle") !== -1) {
        const res = getLinePoints({ x: line.attrs.points[0], y: line.attrs.points[1] }, { x: point.x, y: point.y });
        line.points(getUsePointUn(res));
    }
    else {
        // shift
        if (e.evt.shiftKey) {
            if (Math.abs(point.x - line.attrs.points[0]) -
                Math.abs(point.y - line.attrs.points[0]) >
                0) {
                line.attrs.points[2] = point.x;
                line.attrs.points[3] = line.attrs.points[1];
            }
            else {
                line.attrs.points[2] = line.attrs.points[0];
                line.attrs.points[3] = point.y;
            }
        }
        else {
            line.attrs.points[2] = point.x;
            line.attrs.points[3] = point.y;
        }
        line.setAttrs({ points: line.attrs.points });
    }
};
// 开始创建线
const beginCreateLine = (ie, point, e, opt) => {
    const stage = ie.getStage();
    // 设备
    if (e.target.className === "Image" && e.target.parent?.nodeType === "Group") {
        e.target.parent?.setAttrs({ draggable: false });
    }
    //组件
    if (isComponentChildren(e.target)) {
        e.target.parent.parent.setAttrs({ draggable: false });
    }
    if (e.target.name() === "selfShape" || e.target.className === "Text") {
        return;
    }
    e.target.setAttrs({ draggable: false });
    const lay = layer(stage, "line");
    lay.moveToTop();
    const line = createLine(ie, point, opt);
    let end;
    stage.on("mousemove", (e) => {
        const { x, y } = computedXYByEvent(stage, e.evt);
        if (line) {
            createLineMove(line, { x, y }, opt, e);
            let pos = stage.getPointerPosition();
            if (end) {
                end.setAttrs({ strokeWidth: 0 });
            }
            end = getMouseOver(pos, stage);
            if (end && end.name() === "thingImage") {
                end.setAttrs({ stroke: "red", strokeWidth: 1 });
            }
        }
    });
    return line;
};
// 画出预览线
const createLine = (ie, point, opt) => {
    const stage = ie.getStage();
    const lay = layer(stage, "line");
    // 管道是line
    const isLine = opt.drawState.toLowerCase().indexOf("dotted") === -1;
    const arrow = new Konva[isLine ? "Line" : "Arrow"]({
        id: UUID(),
        points: [point.x, point.y, point.x, point.y],
        ...LineTheme[opt.theme],
        pointerFill: lineState[opt.theme][lineState.default],
        stroke: lineState[opt.theme][lineState.default],
        fill: lineState[opt.theme][lineState.default],
        name: "line",
    });
    if (isLine) {
        arrow.setAttrs({
            dash: ie.drawInfo?.dotted || [8, 8, 8, 8],
            lineJoin: "round",
        });
    }
    lay.add(arrow);
    return arrow;
};

const getInclude = (ie, rect) => {
    const rectTem = rect;
    const arr = [];
    ie.thingLayer.children.forEach((node) => {
        const area = node.getClientRect();
        const points = [
            {
                x: area.x,
                y: area.y,
            },
            {
                x: area.x + area.width,
                y: area.y,
            },
            {
                x: area.x + area.width,
                y: area.y + area.height,
            },
            {
                x: area.x,
                y: area.y + area.height,
            },
        ];
        if (rectTem &&
            rectTem.intersects(points[0]) &&
            rectTem.intersects(points[1]) &&
            rectTem.intersects(points[2]) &&
            rectTem.intersects(points[3])) {
            // if (node.name() !== "field") {
            arr.push(node);
            // }
        }
    });
    return arr;
};

const offSelection = (stage) => {
    // 移除mosemove 监听
    stage.off("mousemove");
};
// 默认框选
const onSelection = (stage, startPoint, themeType, cb) => {
    const rect = createSelectionBox(stage, themeType);
    rect.setAttrs(startPoint);
    let flag;
    stage.on("mousemove", (e) => {
        if (flag)
            clearTimeout(flag);
        flag = setTimeout(() => {
            // 默认框选
            const { y, x } = computedXYByEvent(stage, e.evt);
            const rectAttrs = computedPoint(startPoint, { x, y });
            rect.setAttrs(rectAttrs);
            cb(rect);
        }, 2);
    });
};
// 矩形
const onRect = (stage, rect, themeType) => {
    if (!rect)
        return;
    const { width, height, x, y } = _.cloneDeep(rect.attrs);
    const shapeLayer = layer(stage, "thing");
    const createDefaultRect = defaultRect({ width, height, x, y }, themeType);
    createDefaultRect.name("selfShape");
    shapeLayer.add(createDefaultRect);
};
// custom text
const customText = (stage, startPoint, themeType) => {
    const text = createEditableText(stage, startPoint, themeType);
    text.on("transform", (e) => {
        text.setAttrs({ width: text.width() * text.scaleX(), scaleX: 1 });
    });
};
var setDrawState = (ie, cb) => {
    let rect;
    let line;
    let begin;
    const stage = ie.getStage();
    stage.on("mousedown", (e) => {
        const stage = ie.getStage();
        const drawState = ie.getDrawState();
        const { x, y } = computedXYByEvent(stage, e.evt);
        if (drawState === "dragStage")
            return;
        stage.setAttrs({
            draggable: false,
        });
        switch (drawState) {
            case "img":
                customAddImage(stage, e.evt, ie.drawInfo);
                break;
            case "rightAngleLine":
            case "rightAngleDottedLine":
            case "dottedLine":
            case "Line":
                if (e.target.className === "Image" ||
                    e.target.className === "Circle" ||
                    (e.target.className === "Rect" && e.target.name() !== "field")) {
                    begin = e.target;
                    line = beginCreateLine(ie, { x, y }, e, {
                        theme: ie.getTheme(),
                        drawState: ie.getDrawState(),
                    });
                }
                break;
            case "Text":
                customText(stage, { x, y }, ie.getTheme());
                break;
            case "editLine":
                editMouseDown(e, stage);
                break;
            case "Rect":
                if (e.target.getClassName() === "Stage" ||
                    e.target.name() === "field") {
                    onSelection(ie.getStage(), { y, x }, ie.getTheme(), (rc) => {
                        rect = rc;
                    });
                }
                else {
                    rect = null;
                }
                break;
            default:
                if (e.target.getClassName() === "Stage" ||
                    e.target.name() === "field") {
                    onSelection(ie.getStage(), { y, x }, ie.getTheme(), (rc) => {
                        rect = rc;
                        stage.attrs.drawState = "fieldSelect";
                    });
                }
                else {
                    rect = null;
                }
        }
    });
    stage.on("mouseup", (e) => {
        const stage = ie.getStage();
        const drawState = ie.getDrawState();
        cb ? cb() : null;
        switch (drawState) {
            case "Rect":
                onRect(stage, rect, ie.getTheme());
                break;
            case "editLine":
                if (checkKeepEdit(e)) {
                    lineMouseUp(e, stage);
                    stage.off("mousemove");
                    return;
                }
                else {
                    exitEditLine(stage);
                }
                break;
            case "rightAngleLine":
            case "rightAngleDottedLine":
            case "dottedLine":
            case "Line":
                if (line) {
                    finishLine(ie, begin, line, ie.getDrawState());
                    line = undefined;
                }
                showAnchor(stage, "hide");
                break;
            // if (rect) {
            // }
        }
        // 框选和单选冲突 特殊处理
        if (stage.attrs.drawState === "fieldSelect") {
            // rect未置空
            try {
                // 框选
                const nodes = getInclude(ie, rect);
                toSelect(ie, nodes, ie.selectCb);
            }
            catch (res) {
                console.log("选中暂不节流");
            }
            setTimeout(() => {
                stage.attrs.drawState = undefined;
            }, 300);
        }
        removeSelectionBox(stage);
        rect = null;
        offSelection(ie.getStage());
        ie.setDrawState("default");
    });
};

// 查询出需要辅助线计算的layer
const getLayerBySubLine = (ie) => {
    const stage = ie.getStage();
    const thing = layer(stage, "thing");
    const arr = [...thing.children];
    return arr;
};
// 当前对象的点
const getObjectSnappingEdges = (node) => {
    var box = node.getClientRect();
    return {
        vertical: [
            {
                guide: Math.round(box.x),
                offset: Math.round(node.x() - box.x),
                snap: "start",
            },
            {
                guide: Math.round(box.x + box.width / 2),
                offset: Math.round(node.x() - box.x - box.width / 2),
                snap: "center",
            },
            {
                guide: Math.round(box.x + box.width),
                offset: Math.round(node.x() - box.x - box.width),
                snap: "end",
            },
        ],
        horizontal: [
            {
                guide: Math.round(box.y),
                offset: Math.round(node.y() - box.y),
                snap: "start",
            },
            {
                guide: Math.round(box.y + box.height / 2),
                offset: Math.round(node.y() - box.y - box.height / 2),
                snap: "center",
            },
            {
                guide: Math.round(box.y + box.height),
                offset: Math.round(node.y() - box.y - box.height),
                snap: "end",
            },
        ],
    };
};
const getLineGuideStops = (stage, skipShape, arr) => {
    // we can snap to stage borders and the center of the stage
    const vertical = [0, stage.width() / 2, stage.width()];
    const horizontal = [0, stage.height() / 2, stage.height()];
    // and we snap over edges and center of each object on the canvas
    arr.forEach((guideItem) => {
        if (guideItem === skipShape) {
            return;
        }
        const box = guideItem.getClientRect();
        // and we can snap to all edges of shapes
        vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
        horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
    });
    return {
        vertical: vertical.flat(),
        horizontal: horizontal.flat(),
    };
};
const getGuides = (lineGuideStops, itemBounds) => {
    const resultV = [];
    const resultH = [];
    const GUIDELINE_OFFSET = 5;
    lineGuideStops.vertical.forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound) => {
            const diff = Math.abs(lineGuide - itemBound.guide);
            // if the distance between guild line and object snap point is close we can consider this for snapping
            if (diff < GUIDELINE_OFFSET) {
                resultV.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                });
            }
        });
    });
    lineGuideStops.horizontal.forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound) => {
            const diff = Math.abs(lineGuide - itemBound.guide);
            if (diff < GUIDELINE_OFFSET) {
                resultH.push({
                    lineGuide: lineGuide,
                    diff: diff,
                    snap: itemBound.snap,
                    offset: itemBound.offset,
                });
            }
        });
    });
    const guides = [];
    // find closest snap
    const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
    const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
    if (minV) {
        guides.push({
            lineGuide: minV.lineGuide,
            offset: minV.offset,
            orientation: "V",
            snap: minV.snap,
        });
    }
    if (minH) {
        guides.push({
            lineGuide: minH.lineGuide,
            offset: minH.offset,
            orientation: "H",
            snap: minH.snap,
        });
    }
    return guides;
};
const drawGuides = (ie, guides, layer, themeType) => {
    const stage = ie.getStage();
    guides.forEach((lg) => {
        if (lg.orientation === "H") {
            const { x, y } = computedXY(stage, 6000, lg.lineGuide);
            const line = createSubLine({
                points: [x, y, -x, y],
            }, themeType);
            layer.add(line);
        }
        else if (lg.orientation === "V") {
            const { x, y } = computedXY(stage, lg.lineGuide, -6000);
            const line = createSubLine({
                points: [x, y, x, -y],
            }, themeType);
            layer.add(line);
        }
        layer.batchDraw();
    });
};
const initSubLine = function (stage, e) {
    const layerSubLine = layer(stage, "util");
    const theme = this.getTheme();
    let target = e.target;
    getSubLine(layerSubLine, theme).forEach((item) => {
        item.destroy();
    });
    if (target === stage)
        return;
    target = stage.findOne("Transformer") || target;
    const useLayer = getLayerBySubLine(this);
    const lineGuideStops = getLineGuideStops(stage, target, useLayer);
    const itemBounds = getObjectSnappingEdges(target);
    const guides = getGuides(lineGuideStops, itemBounds);
    if (!guides.length) {
        return;
    }
    drawGuides(this, guides, layerSubLine, this.theme);
    // guides.forEach((lg) => {
    //   switch (lg.snap) {
    //     case "start": {
    //       switch (lg.orientation) {
    //         case "V": {
    //           target.x(lg.lineGuide + lg.offset);
    //           break;
    //         }
    //         case "H": {
    //           target.y(lg.lineGuide + lg.offset);
    //           break;
    //         }
    //       }
    //       break;
    //     }
    //     case "center": {
    //       switch (lg.orientation) {
    //         case "V": {
    //           target.x(lg.lineGuide + lg.offset);
    //           break;
    //         }
    //         case "H": {
    //           target.y(lg.lineGuide + lg.offset);
    //           break;
    //         }
    //       }
    //       break;
    //     }
    //     case "end": {
    //       switch (lg.orientation) {
    //         case "V": {
    //           target.x(lg.lineGuide + lg.offset);
    //           break;
    //         }
    //         case "H": {
    //           target.y(lg.lineGuide + lg.offset);
    //           break;
    //         }
    //       }
    //       break;
    //     }
    //   }
    // });
};
const closeSubLine = function () {
    const stage = this.getStage();
    const theme = this.getTheme();
    const layerSubLine = layer(stage, "util");
    getSubLine(layerSubLine, theme).forEach((item) => {
        item.destroy();
    });
    layerSubLine.batchDraw();
};

var onDrag = (ie, cb) => {
    const stage = ie.getStage();
    // 按下移动
    stage.on("dragmove", (e) => {
        if (e.target.name() === "field") {
            return;
        }
        // 启动辅助线
        if (getCustomAttrs(e.target).type !== "control") {
            initSubLine.bind(ie)(stage, e);
        }
        // 块关联线随动
        let target;
        if (e.target.nodeType === "Shape" ||
            e.target.nodeType === "Image" ||
            e.target.name() === "thingImage") {
            target = e.target;
        }
        else if (e.target.name() === "thingGroup") {
            target = e.target.children.find((ele) => ele.name() === "thingImage");
        }
        if (target) {
            dealRelation(target, ie.getStage());
        }
        if (e.target !== stage && e.target.getClassName() !== "Transformer") {
            const { nodes } = getTran(stage);
            if (nodes.length === 1 && nodes[0] !== e.target) {
                clearTransFormer(stage);
            }
        }
        cb ? cb() : null;
    });
    // 结束拖动
    stage.on("dragend", () => {
        // ie.historyArr[0] = stage.toJSON();
        stage.batchDraw();
        if (ie.historyArr.length >= 5) {
            ie.historyArr.shift();
        }
        ie.historyArr.push(stage.toJSON());
        // 关闭辅助线
        closeSubLine.bind(ie)();
    });
};

var onDbclick = (ie) => {
    const stage = ie.getStage();
    layer(stage, "line").on("dblclick", (e) => {
        if (e.target.className === "Arrow" || e.target.className === "Line") {
            ie.setDrawState("editLine");
            stage.setAttrs({ draggable: false });
            const editLine = e.target.parent.findOne(".line");
            enterEditLine(editLine, stage);
        }
    });
    // thing 内部双击事件
    layer(stage, "thing").on("dblclick", (e) => {
        const className = e.target.getClassName();
        if (className === "Text") {
            const { editable } = e.target.getAttrs();
            if (editable) {
                // 清除select
                clearTransFormer(ie.getStage());
                editorText(e.target, stage);
            }
        }
    });
};

var event = (ie) => {
    const container = ie.getContainer();
    ie.getStage();
    if (ie.opt.isPreview) {
        selectItem(ie);
        keyDown(ie);
    }
    else {
        setDrawState(ie);
        ondrop(ie, container);
        selectItem(ie);
        keyDown(ie);
        onDrag(ie);
        onDbclick(ie);
    }
    onwheel(ie);
};

var selectStage = (cb, e) => {
    cb("stage", { target: e.target });
};

var shapeText = (cb, e) => {
    let parent = e.target.getParent();
    if (parent.getClassName() === "Layer") {
        cb(e.target.getClassName(), {
            target: e.target,
            parent,
        }, {
            attrs: e.target.getAttrs(),
        });
    }
};

var isThingGroup = (cb, e) => {
    // thinggroup
    let parent = e.target.getParent();
    const data1 = getCustomAttrs(parent);
    const codeArr = [];
    const idArr = [];
    parent.find("Group").forEach((item) => {
        const data = getCustomAttrs(item);
        if (data.propertyId) {
            codeArr.push(data.propertyCode);
            idArr.push(data.propertyId);
        }
    });
    cb(e.target.className === "Arrow" || e.target.className === "Line"
        ? "line"
        : "thing", { parent, target: e.target }, { iu: data1.thing.iu, codes: codeArr, ids: idArr });
};

var thingImage = (cb, e) => {
    const thingImg = getParentThingImage(e.target);
    const thingImgParent = getParentThingGroup(e.target);
    const thingImgData = getCustomAttrs(thingImgParent);
    const codeArr = [];
    const idArr = [];
    thingImgParent.find("Group").forEach((item) => {
        const data = getCustomAttrs(item);
        if (data.propertyId) {
            codeArr.push(data.propertyCode);
            idArr.push(data.propertyId);
        }
    });
    cb("thing", { parent: thingImgParent, target: thingImg }, {
        iu: thingImgData.thing?.iu,
        codes: codeArr,
        ids: idArr,
    });
};

var selectThing = (cb, e) => {
    let parent = e.target.getParent();
    if (parent.getClassName() !== "Layer") {
        const name = parent.name();
        switch (name) {
            case "thingGroup":
                isThingGroup(cb, e);
                break;
            case "customImageGroup":
                cb("customImage", {
                    parent,
                    target: e.target,
                }, {});
                break;
            case "clip":
            case "thingImage":
                thingImage(cb, e);
                break;
            default:
                const selfParent = e.target.getParent();
                const thingData = getCustomAttrs(parent.getParent());
                const data = getCustomAttrs(parent);
                cb("thingText", { parent: selfParent, target: e.target }, {
                    iu: thingData.thing.iu,
                    codes: [data?.propertyCode],
                    ids: [data?.propertyId],
                });
        }
    }
};

const getIus = (group) => {
    let arr = [];
    try {
        arr = group
            .find("Group")
            .map((item) => item.getAttr("code"))
            .filter((item) => item);
    }
    catch (error) {
    }
    return arr;
};
var stageClick = (stage, cb) => {
    stage.on("click tap", (e) => {
        if (e.target !== stage) {
            // 如果是图形或者是文字，那么父级别肯定是layer
            let parent = e.target.getParent();
            // 如果是父级不是layer那就有可能是thing或者是thingText
            if (!parent)
                return;
            shapeText(cb, e);
            selectThing(cb, e);
        }
        else {
            selectStage(cb, e);
        }
    });
};

var changeTheme = (stage, themeType, callBack) => {
    // 修改thing 组的主题
    setThingGroupTheme(stage, themeType);
    // 可以由用户自己控制主题特定项目
    if (callBack)
        callBack(stage);
};

const findParents = (pid, stage) => {
    const arr = [];
    const node = stage.findOne("#" + pid);
    if (node?.hasName("thingImage")) {
        arr.push(node);
    }
    else {
        const lineInfo = getLineInfo(node);
        lineInfo.inLineIds.map((id) => {
            const line = stage.findOne("#" + id);
            const lineInfo = getLineInfo(line);
            arr.push(...findParents(lineInfo.from, stage));
        });
    }
    return arr;
};
const findChildren = (pid, stage) => {
    const arr = [];
    const node = stage.findOne("#" + pid);
    if (node?.hasName("thingImage")) {
        arr.push(node);
    }
    else {
        const lineInfo = getLineInfo(node);
        lineInfo?.outLineIds.map((id) => {
            const line = stage.findOne("#" + id);
            const lineInfo = getLineInfo(line);
            arr.push(...findParents(lineInfo.to, stage));
        });
    }
    return arr;
};
const getRelations = (stage) => {
    const arr = [];
    stage.find("Arrow").forEach((line) => {
        arr.push(...getRelation(line, stage));
    });
    return uniqWith(arr, isEqual);
};
const getRelation = (line, stage) => {
    const lineInfo = getLineInfo(line);
    const parents = findParents(lineInfo.from, stage);
    const children = findChildren(lineInfo.to, stage);
    let res = [];
    parents.forEach((p) => {
        children.forEach((c) => {
            res.push({
                instanceIdUp: p.parent.id(),
                instanceIdDown: c.parent.id(),
            });
        });
    });
    res = uniqWith(res, isEqual);
    return res;
};

var disableMove = (stage) => {
    function a(as) {
        for (let i of as.getChildren()) {
            const draggable = i.getAttr("draggable") || false;
            if (draggable) {
                i.draggable(false);
            }
            if (i.hasChildren()) {
                a(i);
            }
        }
    }
    a(stage);
    stage.draggable(false);
};

const FieldTheme = {
    light: {
        fill: "white",
        out: "#EFF2F6",
    },
    dark: {
        fill: "#1B2C55",
        out: "#dddddd",
    },
};

var initStage = (ie, json) => {
    const { id, isPreview } = ie.opt;
    let stage = ie.getStage();
    const dom = document.getElementById(id);
    const { offsetWidth, offsetHeight } = dom;
    const themeType = ie.getTheme();
    if (stage) {
        stage.destroy();
        keyDown(ie, false);
    }
    if (json) {
        stage = Konva.Node.create(json, id);
        stage.setAttrs({
            width: offsetWidth,
            height: offsetHeight,
            background: "#dddddd",
            draggable: isPreview ? false : true,
        });
        ie.setStage(stage);
    }
    else {
        stage = new Konva.Stage({
            container: id,
            width: 1920,
            height: 1080,
            draggable: false,
            background: "#dddddd",
        });
        ie.setStage(stage);
    }
    stage = ie.getStage();
    let container = stage.container();
    ie.setContainer(container);
    container.children[0].setAttribute("id", "myCanvas");
    container.tabIndex = 1;
    const color = isPreview
        ? FieldTheme[themeType].fill
        : thtmeInfo[themeType].background;
    container.setAttribute("style", `background: ${color}; position: relative;`);
    if (ie.opt.isPreview) {
        disableMove(ie.getStage());
    }
    // test(ie);
    // watchElement(id, (dm) => {
    //   stage.size({
    //     width: dm.offsetWidth,
    //     height: dm.offsetHeight,
    //   });
    // });
};

var stageTofit = (ie) => {
    const { id } = ie.opt;
    let stage = ie.getStage();
    const dom = document.getElementById(id);
    const { offsetWidth, offsetHeight } = dom;
    const field = stage?.find(".field")[0];
    const scale = offsetWidth / field?.attrs.width;
    stage?.scale({
        x: scale + 0.001,
        y: scale + 0.001,
    });
    stage?.position({
        x: field.x() * scale * -1 - 1,
        y: field.y() * scale * -1 - 1,
    });
};

var toImage = (stage, background) => {
    const canvas = stage.toCanvas();
    canvas.style.background = background;
    return canvas.toDataURL("image/png");
};

function pipeAni () {
    let animate;
    const sign = this.opt.direction === "obey" ? -1 : 1;
    const distance = getTotalDistance(this.opt.line.points());
    const init = (i) => {
        animate = new Konva.Tween({
            node: this.opt.line,
            dashOffset: (i += sign * distance),
            duration: (this.speed * distance) / 500,
            onFinish: () => {
                if (this.runState) {
                    init(i);
                }
                return false;
            },
        });
        animate.play();
    };
    this.start = () => {
        this.runState = true;
        if (animate) {
            animate.play();
        }
        else {
            init(0);
        }
    };
    this.stop = () => {
        this.runState = false;
        animate.pause();
    };
    this.destroy = () => {
        this.runState = false;
        animate.pause();
    };
}

function animDefault () {
    const info = getCustomAttrs(this.opt.line);
    if (info.lineInfo.type.toLowerCase().indexOf("dotted") === -1) {
        pipeAni.bind(this)();
        return;
    }
    this.animateEl = new Konva.Arrow(this.opt.line.getAttrs());
    this.animateLayer.add(this.animateEl);
    let animate;
    const sign = this.opt.direction === "obey" ? -1 : 1;
    const width = this.opt.line.getAttr("strokeWidth");
    const dash = this.opt.line.getAttr("dash");
    this.opt.line.setAttrs({
        // 透明度，没dom会报错
        // opacity: 0.5,
        strokeWidth: width * 2,
        dashEnabled: false,
    });
    this.opt.line.cache();
    this.opt.line.filters([Konva.Filters.HSL, Konva.Filters.Enhance]);
    if (this.opt.ie.getTheme() === "dark") {
        this.opt.line.luminance(-0.5);
        this.opt.line.saturation(-0.3);
    }
    else {
        this.opt.line.luminance(0.5);
        this.opt.line.saturation(0.3);
    }
    this.animateEl.setAttrs({
        strokeWidth: width * 0.8,
        dash: dash || [15, 8, 15, 8],
    });
    const distance = getTotalDistance(this.opt.line.points());
    const init = (i) => {
        animate = new Konva.Tween({
            node: this.animateEl,
            dashOffset: (i += sign * distance),
            duration: (this.speed * distance) / 500,
            onFinish: () => {
                if (this.runState) {
                    init(i);
                }
                return false;
            },
        });
        animate.play();
    };
    this.start = () => {
        this.animateEl.moveToTop();
        this.runState = true;
        if (animate) {
            animate.play();
        }
        else {
            init(0);
        }
    };
    this.stop = () => {
        this.runState = false;
        animate.pause();
    };
    this.destroy = () => {
        this.runState = false;
        animate.pause();
        this.opt.line.luminance(0);
        this.opt.line.saturation(0);
        this.opt.line.enhance(0);
        this.opt.line.setAttrs({
            strokeWidth: width,
            dashEnabled: true,
        });
        this.opt.line.clearCache();
        this.animateEl.destroy();
    };
}

function animDot () {
    const lineInfo = getLineInfo(this.opt.line);
    const width = this.opt.line.getAttr("strokeWidth");
    let animate;
    let points = JSON.parse(JSON.stringify(this.opt.line.points())) || [];
    const animLength = points.length / 2; // 线段运动次数
    const { distance } = computedDuration(points, this.speed);
    let { pointRes } = computedDuration(points, (this.speed * distance) / 500);
    if (this.opt.direction === "inverse") {
        pointRes.reverse();
    }
    const theme = this.opt.ie.getTheme();
    this.opt.line.setAttrs({
        stroke: aniLineState[theme][lineInfo.state],
        fill: aniLineState[theme][lineInfo.state],
        strokeWidth: width * 2,
    });
    this.animateEl = new Konva.Circle({
        radius: width,
        ...lineAni.dot[theme],
        fill: lineState[theme][lineInfo.state],
        x: points[0],
        y: points[1],
    });
    this.animateLayer.add(this.animateEl);
    const init = (index) => {
        const { x, y, duration } = pointRes[index];
        animate = new Konva.Tween({
            node: this.animateEl,
            x,
            y,
            duration,
            onFinish: () => {
                init(index < animLength - 1 ? (index += 1) : 0);
            },
        });
        animate.play();
    };
    this.start = () => {
        if (this.runState) {
            return;
        }
        this.runState = true;
        if (animate) {
            animate.play();
        }
        else {
            init(0);
        }
    };
    this.stop = () => {
        this.runState = false;
        animate.pause();
    };
    this.destroy = () => {
        this.runState = false;
        animate.pause();
        this.opt.line.setAttrs({
            stroke: lineState[theme][lineInfo.state],
            fill: lineState[theme][lineInfo.state],
            strokeWidth: width,
        });
        this.animateEl.remove();
    };
}

function animFlow () {
    const lineInfo = getLineInfo(this.opt.line);
    this.animateEl = new Konva.Arrow(this.opt.line.getAttrs());
    this.animateLayer.add(this.animateEl);
    let animate;
    const sign = this.opt.direction === "obey" ? 1 : -1;
    let points = JSON.parse(JSON.stringify(this.opt.line.points())) || [];
    const { distance } = computedDuration(points, this.speed);
    const theme = this.opt.ie.getTheme();
    const width = this.opt.line.getAttr("strokeWidth");
    this.opt.line.setAttrs({
        stroke: aniLineState[theme][lineInfo.state],
        fill: aniLineState[theme][lineInfo.state],
        strokeWidth: width * 2,
    });
    this.animateEl.setAttrs({
        ...lineAni.flow[theme],
        stroke: lineState[theme][lineInfo.state],
        fill: lineState[theme][lineInfo.state],
        dash: [distance],
        dashOffset: distance,
        strokeWidth: width,
    });
    const init = () => {
        animate = new Konva.Tween({
            node: this.animateEl,
            dashOffset: sign ? 0 : distance * sign,
            duration: (this.speed * distance) / 500,
            onFinish: () => {
                this.animateEl.setAttrs({ dashOffset: distance });
                init();
            },
        });
        animate.play();
    };
    this.start = () => {
        if (this.runState) {
            return;
        }
        this.runState = true;
        if (animate) {
            animate.play();
        }
        else {
            init();
        }
    };
    this.stop = () => {
        this.runState = false;
        animate.pause();
    };
    this.destroy = () => {
        this.runState = false;
        animate.pause();
        this.opt.line.setAttrs({
            stroke: lineState[theme][lineInfo.state],
            fill: lineState[theme][lineInfo.state],
            strokeWidth: width,
        });
        this.animateEl.remove();
    };
}

var LineAnimateType;
(function (LineAnimateType) {
    LineAnimateType[LineAnimateType["default"] = 0] = "default";
    LineAnimateType[LineAnimateType["flow"] = 1] = "flow";
    LineAnimateType[LineAnimateType["dot"] = 2] = "dot";
})(LineAnimateType || (LineAnimateType = {}));
class LineAnimate {
    constructor(opt) {
        this.opt = opt;
        this.speed = opt.speed || this.speed;
        this.init();
    }
    animateLayer;
    animateEl;
    start = () => { };
    stop = () => { };
    runState = false;
    destroy = () => { };
    opt;
    init() {
        this.reset();
    }
    speed = 5;
    resetAnimate = {
        default: animDefault.bind(this),
        flow: animFlow.bind(this),
        dot: animDot.bind(this),
    };
    reset() {
        const stage = this.opt.ie.getStage();
        this.animateLayer = layer(stage, "line");
        this.resetAnimate[this.opt.animateType || "default"]();
        this.start();
    }
}

var resetComponent = (ie) => {
    const thingLayer = layer(ie.getStage(), "thing");
    thingLayer.find(".thingImage").forEach((item) => {
        const { componentName } = item.getAttrs();
        const { thing } = getCustomAttrs(item.parent);
        if (componentName && componentName === "BELT") {
            ie.componentArr.push(new BELT(ie.getStage(), { thingInfo: thing }));
        }
        if (componentName && componentName === "Scraper") {
            ie.componentArr.push(new Scraper(ie.getStage(), { thingInfo: thing }));
        }
        if (componentName && componentName === "Technique") {
            new Technique(ie.getStage(), { thingInfo: thing });
        }
        if (componentName && componentName === "Pool") {
            const pool = ie.getComponent("Pool");
            pool.add(thing, undefined, item.parent);
        }
        if (componentName && componentName === "StoreHouse") {
            const storeHouse = ie.getComponent("StoreHouse");
            storeHouse.refreshImg(thing, item);
            storeHouse.add(thing, undefined, item.parent);
        }
        if (componentName && componentName === "VideoNode") {
            const video = ie.getComponent("VideoNode");
            video.add(thing, undefined, ie.opt.isPreview, item.parent);
        }
    });
};

var resetImg = async (stage) => {
    const imgArr = stage.find("Image");
    await Promise.all(imgArr.map((imageNode, index) => {
        return new Promise(async (resolve) => {
            if (imageNode.name() === "thingImage" ||
                imageNode.name() === "customImage" ||
                imageNode.parent.attrs.componentName === "Scraper") {
                const parent = imageNode.getParent();
                if (imageNode.name() === "thingImage") {
                    imageNode.attrs.src = getCustomAttrs(parent).thing.img;
                }
                if (parent.getAttrs().componentName === "video") {
                    resolve(1);
                }
                const attrs = imageNode.getAttrs();
                if (attrs.src) {
                    // imgArr[index] = await createImage(attrs.src);
                    const newImage = await createImage(attrs.src);
                    imageNode.remove();
                    newImage.setAttrs(attrs);
                    parent.add(newImage);
                }
            }
            // if (imageNode.parent?.parent?.attrs.componentName === "StoreHouse") {
            //   const parent = imageNode.getParent();
            //   imageNode.attrs.src = getCustomAttrs(
            //     parent.parent.parent
            //   ).thing.fullImg;
            //   const attrs = imageNode.getAttrs();
            //   if (attrs.src) {
            //     const newImage: Konva.Node | Event = await createImage(attrs.src);
            //     imageNode.remove();
            //     newImage.setAttrs(attrs);
            //     parent.add(newImage);
            //   }
            // }
            resolve(1);
        });
    }));
};

var resetText = async (stage) => {
    stage.find(".selfText").map((text) => {
        text.on("transform", (e) => {
            text.setAttrs({ width: text.width() * text.scaleX(), scaleX: 1 });
        });
    });
};

var reset = async (ie) => {
    const stage = ie.getStage();
    await resetImg(stage);
    resetLine(ie);
    resetText(stage);
    resetComponent(ie);
};

const setField = (ie) => {
    const lay = layer(ie.getStage(), "thing");
    const field = ie.getStage().find(".field")[0];
    const theme = ie.getTheme();
    if (!field) {
        const rect1 = new Konva.Rect({
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            name: "field",
            draggable: false,
            fill: FieldTheme[theme].fill,
            // stroke: "grey",
            // strokeWidth: 1,
        });
        // add the shape to the layer
        lay.add(rect1);
        rect1.moveToBottom();
    }
    else {
        field.setAttrs({ draggable: false });
        field.moveToBottom();
    }
};

const changeValFun = {};
changeValFun[groupNames.thingTextGroup] = obj$1.changeVal;
changeValFun[groupNames.thingInputGroup] = obj.changeVal;
changeValFun[groupNames.thingSwitchGroup] = switchText.changeVal;
changeValFun[groupNames.thingButtonGroup] = () => { };
const changeValFuns = changeValFun;

// 动态修改物模型的值
const setTextVal = (stage, iu, propertyId, val) => {
    // 查找物模型
    let thingGroup = stage.findOne(`#${iu}`);
    if (!thingGroup) {
        thingGroup = stage.findOne(`#line${iu}`);
    }
    // 筛选code
    thingGroup.children.forEach((textNode) => {
        const info = getCustomAttrs(textNode);
        if (info?.propertyId && info.propertyId === propertyId) {
            info.thingTextInfo.v = val;
            changeValFuns[textNode.name()](textNode, info.thingTextInfo);
        }
    });
};
const changeLabelState = (stage, iu, propertyId, state) => {
    // 查找物模型
    const thingGroup = (stage.findOne(`#${iu}`) ||
        stage.findOne(`#line${iu}`));
    if (!thingGroup)
        return;
    // 筛选code
    getThingTextGroup(thingGroup).forEach((textNode) => {
        const info = getCustomAttrs(textNode);
        if (info.propertyId && info.propertyId === propertyId) {
            const cdata = getCustomAttrs(textNode);
            // if (cdata.thingTextInfo.showLabel === state) return;
            cdata.thingTextInfo.showLabel = state;
            changeTextLabel(textNode, state);
        }
    });
};
// 重置文字元素
const resetTextEle = (ie, iu, propertyId, thingTextInfo, type) => {
    const stage = ie.getStage();
    // 查找物模型
    const thingGroup = (stage.findOne(`#${iu}`) ||
        stage.findOne(`#line${iu}`));
    if (!thingGroup)
        return;
    const util = createThingTexts(ie, iu, ie.getTheme());
    thingGroup.children.forEach((oldTextGroup) => {
        const info = getCustomAttrs(oldTextGroup);
        if (info?.propertyId && info.propertyId === propertyId) {
            info.thingTextInfo = thingTextInfo;
            const attr = oldTextGroup.attrs;
            if (attr.name === "thingDefTextGroup") {
                attr.x = attr.x + oldTextGroup.children[0].x();
                attr.y = attr.y + oldTextGroup.children[0].y();
                attr.scaleX = oldTextGroup.children[0].scaleX();
                attr.scaleY = oldTextGroup.children[0].scaleY();
            }
            attr.name = type;
            oldTextGroup.destroy();
            const textGroup = util.addText(info.thingTextInfo, attr.name, () => {
                if (!thingTextInfo.showLabel) {
                    changeLabelState(stage, iu, propertyId, false);
                }
            });
            textGroup.setAttrs(attr);
        }
    });
};
var SpecialCode$1;
(function (SpecialCode) {
    SpecialCode["all"] = "allOfThem";
})(SpecialCode$1 || (SpecialCode$1 = {}));
// 删除thing文字 allOfThem删除全部
const removeTextEle = (stage, iu, ids) => {
    // 查找物模型
    const thingGroup = (stage.findOne(`#${iu}`) ||
        stage.findOne(`#line${iu}`));
    if (!thingGroup)
        return;
    // 筛选code
    for (let i of ids) {
        thingGroup.children
            .find((ele) => {
            const info = getCustomAttrs(ele).thingTextInfo;
            return info?.id === i;
        })
            ?.remove();
    }
};

var SpecialCode;
(function (SpecialCode) {
    SpecialCode["all"] = "allOfThem";
})(SpecialCode || (SpecialCode = {}));
class INLEDITOR {
    constructor(opt) {
        // opt.isPreview = false;
        this.opt = opt;
    }
    async init(json) {
        initStage(this, json);
        // 留存设备画布，避免重复获取，提高性能
        this.thingLayer = layer(this.stage, "thing");
        this.thingLayer.setAttrs({ draggable: false });
        setField(this);
        this.event();
        new ComponentFac(this.stage);
        if (this.opt.scale === "show" && !this.opt.isPreview) {
            this.use(new Scale(this));
        }
        this.use(new Pool(this.stage));
        this.use(new StoreHouse(this.stage));
        this.use(new VideoNode(this.stage));
        this.onStageChange(this);
        if (json) {
            await reset(this);
            this.stage.attrs.drawState = "default";
        }
    }
    keyUp = (e) => {
        keyup(e, this);
    };
    keyDown = (e) => {
        keydown(e, this);
    };
    // 操作记录
    historyArr = [];
    // 设备图层
    thingLayer;
    // 皮带刮板组件集合
    componentArr = [];
    // 主题
    theme = "dark";
    getTheme() {
        return this.theme;
    }
    // 注册时间
    event() {
        event(this);
    }
    stage;
    getStage() {
        return this.stage || null;
    }
    setStage(c) {
        this.stage = c;
    }
    setField(stage, height, width) {
        const field = stage.find(".field")[0];
        field.setAttrs({
            height,
            width,
        });
    }
    container;
    getContainer() {
        return this.container || null;
    }
    setContainer(c) {
        this.container = c;
    }
    // 绘制状态
    drawState = "default";
    // 私有图片url或者虚线，间隔
    drawInfo;
    stateChangeCb;
    onDrawStateChange(cb) {
        this.stateChangeCb = cb;
    }
    getDrawState() {
        return this.drawState;
    }
    // 设置画状态
    setDrawState(state, info) {
        this.drawState = state;
        this.drawInfo = info;
        switch (state) {
            case "rightAngleLine":
            case "rightAngleDottedLine":
            case "dottedLine":
            case "Line":
                showAnchor(this.stage, "show");
                break;
        }
        this.stateChangeCb?.(state);
    }
    removeNode = (node) => {
        node.remove();
        node.children.forEach((ele) => {
            if (ele.name() === "thingImage") {
                removeRelevance(ele, this.stage);
            }
        });
    };
    disableStageMove() {
        disableMove(this.stage);
    }
    // 创建thing文字
    createLineGroup = (line, useThing) => {
        if (line.parent.name() === "thingGroup") {
            const group = line.parent;
            setCustomAttrs(group, { thing: useThing });
            group.id("line" + useThing.iu);
        }
        else {
            const group = createThingGroup(useThing, "line" + useThing.iu);
            group.setAttrs({ draggable: false });
            const lineLay = layer(this.stage, "line");
            lineLay.add(group);
            group.add(line);
            return group;
        }
    };
    // 创建thing文字
    createThingText = (iu, type) => {
        return createThingTexts(this, type === "thing" || type === undefined ? iu : type + iu, this.theme);
    };
    setComponentScale = (iu, scale) => {
        const thingGroup = this.stage.findOne("#" + iu);
        const thingImage = getThingImage(thingGroup);
        if (thingImage.attrs.componentName === "BELT") {
            setBeltScale(this, iu, thingGroup, scale);
        }
        else if (thingImage.attrs.componentName === "Scraper") {
            setScraperScale(this, iu, thingGroup, scale);
        }
    };
    // 修改主题
    changeTheme(themeType, cb) {
        this.theme = themeType;
        if (this.opt.isPreview) {
            this.container.style.background = FieldTheme[themeType].fill;
        }
        else {
            this.container.style.background = thtmeInfo[themeType].background;
        }
        const field = this.getStage().find(".field")[0];
        field.setAttrs({ fill: FieldTheme[themeType].fill });
        changeTheme(this.stage, themeType, cb);
    }
    // 动态修改物模型的值
    setVal(iu, propertyId, val) {
        setTextVal(this.stage, iu, propertyId, val);
    }
    changeLabel = (iu, propertyId, val) => {
        changeLabelState(this.stage, iu, propertyId, val);
    };
    resetText(iu, propertyId, info, type) {
        resetTextEle(this, iu, propertyId, info, type);
    }
    resetTexts = (arr) => {
        arr.forEach((ele) => {
            const { iu, propertyId, info, type } = ele;
            resetTextEle(this, iu, propertyId, info, type);
        });
    };
    removeText(iu, ids) {
        removeTextEle(this.stage, iu, ids);
    }
    // 获取画布上所有物模型的id
    getAllIus() {
        const thingLayer = layer(this.stage, "thing");
        thingLayer.draw();
        const ius = [];
        thingLayer.getChildren().forEach((e) => {
            if (e.hasName(groupNames.thingGroup)) {
                const { iu } = getCustomAttrs(e).thing;
                ius.push(iu);
            }
        });
        return ius;
    }
    //查询设备状态
    getThingState(iu) {
        const thingBox = this.thingLayer.findOne(`#${iu}`);
        const { state } = getCustomAttrs(thingBox);
        return state;
    }
    // 修改设备状态
    async setThingState(iu, setStateVal, src) {
        const thingBox = this.thingLayer.findOne(`#${iu}`);
        const image = thingBox?.findOne(".thingImage");
        const { state } = getCustomAttrs(thingBox);
        if (state === setStateVal)
            return;
        if (image.getClassName() !== "Image") {
            // 组件处理
            changeThingComponentState(this.stage, image, setStateVal);
        }
        else {
            const cData = getCustomAttrs(image.parent);
            cData.state = setStateVal;
            image ? await changeThingImage(image, src) : null;
        }
    }
    // 注册组件
    use(component) {
        useComponent(this, component);
    }
    getComponent(s) {
        return (this.components[s] ? this.components[s] : {});
    }
    // 序列化
    toJson(source) {
        if (source === "auto" && this.stage.findOne("Transformer")) {
            return { res: false };
        }
        exitEditLine(this.stage);
        resetEvent(this.stage);
        const json = this.stage.toJSON();
        return { mapJson: json, image: this.toImage() };
    }
    deleteAllPoint() {
        this.stage.find("Circle").forEach((point) => {
            point.remove();
        });
    }
    // 反序列化
    async loadJson(json, cb) {
        await this.init(json);
        cb ? cb() : "";
    }
    // 转换成图片
    toImage() {
        return toImage(this.stage, thtmeInfo[this.theme].background);
    }
    // 通过ID获取已选codes
    getCodeById(iu) {
        const thingGroup = this.stage.findOne("#" + iu);
        return getIus(thingGroup);
    }
    selectCb;
    // 当画布元素被选中
    onselect(cb) {
        this.selectCb = cb;
        stageClick(this.getStage(), cb);
    }
    // 获取所有关系
    getRelations() {
        return getRelations(this.stage);
    }
    // 获取关系
    getRelation(line) {
        return getRelation(line, this.stage);
    }
    // 修改线颜色，已弃用
    updateLineColor(key, line) {
        updateLineColor(key, line, this.theme);
    }
    // 新版修改线样式
    updateLineOption(line, key, option) {
        const info = getLineInfo(line);
        info.state = key;
        if (option.color) {
            line.setAttrs({
                pointerFill: option.color,
                stroke: option.color,
                fill: option.color,
            });
        }
        line.setAttrs({
            dash: option.dotted,
        });
    }
    // 适应画布
    toFit() {
        stageTofit(this);
    }
    hasChange = false;
    // 舞台发生变化
    onStageChange = (ie, cb) => {
        this.stage.on("resize scale rotate wheel dragmove mouseUp mousedown", (e) => {
            if (ie.getDrawState() === "default") {
                return;
            }
            this.hasChange = true;
            // cb();
        });
        this.stage.children.forEach((lay) => {
            lay.on("resize scale rotate wheel dragmove mousedown mouseup", () => {
                // cb();
                this.hasChange = true;
            });
        });
        this.container.addEventListener("keydown", () => {
            // cb();
            this.hasChange = true;
        });
        this.container.addEventListener("drop", () => {
            // cb();
            this.hasChange = true;
        });
    };
    changeElementsPosition(type) {
        changeElementsPosition(this.getStage(), type);
    }
    render(opt) {
        if (opt) {
            this.stage.setAttrs({
                width: opt.width,
                height: opt.height,
            });
            // if (
            //   this.getComponent<Scale>("scale") &&
            //   Object.keys(this.getComponent<Scale>("scale")).length !== 0
            // ) {
            //   this.getComponent<Scale>("scale").render();
            // }
        }
        this.stage.draw();
    }
}
const Animate = LineAnimate;

var drawCoal = (url) => {
    if (url) {
        return createImage(url);
    }
    else {
        return Promise.resolve(new Konva.Star({
            x: 0,
            y: 19,
            numPoints: 5,
            innerRadius: 2,
            outerRadius: 3,
            fill: "black",
            strokeWidth: 0,
        }));
    }
};

class COALANIM {
    constructor(opt) {
        const { autoPlay, stage, uuid, imgUrl, direction } = opt;
        this.autoPlay = autoPlay || false;
        this.stage = stage;
        this.init(autoPlay, uuid, imgUrl);
    }
    async init(autoPlay, uuid, imgUrl) {
        await this.reset(uuid, imgUrl);
        if (autoPlay) {
            this.start();
        }
    }
    movejl = 0;
    async reset(uuid, imgUrl) {
        this.cacheCoal = await drawCoal(imgUrl);
        this.cacheCoal.cache();
        const layerthing = layer(this.stage, "thing");
        this.animEl = layerthing.findOne(`#${uuid}`).findOne(".thingImage");
        if (!this.animEl) {
            return;
        }
        const backward = getCustomAttrs(this.animEl).backward;
        this.direction = backward ? "right" : "left";
        const { width, height } = this.animEl.getClientRect();
        const point = this.animEl.getAbsolutePosition();
        const { x, y } = computedXY(this.stage, point.x, point.y);
        const scale = this.stage.scaleX();
        this.animGroup = new Konva.Group({
            width: width / scale,
            height: height / scale,
            x,
            y: y - height / scale,
        });
        layerthing.add(this.animGroup);
        layerthing.draw();
        const state = getCustomAttrs(this.animEl).state;
        if (state === 1) {
            this.start();
        }
    }
    runState = false;
    start() {
        if (this.runState) {
            return;
        }
        this.runState = true;
        const { width } = this.animEl.getClientRect();
        const scale = this.stage.scaleX();
        this.movejl = width / scale - 30;
        this.tim = setInterval(() => {
            this.anim();
        }, 300);
    }
    stop() {
        this.runState = false;
        clearInterval(this.tim);
        this.animGroup.children.forEach((node) => {
            node.destroy();
        });
    }
    destroy() {
        this.stop();
        this.animGroup.destroy();
    }
    anim() {
        const node = this.cacheCoal.clone();
        this.animGroup.add(node);
        const { width } = this.animEl.getClientRect();
        const scale = this.stage.scaleX();
        node.setAttrs({
            width: 30,
            height: 14,
        });
        const right = width / scale - node.width();
        // 必须分两次赋值
        node.setAttrs({
            y: 25 - node.height(),
            x: this.direction === "left" ? 0 : right,
        });
        const tween = new Konva.Tween({
            node,
            // rotation: 360,
            duration: width / node.width() / scale / 3,
            x: this.direction === "left" ? right : 0,
        });
        tween.play();
        tween.onFinish = () => {
            tween.destroy();
            if (this.runState) {
                const hidek = new Konva.Tween({
                    node,
                    opacity: 0,
                    // x: movejl + 10,
                    // y: node.getAttr("y") + 3,
                    duration: 0.2,
                });
                hidek.play();
                hidek.onFinish = () => {
                    node.destroy();
                    hidek.destroy();
                    return false;
                };
            }
            return false;
        };
    }
}

export { Animate, BELT, COALANIM, ComponentFac, Pool, Scale, Scraper, StoreHouse, Technique, VideoNode, addLineText, addMapTitle, changeBeltState, changeState, componentsName, createThingDefaultText, INLEDITOR as default, defaultTheme, fileToBase64, getCustomAttrs, layer as getLayer, getLineInfo, getLineWidth, getMouseOver, getThingChildPosition, getThingImage, INLEDITOR as inleditor, isComponentChild, isComponentChildren, setBeltScale, setCustomAttrs, setLineWidth, setScraperScale, setText, setThingChildPosition, setThingScale, thtmeInfo };
