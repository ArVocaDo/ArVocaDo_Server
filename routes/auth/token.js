var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');
const authUtil = require('../../module/utils/authUtils');

const jwtUtils = require('../../module/jwt');

/*
토큰 유효성 체크
METHOD       : GET
URL          : /auth/token
*/

router.get('/', authUtil.isLoggedin, async (req, res) => {
    if(req.decoded == null) {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NO_TOKEN_VALUE));
    } else if(req.decoded == -3) {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EXPIRED_TOKEN));
    } else if(req.decoded == -2) {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.INVALID_TOKEN));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.VALID_TOKEN));
    }
});

module.exports = router;