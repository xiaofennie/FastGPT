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
  const userLoginId =
    variables.cassWebUserSub ||
    (variables.cassUserOrigin == 'USER_LOGIN_ID' && variables.cassUserId) ||
    (variables.cassUserType == 'USER_LOGIN_ID' && variables.cassUserId);
  const userNumber =
    variables.cassWechatUser ||
    (variables.cassUserOrigin == 'USER_NUMBER' && variables.cassUserId) ||
    (variables.cassUserType == 'USER_NUMBER' && variables.cassUserId);
  console.log(userLoginId, userNumber);

  if (userLoginId) {
    const userRes = await axios.post(
      `${process.env.CASS_CURRENT_URI}/api/v1/chat/completions`,
      {
        stream: false,
        detail: false,
        messages: [
          {
            content: userLoginId,
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
    let userInfoJson = userRes.data.choices[0].message.content || '';
    let userInfo = JSON.parse(userInfoJson);
    return userInfo;
  } else if (userNumber) {
    const userRes = await axios.post(
      `${process.env.CASS_CURRENT_URI}/api/v1/chat/completions`,
      {
        stream: false,
        detail: false,
        messages: [
          {
            content: userNumber,
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
