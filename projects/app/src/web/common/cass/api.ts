import { GET, POST } from '@/web/common/api/request';

/**
 * 获取企微用户信息
 */
export const getCassWechatUserApi = (data: { appId: string; cassWechatCode: string }) =>
  POST<any>('/cass/wechat', data);
