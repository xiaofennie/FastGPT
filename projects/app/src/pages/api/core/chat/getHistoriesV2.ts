import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import { ChatSourceEnum } from '@fastgpt/global/core/chat/constants';
import { authOutLink } from '@/service/support/permission/auth/outLink';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { authTeamSpaceToken } from '@/service/support/permission/auth/team';
import { NextAPI } from '@/service/middleware/entry';
import { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { PaginationProps, PaginationResponse } from '@fastgpt/web/common/fetch/type';
import { GetHistoriesProps } from '@/global/core/chat/api';
export type getHistoriesQuery = {};

export type getHistoriesBody = PaginationProps<GetHistoriesProps> & { keyword?: string };

export type getHistoriesResponse = {};

async function handler(
  req: ApiRequestProps<getHistoriesBody, getHistoriesQuery>,
  res: ApiResponseType<any>
): Promise<PaginationResponse<getHistoriesResponse>> {
  const { appId, offset, pageSize, keyword } = req.body as getHistoriesBody;

  // 构建查询条件
  const queryCondition: any = { appId };

  // 只有当keyword有值时才添加搜索条件
  if (keyword) {
    queryCondition.$or = [{ title: { $regex: keyword, $options: 'i' } }];
  }

  const [data, total] = await Promise.all([
    await MongoChat.find(queryCondition, 'chatId title top customTitle appId updateTime')
      .sort({ top: -1, updateTime: -1 })
      .skip(Number(offset))
      .limit(Number(pageSize)),
    MongoChat.countDocuments(queryCondition)
  ]);

  return {
    list: data.map((item) => ({
      chatId: item.chatId,
      updateTime: item.updateTime,
      appId: item.appId,
      customTitle: item.customTitle,
      title: item.title,
      top: item.top
    })),
    total
  };
}
export default NextAPI(handler);
