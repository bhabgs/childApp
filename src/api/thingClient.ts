import { instance, createPath } from '.';

const path = createPath('/mtip/thing/v2/thingClient');

export const getPropertiesValueById = (data) => instance.post(path`getPropertiesValueById`, data);

export const getIuPcNameList = (data) => instance.post(path`getIuPcNameList`, data);
