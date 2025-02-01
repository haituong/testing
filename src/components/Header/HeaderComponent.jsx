"use client";

import React from "react";
import { Layout, Dropdown, Avatar, Badge, Button, message } from "antd";
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import ImageWithBasePath from "@/common/imageWithBasePath";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const { Header } = Layout;

const HeaderComponent = ({ onToggleSidebar }) => {
  const userData = JSON.parse(localStorage.getItem("user"));
  const [messageApi, contextHolder] = message.useMessage();
  const pathname = usePathname();
  const router = useRouter();
  const translate = useTranslations();
  const currentLocale = pathname.split("/")[1] || "en";
  const isMobile = window.innerWidth < 768;

  const handleLogout = () => {
    localStorage.removeItem("user");
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    messageApi.success("Logged out successfully!");
    setTimeout(() => {
      router.push(`/${currentLocale}/sign-in`);
    }, 1000);
  };

  const menuItems = [
    {
      key: "profile",
      label: (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong>{userData.display_name}</strong>
          <span>{userData.email}</span>
        </div>
      ),
      style: { padding: "8px 16px" },
    },
    {
      type: "divider",
    },
    {
      key: "personal-settings",
      icon: <SettingOutlined />,
      label: translate("headerComponent.settingTitle"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: translate("headerComponent.logOutTitle"),
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fff",
        padding: "0 24px",
        borderBlockEnd: "1px solid rgba(5, 5, 5, 0.06)",
        height: "56px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Burger Menu Icon for Mobile */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: "18px" }} />}
            onClick={onToggleSidebar}
            style={{ display: "flex", alignItems: "center" }}
          />
        )}

        {/* Logo */}
        <ImageWithBasePath
          src={
            isMobile
              ? "assets/img/logo-small.svg"
              : "assets/img/logo.svg"
          }
          alt="Logo"
          width={isMobile ? "80px" : "120px"} // Smaller logo for mobile
          height="32px"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Badge count={5}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: "18px" }} />}
            style={{ display: "flex", alignItems: "center" }}
          />
        </Badge>

        {/* User Dropdown */}
        <Badge status="success" dot>
          {contextHolder}
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
            overlayStyle={{ width: "200px" }} // Set the width of the dropdown menu
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <Avatar shape="square" icon={<UserOutlined />} />
            </div>
          </Dropdown>
        </Badge>
      </div>
    </Header>
  );
};

export default HeaderComponent;