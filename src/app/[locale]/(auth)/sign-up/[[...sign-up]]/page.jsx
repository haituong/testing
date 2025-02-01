"use client";

import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Card, Flex, Typography } from "antd";
import ImageWithBasePath from "../../../../../common/imageWithBasePath";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from 'next/navigation';

const { Title, Text } = Typography;

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const translate = useTranslations();
  
  // Get the current locale from the pathname
  const currentLocale = pathname.split('/')[1] || 'en'; 

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Here, you would handle form submission, e.g., call an API
      console.log("Form Submitted:", values);
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
          {translate("signUp.title")}
        </Title>
        <Text type="secondary" className="text-center">
          {translate("signUp.description")}
        </Text>

        <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 20 }}>
          <Form.Item
            label={translate("signUp.email")}
            name="email"
            rules={[
              { required: true, message: translate("signUp.emailRequired") },
              { type: "email", message: translate("signUp.validEmail") },
            ]}
          >
            <Input suffix={<i className="ti ti-mail" />} placeholder={translate("signUp.emailPlaceholder")} />
          </Form.Item>

          <Form.Item
            label={translate("signUp.password")}
            name="password"
            rules={[
              { required: true, message: translate("signUp.passwordRequired") },
              { min: 6, message: translate("signUp.passwordMinLength") },
            ]}
            hasFeedback
          >
            <Input.Password placeholder={translate("signUp.passwordPlaceholder")} />
          </Form.Item>

          <Form.Item
            label={translate("signUp.confirmPassword")}
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: translate("signUp.confirmPasswordRequired") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(translate("signUp.passwordMismatch")));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password placeholder={translate("signUp.confirmPasswordPlaceholder")} />
          </Form.Item>

          <Form.Item name="terms" valuePropName="checked" noStyle>
            <Checkbox>
              <Link href="/terms">
                <Text type="primary">{translate("signUp.termsAgreement")}</Text>
              </Link>
            </Checkbox>
          </Form.Item>

          <Form.Item className="mt-2">
            <Button type="primary" htmlType="submit" block loading={loading}>
              {translate("signUp.signUpButton")}
            </Button>
          </Form.Item>
        </Form>

        <Text className="text-center">
          {translate("signUp.existingAccount")}{" "}
          <Link href={`/${currentLocale}/sign-in`}>
            <Text type="secondary" strong className="link-hover">
              {translate("signUp.signIn")}
            </Text>
          </Link>
        </Text>
      </Card>
    </Flex>
  );
};

export default SignUpPage;
