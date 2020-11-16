var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');
const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');

/*
단어 등록
METHOD       : POST
URL          : /word
BODY         : category = 카테고리명
               w_eng = 단어 영어명
               w_kor =  단어 한글명
               AR_obj = AR obj 파일
               AR_mtl = AR mtl 파일a
               audio_eng = 영어 오디오 파일
               audio_kor = 한글 오디오 파일
*/


router.post('/', upload.fields([{ name: 'AR_obj' }, { name: 'AR_mtl' }, { name: 'audio_eng' }, { name: 'audio_kor'}]), async (req, res) => {
    console.log("word등록");
    const selectCategoryIndexQuery = 'SELECT c_idx FROM category WHERE c_name = ?';
    const selectCategoryIndexResult = await db.queryParam_Parse(selectCategoryIndexQuery, [req.body.category]);

    const insertWordQuery = 'INSERT INTO word (c_idx, w_eng, w_kor, AR_obj, AR_mtl, audio_eng, audio_kor) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    if(selectCategoryIndexResult[0] != null) {
        const insertWordResult = await db.queryParam_Arr(insertWordQuery, [selectCategoryIndexResult[0].c_idx, req.body.w_eng, req.body.w_kor, 
            req.files.AR_obj[0].location, req.files.AR_mtl[0].location, req.files.audio_eng[0].location, req.files.audio_kor[0].location]);
        
        if(!insertWordResult) {
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.FAIL_REGISTER_WORD));
        } else {
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_REGISTER_WORD));
        }
    } else { // 기존에 등록된 카테고리가 아닌 새로운 카테고리의 단어 등록을 하는 경우 => 어떻게할건지 카테고리를 계속 추가해나갈건지? (처리안해도될듯)

    }
});

/*
카테고리별 단어 조회
METHOD       : POST
URL          : /word?category={categoryIdx}
PARAMETER    : categoryIdx = 카테고리인덱스
*/

router.get('/', async (req, res) => {
    const selectWordInCategoryQuery = 'SELECT * FROM word where c_idx = ?';
    const selectWordInCategoryResult = await db.queryParam_Parse(selectWordInCategoryQuery, req.query.category);

    if(!selectWordInCategoryResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SELECT_WORD_IN_CATEGORY));
    } else {
        if(selectWordInCategoryResult[0] != null) {
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SELECT_WORD_IN_CATEGORY, selectWordInCategoryResult));
        } else {
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NOT_EXIST_WORD_IN_CATEGORY))
        }
    }
});

module.exports = router;