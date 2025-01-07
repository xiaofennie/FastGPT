import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { jwtCassWeb } from '@/service/common/system/index';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { shareId } = req.query as { shareId?: string };
    const cookies = req.cookies;
    const security_context = cookies['security_context'];

    const webUserJwtToken = security_context ? jwtCassWeb(security_context) : '';

    let iframeUrl = '';

    if (shareId) {
      iframeUrl = `https://fastgpt-test.casstime.com/chat/share?shareId=${shareId}&cassWebAuthToken=${webUserJwtToken}`;
    }

    console.info('cassWebShareUrl', iframeUrl);

    res.setHeader('Content-Type', 'text/html');

    // 返回 HTML 内容
    res.send(`
    <!doctype html>
      <html>
        <head>
          <title>FASTGPT</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html,
            body {
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            .container {
              width: 100%;
              height: 100%;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <iframe src="${iframeUrl}"></iframe>
          </div>
        </body>
      </html>
  `);
  } catch (error) {
    console.log(error);
    jsonRes(res, {
      code: 500,
      error
    });
  }
}
