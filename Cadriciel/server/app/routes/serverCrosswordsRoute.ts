import * as express from 'express';
import { ServerCrosswords } from '../crosswordGrid/serverCrosswords';
import { Crossword } from '../../../commun/crossword/crossword';

module Route {

    export class ServerCrosswordsRoute {
        public serverCrosswords: ServerCrosswords;

        constructor(collection: string) {
            this.serverCrosswords = ServerCrosswords.getInstance();
        }

        public getCrossword(req: express.Request, res: express.Response, next: express.NextFunction): void {
            this.serverCrosswords = ServerCrosswords.getInstance();
            this.serverCrosswords.setCollection(req.params.collection);
            const level = req.params.level;
            this.serverCrosswords.getCrossword(level).then((crossword) => {
                res.send(JSON.stringify(crossword));
            });
        }

        public getMutatedCrossword(req: express.Request, res: express.Response, next: express.NextFunction): void {
            const level = req.body.level;
            const listOfIndex = req.body.wordsWithIndex;
            let mutatedCrossword = new Crossword();
            mutatedCrossword.difficulty = level;
            mutatedCrossword.wordsWithIndex = listOfIndex;
            this.serverCrosswords = ServerCrosswords.getInstance();
            this.serverCrosswords.mutate(mutatedCrossword);
            mutatedCrossword = this.serverCrosswords.mutatedGrid;
            res.send(JSON.stringify({ 'crossword': mutatedCrossword }));
        }

    }
}

export = Route;
