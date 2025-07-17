import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={viVN}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>
);
