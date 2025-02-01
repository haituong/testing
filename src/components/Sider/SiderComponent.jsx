"use client";

import React from "react";
import { Layout, Menu, Drawer } from "antd";
import { SidebarData } from "@/data/json/sidebarData";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const { Sider } = Layout;

const SiderComponent = ({ collapsed, onCollapse }) => {
  const pathname = usePathname();
  const translate = useTranslations("sidebarComponent");
  const currentLocale = pathname.split("/")[1] || "en";
  const isMobile = window.innerWidth < 768;

  // Translate Sidebar Data
  const translateSidebarData = (data) => {
    return data.map((group) => ({
      ...group,
      label: translate(group.label), // Translate group labels
      submenuHdr: translate(group.submenuHdr), // Translate submenu headers
      submenuItems: group.submenuItems.map((item) => ({
        ...item,
        label: translate(item.label), // Translate submenu item labels
      })),
    }));
  };

  const transformedData = translateSidebarData(SidebarData);

  // Function to transform data for the Menu component
  const transformData = (data) => {
    return data.map((group, index) => ({
      key: `g${index + 1}`,
      label: collapsed ? null : group.label, // Hide group label when collapsed
      type: "group",
      children: group.submenuItems.map((item, subIndex) => ({
        key: `${index + 1}-${subIndex + 1}`,
        label: <Link href={`/${currentLocale}${item.link}`}>{item.label}</Link>,
        icon: <i className={item.icon} />,
      })),
    }));
  };

  const items = transformData(transformedData);

  // Function to determine the selected keys based on the current URL
  const getSelectedKeys = () => {
    const selectedKeys = [];
    transformedData.forEach((group, groupIndex) => {
      group.submenuItems.forEach((item, itemIndex) => {
        if (pathname === `/${currentLocale}${item.link}`) {
          selectedKeys.push(`${groupIndex + 1}-${itemIndex + 1}`);
        }
      });
    });
    return selectedKeys;
  };

  return (
    <>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          width={256}
          className="p-0 bg-white"
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
        >
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            items={items}
          />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={onCollapse}
          open={!collapsed} // Drawer is open when not collapsed
          width={256}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            items={items}
          />
        </Drawer>
      )}
    </>
  );
};

export default SiderComponent;