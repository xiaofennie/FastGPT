import type { NextApiRequest } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { getTeamList } from '@fastgpt/service/support/user/team/controller';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';

async function handler(req: NextApiRequest) {
  const { userId } = await authUserPer({
    req,
    authToken: true,
    authApiKey: true
  });
  const { status } = req.query as {
    status: string;
  };

  return getTeamList(userId, status);
}

export default NextAPI(handler);
