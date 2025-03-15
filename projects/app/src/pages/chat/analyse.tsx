import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react';
import { streamFetch } from '@/web/common/api/fetch';
import SideBar from '@/components/SideBar';
import { GPTMessages2Chats } from '@fastgpt/global/core/chat/adapt';

import ChatBox from '@/components/core/chat/ChatContainer/ChatBox/indexV2';
import type { StartChatFnProps } from '@/components/core/chat/ChatContainer/type';

import PageContainer from '@/components/PageContainer';
import ChatHeader from '@/pageComponents/chat/ChatHeaderV2';
import ChatHistorySlider from '@/pageComponents/chat/ChatHistorySliderV2';
import { serviceSideProps } from '@fastgpt/web/common/system/nextjs';
import { useTranslation } from 'next-i18next';
import { getInitOutLinkChatInfo } from '@/web/core/chat/api';
import { getChatTitleFromChatMessage } from '@fastgpt/global/core/chat/utils';
import { MongoApp } from '@fastgpt/service/core/app/schema';
import { addLog } from '@fastgpt/service/common/system/log';
import { connectToDatabase } from '@/service/mongo';
import NextHead from '@/components/common/NextHead';
import { useContextSelector } from 'use-context-selector';
import ChatContextProvider, { ChatContext } from '@/web/core/chat/context/chatContextV2';
import { GetChatTypeEnum } from '@/global/core/chat/constants';
import { useMount } from 'ahooks';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { getNanoid } from '@fastgpt/global/common/string/tools';

import dynamic from 'next/dynamic';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useShareChatStore } from '@/web/core/chat/storeShareChat';
import ChatItemContextProvider, { ChatItemContext } from '@/web/core/chat/context/chatItemContext';
import ChatRecordContextProvider, {
  ChatRecordContext
} from '@/web/core/chat/context/chatRecordContextV2';
import { useChatStore } from '@/web/core/chat/context/useChatStore';
import { ChatSourceEnum } from '@fastgpt/global/core/chat/constants';
import { useI18nLng } from '@fastgpt/web/hooks/useI18n';
import { AppSchema } from '@fastgpt/global/core/app/type';

import { AppTypeEnum } from '@fastgpt/global/core/app/constants';

const CustomPluginRunBox = dynamic(() => import('@/pageComponents/chat/CustomPluginRunBox'));

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
    showHistory = '1',
    showHead = '1',
    authToken,
    customUid,
    ...customVariables
  } = router.query as {
    shareId: string;
    showHistory: '0' | '1';
    showHead: '0' | '1';
    authToken: string;
    [key: string]: string;
  };
  const { isPc } = useSystem();
  const { outLinkAuthData, appId, chatId } = useChatStore();

  const isOpenSlider = useContextSelector(ChatContext, (v) => v.isOpenSlider);
  const onCloseSlider = useContextSelector(ChatContext, (v) => v.onCloseSlider);
  const forbidLoadChat = useContextSelector(ChatContext, (v) => v.forbidLoadChat);
  const onChangeChatId = useContextSelector(ChatContext, (v) => v.onChangeChatId);
  const onUpdateHistoryTitle = useContextSelector(ChatContext, (v) => v.onUpdateHistoryTitle);

  // const resetVariables = useContextSelector(ChatItemContext, (v) => v.resetVariables);
  const isPlugin = useContextSelector(ChatItemContext, (v) => v.isPlugin);
  const setChatBoxData = useContextSelector(ChatItemContext, (v) => v.setChatBoxData);

  const chatRecords = useContextSelector(ChatRecordContext, (v) => v.chatRecords);
  const totalRecordsCount = useContextSelector(ChatRecordContext, (v) => v.totalRecordsCount);
  const isChatRecordsLoaded = useContextSelector(ChatRecordContext, (v) => v.isChatRecordsLoaded);

  const initSign = useRef(false);
  const loading = false;

  useEffect(() => {
    setChatBoxData({
      appId: props.appId,
      title: props.appName,
      app: {
        chatConfig: {},
        name: props.appName,
        avatar: props.appAvatar,
        type: props.appType as AppTypeEnum,
        pluginInputs: [],
        chatModels: []
      }
    });
  }, []);

  useEffect(() => {
    if (initSign.current === false && isChatRecordsLoaded) {
      initSign.current = true;
      if (window !== top) {
        window.top?.postMessage({ type: 'shareChatReady' }, '*');
      }
    }
  }, [isChatRecordsLoaded]);

  // window init
  const [isEmbed, setIdEmbed] = useState(true);
  useMount(() => {
    setIdEmbed(window !== top);
  });

  const RenderHistoryList = useMemo(() => {
    const Children = (
      <ChatHistorySlider
        confirmClearText={t('common:core.chat.Confirm to clear share chat history')}
      />
    );

    if (showHistory !== '1') return null;

    return isPc ? (
      <SideBar>{Children}</SideBar>
    ) : (
      <Drawer
        isOpen={isOpenSlider}
        placement="left"
        autoFocus={false}
        size={'xs'}
        onClose={onCloseSlider}
      >
        <DrawerOverlay backgroundColor={'rgba(255,255,255,0.5)'} />
        <DrawerContent maxWidth={'75vw'} boxShadow={'2px 0 10px rgba(0,0,0,0.15)'}>
          {Children}
        </DrawerContent>
      </Drawer>
    );
  }, [isOpenSlider, isPc, onCloseSlider, showHistory, t]);

  return (
    <>
      <NextHead title={props.appName || 'AI'} desc={props.appIntro} icon={props.appAvatar} />
      <PageContainer
        isLoading={loading}
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
            {showHead === '1' ? (
              <ChatHeader
                history={chatRecords}
                totalRecordsCount={totalRecordsCount}
                showHistory={showHistory === '1'}
                appId={appId}
                chatId={chatId}
              />
            ) : null}
            {/* chat box */}
            <Box flex={1} bg={'white'}>
              {isPlugin ? (
                <CustomPluginRunBox
                  appId={appId}
                  chatId={chatId}
                  outLinkAuthData={outLinkAuthData}
                  onNewChat={() => onChangeChatId(getNanoid())}
                />
              ) : (
                <ChatBox
                  isReady={!loading}
                  appId={appId}
                  chatId={chatId}
                  outLinkAuthData={outLinkAuthData}
                  feedbackType={'user'}
                  chatType="log"
                  showRawSource={true}
                  showNodeStatus={true}
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
  const { appId } = props;
  const { source, chatId, setSource, setAppId } = useChatStore();
  const { setUserDefaultLng } = useI18nLng();

  const chatHistoryProviderParams = useMemo(() => {
    return { appId: props.appId };
  }, [props.appId]);

  const chatRecordProviderParams = useMemo(() => {
    return {
      appId,
      chatId,
      type: GetChatTypeEnum.outLink
    };
  }, [appId, chatId]);

  useMount(() => {
    setSource('share');
    setUserDefaultLng(true);
  });

  // Watch appId
  useEffect(() => {
    setAppId(appId);
  }, [appId, setAppId]);

  return source === ChatSourceEnum.share ? (
    <ChatContextProvider params={chatHistoryProviderParams}>
      {/* <ChatItemContextProvider> */}
      <ChatRecordContextProvider params={chatRecordProviderParams}>
        <OutLink {...props} />
      </ChatRecordContextProvider>
      {/* </ChatItemContextProvider> */}
    </ChatContextProvider>
  ) : (
    <NextHead title={props.appName} desc={props.appIntro} icon={props.appAvatar} />
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
