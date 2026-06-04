import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="it" style={{ backgroundColor: "#1E293B" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root { background-color: #1E293B !important; margin: 0 !important; }
          body > div { background-color: #1E293B !important; }
        `}</style>
      </head>
      <body style={{ backgroundColor: "#1E293B", margin: 0 }}>{children}</body>
    </html>
  );
}
