/*
 * @Author: alw-AY's
 * @Date:   2018-02-08 16:27:09
 * @Last Modified by:   alw-AY's
 * @Last Modified time: 2018-02-13 12:06:24
 */
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var URL = require('url');

var AdMasterAPI = require('../AdmasterAPI');

var api;


router.get('/', function(req, res, next) {
  var response;
  if (!_.isUndefined(api) && api.inited) {
    response = {
      status: 1,
      data: {
        'platform': api.getPlatform(0)
      }
    };
    res.send(JSON.stringify(response));
  } else {
    api = new AdMasterAPI('jFO6hFvEelWW', 'XTcILLZgLBS8U2kHfmLu6e0EO5JU9M5h');
    api.onReady(function() {
      response = {
        status: 1,
        data: {
          'platform': api.getPlatform(0)
        }
      };
      res.send(JSON.stringify(response));
    });
  }
});
router.get('/getData', function(req, res, next) {
  var params = URL.parse(req.url, true).query;

  var teamId = api.getTeamId(0);
  var ruleId = api.getTeams()[0].rules[0].id;

  api.getData(teamId, {
    "platforms":  [params.platforms],
    "endDate": params.endDate,
    "startDate": params.startDate,
    "action": "query",
    "ruleId": ruleId,
    "format": "array",
    "maxResults":params.maxResults
  }, function(_data) {

    response = {
      status: 1,
      data: _data
    };
    if(_data.length>0){
      response.headers = api.getDataHeader(params.platforms);
    }

    res.send(JSON.stringify(response));
  });
});

module.exports = router;
