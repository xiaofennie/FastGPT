import { Avatar, Box, Flex } from '@chakra-ui/react';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/web/support/user/useUserStore';
import { getTeamList, putSwitchTeam } from '@/web/support/user/team/api';
import { TeamTmbItemType } from '@fastgpt/global/support/user/team/type.d';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useRouter } from 'next/router';

const TeamSelector = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { userInfo, initUserInfo } = useUserStore();
  const [teamList, setTeamList] = useState<TeamTmbItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo?._id) return;
    getTeamList(userInfo?._id)
      .then((list) => {
        console.log(userInfo);
        setTeamList(list);
      })
      .catch((err) => {
        toast({
          title: '获取团队列表失败',
          status: 'error'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const list = teamList.map((team) => ({
    label: (
      <Flex alignItems={'center'}>
        <Box>{(team.teamId as any).name}</Box>
      </Flex>
    ),
    value: (team.teamId as any)._id
  }));

  const handleTeamChange = async (val: string) => {
    console.log(val);
    try {
      await putSwitchTeam(val);
      await initUserInfo();
      toast({
        title: '切换团队成功',
        status: 'success'
      });
    } catch (err) {
      toast({
        title: '切换团队失败',
        status: 'error'
      });
    }
  };

  return (
    <MySelect
      value={userInfo?.team?.teamId}
      list={list}
      onchange={handleTeamChange}
      placeholder="选择团队"
    />
  );
};

export default TeamSelector;
