import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react';
// import { streamFetch } from '@/web/common/api/fetch';
import SideBar from '@/components/SideBar';
// import { GPTMessages2Chats } from '@fastgpt/global/core/chat/adapt';

import ChatBox from '@/components/core/chat/ChatContainer/ChatBox';
// import type { StartChatFnProps } from '@/components/core/chat/ChatContainer/type';

import PageContainer from '@/components/PageContainer';
import ChatHeader from './components/ChatHeader';
import ChatHistorySliderV2 from './components/ChatHistorySliderV2';
import { serviceSideProps } from '@/web/common/utils/i18n';
import { useTranslation } from 'next-i18next';
// import { delChatRecordById, getInitOutLinkChatInfo } from '@/web/core/chat/api';
// import { getChatTitleFromChatMessage } from '@fastgpt/global/core/chat/utils';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { AppSchema } from '@fastgpt/global/core/app/type';
import { addLog } from '@fastgpt/service/common/system/log';
import { connectToDatabase } from '@/service/mongo';
import NextHead from '@/components/common/NextHead';
// import { useContextSelector } from 'use-context-selector';
import ChatContextProvider, { ChatContext } from '@/web/core/chat/context/chatContextV2';
// import { InitChatResponse } from '@/global/core/chat/api';
// import { defaultChatData, GetChatTypeEnum } from '@/global/core/chat/constants';
import { useMount } from 'ahooks';
// import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { useChatV2 } from '@/components/core/chat/ChatContainer/useChatV2';
// import { getNanoid } from '@fastgpt/global/common/string/tools';

import dynamic from 'next/dynamic';
// import { useSystem } from '@fastgpt/web/hooks/useSystem';
const CustomPluginRunBox = dynamic(() => import('./components/CustomPluginRunBox'));

type Props = {
  appName: string;
  appIntro: string;
  appAvatar: string;
  appId: string;
  appType: string;
};

const OutLink = (props: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    shareId = '',
    chatId = '',
    showHistory = '1',
    showHead = '1',
    authToken,
    ...customVariables
  } = router.query as {
    shareId: string;
    chatId: string;
    showHistory: '0' | '1';
    showHead: '0' | '1';
    authToken: string;
    [key: string]: string;
  };

  const [isEmbed, setIdEmbed] = useState(true);

  const chatData = {
    appId: props.appId,
    app: {
      name: props.appName,
      avatar: props.appAvatar,
      intro: props.appIntro,
      type: props.appType
    }
  };

  // const {
  //   onUpdateHistoryTitle,
  //   onUpdateHistory,
  //   onClearHistories,
  //   onDelHistory,
  //   isOpenSlider,
  //   onCloseSlider,
  //   forbidLoadChat,
  //   onChangeChatId
  // } = useContextSelector(ChatContext, (v) => v);

  const params = useMemo(() => {
    return {
      chatId,
      appId: chatData.appId
    };
  }, [chatData.appId, chatId]);

  const {
    ChatBoxRef,
    variablesForm,
    pluginRunTab,
    setPluginRunTab,
    resetVariables,
    chatRecords,
    ScrollData,
    setChatRecords,
    totalRecordsCount
  } = useChatV2(params);

  // window init
  useMount(() => {
    setIdEmbed(window !== top);
  });

  const RenderHistoryList = useMemo(() => {
    const Children = (
      <ChatHistorySliderV2
        appName={chatData.app.name}
        appAvatar={chatData.app.avatar}
        confirmClearText={t('common:core.chat.Confirm to clear share chat history')}
        onDelHistory={() => {}}
        onClearHistory={() => {}}
        // onSetHistoryTop={(e) => {
        //   onUpdateHistory({
        //     ...e,
        //     appId: chatData.appId,
        //     shareId,
        //     outLinkUid
        //   });
        // }}
        // onSetCustomTitle={(e) => {
        //   onUpdateHistory({
        //     appId: chatData.appId,
        //     chatId: e.chatId,
        //     customTitle: e.title,
        //     shareId,
        //     outLinkUid
        //   });
        // }}
      />
    );

    if (showHistory !== '1') return null;

    return <SideBar>{Children}</SideBar>;
  }, [chatData.app.avatar, chatData.app.name, showHistory, t]);

  return (
    <>
      <PageContainer
        {...(isEmbed
          ? { p: '0 !important', insertProps: { borderRadius: '0', boxShadow: 'none' } }
          : { p: [0, 5] })}
      >
        <Flex h={'100%'} flexDirection={['column', 'row']}>
          {RenderHistoryList}

          {/* chat container */}
          <Flex
            position={'relative'}
            h={[0, '100%']}
            w={['100%', 0]}
            flex={'1 0 0'}
            flexDirection={'column'}
          >
            {/* header */}
            {/* {showHead === '1' ? (
              <ChatHeader
                chatData={chatData}
                history={chatRecords}
                totalRecordsCount={totalRecordsCount}
                showHistory={showHistory === '1'}
              />
            ) : null} */}
            {/* chat box */}
            <Box flex={1} bg={'white'}>
              {chatData.app.type === AppTypeEnum.plugin ? (
                <CustomPluginRunBox
                  pluginInputs={[]}
                  variablesForm={variablesForm}
                  histories={chatRecords}
                  setHistories={setChatRecords}
                  appId={chatData.appId}
                  tab={pluginRunTab}
                  setTab={setPluginRunTab}
                  // onNewChat={() => onChangeChatId(getNanoid())}
                />
              ) : (
                <ChatBox
                  ScrollData={ScrollData}
                  ref={ChatBoxRef}
                  chatHistories={chatRecords}
                  setChatHistories={setChatRecords}
                  variablesForm={variablesForm}
                  appAvatar={chatData.app.avatar}
                  userAvatar="/imgs/avatar/BrightBlueAvatar.svg"
                  // chatConfig={chatData.app?.chatConfig}
                  feedbackType={'user'}
                  // onDelMessage={({ contentId }) =>
                  //   delChatRecordById({
                  //     contentId,
                  //     appId: chatData.appId,
                  //     chatId,
                  //     shareId,
                  //     outLinkUid
                  //   })
                  // }
                  appId={chatData.appId}
                  chatId={chatId}
                  // shareId={shareId}
                  // outLinkUid={outLinkUid}
                />
              )}
            </Box>
          </Flex>
        </Flex>
      </PageContainer>
    </>
  );
};

const Render = (props: Props) => {
  const contextParams = useMemo(() => {
    return { appId: props.appId };
  }, [props.appId]);

  return (
    <>
      <NextHead title={props.appName || 'AI'} desc={props.appIntro} icon={props.appAvatar} />
      <ChatContextProvider params={contextParams}>
        <OutLink {...props} />;
      </ChatContextProvider>
    </>
  );
};

export default React.memo(Render);

export async function getServerSideProps(context: any) {
  const appId = context?.query?.appId || '';

  const app = await (async () => {
    try {
      await connectToDatabase();
      const app = (await MongoApp.findOne(
        {
          _id: appId
        },
        'name avatar intro type'
      ).lean()) as AppSchema;

      console.log('app', app);

      return app;
    } catch (error) {
      addLog.error('getServerSideProps', error);
      return undefined;
    }
  })();

  return {
    props: {
      appName: app?.name ?? 'name',
      appAvatar: app?.avatar ?? '',
      appIntro: app?.intro ?? 'intro',
      appId: appId ?? '',
      appType: app?.type ?? '',
      ...(await serviceSideProps(context, ['file', 'app', 'chat', 'workflow']))
    }
  };
}
