var express = require('express');
var router = express.Router();

var AdMasterAPI = require('../AdmasterAPI');

router.get('/', function(req, res, next) {
  res.sendfile('index.html');
});

module.exports = router;
