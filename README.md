# Comments-Showcase

## Introduction
This is a serverless showcase webapp with Bluemix, Watson IoT and Google Web Identity.

## Architecture

## Steps to Serverlessness on Bluemix/Watson IoT

### Bluemix Project

https://hub.jazz.net/project/serverlessvienna/Comments-Showcase

### Bluemix Git Repository

https://hub.jazz.net/git/serverlessvienna/Comments-Showcase

### Watson IoT

### Google Identity
Configure and setup an oauth2 credential according to [Google Identity](https://developers.google.com/identity/protocols/OpenIDConnect
). Don't forget to configure http://localhost:3000 as an Authorized JavaScript origin (Cors!) for development.

Take the client id and enter it in ```./src/config.json``` under the key **OAUTH->GOOGLE->APP_KEY** and ```./serverless/serverless.yml``` under the key **OAUTH_GOOGLE_APP_KEY**.

## local development
Install the project dependencies (npm install) and start the application locally (npm start).
```bash
$ npm install
$ npm start
```
The webapp can now be loaded at http://localhost:3000.

## build and deploy webapp

```bash
$ npm run build
```
and copy build/ to public folder of the bluemix project

## Future Tasks

- Persisting/Historization of comments
- [...]
