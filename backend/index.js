const request = require('request-promise-native')
const express = require('express');
const app = express();
const archiver = require('archiver');
const Swagger = require('swagger-client');
const {URL} = require('url');
const bodyparser = require('body-parser');

const {
  KALEIDO_REST_GATEWAY_URL,
  KALEIDO_AUTH_USERNAME,
  KALEIDO_AUTH_PASSWORD,
  PORT,
  FROM_ADDRESS,
  CONTRACT_MAIN_SOURCE_FILE,
  CONTRACT_CLASS_NAME
} = require('./config');

let swaggerClient; // Initialized in init()

app.use(bodyparser.json());

/**
 * Used to filter out forums by version
 */
const forum_version = '0.0.4';

/*
* Gets a particular forum by the provided address.
*/
app.get('/api/forum/:id', async(req,res) => {
  forum = {address: req.params.id};
  await swaggerClient.apis.default.getForumInfo_get({
    address: req.params.id,
    "kld-from": FROM_ADDRESS,
    "kld-sync": "true"
  }).then(res => {
    forum['forumName'] = res.body.forumName;
    forum['forumDescription'] = res.body.forumDescription;
  } ).catch(error => {
    console.log(error);
    res.status(400).send(error);
  });
  res.status(200).send(forum);

});

/*
*Gets all forums addresses, names and descriptions.
*/
app.get('/api/forum', async(req, res) => {
  try {

    const request = {
      url: 'https://u0uiyvnfum-u0oh4ln74g-connect.us0-aws.kaleido.io/contracts',
      mode: 'cors',
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(KALEIDO_AUTH_USERNAME + ':' + KALEIDO_AUTH_PASSWORD).toString('base64')
      }
    };
    let contracts;
    await swaggerClient.http(request).then(response => {
      contracts = response.body;
      //res.status(200).send(forum);
    }).catch(err => {
      //console.log(err);
      res.status(500).send(err);
    });
    console.log(contracts);
    let forums = [];
    for(let i = 0; i < contracts.length; i++) {
      forum = {address: contracts[i].address};
      console.log(forum);
      await swaggerClient.apis.default.getForumInfo_get({
        address: contracts[i].address,
        "kld-from": FROM_ADDRESS,
        "kld-sync": "true"
      }).then(res => {
        forum['forumName'] = res.body.forumName;
        forum['forumDescription'] = res.body.forumDescription;
        forum['version'] = res.body.version;
        if (forum.version === forum_version) {
          forums.push(forum);
        }
      } ).catch(error => {
        //console.log(error);
      });

    }
    
    res.status(200).send(forums);

  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  } 
});

/**
 * Creats a new forum
 */
app.post('/api/forum', async(req,res) => {
  try {
    let postRes = await swaggerClient.apis.default.constructor_post({
      body: {
        // Here we set the constructor parameters
        forumName: req.body.forumName || 'New Forum',
        forumDescription: req.body.forumDescription || 'This is a new forum!',
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    console.log("URL: " + req.baseUrl +  req.url);
    res.status(200).send(postRes.body)
    console.log("Deployed instance: " + postRes.body.contractAddress);
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body)}\n${err.stack}`});
  }
});

/**
 * Gets all the threads
 */
app.get('/api/forum/:id/thread', async(req, res) => {
  try {
    let fThreads = [];
    await swaggerClient.apis.default.getThreads_get({
      address: req.params.id,
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    }).then(response => {
      console.log(response.body['threads']);
      fThreads = response.body.threads;
    }).catch(error => {
      console.log(error);
    });

    console.log("URL: " + req.baseUrl +  req.url);
    res.status(200).send(fThreads)
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

/**
 * Creates a new Thread
 */
app.post('/api/forum/:id/thread', async(req, res) => {
  try {
    let postRes = await swaggerClient.apis.default.addThread_post({
      address: req.params.id,
      body: {
        createdBy: req.body.createdBy,
        threadName: req.body.threadName,
        postBody: req.body.postBody
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    console.log("URL: " + req.baseUrl +  req.url);
    res.status(200).send(postRes.body)
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

/**
 * Gets a thread and its posts
 */
app.get('/api/forum/:id/thread/:threadId', async(req,res) => {
  try {
    let postRes = await swaggerClient.apis.default.getThread_get({
      address: req.params.id,
      threadId: req.params.threadId,
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    let fThread = postRes.body;
    fThread['posts'] = [];
    await swaggerClient.apis.default.getPosts_get({
      address: req.params.id,
      threadId: req.params.threadId,
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    }).then(response => {
      fThread.posts = response.body.posts;
    }).catch(error => {
      console.log(error);
    });
    res.status(200).send(fThread);
    console.log("URL: " + req.baseUrl +  req.url);

  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

/**
 * Creates a new post on the thread.
 */
app.post('/api/forum/:id/thread/:threadId', async(req, res) => {
  try {
    let postRes = await swaggerClient.apis.default.addPost_post({
      address: req.params.id,
      body: {
        postBody: req.body.postBody,
        postedBy: req.body.postedBy,
        threadId: req.params.threadId
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    res.status(200).send(postRes.body);
    console.log("URL: " + req.baseUrl +  req.url);
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

async function init() {

  // Kaleido example for compilation of your Smart Contract and generating a REST API
  // --------------------------------------------------------------------------------
  // Sends the contents of your contracts directory up to Kaleido on each startup.
  // Kaleido compiles you code and turns into a REST API (with OpenAPI/Swagger).
  // Instances can then be deployed and queried using this REST API
  // Note: we really only needed when the contract actually changes.  
  const url = new URL(KALEIDO_REST_GATEWAY_URL);
  url.username = KALEIDO_AUTH_USERNAME;
  url.password = KALEIDO_AUTH_PASSWORD;
  url.pathname = "/abis";
  var archive = archiver('zip');  
  archive.directory("contracts", "");
  await archive.finalize();
  let res = await request.post({
    url: url.href,
    qs: {
      compiler: "0.5", // Compiler version
      source: CONTRACT_MAIN_SOURCE_FILE, // Name of the file in the directory
      contract: `${CONTRACT_MAIN_SOURCE_FILE}:${CONTRACT_CLASS_NAME}` // Name of the contract in the 
    },
    json: true,
    headers: {
      'content-type': 'multipart/form-data',
    },
    formData: {
      file: {
        value: archive,
        options: {
          filename: 'smartcontract.zip',
          contentType: 'application/zip',
          knownLength: archive.pointer()    
        }
      }
    }
  });
  // Log out the built-in Kaleido UI you can use to exercise the contract from a browser
  url.pathname = res.path;
  url.search = '?ui';
  console.log(`Generated REST API: ${url}`);
  
  // Store a singleton swagger client for us to use
  swaggerClient = await Swagger(res.openapi, {
    requestInterceptor: req => {
      req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
    }
  });

  // Start listening
  app.listen(PORT, () => console.log(`Kaleido DApp backend listening on port ${PORT}!`))
}

init().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
  

module.exports = {
  app
};
