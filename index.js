// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;
var path = require('path');
var SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://xpensetag-test:test@ds037272.mlab.com:37272/xpensetag-test',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'appId', // The application id to host with this server instance. You can use any arbitrary string. For migrated apps, this should match your hosted Parse app.
  masterKey: process.env.MASTER_KEY || 'masterKey', // The master key to use for overriding ACL security. You can use any arbitrary string. Keep it secret! For migrated apps, this should match your hosted Parse app.
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  clientKey: process.env.CLIENT_KEY || 'optionalClientKey',
  javascriptKey: process.env.JAVASCRIPT_KEY || 'optionalJavascriptKey',
  restAPIKey: process.env.REST_API_KEY || 'optionalRestApiKey',
  dotNetKey: process.env.DOT_NET_KEY || 'optionalDotNetKey',
  fileKey: process.env.FILE_KEY || 'optionalFileKey',
  allowClientClassCreation: true,
  enableAnonymousUsers: true,
  liveQuery: {
    classNames: [] // List of classes to support for query subscriptions
  },
  push: {
    android: {
      senderId: '303038234133',
      apiKey: 'AIzaSyAG-Vqkv3I0YXYGWdbjtqo3TnpCo60h3bQ '
    },
    /*ios: {
      pfx: '/file/path/to/XXX.p12',
      bundleId: '',
      production: false
    }*/
  },
  appName: 'AppName',
  publicServerURL: 'http://ec2-52-87-221-80.compute-1.amazonaws.com:1337/parse',
  verifyUserEmails: true,
  emailAdapter: SimpleSendGridAdapter({
    apiKey: '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',
    fromAddress: 'test@example.com',
  }),
  // filesAdapter: new S3Adapter(
  //   "AWS_ACCESS_KEY_ID",
  //   "AWS_SECRET_ACCESS_KEY",
  //   "BUCKET_NAME",
  //   { directAccess: true }
  // ),
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
