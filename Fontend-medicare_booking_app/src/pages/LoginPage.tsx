import { App, Button, Divider, Form, Input, notification } from "antd";
import type { FormProps } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.scss";

type FieldType = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();


  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    // const { email, password } = values;

    // const res = await loginAPI(email, password);
    // console.log(res);
    // if (res?.data) {
    //   setIsAuthenticated(true);
    //   setUser(res.data.user);
    //   localStorage.setItem("access_token", res.data.access_token);
    //   message.success("Đăng nhập tài khoản thành công!");
    //   navigate("/");
    // } else {
    //   notification.error({
    //     message: "Đăng nhập tài khoản thất bại!",
    //     description: res.message,
    //     placement: "topRight",
    //   });
    // }
  };

  return (
    <div className="register-page">
      <main className="main">
        <div className="container">
          <section className="wrapper">
            <div className="heading">
              <h2 className="text text-large">Đăng nhập</h2>
              <Divider />
            </div>
            <Form name="form-register" onFinish={onFinish} autoComplete="off">
              <Form.Item<FieldType>
                labelCol={{ span: 24 }} //whole column
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email không được để trống!" },
                  { type: "email", message: "Email không đúng định dạng!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item<FieldType>
                labelCol={{ span: 24 }} //whole column
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: "Mật khẩu không được để trống!" },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSubmit}>
                  Đăng nhập
                </Button>
              </Form.Item>
              <Divider>Or</Divider>
              <p className="text text-normal" style={{ textAlign: "center" }}>
                Chưa có tài khoản ?
                <span>
                  <Link to="/register"> Đăng ký </Link>
                </span>
              </p>
            </Form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
