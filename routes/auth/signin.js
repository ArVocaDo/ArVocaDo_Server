var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');

const jwtUtils = require('../../module/jwt');

/*
로그인
METHOD       : POST
URL          : /auth/signin
BODY         : id = 사용자 아이디
               password = 사용자 패스워드
*/

router.post('/', async (req, res) => {
    const selectUserQuery = 'SELECT * FROM user WHERE id = ?'
    const selectUserResult = await db.queryParam_Parse(selectUserQuery, [req.body.id]);
    console.log(selectUserResult[0])//유저 정보

    if (selectUserResult[0] == null) {//id가 존재하지 않으면
        console.log("id가 존재하지 않음");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_EXIST_ID));
    } else {
        const salt = selectUserResult[0].salt;
        const hashedEnterPw = await crypto.pbkdf2(req.body.password.toString(), salt, 1000, 32, 'SHA512');

        if (selectUserResult[0].password == hashedEnterPw.toString('base64')) {
            const tokens = jwtUtils.sign(selectUserResult[0]);
            const refreshToken = tokens.refreshToken;
            const refreshTokenUpdateQuery = "UPDATE user SET refresh_token = ? WHERE id= ?";
            const refreshTokenUpdateResult = await db.queryParam_Parse(refreshTokenUpdateQuery, [refreshToken, req.body.id]);
            if (!refreshTokenUpdateResult) {
                res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SAVE_REFRESHTOKEN));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SIGNIN, tokens));
            }

        } else {
            console.log("비밀번호가 일치하지 않음");
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_CORRECT_PASSWORD));
        }
    }

});

module.exports = router;