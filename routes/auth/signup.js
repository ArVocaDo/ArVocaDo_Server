var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');

const jwtUtils = require('../../module/jwt');


/*
회원가입
METHOD       : POST
URL          : /auth/signup
BODY         : email = 회원가입 아이디
               password = 회원가입 패스워드
               nickname =  회원가입 이름
               gender = 성별
*/

router.post('/', async (req, res) => {
    const signupQuery = 'INSERT INTO user (email, password, salt, nickname, gender) VALUES (?, ?, ?, ?, ?)';
    const buf = await crypto.randomBytes(64);
    const salt = buf.toString('base64');
    console.log(req.body.password);
    const hashedPw = await crypto.pbkdf2(req.body.password.toString(), salt, 1000, 32, 'SHA512');
    const signupResult = await db.queryParam_Arr(signupQuery, [req.body.email, hashedPw.toString('base64'), salt, req.body.nickname, req.body.gender]);
    console.log(signupResult)

    if (!signupResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SIGNUP));
    } else { //쿼리문이 성공했을 때
        const userInfo = {
            u_idx: signupResult.insertId,
            email: req.body.email,
            nickname: req.body.nickname,
        }
    
        const tokens = jwtUtils.sign(userInfo);
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SIGNUP, tokens));
    }
});


/*
이메일 중복체크
METHOD       : GET
URL          : /auth/signup/check?email={email}
*/

router.get('/check', async (req, res) => {
    const selectIdQuery = 'SELECT * FROM user WHERE email = ?'
    const selectIdResult = await db.queryParam_Parse(selectIdQuery, [req.query.email]);

    if (selectIdResult[0] == null) {
        console.log("해당 이메일 사용 가능");
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.USABLE_EMAIL));
    } else {
        console.log("이미 존재");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.ALREADY_EXIST_EMAIL));
    }
});

module.exports = router;