import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { teamId } = req.body as { teamId: string };

    if (!teamId) {
      throw new Error('teamId is required');
    }

    const { userId } = await authCert({ req, authToken: true });

    const user = await MongoUser.findOne({ _id: userId });

    const tmb = await MongoTeamMember.findOne({ userId, teamId });

    if (!tmb || !user) {
      throw new Error('team not exist');
    }

    const userDetail = await getUserDetail({ tmbId: tmb._id, userId });

    const token = createJWT({
      ...userDetail,
      isRoot: user.username === 'root'
    });

    setCookie(res, token);

    jsonRes(res, { data: 'success' });
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}
