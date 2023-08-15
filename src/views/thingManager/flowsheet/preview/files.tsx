import { defineComponent, onMounted, ref } from 'vue';
import { toLower, includes } from 'lodash';
import { message } from 'ant-design-vue';
import { getThingInstFiles, downloadThingInstFile } from '@/api/thingInst';
import { exportException } from '../../thingInstance/util/upload';

export default defineComponent({
  props: {
    thingInstData: {
      type: Object,
      default: null,
    },
    thingPropertyId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const fileList = ref([]);
    const pagerCurrent = ref(1);
    const pagerTotal = ref(0);
    const pageSize = 5;
    const getFileList = () => {
      getThingInstFiles({
        thingCode: props.thingInstData.thingCode,
        thingInstId: props.thingInstData.id,
        thingPropertyId: props.thingPropertyId,
      }, {
        pageNum: pagerCurrent.value,
        pageSize,
      }).then(({ data }) => {
        const { list, total } = data;
        fileList.value = list;
        pagerTotal.value = total;
      });
    };
    const onPagerChange = (current) => {
      pagerCurrent.value = current;
      getFileList();
    };
    onMounted(() => {
      getFileList();
    });
    const getIconByFilename = (fileName) => {
      let suffix = '';
      const re = fileName.match(/\.(\w+)$/);
      if (re) {
        suffix = toLower(re[1]);
      }
      if (includes(['doc', 'docx'], suffix)) {
        return 'icon-Word';
      }
      if (includes(['xls', 'xlsx'], suffix)) {
        return 'icon-Excel';
      }
      if (includes(['bmp', 'jpg', 'jpeg', 'png', 'gif'], suffix)) {
        return 'icon-tupian';
      }
      if (suffix === 'pdf') {
        return 'icon-PDF';
      }
      if (includes(['ppt', 'pptx'], suffix)) {
        return 'icon-PPT';
      }
      if (includes(['zip', 'rar'], suffix)) {
        return 'icon-yasuobao';
      }
      if (suffix === 'dwg') {
        return 'icon-CAD1';
      }
      return 'icon-qita';
    };
    const download = (id, name) => {
      downloadThingInstFile(id).then((res) => {
        message.success('下载成功');
        exportException(res, name);
      });
    };
    return () => fileList.value.length ? (
      <div class="topo-preview-files">
        <div class="topo-preview-files-list">
          {fileList.value.map(({ id, name }) => (
            <div class="topo-preview-files-item">
              <icon-font class="topo-preview-files-icon" type={getIconByFilename(name)}></icon-font>
              <span class="topo-preview-files-name" title={name}>{name}</span>
              <a-button type="link" onClick={() => download(id, name)}>下载</a-button>
            </div>
          ))}
        </div>
        <div class="topo-preview-files-pager">
          <a-pagination
            class="tar"
            v-model:current={pagerCurrent.value}
            page-size={pageSize}
            total={pagerTotal.value}
            onChange={onPagerChange}
          ></a-pagination>
        </div>
      </div>
    ) : (
      <a-empty></a-empty>
    );
  },
});
