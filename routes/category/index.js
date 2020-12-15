var express = require('express');
var router = express.Router();

/* GET home page. */

router.use("/progress", require("./progress"));
router.use("/", require("./category"));


module.exports = router;