var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');
const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');
const db = require('../../module/pool');
const authUtil = require('../../module/utils/authUtils');

/*
단어 등록
METHOD       : POST
URL          : /word
BODY         : category = 카테고리명
               w_eng = 단어 영어명
               w_kor =  단어 한글명
               w_AR = 단어 AR
               audio_eng = 영어 오디오 파일
               audio_kor = 한글 오디오 파일
*/


router.post('/', upload.fields([{ name: 'w_img' }, { name: 'audio_eng' }, { name: 'audio_kor'}]), async (req, res) => {
    console.log("word등록");
    const selectCategoryIndexQuery = 'SELECT c_idx, c_count FROM category WHERE c_name = ?';
    const selectCategoryIndexResult = await db.queryParam_Parse(selectCategoryIndexQuery, [req.body.category]);

    const insertWordQuery = 'INSERT INTO word (c_idx, word.index, w_eng, w_kor, w_img, audio_eng, audio_kor) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    if(selectCategoryIndexResult[0] != null) {
        const insertWordResult = await db.queryParam_Arr(insertWordQuery, [selectCategoryIndexResult[0].c_idx, selectCategoryIndexResult[0].c_count, req.body.w_eng, req.body.w_kor, 
            req.files.w_img[0].location, req.files.audio_eng[0].location, req.files.audio_kor[0].location]);
    
        if(!insertWordResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_REGISTER_WORD));
        } else {
            const updateCategoryCountQuery = 'UPDATE category SET c_count = c_count + 1 WHERE c_idx = ?';
            const updateCategoryCountResult = await db.queryParam_Parse(updateCategoryCountQuery, [selectCategoryIndexResult[0].c_idx]);
            if(!updateCategoryCountResult) {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.FAIL_UPDATE_CATEGORY_COUNT));
            } else {
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_REGISTER_WORD));
            }
        }
    } else { 
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_EXIST_CATEGORY));
    }
});

/*
카테고리별 단어 조회
METHOD       : GET
URL          : /word?category={categoryIdx}
PARAMETER    : categoryIdx = 카테고리인덱스
*/

router.get('/',authUtil.isLoggedin, async (req, res) => {
    const selectWordInCategoryQuery = 'SELECT * FROM word where c_idx = ?';
    const selectWordInCategoryResult = await db.queryParam_Parse(selectWordInCategoryQuery, req.query.category);

    if(!selectWordInCategoryResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SELECT_WORD_IN_CATEGORY));
    } else {
        var wordArray = new Array();
        if(selectWordInCategoryResult[0] != null) {
            if(req.decoded == null) {
                console.log("token null")
                for(var i = 0 ; i<selectWordInCategoryResult.length; i++) {
                    const word = {
                        w_idx : selectWordInCategoryResult[i].w_idx,
                        c_idx : selectWordInCategoryResult[i].c_idx,
                        w_img : selectWordInCategoryResult[i].w_img,
                        w_AR : selectWordInCategoryResult[i].w_AR,
                        w_eng : selectWordInCategoryResult[i].w_eng,
                        w_kor : selectWordInCategoryResult[i].w_kor,
                        audio_eng : selectWordInCategoryResult[i].audio_eng,
                        audio_kor : selectWordInCategoryResult[i].audio_kor,
                        index : selectWordInCategoryResult[i].index,
                        isScraped : false
                    }
                    wordArray.push(word);
                }
            } else {
                for(var i = 0 ; i<selectWordInCategoryResult.length; i++) {
                    const word = {
                        w_idx : selectWordInCategoryResult[i].w_idx,
                        c_idx : selectWordInCategoryResult[i].c_idx,
                        w_img : selectWordInCategoryResult[i].w_img,
                        w_AR : selectWordInCategoryResult[i].w_AR,
                        w_eng : selectWordInCategoryResult[i].w_eng,
                        w_kor : selectWordInCategoryResult[i].w_kor,
                        audio_eng : selectWordInCategoryResult[i].audio_eng,
                        audio_kor : selectWordInCategoryResult[i].audio_kor,
                        index : selectWordInCategoryResult[i].index,
                        isScraped : false
                    }

                    const selectLikedWordQuery = 'SELECT * FROM scrap where u_idx = ? and w_idx = ?';
                    const selectLikedWordResult = await db.queryParam_Arr(selectLikedWordQuery, [req.decoded.u_idx, selectWordInCategoryResult[i].w_idx]);
                    
                    if(selectLikedWordResult[0] != null) {
                        word.isScraped = true;
                    }
                    wordArray.push(word);
                }
            }
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SELECT_WORD_IN_CATEGORY, wordArray));
        } else {
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NOT_EXIST_WORD_IN_CATEGORY))
        }
    }
});

module.exports = router;