"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Flex, Typography } from "antd";
import ImageWithBasePath from "../../../../../common/imageWithBasePath";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from 'next/navigation';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const translate = useTranslations();
  
  // Get the current locale from the pathname
  const currentLocale = pathname.split('/')[1] || 'en'; 

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate sending reset password email
      console.log("Reset link sent to:", values.email);
    }, 1500); // Simulate an API call
  };

  return (
    <Flex
      align="center"
      justify="center"
      style={{ height: "100vh", background: "#f0f2f5", padding: "20px" }}
    >
      <Card
        style={{ width: "100%", maxWidth: 400, borderRadius: 10 }}
        bordered={false}
        className="shadow-md"
      >
        <Flex justify="center" style={{ marginBottom: 20 }}>
          <ImageWithBasePath src="assets/img/logo.svg" alt="Logo" width={120} />
        </Flex>

        <Title level={4} className="text-center">
          {translate("forgotPassword.title")}
        </Title>
        <Text type="secondary" className="text-center">
          {translate("forgotPassword.description")}
        </Text>

        <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
          <Form.Item
            label={translate("forgotPassword.email")}
            name="email"
            rules={[
              { required: true, message: translate("forgotPassword.emailRequired") },
              { type: "email", message: translate("forgotPassword.validEmail") },
            ]}
          >
            <Input suffix={<i className="ti ti-mail" />} placeholder={translate("forgotPassword.emailPlaceholder")} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {translate("forgotPassword.submitButton")}
            </Button>
          </Form.Item>
        </Form>

        <Text className="text-center">
          {translate("forgotPassword.returnToSignIn")}{" "}
          <Link href="/sign-in">
            <Text type="secondary" strong className="link-hover">
              {translate("forgotPassword.signIn")}
            </Text>
          </Link>
        </Text>
      </Card>
    </Flex>
  );
};

export default ForgotPasswordPage;
