"use client";

import React, { useState, useEffect } from "react";
import { Layout, ConfigProvider } from "antd";
import HeaderComponent from "../Header/HeaderComponent";
import SiderComponent from "../Sider/SiderComponent";

const { Content } = Layout;

const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Initialize collapsed state based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true); // Collapse by default on mobile
      } else {
        setCollapsed(false); // Expand by default on desktop
      }
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedColor: "#e41f07",
            itemHoverColor: "#e41f07",
            itemSelectedBg: "#fce9e6",
            itemHoverBg: "#fce9e6",
          },
          Button: {
            defaultHoverBorderColor: "#E41F07",
            defaultHoverColor: "#E41F07",
          },
          Tabs: {
            itemActiveColor: "#E41F07",
            itemHoverColor: "#E41F07",
            itemSelectedColor: "#E41F07",
            horizontalMargin: 0,
            cardGutter: 0,
          },
          Select: {
            hoverBorderColor: "#E41F07",
            activeBorderColor: "#E41F07",
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <HeaderComponent onToggleSidebar={toggleSidebar} />
        <Layout>
          <SiderComponent collapsed={collapsed} onCollapse={toggleSidebar} />
          <Layout>
            <Content
              style={{
                padding: 12,
                margin: 0,
                minHeight: 280,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default LayoutComponent;