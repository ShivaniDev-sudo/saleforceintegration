# React.js and Salesforce Integration using REST API 

## About

A Salesforce and React application integration project example.

The following ideas are illustrated by this application:


  - authenticating with OAuth 2.0 (login, logout, retrieving session info)
  - using the REST API to run a SOQL query
  - using the [Lightning Design System](https://www.lightningdesignsystem.com) (LDS) in a React application 

The arrangement of the source code for this app is as follows:

The React app is stored in the client directory.
The server directory contains the node.js app that functions as middleware, communicating with the Salesforce Platform.


## Installation

1. Create a [Connected App](https://help.salesforce.com/articleView?id=connected_app_create.htm) in Salesforce.

1. Create a `.env` file in the root directory of this project and add this content (make sure to replace the values):

   ```
CLIENT_ID=dummy
CLIENT_SECRET=dummy
REDIRECT_URI=https://www.test.com
SALESFORCE_SECRET=dummy@qLYObVwEiJxt
SALESFORCE_USERNAME=dummy@username.sandbox
SALESFORCE_API_HOST_URL=https://dummy.develop.my.salesforce.com/services/data/v51.0/query?q=SELECT Id, Name FROM Account LIMIT 3
   ```

1. Run `npm run build` to build the app.

1. Run `npm start` to start the app.

