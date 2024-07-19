import React from "react";
import styles from "./About.module.scss";
import { Button, Typography } from "antd";
import BasicLayout from "../../Layout/BasicLayout";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();
  return (
    <BasicLayout isMenu={false}>
      <div className={styles.about_container}>
        <Typography.Title level={2}>About this thing</Typography.Title>
        <Typography.Paragraph level={2} className={styles.paragraph}>
          This aims to help you define your software projects to better solve
          them
        </Typography.Paragraph>
        <div className={styles.button_container}>
          <Button type="primary" size="large" onClick={() => navigate(`/`)}>
            Go to Problems
          </Button>
        </div>
      </div>
    </BasicLayout>
  );
};

export default About;
