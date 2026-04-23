import { GraphQLClient } from 'graphql-request';
import { store } from '../store';

const getGraphQLClient = () => {
  const token = store.getState().login?.user?.token;

  const headers = {};
  if (token) {
    headers['x-token'] = token;
  }

  return new GraphQLClient('http://localhost:4001/graphql', {
    headers,
  });
}; export default getGraphQLClient;