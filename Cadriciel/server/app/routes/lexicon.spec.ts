import { assert } from 'chai';

describe('Lexicon', () => {
    const chai = require('chai');
    const chaiHttp = require('chai-http');
    chai.use(chaiHttp);


    it('Should return the definitions of cat', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/definition/cat')
            .end((err: any, res: any) => {
                assert(res.text[0] === '"A small carnivorous mammal (Felis catus or F. domesticus) domesticated since early times as a catcher of rats and mice and as a pet and existing in several distinctive breeds and varieties."');
            });
        done();
    });

    // getWordFrequency

    it('Should return the frequency of the word cat', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/frequency/cat')
            .end((err: any, res: any) => {
                const content: string = res.text;
                assert(content === '8');
            });
        done();
    });

    it('Should return all the words of the lexicon', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/lexicon')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0] === 'aalii' && content[content.length - 1] === 'zymotic');
                done();
            });
    });

    it('Should return all the words of length of 6', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/lexicon/6')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0].length === 6);
                done();
            });
    });

    it('Should return no words when searching for words of length of 0', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/lexicon/0')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content.length === 0);
                done();
            });
    });

    // getWordsWithCharAt

    it('Should return all the words with a b at index 2', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/lexicon/b/2')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0][2] === 'b' && content[content.length - 1][2] === 'b');
                done();
            });
    });

    // getWordsMatchingPattern

    it('Should return all words matching this pattern <a e >', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/pattern/a%20e%20')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0][0] === 'a' && content[0][2] === 'e');
                done();
            });
    });

    it('Should return all words matching this pattern <   > so all the words with length of 3', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/pattern/%20%20%20')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content[0].length === 3 && content[content.length - 1].length === 3);
                done();
            });
    });

    // get some commonwords

    it('Should return some commonWords', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/commonWords')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content.length > 0);
            });
        done();
    });

    // get some uncommonwords 

    it('Should return some uncommonWords', (done) => {
        chai.request('http://localhost:3000')
            .get('/api/uncommonWords')
            .end((err: any, res: any) => {
                const content: string[] = res.body;
                assert(content.length > 0);
            });
        done();
    });
});
