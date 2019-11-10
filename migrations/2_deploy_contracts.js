 var CookieCoin = artifacts.require("./CookieCoin.sol");

module.exports = function(deployer) {
   deployer.deploy(CookieCoin, 1000000000);
};
