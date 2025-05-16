import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import axios from 'axios';

type Props = {
  keyword: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { keyword } = req.query as Props;

  if (!keyword) {
    return {};
  }
  const userRes = await axios.post(
    `${process.env.CASS_CURRENT_URI}/api/v1/chat/completions`,
    {
      stream: false,
      detail: false,
      messages: [
        {
          content: keyword,
          role: 'user'
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.CASS_USER_ID_KEY
      }
    }
  );
  let userInfoJson = userRes.data.choices[0].message.content || '';
  let userInfo = JSON.parse(userInfoJson);
  return userInfo;
}

export default NextAPI(handler);
