import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { apollo } from "./apollo";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apollo}>
    <App />
  </ApolloProvider>
);
