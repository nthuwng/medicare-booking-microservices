import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { App as AntdApp } from "antd";

import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { AppProvider } from "./components/contexts/app.context.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AntdApp>
        <AppProvider>
          <ConfigProvider locale={viVN}>
            <GoogleOAuthProvider clientId={clientId}>
              <App />
            </GoogleOAuthProvider>
          </ConfigProvider>
        </AppProvider>
      </AntdApp>
    </BrowserRouter>
  </StrictMode>
);
