module.exports = {
    PORT: 4000,
    // Connectivity details for the node
    // ** Make sure you take the "-connect" URL for your node here, which is the REST API Gateway **
    KALEIDO_REST_GATEWAY_URL: "https://u0uiyvnfum-u0oh4ln74g-connect.us0-aws.kaleido.io/",
    KALEIDO_AUTH_USERNAME: "u0fj9dp80s",
    KALEIDO_AUTH_PASSWORD: "2NIj2nDeJCuoLYd1gQx8IVeNXqWh27fNl9gOj4InIxo",
    // The "from" address to sign the transactions. Must exist in the node's wallet
    FROM_ADDRESS: "0xeb90323512b5937890eb0e6c1a27705d5e48dd84",
    // Details of the contract source code in the contracts directory
    // ** if you pull in pre-reqs like OpenZeppelin, just put them all inside the contracts directory **
    CONTRACT_MAIN_SOURCE_FILE: "forum.sol", // filename
    CONTRACT_CLASS_NAME: "forum", // Solidity class within the file
  }