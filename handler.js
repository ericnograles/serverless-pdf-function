'use strict';

const { Chromeless } = require('chromeless');
const https = require('follow-redirects').https;

module.exports.pdf = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let body = JSON.parse(event.body);

  // We utilize a Chromeless Proxy Service that is deployed to IoT
  // See: https://github.com/graphcool/chromeless/tree/master/serverless#setup
  const chromeless = new Chromeless({
    remote: {
      endpointUrl: process.env.CHROMELESS_PROXY_ENDPOINT_URL,
      apiKey: process.env.CHROMELESS_PROXY_API_KEY
    }
  });

  console.log('Rendering PDF...');
  chromeless
    .setHtml(body.html)
    .wait(1000)
    .pdf({ printBackground: true, displayHeaderFooter: true })
    .then(url => {
      if (body.send_binary === true) {
        console.log('Sending binary');
        https.get(url, res => {
          let data = [];
          res.on('data', chunk => {
            data.push(chunk);
          });

          res.on('end', () => {
            let buffer = Buffer.concat(data);
            let base64Data = buffer.toString('base64');
            let resp = {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/pdf'
              },
              body: base64Data,
              isBase64Encoded: true
            };
            callback(null, resp);
          });
        });
      } else {
        console.log('Sending URL');
        let resp = {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url }),
          isBase64Encoded: false
        };
        callback(null, resp);
      }
    })
    .catch(error => {
      let response = {
        statusCode: error.statusCode || 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: error.message, trace: JSON.stringify(error)}),
        isBase64Encoded: false
      };
      callback(error, response);
    });
};
