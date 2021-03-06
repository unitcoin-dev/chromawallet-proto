/** @jsx React.DOM */
var ccWallet = require('../cc-wallet-engine');

// Probably not much react, maybe move out later.

function AssetModel(props) {
  if (props.totalBalance === undefined)
    props.totalBalance = 0
  if (props.unconfirmedBalance === undefined)
    props.unconfirmedBalance = 0
  if (props.availableBalance === undefined)
    props.availableBalance = 0

  this.props = props
}

AssetModel.prototype.getMoniker = function () {
  return this.props.moniker
}

AssetModel.prototype.getAddress = function () {
  return this.props.address
}

AssetModel.prototype.getTotalBalance = function () {
  return this.props.totalBalance
}

AssetModel.prototype.getUnconfirmedBalance = function () {
  return this.props.unconfirmedBalance
}

AssetModel.prototype.getAvailableBalance = function () {
  return this.props.availableBalance
}



function AssetModels(wallet) {
  this.updateCallback = function() {}
  this.models = {}
  this.wallet = wallet
  this.isLoggedIn = false
}

AssetModels.prototype.getAssetModels = function() {
    var models = [];
    for (var k in this.models)
        if (this.models.hasOwnProperty(k))
            models.push(this.models[k]);
    return models;
}

AssetModels.prototype.setCallback = function(notifier) {
  this.updateCallback = notifier
}

AssetModels.prototype.updateAssetModels = function() {
  var _this = this

  var added = false
  this.wallet.getAllAssetDefinitions().forEach(function(assdef) {
    var colorHash = assdef.getColorSet().getColorHash()
    if (_this.models[colorHash] !== undefined)
      return

    _this.models[colorHash] = new AssetModel({
      moniker: assdef.getMonikers()[0],
      address: _this.wallet.getSomeAddress(assdef)
    })
    added = true
  })

  if (added)
    this.updateCallback()

  Object.keys(this.models).forEach(function(colorHash) {
    var model = _this.models[colorHash]
    var assdef = _this.wallet.getAssetDefinitionByMoniker(model.props.moniker)

    _this.wallet.getAvailableBalance(assdef, function(error, balance) {
      if (error === null && _this.models[colorHash].props.availableBalance !== balance) {
        _this.models[colorHash].props.availableBalance = balance
        _this.updateCallback()
      }
    })

    _this.wallet.getTotalBalance(assdef, function(error, balance) {
      if (error === null && _this.models[colorHash].props.totalBalance !== balance) {
        _this.models[colorHash].props.totalBalance = balance
        _this.updateCallback()
      }
    })

    _this.wallet.getUnconfirmedBalance(assdef, function(error, balance) {
      if (error === null && _this.models[colorHash].props.unconfirmedBalance !== balance) {
        _this.models[colorHash].props.unconfirmedBalance = balance
        _this.updateCallback()
      }
    })
  })
}

AssetModels.prototype.isInitialized = function () {
    return this.isInitializedFlag;
};


AssetModels.prototype.initializeFromSeed = function (seed) {
    this.isInitializedFlag = true;
    this.updateCallback();
};

AssetModels.prototype.generateRandomSeed = function (entropy) {
     return 'random seed';
};

AssetModels.prototype.getHistory = function () {
    //TODO
    return [];
};


var cc_wallet = new ccWallet({
                                 "masterKey": "123131123131123131123131123131123131123131123131123131", 
                                 testnet: true});
cc_wallet.addAssetDefinition({
                                 monikers: ['gold'],
                                 colorSet: ['epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679']
                             });
var wallet = new AssetModels(cc_wallet);
wallet.updateAssetModels();

module.exports = {
    wallet: wallet
};
