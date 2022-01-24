import yargs from 'yargs';
import fs from 'fs';
import { hideBin } from 'yargs/helpers';
import express from 'express';
import chokidar from 'chokidar';

(async () => {
    const argv = await yargs(hideBin(process.argv))
        .option('url', {
            alias: 'u',
            describe: 'url to respond to',
            default: '/',
            type: 'string'
        })
        .option('bodyPath', {
            alias: 'b',
            describe: 'path to a file to load body from',
            default: null,
            type: 'string'
        })
        .option('method', {
            alias: 'm',
            describe: 'method to respond to',
            default: 'get',
            type: 'string'
        })
        .option('port', {
            alias: 'p',
            describe: 'port to listen on',
            type: 'number',
            default: 8000
        })
        .option('headers', {
            alias: 'h',
            describe: 'headers in format HEADER=VALUE',
            type: 'string',
            array: true
        })
        .option('regex', {
            alias: 'r',
            describe: 'is passed URL a regexp',
            type: 'boolean',
            default: false
        })
        .check((argv) => {
            switch (argv.method.toLowerCase()) {
                case 'get':
                case 'post':
                case 'put':
                case 'delete':
                case 'patch':
                case 'options':
                case 'head':
                    return true;
                default:
                    throw new Error('Invalid method passed.');
            }
        })
        .argv;

    let body: string | null = null;
    if (argv.bodyPath) {
        const path = argv.bodyPath;
        body = await fs.promises.readFile(path, 'utf-8');

        const watcher = chokidar.watch(path);
        watcher.on('change', async () => {
            console.log('Updated file');
            body = await fs.promises.readFile(path, 'utf-8');
        });
    }

    const app = express();
    const method = argv.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

    const headers: any = {};
    const rawHeaders = argv.headers;
    if (rawHeaders) {
        for (const header of rawHeaders) {
            const [name, value] = header.split('=');
            headers[name] = value;
        }
    }

    let url: string | RegExp;
    if (argv.regex) {
        url = new RegExp(eval(argv.url));
    } else {
        url = argv.url;
    }

    app[method](url, (_, res) => {
        for (const name in headers) {
            res.setHeader(name, headers[name]);
        }

        if (body) {
            res.send(body);
        } else {
            res.sendStatus(200);
        }
    });

    app.listen(argv.port);
    console.log(`listening for ${argv.method}:${argv.url} (regex: ${argv.regex}) on port ${argv.port}`);
})();
