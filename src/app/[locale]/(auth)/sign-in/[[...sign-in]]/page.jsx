"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Flex,
  Typography,
  message,
} from "antd";
import ImageWithBasePath from "../../../../../common/imageWithBasePath";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const { Title, Text } = Typography;

const SignInPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const translate = useTranslations();
  const [form] = Form.useForm(); // Ensure form is initialized

  const currentLocale = pathname.split("/")[1] || "en";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Save the token (e.g., in cookies or local storage)
        const expires = values.remember ? 30 * 24 * 60 * 60 : null; // 30 days in seconds or session cookie
        document.cookie = `authToken=${data.token}; path=/; ${expires ? `max-age=${expires}` : ''}`;
        localStorage.setItem('user', JSON.stringify(data.userData));
        messageApi.success('Login successful!');
        setTimeout(() => router.push(`/`), 1000);
      } else {
        messageApi.error(data.error || 'Login failed');
      }
    } catch (error) {
      messageApi.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      align="center"
      justify="center"
      style={{ height: "100vh", background: "#f0f2f5", padding: "20px" }}
    >
      <Card
        style={{ width: 400, borderRadius: 10 }}
        bordered={false}
        className="shadow-md"
      >
        <Flex justify="center" style={{ marginBottom: 20 }}>
          <ImageWithBasePath src="assets/img/logo.svg" alt="Logo" width={120} />
        </Flex>

        <Title level={4} className="text-center">
          {translate("signIn.title")}
        </Title>
        <Text type="secondary" className="text-center">
          {translate("signIn.description")}
        </Text>

        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 20 }}
          form={form}
          initialValues={{ remember: true }}
        >
          <Form.Item
            label={translate("signIn.email")}
            name="email"
            rules={[
              { required: true, message: translate("signIn.emailRequired") },
              { type: "email", message: translate("signIn.validEmail") },
            ]}
          >
            <Input
              suffix={<i className="ti ti-mail" />}
              placeholder={translate("signIn.emailPlaceholder")}
            />
          </Form.Item>

          <Form.Item
            label={translate("signIn.password")}
            name="password"
            rules={[
              { required: true, message: translate("signIn.passwordRequired") },
            ]}
          >
            <Input.Password
              placeholder={translate("signIn.passwordPlaceholder")}
            />
          </Form.Item>

          <Flex
            justify="space-between"
            align="center"
            style={{ marginBottom: 10 }}
          >
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{translate("signIn.rememberMe")}</Checkbox>
            </Form.Item>
            <Link href={`/${currentLocale}/forgot-password`}>
              <Text type="primary" className="link-hover">
                {translate("signIn.forgotPassword")}
              </Text>
            </Link>
          </Flex>

          <Form.Item>
            {contextHolder}
            <Button
              color="danger"
              variant="solid"
              htmlType="submit"
              block
              loading={loading}
            >
              {translate("signIn.signInButton")}
            </Button>
          </Form.Item>
        </Form>

        <Text className="text-center">
          {translate("signIn.newOnPlatform")}{" "}
          <Link href={`/${currentLocale}/sign-up`}>
            <Text type="secondary" strong className="link-hover">
              {translate("signIn.createAccount")}
            </Text>
          </Link>
        </Text>
      </Card>
    </Flex>
  );
};

export default SignInPage;
