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
스크랩 변경
METHOD       : PUT
URL          : /scrap
BODY         : w_idx = 단어 고유 id
               c_idx = 카테고리 고유 id
*/
router.put('/', authUtil.isLoggedin, async (req, res) => {
    if(req.decoded == null) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NULL_VALUE));
    } else {
        const selectScrapQuery = 'SELECT * FROM scrap WHERE u_idx = ? and w_idx = ?';
        const selectScrapResult = await db.queryParam_Arr(selectScrapQuery, [req.decoded.u_idx, req.body.w_idx]);

        if(!selectScrapResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SELECT_SCRAP_TF));
        } else {
            if(selectScrapResult[0] == null) {
                const insertScrapQuery = 'INSERT INTO scrap (w_idx, u_idx, c_idx) VALUES (?, ?, ?)';
                const insertScrapResult = await db.queryParam_Arr(insertScrapQuery, [req.body.w_idx, req.decoded.u_idx, req.body.c_idx]);
                
                if(!insertScrapResult) {
                    res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SCRAP));
                } else {
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SCRAP));
                }
            } else {
                const deleteScrapQuery = 'DELETE FROM scrap WHERE u_idx = ? and w_idx = ?';
                const deleteScrapResult = await db.queryParam_Arr(deleteScrapQuery, [req.decoded.u_idx, req.body.w_idx]);
                    
                if(!deleteScrapResult) {
                    res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_DELETE_SCRAP));
                } else {
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_DELETE_SCRAP));
                }
            }
        }
        
    }
});


/*
스크랩 조회
METHOD       : GET
URL          : /scrap
*/
router.get('/', authUtil.isLoggedin, async(req, res, next) => {
        const selectScrapQuery = 'SELECT * FROM scrap WHERE u_idx = ?';
        const selectScrapResult = await db.queryParam_Parse(selectScrapQuery, req.decoded.u_idx);

        if(!selectScrapResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SELECT_SCRAP));
        } else {
            if(selectScrapResult[0] == null) {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NOT_EXIST_SCRAP, selectScrapResult));
            } else {
                var scrapArray = new Array();

                for(var i = 0; i < selectScrapResult.length; i++) {
                    const selectWordQuery = 'SELECT * FROM word WHERE w_idx = ?';
                    const selectWordResult = await db.queryParam_Parse(selectWordQuery, selectScrapResult[i].w_idx);
                    
                    var scrap = {
                        w_eng: "",
                        w_kor: "",
                        w_img: "",
                        w_AR: "",
                        audio_eng: "",
                        audio_kor: "",
                    }

                    scrap.w_eng = selectWordResult[0].w_eng,
                    scrap.w_kor = selectWordResult[0].w_kor,
                    scrap.w_img = selectWordResult[0].w_img,
                    scrap.w_AR = selectWordResult[0].w_AR,
                    scrap.audio_eng = selectWordResult[0].audio_eng,
                    scrap.audio_kor = selectWordResult[0].audio_kor,

                    scrapArray.push(scrap);
            }
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SELECT_SCRAP, scrapArray));
            }
        } 
});

module.exports = router;