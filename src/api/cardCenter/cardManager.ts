import instance from "..";

/**
 * 获取卡片列表
 */
export const getCardList = (params: any) =>
  instance.get("/appCenter/v1/getControlInstItems", { params });

/**
 * 根据卡片id查详情
 */
export const getCardDetailById = (id: string) =>
  instance.get("/appCenter/v1/getAppControlInstById", {
    params: { id },
  });

/**
 * 根据id删除卡片
 */
export const deleteCardById = (id: string) =>
  instance.post("/appCenter/v1/removeControlInst", [id]);

/**
 * 新增保存卡片
 */
export const updateSaveCard = (data: any) =>
  instance.post("/appCenter/v1/saveAppControlInst", data);

/**
 * 获取角色下拉列表
 */
export const getRoleSelect = () => instance.get("/common/v1/role/all");

/**
 * 上传
 */
export const uploadThumbnail = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await instance.post(
    "/mtip/thing/v2/thing/uploadImage",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
