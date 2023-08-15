import { Rule } from 'ant-design-vue/lib/form/interface';
import * as thingApis from '@/api/thingInstance';
import { reactive, ref, toRefs, watch, computed, ComputedRef } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import useTableList from './useTableList';
import _ from 'lodash';

export const reorder = (arr: any[]) => {
  arr.sort((a, b) => {
    return a.sort - b.sort;
  });
  const list = arr.filter((n) => n.sort === null);
  const newList = arr.filter((n) => n.sort !== null);
  return _.uniqWith([...newList, ...list], _.isEqual);
};

export default function useInstanceList(
  thingCode: ComputedRef<string>,
  callback?: Function,
  sorterTable = true
) {
  const isAllQueryOpts = ref<boolean>(false);
  const queryOpts = ref<any[]>([]);
  const columnData = ref<any>([]);
  const queryFormRef = ref();
  const thingInstQueryOrder: any = ref<any>({});
  const queryOptLen = computed(() => {
    let len = 4;
    const queryOptsLen = queryOpts.value.length;
    if (queryOptsLen <= 4) {
      len = queryOptsLen;
    } else {
      len = isAllQueryOpts.value ? queryOptsLen : 4;
    }
    return len;
  });
  const getList = async () => {
    if (!thingCode.value) {
      message.info('请先选择物模型');
      return;
    }
    //筛选列表筛选项的值
    const queryPropertyList = queryOpts.value
      .filter((el) => !_.isNil(el.value))
      .map((el) => {
        let item: {
          queryType?: string;
          propertyId: string;
          propertyCode: string;
          value?: string;
          value2?: string;
        } = {
          queryType: el.operation,
          propertyId: el.id,
          propertyCode: el.code,
        };
        if (el.displayType.indexOf('date') > -1) {
          const format =
            el.displayType == 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
          item.value = dayjs(el.value[0]).format(format);
          item.value2 = dayjs(el.value[1]).format(format);
          delete item.queryType;
        } else {
          item.value = el.value;
        }
        return item;
      });
    const param: any = {
      thingCode: thingCode.value,
      queryPropertyList,
      thingInstQueryOrder: thingInstQueryOrder.value,
    };
    const res: any = await thingApis.getInstanceList({
      ...param,
      pageNum: currPage.value,
      pageSize: pageSize.value,
    });
    const resObj: any = {
      columnData: [],
      data: [],
      totalNum: res.data?.total,
    };

    resObj.columnData = _.cloneDeep(columnData.value);

    resObj.columnData.push({
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    });
    if (res.data) {
      callback && callback(res.data);
      resObj.data = res.data.list;
    } else {
      resObj.data = [];
    }

    return resObj;
  };
  const {
    isLoading,
    columns,
    tableList,
    pagination,
    refresh,
    currPage,
    pageSize,
    handlePageChange,
  } = useTableList(getList, 'list', 'total');

  const reset = () => {
    queryOpts.value.forEach((ele) => {
      ele.value = '';
      ele.operation = 'LIKE';
    });
    refresh();
  };
  // 获取可查询项
  const getQueryColumn = (thingCode: string) => {
    thingApis.getQueryColumnByThingCode(thingCode).then((res) => {
      const data = res.data?.properties || [];
      queryOpts.value = data.map((ele) => {
        return {
          ...ele,
          operation: 'LIKE',
        };
      });
    });
  };
  // 获取表格列头项
  const getListPageTableColumn = (thingCode: string) => {
    thingApis.getListPageTableColumnByThingCode(thingCode).then((res) => {
      const data = res?.data || [];
      columnData.value = data.map((el) => {
        return {
          ...el,
          title: el.thingPropertyDisplayName,
          dataIndex: el.thingPropertyCode,
          key: el.thingPropertyCode,
          sorter: sorterTable,
        };
      });
      columnData.value = reorder(columnData.value);
    });
  };
  //实例表头排序
  const handleTableChange = (pagination, filters, sorter) => {
    const orderEnum = {
      ascend: 'asc',
      descend: 'desc',
    };
    if (!sorter.order) {
      thingInstQueryOrder.value = {};
    } else {
      thingInstQueryOrder.value = {
        thingProperCode: sorter.field,
        thingPropertyId: sorter.column.thingPropertyId,
        orderEnum: orderEnum[sorter.order],
      };
    }

    refresh();
  };

  return {
    isAllQueryOpts,
    queryOpts,
    thingInstQueryOrder,
    queryOptLen,
    getQueryColumn,
    getListPageTableColumn,
    handleTableChange,
    columnData,
    isLoading,
    columns,
    tableList,
    pagination,
    refresh,
    currPage,
    pageSize,
    reset,
    handlePageChange,
  };
}
