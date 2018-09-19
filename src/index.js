
'use strict'
import SpeechToTextV1 from 'watson-developer-cloud/speech-to-text/v1'
import BoxSDK from 'box-node-sdk'

function main(args) {

    const boxConfig = JSON.parse(args.boxConfig)
    const boxUserId = args.boxUserId

    let body = new Buffer(args.__ow_body, 'base64')
    body = JSON.parse(body.toString('utf8'));

    let isValid = BoxSDK.validateWebhookMessage(stringifyBody(body), args.__ow_headers,
        boxConfig.webhooks.primaryKey, boxConfig.webhooks.secondaryKey)

    return new Promise(function (resolve, reject) {

        if (isValid) {
            //Initialize speechToText SDK
            const speechToText = new SpeechToTextV1({
                username: args.watsonUserName,
                password: args.watsonPassword,
                url: 'https://stream.watsonplatform.net/speech-to-text/api/'
            });

            //Initialize Box SDK
            const boxSDK = BoxSDK.getPreconfiguredInstance(boxConfig)

            // Get an app user client
            const boxClient = boxSDK.getAppAuthClient('user', boxUserId)

            //Read file stream
            boxClient.files.getReadStream(body.source.id, null, (err, stream) => {

                var params = {
                    // From file
                    audio: stream,
                    content_type: 'audio/mp3',
                    model: 'zh-CN_BroadbandModel'
                };

                speechToText.recognize(params, (err, res) => {
                    if (err) {
                        console.log(err.message)
                        reject({ message: err.message })
                    } else {
                        console.log(JSON.stringify(res, null, 2))
                        resolve({ payload: JSON.stringify(res, null, 2) })
                    }
                });
            })
        } else {
            console.log(`Error 403: Message authenticity not verified ${isValid}`)
            reject({ message: `Error 403: Message authenticity not verified` })
        }
    })

}

/**
 *  Stringify the request body from 'object' to 'string'. 
 *  Fix the issue that Box validateWebhookMessage method cannot handle Chinese 
 *  and other none-ASCII characters correctly.
 */
function stringifyBody(obj) {
    var str = JSON.stringify(obj)
    str = str.replace(/\"name\":\"(.*?)\"/g, (match, str) => {
        str = "\"" + str.replace(/([^\u0000-\u007F])/g, (match, str) => {
            return escape(str).replace(/%u/g, "\\u").toLowerCase()
        }) + "\""
        return `"name":${str}`
    })
    return str
}

exports.main = main;



