const API = require('./api.js');
const WXAPI = require('./wxApi.js');
const SHOPAPI = require('./shopApi.js');

module.exports = {
    api: new API(),
    wxApi: new WXAPI(),
    shopApi: new SHOPAPI()
}