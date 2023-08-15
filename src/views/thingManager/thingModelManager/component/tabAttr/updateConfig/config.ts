interface displayTypeI {
  label: string;
  value: string;
  range?: string[];
}

interface selectOptsI {
  key: string;
  name: string;
  tip?: string;
}
export const displayTypes: displayTypeI[] = [
  {
    label: '文本[text]',
    value: 'text',
    range: ['property', 'logic', 'metric'],
  },
  {
    label: '文本域[textarea]',
    value: 'textarea',
    range: ['property', 'logic', 'metric'],
  },
  {
    label: '数字[number]',
    value: 'number',
    range: ['property'],
  },
  {
    label: '日期[date]',
    value: 'date',
    range: ['property'],
  },
  {
    label: '日期时间[datetime]',
    value: 'datetime',
    range: ['property'],
  },
  {
    label: '下拉列表[select]',
    value: 'select',
    range: ['property', 'logic'],
  },
  {
    label: '级联下拉列表[select_atomic]',
    value: 'select_atomic',
    range: ['property', 'logic'],
  },
  {
    label: '下拉树[select_tree]',
    value: 'select_tree',
  },
  {
    label: '下发按钮[button_status]',
    value: 'button_status',
    range: ['property', 'logic'],
  },
  {
    label: '带参数的下发按钮[button_parameter]',
    value: 'button_parameter',
  },
  {
    label: '表格[table]',
    value: 'table',
  },
  {
    label: '开关[switch]',
    value: 'switch',
  },
  {
    label: '文件[file]',
    value: 'file',
  },
  {
    label: '烽火报警[alarm]',
    value: 'alarm',
  },
  {
    label: '嵌入页面[iframe]',
    value: 'iframe',
  },
  {
    label: '信号灯[signal]',
    value: 'signal',
  },
];

// TEXT("text","文本"),
// TEXTAREA("textarea","文本域"),
// SELECT("select","下拉框"),
// SELECT_ATOMIC("select_atomic","级联拉框"),
// SELECT_TREE("select_tree","属性下拉框"),
// NUMBER("number","数值"),
// DATE("date","日期"),
// DATETIME("datetime","日期时间"),
// TABLE("table","表格"),
// LABEL("label","标签"),
// SWITCH("switch","开关"),
// SIGNAL("signal","信号灯"),
// FILE("file","文件"),
// BUTTON_STATUS("button_status","下发按钮"),
// BUTTON_PARAMETER("button_parameter","带参数的下发按钮"),
// ALARM("alarm","烽火报警"),
export const signalListShow = {
  alarm: [
    {
      text: '一级报警，数据：1',
      color: 'red',
    },
    {
      text: '二级报警，数据：2',
      color: 'orange',
    },
    {
      text: '三级报警，数据：3',
      color: 'yellow',
    },
    {
      text: '四级报警，数据：4',
      color: 'blue',
    },
    {
      text: '无报警，数据：null',
      color: 'green',
    },
    {
      text: '未配置报警规',
      color: '',
    },
  ],
  device_state: [
    {
      text: '正常，数据：0',
      color: 'green',
    },
    {
      text: '故障，数据：1',
      color: 'red',
    },
    {
      text: '上电，数据：2',
      color: 'blue',
    },
    {
      text: '待机，数据：4',
      color: 'gray',
    },
    {
      text: '无，数据：nul',
      color: '',
    },
  ],
  system_state: [
    {
      text: '运行，数据：0',
      color: 'green',
    },
    {
      text: '故障，数据：1',
      color: 'red',
    },
    {
      text: '未运行，数据：2',
      color: 'blue',
    },
    {
      text: '无，数据：nul',
      color: '',
    },
  ],
};
export const propertyTypes: selectOptsI[] = [
  {
    key: 'property',
    name: '基本信息',
    tip: '基本信息为存储物理表已有字段，如：名称、长度、设备额定处理量等',
  },
  {
    key: 'metric',
    name: '采集数据',
    tip: '采集数据为设备状态类属性，需采集数据，如：电流、温度等',
  },
  {
    key: 'logic',
    name: '逻辑计算',
    tip: '需要通过逻辑计算获得的属性，如：生产系统启动状态等',
  },
  {
    key: 'action',
    name: '设备控制',
    tip: '执行动作类，即可直接下发的属性，如：集控启动、集控停止等',
  },
  {
    key: 'relation',
    name: '关系属性',
    tip: '为了显示关联关系中列表显示的目的，如：系统包含设备，设备关联相机',
  },
  {
    key: 'parameter',
    name: '下发参数',
    tip: '需要带参数的下发，如：设定密度、设定压力等',
  },
  {
    key: 'setting',
    name: '设定参数',
    tip: '需要关心下发是否执行成功，如不成功需要做处理，例如温度设定等',
  },
  {
    key: 'alarm',
    name: '报警属性',
    tip: 'PLC报警+软件报警，来源于烽火报警',
  },
];
export const detailGroupTypes: selectOptsI[] = [
  {
    key: 'BASIC_INFO',
    name: '基本信息',
  },
  {
    key: 'STATUS_INFO',
    name: '状态信息',
  },
  {
    key: 'RUN_INFO',
    name: '运行信息',
  },
  {
    key: 'ALARM_INFO',
    name: '报警信息',
  },
  {
    key: 'USE_INFO',
    name: '使用信息',
  },
  {
    key: 'RELATION_INFO',
    name: '关联关系',
  },
];
//     NE("!=","不等于"),
//     GT(">","大于"),
//     GTE(">=","大于等于"),
//     LT("<","小于"),
//     LTE("<=","小于等于"),
//     NULL("==null","为空"),
//     NOT_NULL("!=null","不为空");
export const valueConvertFormulaTypeEnums: selectOptsI[] = [
  {
    name: '等于',
    key: 'EQ',
  },
  {
    name: '不等于',
    key: 'NE',
  },
  {
    name: '大于',
    key: 'GT',
  },
  {
    name: '大于等于',
    key: 'GTE',
  },
  {
    name: '小于',
    key: 'LT',
  },
  {
    name: '小于等于',
    key: 'LTE',
  },
  {
    name: '为空',
    key: 'NULL',
  },
  {
    name: '不为空',
    key: 'NOT_NULL',
  },
];

export const validateFn = (formRef: any, module: string) => {
  return () => {
    return new Promise((resolve, reject) => {
      formRef.value
        .validate()
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject({
            ...err,
            module,
          });
        });
    });
  }
};
