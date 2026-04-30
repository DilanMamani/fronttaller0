// src/lib/client.js

import { GraphQLClient } from 'graphql-request';

import { store } from '../store';

const getGraphQLClient = () => {

  const token = store.getState().login?.user?.token;

  const headers = {};

  if (token) {

    headers['x-token'] = token;

  }

  return new GraphQLClient(import.meta.env.VITE_GRAPHQL_URL, {

    headers,

  });

};

export default getGraphQLClient;