const hmacSha256 = require('crypto-js/hmac-sha256');
const Base64 = require('crypto-js/enc-base64');
const axios = require('axios');
const _ = require('lodash');
const events = require('events');

const SIGN_METHOD = "HmacSHA256";
const SIGN_VERSION = "1";
const BASE_URL = "http://report.socialmaster.com.cn/api";

var self, eventEmitter;

var key, secret;

var session, teams;

var DataHeaders = {
  "weibo": ["id",
    "platform",
    "publishedAt",
    "topic",
    "url",
    "content",
    "source",
    "commonSentiment",
    "viewCount",
    "likeCount",
    "commentCount",
    "repostCount",
    "interactCount",
    "haslink",
    "isOriginal",
    "postFrom",
    "nickName",
    "uid",
    "profileImageUrl",
    "gender",
    "province",
    "city",
    "description",
    "friendCount",
    "followerCount",
    "statusCount",
    "favouriteCount",
    "biFollowerCount",
    "createdAt",
    "verified",
    "verifiedType",
    "verifiedReason",
    "ugc",
    "pbw",
    "originalID",
    "originalPublishedAt",
    "originalContent",
    "originalSource",
    "originalCommentCount",
    "originalRepostCount",
    "originalLikeCount",
    "originalPostFrom",
    "originalUID",
    "originalNickName",
    "originalVerified",
    "isDeleted",
    "spam",
    "images",
    "originalImages",
    "rule"
  ],
  "weixin": ["id",
    "platform",
    "publishedAt",
    "url",
    "content",
    "source",
    "commonSentiment",
    "viewCount",
    "likeCount",
    "commentCount",
    "rewardCount",
    "interactCount",
    "isReward",
    "title",
    "indexid",
    "author",
    "digest",
    "postFrom",
    "nickName",
    "biz",
    "description",
    "verifiedReason",
    "account",
    "profileImageUrl",
    "codeImageUrl",
    "verified",
    "openid",
    "originalUrl",
    "rule"
  ],
  "bbs": ["id",
    "platform",
    "publishedAt",
    "url",
    "content",
    "source",
    "commonSentiment",
    "viewCount",
    "likeCount",
    "commentCount",
    "originalID",
    "channel",
    "secondChannel",
    "thirdChannel",
    "title",
    "content",
    "floor",
    "originalUrl",
    "originalPublishedAt",
    "originalContent",
    "isComment",
    "isEssence",
    "nickName",
    "userUrl",
    "gender",
    "province",
    "city",
    "userLevel",
    "postFrom",
    "isDeleted",
    "rule"
  ],
  "news": [
    "id",
    "platform",
    "publishedAt",
    "url",
    "content",
    "source",
    "commonSentiment",
    "viewCount",
    "likeCount",
    "commentCount",
    "channel",
    "secondChannel",
    "thirdChannel",
    "title",
    "content",
    "floor",
    "originalUrl",
    "originalPublishedAt",
    "originalContent",
    "isComment",
    "isEssence",
    "nickName",
    "userUrl",
    "gender",
    "province",
    "city",
    "userLevel",
    "postFrom",
    "rule"
  ],
  "blog": [
    "id",
    "platform",
    "publishedAt",
    "url",
    "content",
    "source",
    "commonSentiment",
    "viewCount",
    "likeCount",
    "commentCount",
    "channel",
    "secondChannel",
    "thirdChannel",
    "title",
    "content",
    "floor",
    "originalUrl",
    "originalPublishedAt",
    "originalContent",
    "isComment",
    "isEssence",
    "nickName",
    "userUrl",
    "gender",
    "province",
    "city",
    "userLevel",
    "postFrom",
    "rule"
  ],
  "wenda": [
    "id",
    "platform",
    "publishedAt",
    "url",
    "content",
    "source",
    "commonSentiment",
    "viewCount",
    "likeCount",
    "commentCount",
    "channel",
    "secondChannel",
    "thirdChannel",
    "title",
    "content",
    "floor",
    "originalUrl",
    "originalPublishedAt",
    "originalContent",
    "isComment",
    "isEssence",
    "nickName",
    "userUrl",
    "gender",
    "province",
    "city",
    "userLevel",
    "postFrom",
    "rule"
  ],
  "share": [
    "id",
    "platform",
    "publishedAt",
    "url",
    "content",
    "source",
    "commonSentiment",
    "viewCount",
    "likeCount",
    "commentCount",
    "collectCount",
    "interactCount",
    "channel",
    "secondChannel",
    "title",
    "content",
    "originalUrl",
    "originalPublishedAt",
    "originalContent",
    "isComment",
    "nickName",
    "profileImageUrl",
    "userUrl",
    "userSiteID",
    "gender",
    "province",
    "city",
    "description",
    "friendCount",
    "goodsPrice",
    "followerCount",
    "goodsName",
    "goodsLocation",
    "rule"
  ]
};


