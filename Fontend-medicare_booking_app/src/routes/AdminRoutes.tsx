import React from "react";
import LayoutAdmin from "../components/layout/AdminLayout/layout.admin";
import { Route, Routes } from "react-router-dom";
import AdminDashboardPage from "../modules/admin/pages/AdminDashboardPage";
import DoctorManagementPage from "../modules/admin/pages/DoctorManagementPage";
import { Button, Result } from "antd";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LayoutAdmin />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="doctor" element={<DoctorManagementPage />} />
      </Route>
      <Route
        path="*"
        element={
          <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Button type="primary">Back Home</Button>}
          />
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
