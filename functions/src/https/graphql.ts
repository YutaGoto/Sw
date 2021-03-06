import { graphqlExpress } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { readFileSync } from 'fs';
import { makeExecutableSchema } from 'graphql-tools';
import { join } from 'path';

import { failureResponse } from '../helpers/failureResponse';
import { resolvers } from '../resolvers';

const typeDefsFile = join(__dirname, '..', '..', 'schema.graphqls');
const typeDefs = readFileSync(typeDefsFile, 'utf-8');
const schema = makeExecutableSchema({typeDefs, resolvers});

const graphql = graphqlExpress(async (request, response) => {
  const {authorization} = request.headers as any;

  if (authorization) {
    try {
      const idToken = authorization.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const user = {
        displayName: decodedToken.name || '',
        photoURL: decodedToken.picture || '',
        uid: decodedToken.uid,
        email: decodedToken.email || ''
      };
      return {schema, context: {user}};
    } catch (err) {
      failureResponse(response, err);
    }
  }

  return {schema, context: {}};
});

const filter = (request, response, next) => {
  if (request.method === 'OPTIONS') {
    response.sendStatus(200);
    return;
  }

  if (request.method === 'GET') {
    request.method = 'POST';
    request.url = '/';
    request.body = request.body || request.query;
    if (typeof request.body.variables === 'string') {
      try {
        request.body.variables = JSON.parse(request.body.variables);
      } catch (e) {
        console.error(e);
      }
    }
  }
  next();
};

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(filter)
  .use(graphql);

export = functions.https.onRequest(app)