var AdMasterAPI = function(_k, _s) {
  self = this;
  this.inited = false;
  eventEmitter = new events.EventEmitter();

  key = _k;
  secret = _s;

  teams = [];

  initBaseInfo();
}

AdMasterAPI.prototype.getSession = function() {
  return session;
};

AdMasterAPI.prototype.getTeams = function() {
  return teams;
};

AdMasterAPI.prototype.getTeamId = function(_i) {
  return Object.keys(session.joins)[_i];
};

AdMasterAPI.prototype.getPlatform = function(_i) {
  return session.joins[self.getTeamId(_i)].queryTypes;
};

AdMasterAPI.prototype.getGroups = function(_i, _f, _e) {
  get('/teams/' + _i + '/groups', {
    'success': _f,
    'error': _e
  });
};

AdMasterAPI.prototype.getRules = function(_i, _f, _e) {
  get('/teams/' + _i + '/rules', {
    'success': _f,
    'error': _e
  });
};

AdMasterAPI.prototype.getData = function(_i, _o, _f, _e) {
  post('/teams/' + _i + '/analysis/contents', {
    'params': _o,
    'success': _f,
    'error': _e
  });
};

AdMasterAPI.prototype.getDataHeader = function(_i) {
  return DataHeaders[_i];
};


AdMasterAPI.prototype.onReady = function(_f) {
  if (_.isUndefined(session)) {
    self.inited = true;
    eventEmitter.addListener("ready", _f);
  } else {
    _f();
  }
};

function initBaseInfo() {
  get('/session', {
    'success': function(_data) {
      session = _data;

      var count = 0;
      var length = Object.keys(_data.joins).length;

      _.forEach(_data.joins, function(v) {
        let to = {
          'info': v
        };
        teams.push(to);

        self.getGroups(v.id, function(_data) {
          to.groups = _data;
          count++;
          if (count == length * 2) {
            eventEmitter.emit('ready');
          }
        }, function(_error) {
          to.groups = "error";
          count++;
          if (count == length * 2) {
            eventEmitter.emit('ready');
          }
        });
        self.getRules(v.id, function(_data) {
          to.rules = _data;
          count++;
          if (count == length * 2) {
            eventEmitter.emit('ready');
          }
        }, function(_error) {
          to.rules = "error";
          count++;
          if (count == length * 2) {
            eventEmitter.emit('ready');
          }
        });
      });
    }
  });
}

function get(_u, _o) {
  var option = {};

  option.headers = getHeader('GET', _u);

  if (_.isPlainObject(_o.params)) {
    option.params = _o.params;
  }

  axios({
      method: 'get',
      url: BASE_URL + _u,
      data: option.params,
      headers: option.headers
    }).then(function(response) {

      if (_.isFunction(_o.success)) {
        _o.success(response.data);
      }
    })
    .catch(function(error) {
      if (_.isFunction(_o.error)) {
        _o.error(error);
      } else {
        console.log(error);
      }
    });
}

function post(_u, _o) {
  _o.headers = getHeader('POST', _u);

  if (!_.isPlainObject(_o.params)) {
    console.log('no params!');
    return false;
  }

  axios({
      method: 'post',
      url: BASE_URL + _u,
      data: _o.params,
      headers: _o.headers
    }).then(function(response) {
      if (_.isFunction(_o.success)) {
        _o.success(response.data);
      }
    })
    .catch(function(error) {
      if (_.isFunction(_o.error)) {
        _o.error(error);
      } else {
        console.log(error);
      }
    });
}

function getHeader(_p, _u) {
  var timestamp = new Date();
  var sign = Base64.stringify(hmacSha256(_.join([_p, _u, key, timestamp, SIGN_METHOD, SIGN_VERSION, ''], '\n'), secret));


  var headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Cache-Control": "no-cache",
    "X-Auth-Signature": sign,
    "X-Auth-Key": key,
    "X-Auth-Timestamp": timestamp,
    "X-Auth-Sign-Method": SIGN_METHOD,
    "X-Auth-Sign-Version": SIGN_VERSION
  };

  return headers;
}

module.exports = AdMasterAPI;
