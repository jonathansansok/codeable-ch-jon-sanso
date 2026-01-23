import "@fontsource/geist";
import "@fontsource/geist-mono";

import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import { apollo } from "./apollo";
import { AppProviders } from "./app/providers/AppProviders";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apollo}>
    <AppProviders>
      <App />
    </AppProviders>
  </ApolloProvider>
);
