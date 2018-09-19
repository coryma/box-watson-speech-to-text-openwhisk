# box-watson-speech-to-text-openwhisk
This example project gets you started with using Node.js to build [Box webhook](https://github.com/box/box-node-sdk/blob/master/docs/webhooks.md) handler app and deoploy it on the IBM Cloud Functions platform (powered by Apache OpenWhisk).

## Getting Started

These instructions will get you a copy of the project up and running the IBM Cloud Functions platform for Box webhook app development and testing purposes. 

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/)
- [Box Developer Account](https://developer.box.com/)
- [IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview)

You should have a basic understanding of the OpenWhisk programming model. If not, [try the action, trigger, and rule demo first](https://github.com/IBM/openwhisk-action-trigger-rule).

Also, you'll need an IBM Cloud account and the latest [Whisk Deploy Utility (`wskdeploy`) installed and on your PATH](https://github.com/apache/incubator-openwhisk-wskdeploy#downloading-released-binaries).


### Using the sample
##### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developer.box.com)
    * Press "Console"
2. Select "Create New App"
    * Select "Custom App" and press "Next"
    * Select "OAuth 2.0 with JWT (Server Authentication)" and press "Next"
    * Name the application "Box Webhook App - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
3. Click "Webhooks" section in the left-side navbar
    * Press "Generate Key" for both the "Primary Key" and "Secondary Key" to create keys for signing the events
4. Return to the "Configuration" section and go to "Application Scopes"
    * Check "Manage webhooks" and click "Save Changes"
5. Scroll down to "App Settings"
    * Press "Download as JSON"
    * Save the JSON config file, which contains your application's webhook signing keys

##### Step 2. Clone the repository 

1. Clone the respository and initial the project
```
$ git clone https://github.com/coryma/box-node-webhook-to-openwhisk-sample.git # or fork and clone your own
$ cd box-node-webhook-to-openwhisk-sample
$ npm install
```
2. Rename local.env.template to local.env
3. Edit local.env
    * In `BOX_USER_ID`, input your Box account ID 
    * In `BOX_CONFIG`, paste the contents of your JSON config file into the `''` (keep the single quote). 

##### Step 3. Create OpenWhisk actions and mappings

1. Deploy the package and the action
```bash
./deploy.sh --install
```
2. Log into the [IBM Cloud console](https://console.bluemix.net/openwhisk/actions)
    * Find your package and action in the right panel, and click the action name (ex. hello-box). 
3. Click "Endpoints" section in the left-side navbar 
    * Copy the "URL" in "Web Actions"

#### Step 4. Create a Box webhook to connect to your OpenWhisk action
Note: See [Getting Started with Webhooks V2](https://docs.box.com/v2.0/docs/getting-started-with-webhooks-v2) and [Overview of Webhooks V2](https://docs.box.com/reference#webhooks-v2) for more info.

1. Choose a folder in your Box account and record the "Folder ID"
    * See these [instructions](https://docs.box.com/v2.0/docs/getting-started-with-webhooks-v2#section-3-create-a-webhook) for how to find the "Folder ID"
    * *Note: You can't create a webhook on your root folder (ID = 0)*
2. Press "Generate a Developer Token" to create a developer token for your app
    * *The token is valid for an hour, but you can get another one if it expires*
3. Create a webhook by using `curl` to call the [Box webhook API](https://docs.box.com/reference#create-webhook):

    ```
    curl https://api.box.com/2.0/webhooks \
    -H "Authorization: Bearer <DEVELOPER_TOKEN>" \
    -d '{"target": {"id": "<FOLDER_ID>", "type": "folder"}, "address": "<YOUR_WEB_ACTION_URL>", "triggers": ["FILE.UPLOADED"]}'; echo
    ```

    *Note: You must use the API to create V2 webhooks -- there is no Web UI*
   
4. You should get a response confirming that the webhook has been created:

    ```
    {"id":"<WEBHOOK_ID>","type":"webhook","target":{"id":"<FOLDER_ID>","type":"folder"},"created_by":<YOUR_USER_INFO>,"created_at":"2016-11-10T15:00:10-08:00","address":"<YOUR_WEB_ACTION_URL>","triggers":["FILE.UPLOADED"]}
    ```
    
    * Note the `<WEBHOOK_ID>` in case you need to modify or delete the webhook later

#### Step 5. Test the webhook
1. Tail the logs
```
bx wsk activation poll
```
2. Upload a file to the Box folder that you specified when creating the webhook
3. You should see a new set of events appear in the heroku logs:
    ```
    webhook=########, trigger=FILE.UPLOADED, source=<file id=########### name=xxxx.xx>
    ```
