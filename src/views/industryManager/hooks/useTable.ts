import { reactive, toRaw } from 'vue';

interface Request {
  data: any;
  callback?: Function;
}
interface ResponseKeys {
  total: string;
  list: string;
}
const useTable = (
  httpFun: Function,
  request?: Request,
  responseKeys?: ResponseKeys,
  responseHandler?: Function
) => {
  const table = reactive<{
    loading: boolean;
    list: any[];
  }>({
    loading: false,
    list: [],
  });

  const page = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const getParams = () => {
    let params: any = {};
    if (request?.data) {
      params = { ...request.data };
    }
    params.pageNum = page.current;
    params.pageSize = page.pageSize;
    if (request?.callback) {
      Object.assign(params, request.callback(params));
    }

    return params;
  };

  const getList = async () => {
    table.loading = true;
    const params = getParams();

    try {
      const res: any = await httpFun(params);
      let list: any[] = [];
      if (res) {
        page.total = Number(res.data[responseKeys?.total || 'total']);
        list = res.data[responseKeys?.list || 'list'];
      }
      if (responseHandler) {
        table.list = responseHandler(list);
      } else {
        table.list = list;
      }
    } catch (error) {
      // console.log(error);
    }
    table.loading = false;
  };
  const search = () => {
    page.current = 1;
    getList();
  };
  const sizeChange = (current: number, size: number) => {
    page.current = 1;
    page.pageSize = size;
    search();
  };

  const pageChange = (current: number) => {
    page.current = current;
    getList();
  };
  const showTotal = (total: number) => {
    return `共${total}条`;
  };

  return {
    table,
    page,
    search,
    getList,
    pageChange,
    sizeChange,
    pageSizeOptions: ['10', '20', '50'],
    defaultPageSize: 10,
    showTotal,
  };
};
export default useTable;
