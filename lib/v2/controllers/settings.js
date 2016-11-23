var template = require('../util/template');
var config = require('../../config');
var types = ['app', 'message', 'merchant',
  'certificate', 'server', 'urls',
  'oauth', 'pages'];

var getId = require('../util/getId');
var callbacks = require('../util/callbacks');

var thisModule = {
  __onConfig: function (req, res) {
    var type = req.query.type;
    if (types.indexOf(type) === -1) {
      type = 'app';
    }
    var user = req.session.user;
    req.__weixinSettings.get(user._id,
      type,
      function (value) {
        var html = template.render('settings/weixin/config/' + type + '.njk', {
          host: req.headers.host,
          type: type,
          title: '微信设定',
          googleTrackerId: config.google_tracker_id,
          user: {
            name: user.name,
            avatar: user.avatar,
            id: user._id
          },
          data: value
        });
        res.send(html);
      }
    );
  },
  __Message: function (req, res, model) {
    var user = req.session.user;
    model.findOne({
      user: user._id
    }).then(function (settings) {
      var html = template.render('settings/weixin/pages.njk', {
        host: req.headers.host,
        title: '消息页面',
        googleTrackerId: config.google_tracker_id,
        user: {
          name: user.name,
          avatar: user.avatar,
          id: user._id
        },
        url: req.hostname + '/weixin/api/' + settings.id
      });
      res.send(html);
    }).fail(callbacks.failed(res));
  },
  onPages: function (req, res, model) {
    var app = req.query.app;
    switch (app) {
      case 'message':
        thisModule.__onMessage(req, res, model);
        break;
      default:
        thisModule.__onConfig(req, res, model);
        break;
    }
  },
  onWeixinId: function (model, req, res) {
    var data = {
      user: String(getId(req))
    };
    model.findOne(data).then(function (settings) {
      res.errorize(res.errors.Success, {
        id: settings.id
      });
    }).fail(callbacks.failed(res));
  },
  onClear: function (model, req, res) {
    model.destroy({}).then(function () {
      res.errorize(res.errors.Success);
    }).fail(callbacks.failed(res));
  }
};
module.exports = thisModule;