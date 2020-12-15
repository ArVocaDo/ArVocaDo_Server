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
router.get('/', authUtil.isLoggedin, async(req, res, next) => {
    const selectCategoryQuery = 'SELECT * FROM category';
    const selectCategoryResult = await db.queryParam_None(selectCategoryQuery);

    if(!selectCategoryResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SELECT_CATEGORY));
    } else {
        var categoryArray = new Array();

        if(req.decoded == null) {
            for(var i = 0; i < selectCategoryResult.length; i++) {
                var category = {
                    c_idx: selectCategoryResult[i].c_idx,
                    c_name: selectCategoryResult[i].c_name,
                    c_img: selectCategoryResult[i].c_img,
                    c_count: selectCategoryResult[i].c_count,
                    index: 0
                }
                categoryArray.push(category);
            }
        } else {           
            for(var i = 0; i < selectCategoryResult.length; i++) {
                const selectProgressQuery = 'SELECT progress_rate.index FROM progress_rate WHERE u_idx = ? and c_idx = ?';
                const selectProgressResult = await db.queryParam_Arr(selectProgressQuery, [req.decoded.u_idx, selectCategoryResult[i].c_idx]);
                
                var category = {
                    c_idx: 0,
                    c_name: "",
                    c_img: "",
                    c_count: 0,
                    index: 0
                }

                if(selectProgressResult[0] == null) { 
                    category.c_idx = selectCategoryResult[i].c_idx,
                    category.c_name = selectCategoryResult[i].c_name,
                    category.c_img = selectCategoryResult[i].c_img,
                    category.c_count = selectCategoryResult[i].c_count;
                } else {
                    console.log(selectProgressResult[0]);
                    category.c_idx = selectCategoryResult[i].c_idx;
                    category.c_name = selectCategoryResult[i].c_name;
                    category.c_img = selectCategoryResult[i].c_img;
                    category.c_count = selectCategoryResult[i].c_count;
                    category.index = selectProgressResult[0].index;
                }
                categoryArray.push(category);
            }
        }
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SELECT_CATEGORY, categoryArray));
    }
});

module.exports = router;