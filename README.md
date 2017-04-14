# Comments-Showcase

Demo: https://serverless-vienna.firebaseapp.com

## Setup

Add Firebase Web Project https://tbd

Add configuration to config.json:
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

Add Firebase:
```
$ firebase use -add
```

Choose project and get webclient id https://console.developers.google.com/apis/credentials?project=_
and add to config.json:
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
