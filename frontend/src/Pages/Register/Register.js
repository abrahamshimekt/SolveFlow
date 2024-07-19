import React from "react";
import styles from "./Register.module.scss";
import { Button, Space, Typography } from "antd";
import { BASE_URL } from "../../Config";
import axios from "axios";

const Register = () => {
  const handleRegister = (type) => {
    if (!type) {
      return "";
    }
    sessionStorage?.setItem("authType", type);
    window.location = `${BASE_URL}/api/auth/google`;
  };

  return (
    <div className={styles.register_container}>
      <div className={styles.register}>
        <Typography.Title level={2}>Authenticate</Typography.Title>
        <Space>
          <Button
            size="large"
            type="primary"
            onClick={() => handleRegister("SIGN_IN")}
          >
            Login
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={() => handleRegister("SIGN_UP")}
          >
            Sign Up
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Register;
