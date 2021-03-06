var express = require('express');
var router = express.Router();

/* GET home page. */

router.use("/auth", require("./auth/index"));
router.use("/word", require("./word/index"));
router.use("/category", require("./category/index"));
router.use("/scrap", require("./scrap/index"));

module.exports = router;