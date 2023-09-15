import { mkdirpSync, readJSONSync, writeJSONSync } from 'fs-extra';
import { google } from 'googleapis';
import { createServer } from 'http';
import { join, resolve } from 'path';
import { URL } from 'url';

const TOKEN_DIR_NAME = '.mznode';

export class GoogleAuthorizer {
  private readonly tokenDir: string;

  constructor(org: string, rootDir: string) {
    this.tokenDir = join(rootDir, TOKEN_DIR_NAME, org);
  }

  public authorize() {
    const clientSecret = readJSONSync(join(this.tokenDir, 'client-secret.json'), { encoding: 'utf-8' });
    const tokens = readJSONSync(join(this.tokenDir, 'tokens.json'), { encoding: 'utf-8' });

    const client = new google.auth.OAuth2(
      `${clientSecret.client_id}`,
      `${clientSecret.client_secret}`,
      'http://localhost:3000'
    );

    client.credentials = tokens;

    return client;
  }

  public saveToken(clientSecretPath: string) {
    const clientSecret = readJSONSync(resolve(clientSecretPath));
    const client = new google.auth.OAuth2(
      `${clientSecret.installed.client_id}`,
      `${clientSecret.installed.client_secret}`,
      'http://localhost:3000'
    );

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log(authUrl);

    const server = createServer(async (req, res) => {
      try {
        const qs = new URL(req.url || '', 'http://localhost:3000').searchParams;
        const code = qs.get('code');

        if (!code) {
          throw new Error(`Invalid code. ${code}`);
        }

        mkdirpSync(this.tokenDir);

        const tokenResponse = await client.getToken(code);
        {
          const savePath = join(this.tokenDir, 'client-secret.json');

          writeJSONSync(savePath, clientSecret.installed, { encoding: 'utf-8' });
          console.log(savePath);
        }
        {
          const savePath = join(this.tokenDir, 'tokens.json');

          writeJSONSync(savePath, tokenResponse.tokens, { encoding: 'utf-8' });
          console.log(savePath);
        }

        res.end('Success!');
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`${e}`);
      }

      server.close();
      process.exit(0);
    });

    server.listen(3000);
  }
}
