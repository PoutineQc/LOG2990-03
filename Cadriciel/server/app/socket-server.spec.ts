import { expect } from 'chai';
import * as http from 'http';
import * as express from 'express';

import { SocketServer } from './socket-server';

const TEST_PORT = 3001;
let app: express.Application;
let server: http.Server;

describe('#SocketServer', () => {
    before(() => {
        app = express();
        server = http.createServer(app);
        server.listen(TEST_PORT);
        SocketServer.setServer(server);
    });

    it('should return an instance of SocketServer', () => {
        expect(SocketServer.getInstance()).to.equal(SocketServer.getInstance());
    });
});
