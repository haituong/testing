import React, { useState } from "react";
import { Drawer, Form, Input, Button, Select, Spin, message } from "antd";
import debounce from "lodash.debounce";
export default function CreateComponent({
  moduleType,
  open,
  onClose,
  moduleColumns,
  fetchData,
}) {
  const [form] = Form.useForm();
  const [searchResults, setSearchResults] = useState({});
  const [loading, setLoading] = useState(false);
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
        form={`${moduleType}_create_form`}
      >
        Save
      </Button>
    </div>
  );
  const excludeColumns = ["tags", "createdAt", "updatedAt", "contact_status"];

  const handleSearch = async (value, column) => {
    if (value.length < 3 || !column.targetAttribute) return;
    setLoading(true);
    try {
      //   const module = column.name === "sales_account" ? "accounts" : "contacts";
      const response = await fetch(
        `http://141.136.47.162:1347/api/${
          column.name
        }?sort[0]=name:asc&filters[name][$containsi]=${encodeURIComponent(
          value
        )}&fields[0]=name&pagination[pageSize]=5&pagination[page]=1`
      );
      const result = await response.json();
      const options = result.data.map((item) => ({
        value: item.documentId,
        label: item.name,
      }));
      setSearchResults((prev) => ({
        ...prev,
        [column.name]: options,
      }));
    } catch (error) {
      console.error(`Error fetching data for ${column.name}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchProducts = debounce((value, column) => {
    if (value.length >= 3) {
      handleSearch(value, column);
    } else {
      setSearchResults([]); // Clear options if input is less than 3 characters
    }
  }, 300);
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

    return (
      <>
        {filteredAndSortedColumns.map((column) => {
          const commonProps = {
            name: column.name,
            label: column.label,
          };

          // Special handling for email with validation
          if (column.name === "email") {
            return (
              <Form.Item
                {...commonProps}
                rules={[
                  {
                    type: "email",
                    required: true,
                    message: "Please input the email!",
                  },
                ]}
                key={column.name}
              >
                <Input placeholder="E.g. john.smith@acmecorp.com" />
              </Form.Item>
            );
          }

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
            case "relation":
              if (column.targetAttribute) {
                return (
                  <Form.Item {...commonProps} key={column.name}>
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder={`Select ${column.label.toLowerCase()}`}
                      notFoundContent={
                        loading ? <Spin size="small" /> : "Type to search..."
                      }
                      filterOption={false} // Disable built-in filtering
                      onSearch={(value) =>
                        debouncedFetchProducts(value, column)
                      }
                      options={searchResults[column.name] || []}
                    />
                  </Form.Item>
                );
              } else {
                return (
                  <Form.Item {...commonProps} key={column.name}>
                    <Select
                      placeholder={`Select a ${column.label.toLowerCase()}...`}
                      options={[]}
                    />
                  </Form.Item>
                );
              }
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
        sales_account: values.sale_account
          ? {
              connect: [
                {
                  documentId: values.sale_account,
                },
              ],
            }
          : undefined, // Only include this field if `sale_account` exists
        contact_status: {
          connect: [
            {
              documentId: "hc6s8kp6yppowne5n5ix2atz", // Static documentId
            },
          ],
        },
      },
    };

    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/${moduleType}s`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transformedData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        onClose(); // Close the form/modal
        form.resetFields(); // Reset the form fields
        fetchData();
        messageApi.open({
          type: "success",
          content: `Create ${moduleType} successful!`,
        });
      } else {
        const errorPath = result.error?.details?.errors?.[0]?.path?.[0];
        const errorMessage = result.error?.details?.errors?.[0]?.message;
        const userFriendlyMessage = errorPath
          ? `The field "${errorPath}" must be unique.`
          : errorMessage || `Failed to add ${moduleType}.`;
        messageApi.error(userFriendlyMessage);
      }
    } catch (error) {
      messageApi.error(`An error occurred while adding the ${moduleType}.`);
    }
  };

  return (
    <Drawer
      title={`Add ${moduleType}`}
      open={open}
      zIndex={1005}
      width="40%"
      closeIcon={null}
      footer={renderFooter()}
    >
      <Form
        layout="vertical"
        form={form}
        name={`${moduleType}_create_form`}
        onFinish={onFinish}
      >
        {renderFormItems()}
      </Form>
    </Drawer>
  );
}
