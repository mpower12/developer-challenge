module.exports = {
  PORT: 4000,
  // Connectivity details for the node
  // ** Make sure you take the "-connect" URL for your node here, which is the REST API Gateway **
  KALEIDO_REST_GATEWAY_URL: "https://u0uiyvnfum-u0oh4ln74g-connect.us0-aws.kaleido.io/",
  KALEIDO_AUTH_USERNAME: "xxxxxx",
  KALEIDO_AUTH_PASSWORD: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  // The "from" address to sign the transactions. Must exist in the node's wallet
  FROM_ADDRESS: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  // Details of the contract source code in the contracts directory
  // ** if you pull in pre-reqs like OpenZeppelin, just put them all inside the contracts directory **
  CONTRACT_MAIN_SOURCE_FILE: "simplestorage.sol", // filename
  CONTRACT_CLASS_NAME: "forum", // Solidity class within the file
  KALEIDO_API_KEY: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" //api key for kaleido
}