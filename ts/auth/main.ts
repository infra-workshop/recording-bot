import * as http from "http";

import {OAuth2ClientOptions} from "google-auth-library/build/src/auth/oauth2client";
import {google} from "googleapis";
import * as path from "path";
import {URL} from "url";
import * as fs from "fs";

const rootDir = path.join(__dirname, "../../");


export async function auth(options: OAuth2ClientOptions) {

    const client = new google.auth.OAuth2(
        Object.assign({}, options, {
            redirectUri: "http://localhost:3000"
        })
    );

    function saveRefresh_token(tokens: {refresh_token?: string}) {
        if (tokens.refresh_token) {
            console.log("refresh_token: "+  tokens.refresh_token);
            const tokensJson = JSON.parse(fs.readFileSync(path.join(rootDir, "resources/tokens.json"), "utf8"));
            tokensJson.google = tokensJson.google || {};
            tokensJson.google.refresh_token = tokens.refresh_token;
            fs.writeFileSync(path.join(rootDir, "resources/tokens.json"), JSON.stringify(tokensJson, null, '  '))
        }
    }

    const tokensJson = JSON.parse(fs.readFileSync(path.join(rootDir, "resources/tokens.json"), "utf8"));
    if (tokensJson.google && tokensJson.google.refresh_token) {
        client.setCredentials({
            refresh_token: tokensJson.google.refresh_token
        });
    } else {

        let setCode: (code: string) => void = () => {};
        let setCodeError: (error: any) => void = () => {};

        const server = http.createServer((req, res) => {
            const url = new URL("http://localhost:3000" + req.url);
            if (url.searchParams.has("code")) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('OK\n');
                setCode(url.searchParams.get("code"));
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Please Retry\n');
                setCodeError(new Error("not allowed"));
            }
        });
        server.listen(3000, () => console.log('Server http://localhost:3000'));

        const url = client.generateAuthUrl({
            scope: ["https://www.googleapis.com/auth/youtube.upload"],
            access_type: "offline",
        });

        console.log(`please access '${url}'`);

        const code = await new Promise<string>((resolve, reject) => {
            setCode = resolve;
            setCodeError = reject
        });
        console.log(`code: ${code}`);

        console.log(`server stopping`);

        server.close();


        const {tokens} = await client.getToken(code);


        console.log(`got token: ${Object.keys(tokens)}`);

        client.setCredentials(tokens);
        saveRefresh_token(tokens);
    }

    client.on('tokens', (tokens) => {
        saveRefresh_token(tokens);
    });

    return client;
}
