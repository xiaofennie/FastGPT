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

export type getHistoriesBody = PaginationProps<GetHistoriesProps>;

export type getHistoriesResponse = {};

async function handler(
  req: ApiRequestProps<getHistoriesBody, getHistoriesQuery>,
  res: ApiResponseType<any>
): Promise<PaginationResponse<getHistoriesResponse>> {
  const { appId, offset, pageSize } = req.body as getHistoriesBody;

  const [data, total] = await Promise.all([
    await MongoChat.find({ appId }, 'chatId title top customTitle appId updateTime')
      .sort({ top: -1, updateTime: -1 })
      .skip(offset)
      .limit(pageSize),
    MongoChat.countDocuments({ appId })
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
