//frontend\src\apollo.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const apollo = new ApolloClient({
  link: new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql" }),
  cache: new InMemoryCache(),
});
