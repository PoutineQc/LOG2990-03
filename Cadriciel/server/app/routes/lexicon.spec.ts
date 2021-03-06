import { assert } from 'chai';
import { API_URL } from '../config';

describe('Lexicon', () => {
    const chai = require('chai');
    const chaiHttp = require('chai-http');
    chai.use(chaiHttp);

    it('Should return the definitions of cat', (done) => {
        chai.request(API_URL)
            .get('/definition/cat')
            .end((err: any, res: any) => {
                const definitions = JSON.parse(res.text);
                assert(definitions[0].includes('A small carnivorous mammal'));
                done();
            });
    });

    it('Should return multiple definitions of cat', (done) => {
        chai.request(API_URL)
            .get('/definition/cat')
            .end((err: any, res: any) => {
                const definitions = JSON.parse(res.text);
                assert(definitions.length > 1);
                done();
            });
    });

    it('Should return the frequency of the word cat', (done) => {
        chai.request(API_URL)
            .get('/frequency/cat')
            .end((err: any, res: any) => {
                const content: string = res.text;
                assert(content === '8');
                done();
            });
    });

    it('Should return all the words of the lexicon', (done) => {
        chai.request(API_URL)
            .get('/lexicon')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0] === 'aalii' && content[content.length - 1] === 'zymotic');
                done();
            });
    });

    it('Should return all the words of length of 6', (done) => {
        chai.request(API_URL)
            .get('/lexicon/6')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0].length === 6);
                done();
            });
    });

    it('Should return no words when searching for words of length of 0', (done) => {
        chai.request(API_URL)
            .get('/lexicon/0')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content.length === 0);
                done();
            });
    });

    it('Should return all the words with a b at index 2', (done) => {
        chai.request(API_URL)
            .get('/lexicon/b/2')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0][2] === 'b' && content[content.length - 1][2] === 'b');
                done();
            });
    });

    it('Should return all words matching this pattern <a e >', (done) => {
        chai.request(API_URL)
            .get('/pattern/a%20e%20')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0][0] === 'a' && content[0][2] === 'e');
                done();
            });
    });

    it('Should return all words matching this pattern <   > so all the words with length of 3', (done) => {
        chai.request(API_URL)
            .get('/pattern/%20%20%20')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0].length === 3 && content[content.length - 1].length === 3);
                done();
            });
    });

    it('Should return some commonWords', (done) => {
        chai.request(API_URL)
            .get('/commonWords')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content.length > 0);
                done();
            });
    }).timeout(15000);

    it('Should return some uncommonWords', (done) => {
        chai.request(API_URL)
            .get('/uncommonWords')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content.length > 0);
                done();
            });
    }).timeout(15000);
});
