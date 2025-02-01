import React, { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Spin,
  message,
  InputNumber,
} from "antd";

export default function CreateComponent({
  open,
  onClose,
  moduleColumns,
  fetchData,
}) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const renderFooter = () => (
    <div style={{ textAlign: "right" }}>
      <Button style={{ marginRight: 8 }} onClick={onClose}>
        Cancel
      </Button>
      {contextHolder}
      <Button
        className="bg-primary"
        htmlType="submit"
        form={`product_create_form`}
      >
        Save
      </Button>
    </div>
  );
  const excludeColumns = ["createdAt", "updatedAt"];

  const renderFormItems = () => {
    // Filter out excluded columns and sort to ensure `name` and `email` appear first
    const filteredAndSortedColumns = [...moduleColumns]
      .filter((column) => !excludeColumns.includes(column.name)) // Exclude specified columns
      .sort((a, b) => {
        if (a.name === "name") return -1;
        if (b.name === "name") return 1;
        if (a.name === "email") return -1;
        if (b.name === "email") return 1;
        return 0;
      });
    console.log(filteredAndSortedColumns);
    return (
      <>
        {filteredAndSortedColumns.map((column) => {
          const commonProps = {
            name: column.name,
            label: column.label,
          };

          // Special handling for name
          if (column.name === "name") {
            return (
              <Form.Item
                {...commonProps}
                rules={[{ required: true, message: "Please input the name!" }]}
                key={column.name}
              >
                <Input placeholder="E.g. John Smith" />
              </Form.Item>
            );
          }

          // Default handling based on column type
          switch (column.type) {
            case "string":
            case "email":
              return (
                <Form.Item {...commonProps} key={column.name}>
                  <Input
                    placeholder={`Enter ${column.label.toLowerCase()}...`}
                  />
                </Form.Item>
              );
            case "enumeration":
              return (
                <Form.Item {...commonProps} key={column.name}>
                  <Select
                    placeholder={`Select a ${column.label.toLowerCase()}...`}
                    options={column.enum.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                  />
                </Form.Item>
              );
            case "boolean":
              return (
                <Form.Item {...commonProps} key={column.name}>
                  <Select
                    placeholder={`Select a ${column.label.toLowerCase()}...`}
                    options={[
                      {
                        value: true,
                        label: "Yes",
                      },
                      {
                        value: false,
                        label: "No",
                      },
                    ]}
                  />
                </Form.Item>
              );
            case "float":
              return (
                <Form.Item {...commonProps} key={column.name}>
                  <InputNumber
                    placeholder={`Enter ${column.label.toLowerCase()}...`}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              );
            case "datetime":
              return (
                <Form.Item {...commonProps} key={column.name}>
                  <Input type="date" />
                </Form.Item>
              );
            default:
              return (
                <Form.Item {...commonProps} key={column.name}>
                  <Input
                    placeholder={`Enter ${column.label.toLowerCase()}...`}
                  />
                </Form.Item>
              );
          }
        })}
      </>
    );
  };

  const onFinish = async (values) => {
    // Transform the data
    const transformedData = {
      data: {
        ...values,
      },
    };

    try {
      const response = await fetch(`http://141.136.47.162:1347/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();

      if (response.ok) {
        onClose(); // Close the form/modal
        form.resetFields(); // Reset the form fields
        fetchData();
        messageApi.open({
          type: "success",
          content: `Create product successful!`,
        });
      } else {
        const errorPath = result.error?.details?.errors?.[0]?.path?.[0];
        const errorMessage = result.error?.details?.errors?.[0]?.message;
        const userFriendlyMessage = errorPath
          ? `The field "${errorPath}" must be unique.`
          : errorMessage || `Failed to add product.`;
        messageApi.error(userFriendlyMessage);
      }
    } catch (error) {
      messageApi.error(`An error occurred while adding the product.`);
    }
  };

  return (
    <Drawer
      title={`Add Product`}
      open={open}
      zIndex={1005}
      width="40%"
      closeIcon={null}
      footer={renderFooter()}
    >
      <Form
        layout="vertical"
        form={form}
        name={`product_create_form`}
        onFinish={onFinish}
      >
        {renderFormItems()}
      </Form>
    </Drawer>
  );
}
