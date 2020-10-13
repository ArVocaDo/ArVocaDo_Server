var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');

/*
회원가입
METHOD       : POST
URL          : /auth/signup
BODY         : id = 회원가입 아이디
               password = 회원가입 패스워드
               nickname =  회원가입 이름
*/

router.post('/', async (req, res) => {
    const selectIdQuery = 'SELECT * FROM user WHERE id = ?'
    const selectIdResult = await db.queryParam_Parse(selectIdQuery, [req.body.id]);
    const signupQuery = 'INSERT INTO user (id, password, salt, nickname) VALUES (?, ?, ?, ?)';

    if (selectIdResult[0] == null) {
        console.log("일치 없음");
        const buf = await crypto.randomBytes(64);
        const salt = buf.toString('base64');
        console.log(req.body.password);
        const hashedPw = await crypto.pbkdf2(req.body.password.toString(), salt, 1000, 32, 'SHA512');
        const signupResult = await db.queryParam_Arr(signupQuery, [req.body.id, hashedPw.toString('base64'), salt, req.body.nickname]);

        if (!signupResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SIGNUP));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SIGNUP));
        }
    } else {
        console.log("이미 존재");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.ALREADY_EXIST_ID));
    }

});


/*
이메일 중복체크
METHOD       : GET
URL          : /auth/signup/check?email={email}
PARAMETER    : email = 이메일
*/

router.get('/check', async (req, res) => {
    const selectIdQuery = 'SELECT * FROM user WHERE id = ?'
    const selectIdResult = await db.queryParam_Parse(selectIdQuery, [req.query.id]);

    if (selectIdResult[0] == null) {
        console.log("해당 이메일 사용 가능");
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.USABLE_ID));
    } else {
        console.log("이미 존재");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.ALREADY_EXIST_ID));
    }
});

module.exports = router;