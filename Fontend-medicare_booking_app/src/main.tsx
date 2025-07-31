import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { App as AntdApp } from "antd";

import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import "./index.css";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { AppProvider } from "./components/contexts/app.context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AntdApp>
        <AppProvider>
          <ConfigProvider locale={viVN}>
            <App />
          </ConfigProvider>
        </AppProvider>
      </AntdApp>
    </BrowserRouter>
  </StrictMode>
);
