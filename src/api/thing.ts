import { instance, createPath } from '.';

const path = createPath('/mtip/thing/v2/thing');

/**
 * 上传图片
 * @access http://192.168.5.66:3333/project/329/interface/api/10859
 * @param file 文件 {file}
 */
export const uploadImage = (file: File) => instance.post(path`uploadImage`, {file}, {
  headers: {
    'content-type': 'multipart/form-data',
  },
});

export const findTree = (rootThingCode: string) => instance.get(path`findTree`, {
  params: {
    'root_thing_code': rootThingCode,
  },
});
