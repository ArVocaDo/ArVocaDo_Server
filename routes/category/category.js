var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');
const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');

/*
카테고리 등록
METHOD       : POST
URL          : /category
BODY         : c_name = 카테고리명
               c_img = 카테고리 이미지
*/
router.post('/', upload.single('c_img'), async (req, res) => {
    console.log("카테고리등록");
    const insertCategoryQuery = 'INSERT INTO category (c_name, c_img) VALUES (?, ?)';
    const insertCategoryResult = await db.queryParam_Arr(insertCategoryQuery, [req.body.c_name, req.file.location]);
    
    if(!insertCategoryResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_REGISTER_CATEGORY));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_REGISTER_CATEGORY));
    }
});


/*
카테고리 조회
METHOD       : GET
URL          : /category
*/
router.get('/', async (req, res) => {
    const selectCategoryQuery = 'SELECT * FROM category';
    const selectCategoryResult = await db.queryParam_None(selectCategoryQuery);

    if(!selectCategoryResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SELECT_CATEGORY));
    } else {
        if(selectCategoryResult[0] != null) {
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SELECT_CATEGORY, selectCategoryResult));
        } else {
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NOT_EXIST_CATEGORY))
        }
    }
});

module.exports = router;