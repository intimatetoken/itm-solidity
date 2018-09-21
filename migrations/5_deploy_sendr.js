let IntimateSender = artifacts.require("./IntimateSender.sol");

module.exports = function(deployer) {
    deployer.deploy(IntimateSender);
};