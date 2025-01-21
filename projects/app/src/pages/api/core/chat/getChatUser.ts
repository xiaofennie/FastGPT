import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import axios from 'axios';

type Props = {
  appId: string;
  chatId: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { appId, chatId } = req.query as Props;

  if (!appId || !chatId) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数'
    });
  }

  const result = await MongoChat.findOne({ appId, chatId }, 'variables');
  const variables = result?.variables || {};

  if (variables.cassWebUserSub) {
    const userRes = await axios.post(
      `${process.env.CASS_CURRENT_URI}/api/v1/chat/completions`,
      {
        stream: false,
        detail: false,
        messages: [
          {
            content: variables.cassWebUserSub,
            role: 'user'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.CASS_SUB_USER_KEY
        }
      }
    );
    console.log(
      '1',
      process.env.CASS_SUB_USER_KEY,
      variables.cassWebUserSub,
      userRes.data.choices[0].message
    );
    let userInfoJson = userRes.data.choices[0].message.content || '';
    let userInfo = JSON.parse(userInfoJson);
    return userInfo;
  } else if (variables.cassWechatUser) {
    const userRes = await axios.post(
      `${process.env.CASS_CURRENT_URI}/api/v1/chat/completions`,
      {
        stream: false,
        detail: false,
        messages: [
          {
            content: variables.cassWechatUser,
            role: 'user'
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.CASS_USER_KEY
        }
      }
    );
    let userInfoJson = userRes.data.choices[0].message.content || '';
    let userInfo = JSON.parse(userInfoJson);
    return userInfo;
  }
  return {};
}

export default NextAPI(handler);
