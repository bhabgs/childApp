import {
  defineComponent,
  computed,
  reactive,
  ref,
  onMounted,
  toRaw,
} from 'vue';
import industryApi from '@/api/industry';
import useTable from './hooks/useTable';
import { FormInstance, message } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { transformTime } from '@/utils/format';

import {
  Input,
  Form,
  FormItem,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Space,
} from 'ant-design-vue';

interface FormState {
  code: string;
  name: string;
}
interface ModalState {
  code: string;
  name: string;
  validEnable: boolean;
  remark: string;
  updateDt?: string;
  updateUser?: string;
  createUser?: string;
  createDt?: string;
  industryDescription?: string;
  id?: any;
}
const defaultModalState: ModalState = {
  code: '',
  industryDescription: '',
  name: '',
  remark: '',
  validEnable: true,
};
const column = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '编码',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '状态',
    dataIndex: 'validEnable',
    key: 'validEnable',
    slots: { customRender: 'validEnable' },
  },

  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    slots: { customRender: 'action' },
  },
];
function ModalPart() {
  const isNew = ref<boolean>(false);
  const visible = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const modalRef = reactive<{ modalState: ModalState }>({
    modalState: defaultModalState,
  });
  const compareCondition = (data: any) => {
    return industryApi.compareCondition(data);
  };
  const rulesRef = reactive({
    name: [
      {
        required: true,
        message: '请输入名称',
      },
      {
        validator: async (_rule: Rule, value: string) => {
          if (value.trim()) {
            const res = await compareCondition({
              name: value,
              id: modalRef.modalState.id || '0',
            });
            if (res.data) return Promise.reject('该名称已存在');
          }
          return Promise.resolve();
        },
        trigger: 'blur',
      },
    ],
    code: [
      {
        required: true,
        message: '请输入编码',
      },
      {
        validator: async (_rule: Rule, value: string) => {
          if (value.trim()) {
            const res = await compareCondition({
              code: value,
              id: modalRef.modalState.id || '0',
            });
            if (res.data) return Promise.reject('该编码已存在');
          }
          return Promise.resolve();
        },
        trigger: 'blur',
      },
    ],
    validEnable: [
      {
        required: true,
        message: '请选择',
      },
    ],
  });
  const showModal = (id: string, type: boolean) => {
    visible.value = true;
    isNew.value = type;
    formRef.value?.resetFields();
    getInfo(id);
  };
  const handleOk = (callback: () => void) => {
    formRef.value?.validate().then((res) => {
      const type: string = isNew.value ? 'create' : 'modify';
      industryApi.update(toRaw(modalRef.modalState), type).then(() => {
        visible.value = false;
        callback && callback();
      });
    });
  };
  const getInfo = (id?: string) => {
    if (!id) {
      modalRef.modalState = { ...defaultModalState };
      return;
    }
    industryApi.info(id).then((res) => {
      modalRef.modalState = res.data;
    });
  };

  return {
    visible,
    showModal,
    handleOk,
    isNew,
    modalRef,
    formRef,
    rulesRef,
  };
}
export default defineComponent({
  setup() {
    const formData = reactive<FormState>({
      code: '',
      name: '',
    });
    const { visible, showModal, handleOk, isNew, modalRef, formRef, rulesRef } =
      ModalPart();
    const {
      table,
      page,
      search,
      getList,
      pageChange,
      sizeChange,
      pageSizeOptions,
      defaultPageSize,
      showTotal,
    } = useTable(
      industryApi.getList,
      { data: toRaw(formData) },
      {
        list: 'list',
        total: 'total',
      }
    );
    const remove = (id: string) => {
      industryApi.remove(id).then(() => {
        getList();
        message.success('删除成功');
      });
      visible.value = false;
    };
    onMounted(() => {
      getList();
    });
    return () => (
      <div class='industryManager bg-fff'>
        <div class='option'>
          <Form wrapperCol={{ span: 16 }}>
            <Row gutter={24}>
              <Col span={6}>
                <FormItem label='名称' name='name'>
                  <Input
                    v-model={[formData.name, 'value']}
                    allowClear
                    autocomplete='off'
                  />
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem label='编码' name='code'>
                  <Input
                    v-model={[formData.code, 'value']}
                    allowClear
                    autocomplete='off'
                  />
                </FormItem>
              </Col>
              <Col span={6} offset={6} class='align-r'>
                <Button type='primary' onClick={search}>
                  查询
                </Button>
              </Col>
            </Row>
          </Form>
          <Button type='primary' onClick={() => showModal('', true)}>
            新增行业
          </Button>
        </div>
        <div class='mar-t-20'>
          <Table
            dataSource={table.list}
            columns={column}
            loading={table.loading}
            pagination={{
              ...page,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal,
              onChange: pageChange,
              onShowSizeChange: sizeChange,
              defaultPageSize,
              pageSizeOptions,
            }}
            v-slots={{
              action: ({ record }: any) => {
                return (
                  <Space>
                    <a onClick={() => showModal(record.id, false)}>编辑</a>
                    <a-popconfirm
                      title='确定要删除吗'
                      onConfirm={() => {
                        remove(record.id);
                      }}
                    >
                      <a>删除</a>
                    </a-popconfirm>
                  </Space>
                );
              },
              validEnable: ({ record, text }: any) => {
                return text ? (
                  <a-tag color='success'>生效</a-tag>
                ) : (
                  <a-tag color='default'>未生效</a-tag>
                );
              },
            }}
          />
        </div>
        <Modal
          v-model={[visible.value, 'visible']}
          title={isNew.value ? '新增行业' : '编辑行业'}
          onOk={() => handleOk(search)}
          width='400px'
          centered
        >
          <a-form
            ref={formRef}
            name='form'
            model={modalRef.modalState}
            rules={rulesRef}
            label-col={{ span: 6 }}
            wrapper-col={{ span: 16 }}
          >
            <a-form-item label='名称' name='name'>
              <a-input
                v-model={[modalRef.modalState.name, 'value']}
                autocomplete='off'
                maxlength={50}
              />
            </a-form-item>
            <a-form-item label='编码' name='code'>
              <a-input
                v-model={[modalRef.modalState.code, 'value']}
                disabled={!isNew.value}
                autocomplete='off'
                maxlength={50}
              />
            </a-form-item>
            <a-form-item label='是否生效' name='validEnable'>
              <a-switch
                v-model={[modalRef.modalState.validEnable, 'checked']}
              />
            </a-form-item>
            {!isNew.value ? (
              <div>
                <a-form-item label='创建人' name='createUser'>
                  <span>{modalRef.modalState.createUser || '--'}</span>
                </a-form-item>
                <a-form-item label='创建时间' name='createDt'>
                  <span>{transformTime(modalRef.modalState.createDt)}</span>
                </a-form-item>
                <a-form-item label='更新人' name='updateUser'>
                  <span>{modalRef.modalState.updateUser || '--'}</span>
                </a-form-item>
                <a-form-item label='更新时间' name='updateDt'>
                  <span>{transformTime(modalRef.modalState.updateDt)}</span>
                </a-form-item>
              </div>
            ) : null}

            <a-form-item label='备注' name='remark'>
              <a-textarea v-model={[modalRef.modalState.remark, 'value']} />
            </a-form-item>
          </a-form>
        </Modal>
      </div>
    );
  },
});
