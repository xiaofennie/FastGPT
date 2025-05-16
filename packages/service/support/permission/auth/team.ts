import { MongoTeamMember } from '../../user/team/teamMemberSchema';
import { MongoTeam } from '../../user/team/teamSchema';
import { checkTeamAIPoints } from '../teamLimit';
import { type UserModelSchema } from '@fastgpt/global/support/user/type';
import { type TeamSchema } from '@fastgpt/global/support/user/team/type';
import { TeamErrEnum } from '@fastgpt/global/common/error/code/team';

export async function getUserChatInfoAndAuthTeamPoints(tmbId: string, teamId?: string) {
  const tmb = await MongoTeamMember.findById(tmbId, 'userId teamId')
    .populate<{ user: UserModelSchema; team: TeamSchema }>([
      {
        path: 'user',
        select: 'timezone'
      },
      {
        path: 'team',
        select: 'openaiAccount externalWorkflowVariables'
      }
    ])
    .lean();

  if (!tmb && !teamId) return Promise.reject(TeamErrEnum.notUser);

  // 检查团队AI积分
  // if (tmb) await checkTeamAIPoints(tmb.team._id);

  let teamInfo = null;
  if (!tmb) {
    console.error('tmbId不存在', tmbId);
    teamInfo = await MongoTeam.findById(teamId, 'openaiAccount externalWorkflowVariables').lean();
  }

  return {
    timezone: tmb?.user.timezone ?? 'Asia/Shanghai',
    externalProvider: {
      openaiAccount: tmb?.team.openaiAccount ?? teamInfo?.openaiAccount,
      externalWorkflowVariables:
        tmb?.team.externalWorkflowVariables ?? teamInfo?.externalWorkflowVariables
    }
  };
}
