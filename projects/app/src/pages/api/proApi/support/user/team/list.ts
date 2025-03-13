import type { NextApiRequest } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { getTeamList } from '@fastgpt/service/support/user/team/controller';

async function handler(req: NextApiRequest) {
  const { userId } = req.query as {
    userId: string;
  };

  return getTeamList(userId);
}

export default NextAPI(handler);
