/**
 * 基于ant上传组件自定义上传
 * options ant上传组件自定义上传回调值
 * callback 接口方法
 */
import { message } from 'ant-design-vue';
const headers: any = {
  'Content-Type': 'multipart/form-data',
};
export const customRequest = async (
  file: File,
  callback,
  outputERROR = false,
  abortPicture = null
) => {
  const fileData = new FormData();
  fileData.append('file', file as any);
  const hide = message.info('正在上传，请稍后');
  try {
    headers.abortPicture = abortPicture;
    const res = await callback(fileData, headers);
    hide();
    if (res.code === 'M0000') {
      message.success('上传成功');
      return res;
    } else {
      message.error('上传失败');
    }
  } catch (error) {
    hide();
    if (outputERROR) {
      message.error('导入失败');
      createDownAction(error, '错误信息.txt');
    }
  }
};

export const createDownAction = (res, filename) => {
  const blob = new Blob([res], {
    type: 'text/html;charset=UTF-8',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const exportException = (res: any, filename: string) => {
  let reader = new FileReader();
  reader.readAsText(res, 'utf-8');
  reader.onload = (e) => {
    try {
      const result = JSON.parse(reader.result as string);
      if (result.code && result.code === 'M5001') {
        message.error(result.message);
      }
      if (result.code && result.code === 'M4003') {
        // router.push('/login');
      }
    } catch (error) {
      createDownAction(res, filename);
    }
  };
};
