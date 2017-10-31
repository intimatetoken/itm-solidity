const TestRPC = require("ethereumjs-testrpc")

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    test: {
      network_id: "*",
      provider: TestRPC.provider()
    }
  }
};
