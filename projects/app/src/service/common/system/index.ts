import { initHttpAgent } from '@fastgpt/service/common/middle/httpAgent';
import fs, { existsSync } from 'fs';
import type { FastGPTFeConfigsType } from '@fastgpt/global/common/system/types/index.d';
import type { FastGPTConfigFileType } from '@fastgpt/global/common/system/types/index.d';
import { getFastGPTConfigFromDB } from '@fastgpt/service/common/system/config/controller';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';
import { isProduction } from '@fastgpt/global/common/system/constants';
import { initFastGPTConfig } from '@fastgpt/service/common/system/tools';
import json5 from 'json5';
import { defaultGroup, defaultTemplateTypes } from '@fastgpt/web/core/workflow/constants';
import { MongoPluginGroups } from '@fastgpt/service/core/app/plugin/pluginGroupSchema';
import { MongoTemplateTypes } from '@fastgpt/service/core/app/templates/templateTypeSchema';
import { loadSystemModels } from '@fastgpt/service/core/ai/config/utils';

import jwt, { JwtPayload } from 'jsonwebtoken';
import { addLog } from '@fastgpt/service/common/system/log';
import { connectToDatabase } from '@/service/mongo';
import { connectionMongo } from '@fastgpt/service/common/mongo';
import axios from 'axios';

export const readConfigData = async (name: string) => {
  const splitName = name.split('.');
  const devName = `${splitName[0]}.local.${splitName[1]}`;

  const filename = (() => {
    if (!isProduction) {
      // check local file exists
      const hasLocalFile = existsSync(`data/${devName}`);
      if (hasLocalFile) {
        return `data/${devName}`;
      }
      return `data/${name}`;
    }
    // production path
    return `/app/data/${name}`;
  })();

  const content = await fs.promises.readFile(filename, 'utf-8');

  return content;
};

/* Init global variables */
export function initGlobalVariables() {
  if (global.communityPlugins) return;

  global.communityPlugins = [];
  global.qaQueueLen = global.qaQueueLen ?? 0;
  global.vectorQueueLen = global.vectorQueueLen ?? 0;
  initHttpAgent();
}

/* Init system data(Need to connected db). It only needs to run once */
export async function getInitConfig() {
  return Promise.all([initSystemConfig(), getSystemVersion(), loadSystemModels()]);
}

const defaultFeConfigs: FastGPTFeConfigsType = {
  show_emptyChat: false,
  show_git: false,
  docUrl: '',
  openAPIDocUrl: '',
  systemPluginCourseUrl: 'https://fael3z0zfze.feishu.cn/wiki/ERZnw9R26iRRG0kXZRec6WL9nwh',
  appTemplateCourse:
    'https://fael3z0zfze.feishu.cn/wiki/CX9wwMGyEi5TL6koiLYcg7U0nWb?fromScene=spaceOverview',
  systemTitle: 'Nebula AI',
  concatMd: '',
  limit: {
    exportDatasetLimitMinutes: 0,
    websiteSyncLimitMinuted: 0
  },
  scripts: [],
  favicon: '/favicon.ico',
  uploadFileMaxSize: 500
};

export async function initSystemConfig() {
  // load config
  const [{ config: dbConfig }, fileConfig] = await Promise.all([
    getFastGPTConfigFromDB(),
    readConfigData('config.json')
  ]);
  const fileRes = json5.parse(fileConfig) as FastGPTConfigFileType;

  // get config from database
  const config: FastGPTConfigFileType = {
    feConfigs: {
      ...fileRes?.feConfigs,
      ...defaultFeConfigs,
      ...(dbConfig.feConfigs || {}),
      isPlus: !!FastGPTProUrl,
      show_aiproxy: !!process.env.AIPROXY_API_ENDPOINT
    },
    systemEnv: {
      ...fileRes.systemEnv,
      ...(dbConfig.systemEnv || {})
    },
    subPlans: dbConfig.subPlans || fileRes.subPlans
  };

  // set config
  initFastGPTConfig(config);

  console.log({
    feConfigs: global.feConfigs,
    systemEnv: global.systemEnv,
    subPlans: global.subPlans
  });
}

async function getSystemVersion() {
  if (global.systemVersion) return;
  try {
    if (process.env.NODE_ENV === 'development') {
      global.systemVersion = process.env.npm_package_version || '0.0.0';
    } else {
      const packageJson = json5.parse(await fs.promises.readFile('/app/package.json', 'utf-8'));

      global.systemVersion = packageJson?.version;
    }
    console.log(`System Version: ${global.systemVersion}`);
  } catch (error) {
    console.log(error);

    global.systemVersion = '0.0.0';
  }
}

