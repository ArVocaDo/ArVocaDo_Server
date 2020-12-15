var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');
const crypto = require('crypto-promise');

const authUtil = require('../../module/utils/authUtils');
const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');


/*
진도율 등록
METHOD       : POST
URL          : /category/progress
BODY         : c_idx = 카테고리 고유 id
               index = 단어 순서
*/
router.post('/', authUtil.isLoggedin ,async (req, res, next) => {
    if(req.decoded != null) {
        const selectProgressQuery = 'SELECT * FROM progress_rate WHERE u_idx = ? and c_idx = ?';
        const selectProgressResult = await db.queryParam_Arr(selectProgressQuery, [req.decoded.u_idx, req.body.c_idx]);
        
        if(selectProgressResult[0] != null) {
            console.log("update")

            const updateProgressQuery = 'UPDATE progress_rate SET progress_rate.index = ? WHERE u_idx = ? and c_idx = ?';
            const updateProgressResult = await db.queryParam_Arr(updateProgressQuery, [req.body.index + 1, req.decoded.u_idx, req.body.c_idx]);

            if(!updateProgressResult) {
                res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SAVE_PROGRESS));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SAVE_PROGRESS));
            }
        } else {
            console.log("insert")

            const insertProgressQuery = 'INSERT INTO progress_rate (c_idx, u_idx, progress_rate.index) VALUES (?, ?, ?)';
            console.log(req.body.c_idx, req.decoded.u_idx, req.body.index);
            const insertProgressResult = await db.queryParam_Arr(insertProgressQuery, [req.body.c_idx, req.decoded.u_idx, req.body.index + 1]);

            if(!insertProgressResult) {
                res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SAVE_PROGRESS));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SAVE_PROGRESS));
            }
        }
    } else {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NULL_VALUE));
    }
});

module.exports = router;