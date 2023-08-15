import { defineComponent, ref, onMounted, reactive } from 'vue';

import { useRoute, useRouter } from 'vue-router';

import '@/assets/style/pages/thingManager/thingInstance/DetailOrEdit.less';

import ThingDetail from './ThingDetail';
import EditThing from './EditThing2';

export default defineComponent({
  name: 'DetailOrEdit',
  emits: ['close'],
  setup(props, { emit }) {
    const canEdit: any = ref(true);
    const thing = reactive<{
      id: string;
      model: string;
      rootThingCode: string;
    }>({
      id: '',
      model: '',
      rootThingCode: '',
    });

    const route = useRoute();
    const router = useRouter();
    const { thingInfo } = route?.query;
    thing.id = route?.params?.id as string;
    if (thingInfo) {
      const thingInfoObj = JSON.parse(thingInfo as any);
      thing.model = thingInfoObj.model;
      thing.rootThingCode = thingInfoObj.rootThingCode;
      canEdit.value = thingInfoObj.isEdit;
    }

    onMounted(() => {});

    return () => (
      <div class='DetailOrEdit'>
        {canEdit.value ? (
          <EditThing
            thingId={thing.id}
            thingModel={thing.model}
            onChangeEdit={(data: any) => {
              if (thing.id === 'new') {
                emit('close');
                if (data) {
                  thing.id = data.thingInstId;
                  router.push({
                    name: 'DetailOrEdit',
                    params: { id: data.thingInstId },
                    query: {
                      name: `物实例 (${data.thingInstName})`,
                      thingInfo: JSON.stringify({
                        model: thing.model,
                        isEdit: false,
                      }),
                    },
                  });
                  canEdit.value = false;
                } else {
                  router.push(
                    `/mtip-developer-center/thingManager/thingInstanceManager/thingInstance/${thing.rootThingCode}?code=${thing.model}`
                  );
                }
              } else {
                canEdit.value = false;
              }
            }}
          />
        ) : (
          <ThingDetail
            thingId={thing.id}
            thingModel={thing.model}
            onChangeEdit={() => {
              canEdit.value = true;
            }}
          />
        )}
      </div>
    );
  },
});
