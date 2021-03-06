import { assert } from 'chai';
import { API_URL } from '../config';

describe('Authentication', () => {
    const chai = require('chai');
    const chaiHttp = require('chai-http');
    chai.use(chaiHttp);


    it('Should login when password is walleandtomato', (done) => {
        chai.request(API_URL)
            .post('/login')
            .send({ password: 'walleandtomato' })
            .end((err: any, res: any) => {
                assert(JSON.parse(res.text).data === 'authenticated');
                done();
            });
    });

    it('Should not login when password is not walleandtomato', (done) => {
        chai.request(API_URL)
            .post('/login')
            .send({ password: 'blablabla' })
            .end((err: any, res: any) => {
                assert(JSON.parse(res.text).data !== 'authenticated');
                done();
            });
    });

    it('Should change password when walleandtomato is entered', (done) => {
        chai.request(API_URL)
            .post('/changepassword')
            .send({ oldPassword: 'walleandtomato', newPassword: 'walleandtomato' })
            .end((err: any, res: any) => {
                assert(JSON.parse(res.text).data === 'success');
                done();
            });
    });

    it('Should not change password when a password other than walleandtomato is entered', (done) => {
        chai.request(API_URL)
            .post('/changepassword')
            .send({ oldPassword: 'blablabla', newPassword: 'walleandtomato' })
            .end((err: any, res: any) => {
                assert(JSON.parse(res.text).data === 'invalid');
                done();
            });
    });
});