export async function initSystemPluginGroups() {
  try {
    const { groupOrder, ...restDefaultGroup } = defaultGroup;
    await MongoPluginGroups.updateOne(
      {
        groupId: defaultGroup.groupId
      },
      {
        $set: restDefaultGroup
      },
      {
        upsert: true
      }
    );
  } catch (error) {
    console.error('Error initializing system plugins:', error);
  }
}

export async function initAppTemplateTypes() {
  try {
    await Promise.all(
      defaultTemplateTypes.map((templateType) => {
        const { typeOrder, ...rest } = templateType;

        return MongoTemplateTypes.updateOne(
          {
            typeId: templateType.typeId
          },
          {
            $set: rest
          },
          {
            upsert: true
          }
        );
      })
    );
  } catch (error) {
    console.error('Error initializing system templates:', error);
  }
}

export function jwtCassWeb(token: string): JwtPayload | string | null {
  try {
    const publicKey = process.env.CASS_WEB_JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');
    if (!publicKey) {
      return null;
    }
    // 验证签名
    const verifyJwt = jwt.verify(token, publicKey!, {
      algorithms: ['RS256'],
      ignoreExpiration: true
    }) as JwtPayload;
    if (verifyJwt) {
      const decoded = jwt.decode(token);
      const jwtSecret = process.env.USER_JWT_SECRET;

      if (!jwtSecret) {
        addLog.error('jwtCassWeb failed: jwtSecret is empty');
        return null;
      }

      if (decoded && decoded.sub) {
        const cassWebToken = jwt.sign(
          {
            sub: decoded.sub // sub 是 JWT 标准字段，用于存储主体
          },
          jwtSecret
        );
        return cassWebToken;
      }
      addLog.error('jwtCassWeb failed: decoded.sub is empty', decoded);
      return null;
    } else {
      return null;
    }
  } catch (error) {
    addLog.error('jwtCassWeb failed:', error);
    return null;
  }
}

export function jwtCassWechat(appId: string | undefined, code: String) {
  return new Promise(async (resolve) => {
    if (!appId) {
      addLog.error('jwtCassWechat: appId为空');
      resolve(null);
    }

    await connectToDatabase();

    // 获取数据库实例
    const db = connectionMongo.connection.db;

    // 获取集合
    const collection = db.collection('casscorpsecret');

    const result = await collection.findOne({ appId });

    if (!result) {
      addLog.error('jwtCassWechat error: casscorpsecret找不到appId', appId);
      resolve(null);
    }

    const corpsecret = result?.corpsecret;

    const accessTokenRes = await axios.get(`
      https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wx34b4ed8f75c6657a&corpsecret=${corpsecret}`);

    const accessToken = accessTokenRes?.data?.access_token;

    // console.info('jwtCassWechat accessToken', accessToken);

    const userInfoRes = await axios.get(
      `https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo?access_token=${accessToken}&code=${code}`
    );

    // console.info('jwtCassWechat userInfoRes', userInfoRes?.data);

    const jwtSecret = process.env.USER_JWT_SECRET;

    if (!jwtSecret) {
      addLog.error('jwtCassWechat error: USER_JWT_SECRET为空');
      resolve(null);
    }

    if (jwtSecret && userInfoRes?.data.userid) {
      const cass_wechat_token = jwt.sign(
        {
          sub: userInfoRes?.data.userid // sub 是 JWT 标准字段，用于存储主体
        },
        jwtSecret
      );
      resolve(cass_wechat_token);
    } else {
      addLog.error('jwtCassWechat error: userInfoRes?.data.userid为空', userInfoRes?.data);
      resolve(null);
    }
  });
}

export function parseCassJwt(token: string) {
  return new Promise((resolve) => {
    const key = process.env.USER_JWT_SECRET as string;

    jwt.verify(token, key, function (err: any, decoded: any) {
      if (!err) {
        resolve(decoded.sub || '');
      } else {
        resolve('');
      }
    });
  });
}

export function parseCassAppJwt(token: string) {
  return new Promise((resolve) => {
    const key = process.env.CASS_APP_JWT_PUBLIC_KEY as string;
    console.log('cassAppJwt', key, token);

    jwt.verify(token, key, function (err: any, decoded: any) {
      console.log('cassAppJwt1', decoded);
      if (!err) {
        resolve(decoded.userLoginId || '');
      } else {
        resolve('');
      }
    });
  });
}
