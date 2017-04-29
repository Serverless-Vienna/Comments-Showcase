# Comments-Showcase

Demo: https://serverless-vienna.firebaseapp.com

## Setup

Create Firebase Web Project https://codelabs.developers.google.com/codelabs/firebase-web/#2

Setup Firebase CLI https://codelabs.developers.google.com/codelabs/firebase-web/#3

Add configuration to config.json (copy it from config.template.json) via add firebase to webapp in console at https://console.firebase.google.com/project/<your-project>/overview:
```
{
  "**** FIREBASE ****": "",
  "FIREBASE": {
    "apiKey": "",
    "authDomain": "",
    "databaseURL": "",
    "projectId": "",
    "storageBucket": "",
    "messagingSenderId": ""
  },

[...]

}
```

Choose your google project and get webclient id  https://console.developers.google.com/apis/credentials?project=<your-project>
and add it to APP_KEY in config.json:
```
{

[...]

    "**** OAUTH ****": "",
    "OAUTH": {
        "GOOGLE": {
            "APP_KEY": ""
        }
    }
}
```
And add http://localhost:3000 to Authorized JavaScript origins in the client id configuration.

Npm stuff:
```
$ npm install
```

Local Development on localhost:3000
```
$ npm start
```
Login, write a message logout

```
$ npm run build
...
$ firebase deploy
```

open your application url and have fun.
