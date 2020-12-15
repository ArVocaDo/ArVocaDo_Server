var express = require('express');
var router = express.Router();

//회원가입
router.use("/signup", require("./signup"));
//로그인
router.use("/signin", require("./signin"));
//토큰 확인
router.use("/token", require("./token"));

module.exports = router;