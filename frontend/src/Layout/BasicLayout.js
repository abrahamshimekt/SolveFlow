import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUser } from "../Redux/Features/getUserSlice";
import { removeCookie } from "../utils/helper";
import styles from "./BasicLayout.module.scss";
import { Menu, Typography, Button } from "antd";
import { userLogout } from "../Redux/Features/userLogoutSlice";
import cc from "classnames";

const BasicLayout = ({
  children,
  title,
  isPadding = true,
  handleCompileToDoc,
  setIsMergeDocumentModalVisible,
  libraryTitle,
  isMenu = true,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState([]);

  const handleLogout = () => {
    dispatch(userLogout({}));
    navigate(`/`);
    removeCookie("token");
    dispatch(getUser("token"));
  };

  useEffect(() => {
    let pathName = `/${window.location?.pathname?.split("/")[1]}`;
    if (pathName === "/home" || pathName === "/chat") {
      setSelectedTab((prev) => {
        return ["1"];
      });
    }
    if (pathName === "/threads") {
      setSelectedTab((prev) => {
        return ["2"];
      });
    }
  }, []);

  return (
    <div className={styles.basic_layout_container}>
      <div className={styles.layout_container}>
        <div
          className={cc(styles.children_container)}
          style={{
            padding: !isPadding && "0",
          }}
        >
          {title && <Typography.Title level={2}>{title}</Typography.Title>}

          {isMenu && (
            <div className={styles.chat_menu_container}>
              <div className={styles.auto_container}>
                <Menu
                  defaultSelectedKeys={selectedTab}
                  selectedKeys={selectedTab}
                  mode="horizontal"
                  style={{ display: 'flex', width: '50%' }}
                  items={[
                    {
                      key: "1",
                      label: "Problems",
                      onClick: () => {
                        navigate(`/home`);
                      },
                    },
                    {
                      key: "2",
                      label: "Threads",
                      onClick: () => {
                        navigate(`/threads`);
                      },
                    },
                    {
                      key: "3",
                      label: "Logout",
                      onClick: () => {
                        handleLogout();
                      },
                    },
                  ]}
                />
                {libraryTitle && !isPadding && (
                  <Typography.Paragraph className={styles.libraryTitle}>
                    {libraryTitle}
                  </Typography.Paragraph>
                )}
              </div>
            </div>
          )}

          {children}
          {!isPadding && (
            <div className={styles.buttonGroup}>
              <Button type="dashed" onClick={handleCompileToDoc}>
                Compile to Document
              </Button>
              <Button
                type="dashed"
                onClick={() => setIsMergeDocumentModalVisible(true)}
              >
                Merge Document
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicLayout;
