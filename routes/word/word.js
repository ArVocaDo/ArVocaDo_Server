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
               AR_mtl = AR mtl 파일
               audio_eng = 영어 오디오 파일
               audio_kor = 한글 오디오 파일
*/

// router.post('/single', upload.single('img'), (req, res) => {
//     /*
//         파일이 하나만 전송할 때 single 메소드 쓰임
//         file.location으로 전송된 파일 경로 접근
//     */
//     const img = req.file.location;
//     console.log(img);
// });

// router.post('/multi', upload.array('imgs'), (req, res) => {
//     /*
//         파일을 여러개 전송할 때 array 메소드 쓰임
//         req.files에 전송된 파일들에 대한 정보가 들어있음
//         files[i].location으로 전송된 파일 경로 접근
//     */
//     const imgs = req.files;
//     for (let i = 0; i < imgs.length; i++) {
//         console.log(imgs[i].location)
//     }
// });


router.post('/', upload.fields([{ name: 'AR_obj' }, { name: 'AR_mtl' }, { name: 'audio_eng' }, { name: 'audio_kor'}]), async (req, res) => {

    
    /*
        파일을 여러개 전송할 때 fields 메소드 쓰임
        req.files에 전송된 키 값 이름으로 사진에 대한 정보 배열이 들어가있음
        files.키값[i].location으로 전송된 파일 경로 접근
    */
    const selectCategoryIndexQuery = 'SELECT c_idx FROM category WHERE c_name = ?';
    const selectCategoryIndexResult = await db.queryParam_Parse(selectCategoryIndexQuery, [req.body.category]);

    const insertWordQuery = 'INSERT INTO word (c_idx, w_eng, w_kor, AR_obj, AR_mtl, audio_eng, audio_kor) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    if(selectCategoryIndexResult[0] != null) {
        const insertWordResult = await db.queryParam_Arr(insertWordQuery, [selectCategoryIndexResult[0].c_idx, req.body.w_eng, req.body.w_kor, 
            req.files.AR_obj[0].location, req.files.AR_mtl[0].location, req.files.audio_eng[0].location, req.files.audio_kor[0].location]);
        
        res.status(200).send(defaultRes.successTrue(statusCode.OK, "s3성공"));
    } else { // 기존에 등록된 카테고리가 아닌 새로운 카테고리의 단어 등록을 하는 경우 => 어떻게할건지 카테고리를 계속 추가해나갈건지? (처리안해도될듯)

    }
});

module.exports = router;