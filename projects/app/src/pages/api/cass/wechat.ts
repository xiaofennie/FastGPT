import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtCassWechat } from '@/service/common/system/index';
import { NextAPI } from '@/service/middleware/entry';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { appId, cassWechatCode } = req.body;

    if (!appId || !cassWechatCode) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('查询企微用户信息', appId, cassWechatCode);

    const result = await jwtCassWechat(appId, cassWechatCode);

    console.log('jwtCassWechat3', result);

    return {
      result
    };
  } catch (error) {
    console.error('企微认证失败:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default NextAPI(handler);
