import instance from "..";

/**
 * 获取图片列表
 */
export const getImageList = (params: any) =>
  instance.get("/appCenter/v1/getImages", { params });

/**
 * 新增图片
 */
export const insertImage = (data: any) =>
  instance.post("/appCenter/v1/saveImageItem", data);

/**
 * 删除图片
 */
export const deleteImage = (id: string | string[]) => {
  const ids = Array.isArray(id) ? id : [id];
  return instance.post("/appCenter/v1/removeImage", { idList: ids });
};
