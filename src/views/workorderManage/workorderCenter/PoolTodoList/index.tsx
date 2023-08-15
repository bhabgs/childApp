import {
  defineComponent,
  onMounted,
  ref,
  reactive,
  watch,
  nextTick,
} from "vue";
import { message } from "ant-design-vue";

import AddWorkorder from "./AddWorkorder";
import EditWorkorder from "./EditWorkorder";

import WorkorderTable from "@/views/workorderManage/components/WorkorderTable";

export default defineComponent({
  setup(props, context) {
    onMounted(() => {});

    const showAdd = ref(false);
    const showEdit = ref(false);
    const currentRow = ref();

    const showSelect = ref(false);
    const selectedRows = ref([]);

    const cancelBatch = () => {
      showSelect.value = false;
      selectedRows.value = [];
    };

    const slots = {
      btnLine: () => (
        <>
          <div class="flex" style="gap:8px">
            <a-button
              type="primary"
              onClick={() => {
                showAdd.value = true;
              }}
            >
              新建
            </a-button>

            {!showSelect.value && (
              <a-button
                onClick={() => {
                  showSelect.value = true;
                }}
                disabled
              >
                批量审批
              </a-button>
            )}
          </div>

          {showSelect.value && (
            <div class="batchLine flex-center">
              <a-space>
                <span>已勾选：{selectedRows.value.length}个</span>
                <a-button
                  type="primary"
                  ghost
                  onClick={() => {
                    if (selectedRows.value.length) {
                      // toStopRefuse({
                      //   taskDefKey: "batch",
                      //   taskName: "批量审批",
                      //   disAgreeButton: "拒绝",
                      // });
                    } else {
                      message.error("请选择");
                    }
                  }}
                >
                  拒绝
                </a-button>

                <a-button
                  type="primary"
                  ghost
                  onClick={() => {
                    if (selectedRows.value.length) {
                      // toStopAgree({
                      //   taskDefKey: "batch",
                      //   taskName: "批量审批",
                      //   agreeButton: "同意",
                      // });
                    } else {
                      message.error("请选择");
                    }
                  }}
                >
                  同意
                </a-button>

                <a-button type="link" onClick={cancelBatch}>
                  取消批量审批
                </a-button>
              </a-space>
            </div>
          )}
        </>
      ),
      tableBtns: (record: any) => (
        <div class="operation flex">
          <div v-show={false}>
            <a-button type="link" size="small" onClick={() => {}}>
              编辑
            </a-button>

            <a-button type="link" size="small" onClick={() => {}}>
              通过
            </a-button>

            <a-button type="link" size="small" onClick={() => {}}>
              驳回
            </a-button>
          </div>

          <a-button
            type="link"
            size="small"
            onClick={() => {
              currentRow.value = record;
              showEdit.value = true;
            }}
          >
            查看
          </a-button>

          {/* <a-popconfirm
        title="确认强制关闭？"
        onConfirm={() => {
          del(record);
        }}
      >
        <a-button type="link" size="small">
          强制关闭
        </a-button>
      </a-popconfirm> */}
        </div>
      ),
    };

    const workorderTableRef = ref();

    return () => (
      <div class="PoolTodoList">
        <WorkorderTable
          ref={workorderTableRef}
          apiName="poolsToDoTaskList"
          v-slots={slots}
          showSelect={showSelect.value}
          onChangeSelect={(rows) => {
            selectedRows.value = rows;
          }}
        />

        <AddWorkorder
          v-models={[[showAdd.value, "showAdd"]]}
          onRefresh={workorderTableRef.value?.refresh}
        />

        <EditWorkorder
          v-models={[[showEdit.value, "showEdit"]]}
          currentRow={currentRow.value}
          onRefresh={workorderTableRef.value?.refresh}
        />
      </div>
    );
  },
});
