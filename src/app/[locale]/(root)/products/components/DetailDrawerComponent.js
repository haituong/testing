import {
  Drawer,
  Layout,
  Avatar,
  Button,
  Menu,
  Popconfirm,
  Form,
  Input,
  Select,
  Spin,
  DatePicker,
  Space,
  Col,
  Row,
  Checkbox,
} from "antd";
import moment from "moment";

import { useState, useEffect } from "react";
import OverviewComponent from "./details/OverviewComponent";
import MerchantComponent from "./details/MerchantComponent";
import debounce from "lodash.debounce";
const { Content, Sider } = Layout;
import {
  MailOutlined,
  PlusCircleOutlined,
  MoneyCollectOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  AuditOutlined,
  UnorderedListOutlined,
  WechatWorkOutlined,
} from "@ant-design/icons";
const iconStyle = {
  fontSize: 20,
};
const detailMenuItems = [
  {
    key: "overview",
    icon: <AppstoreOutlined style={iconStyle} />,
    label: "Overview",
    danger: true,
  },
  {
    key: "convervations",
    icon: <WechatWorkOutlined style={iconStyle} />,
    label: "Convervations",
    disabled: true,
  },
  {
    key: "activites",
    icon: <UnorderedListOutlined style={iconStyle} />,
    label: "Activites",
    disabled: true,
  },
  {
    key: "merchants",
    icon: <AuditOutlined style={iconStyle} />,
    label: "Merchants",
    danger: true,
  },
  {
    key: "transactions",
    icon: <MoneyCollectOutlined style={iconStyle} />,
    label: "Transactions",
    danger: true,
  },
];

const excludeInfo = [
  "documentId",
  "tags",
  "contact_status",
  "createdAt",
  "custom_field",
  "first_name",
  "id",
  "documentId",
  "notes",
  "publishedAt",
  "tags",
  "tasks",
  "updatedAt",
  "last_name",
  "contacts",
  "accounts",
  "deals",
];

const excludeEdit = [
  "documentId",
  "tags",
  "contact_status",
  "createdAt",
  "custom_field",
  "first_name",
  "id",
  "documentId",
  "notes",
  "publishedAt",
  "tags",
  "tasks",
  "updatedAt",
  "last_name",
  "sales_account",
  "contacts",
];

export default function DetailDrawerComponent({
  detailOpen,
  detailDocumentId,
  detailClose,
  fetchData,
}) {
  const [detail, setDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [moduleColumns, setModuleColumns] = useState([]);
  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const [form] = Form.useForm();
  //Fetch detail

  const fetchDetail = async (id = detailDocumentId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/products/${id}?populate=*`
      );
      const result = await response.json();
      setDetail(result.data);
    } catch {
      console.log("Error");
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => (
    <div style={{ textAlign: "left" }}>
      <Button
        onClick={() => {
          detailClose(); // Close the drawer
          fetchData(); // Fetch data again
        }}
        style={{ marginRight: 8 }}
      >
        Close
      </Button>
    </div>
  );

  const handleDetailDelete = async () => {
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/products/${detail.documentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        detailClose();
        fetchData();
      } else {
        console.error("Error deleting product:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const fetchColumns = async () => {
    const columnNameMapping = [
      {
        name: "createdAt",
        type: "datetime",
        label: "Created at",
        default: false,
        visible: true,
      },
      {
        name: "updatedAt",
        type: "datetime",
        label: "Updated at",
        default: false,
        visible: true,
      },
    ];
    const excludeColumns = [];

    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/content-type-builder/content-types/api::product.product`
      );
      const result = await response.json();
      const attributes = result.data.schema.attributes;

      const apiColumns = Object.keys(attributes)
        .filter((key) => !excludeColumns.includes(key))
        .map((key) => ({
          name: key,
          type: attributes[key].type,
          label: key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
          default:
            ["name", "contact_status", "accounts", "contacts", "tags"].includes(
              key
            ) || attributes[key].required,
          enum:
            attributes[key].type === "enumeration"
              ? attributes[key].enum
              : null,
          relation:
            attributes[key].type === "relation"
              ? attributes[key].relation
              : null,
          visible: true,
          targetAttribute: attributes[key].targetAttribute || null,
        }));

      const mergedColumns = [...apiColumns, ...columnNameMapping].sort((a, b) =>
        a.name === "name" ? -1 : b.name === "name" ? 1 : 0
      );
      setModuleColumns(mergedColumns);
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  };

  const renderFormItem = (item) => {
    console.log(item);
    switch (item.type) {
      case "string":
      case "email":
        return <Input placeholder={`Enter ${item.label.toLowerCase()}`} />;
      case "enumeration":
        return (
          <Select placeholder={`Select ${item.label.toLowerCase()}`}>
            {item.enum.map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        );
      case "boolean":
        return (
          <Select
            placeholder={`Select ${item.label.toLowerCase()}`}
            options={[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ]}
          />
        );
      default:
        return <Input placeholder={`Enter ${item.label.toLowerCase()}`} />;
    }
  };

  const saveEdit = async (values) => {
    try {
      const payload = {
        data: values,
      };

      // Make the API call
      const res = await fetch(
        `http://141.136.47.162:1347/api/products/${detail.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to update"
          }`
        );
      }
      setChildrenDrawer(false);
      fetchDetail(detail.documentId);
    } catch (error) {
      console.error("Error updating:", error.message);
    }
  };

  const sortedEntries = Object.entries(detail)
    .filter(([key]) => !excludeInfo.includes(key))
    .sort(([keyA], [keyB]) => {
      if (keyA === "name") return -1;
      if (keyB === "name") return 1;
      return 0;
    });

  const filteredModuleColumns = moduleColumns
    .filter((column) => !excludeEdit.includes(column.name))
    .sort((a, b) => {
      if (a.name === "name") return -1;
      if (b.name === "name") return 1;
      if (a.name === "email") return -1;
      if (b.name === "email") return 1;
      return 0;
    })
    .map((column) => {
      return column;
    });

  const initialValues = sortedEntries.reduce((acc, [key, value]) => {
    if (key === "accounts") {
      // Set accounts as an array of IDs
      acc[key] = value ? value.map((account) => account.name) : [];
    } else {
      acc[key] =
        typeof value === "object" && value !== null ? value.name : value;
    }
    return acc;
  }, {});

  useEffect(() => {
    if (detailDocumentId) {
      fetchDetail();
    }
  }, [detailDocumentId]);

  useEffect(() => {
    if (childrenDrawer) {
      fetchColumns();
    }
  }, [childrenDrawer]);

  return (
    <>
      <Drawer
        open={detailOpen}
        width="50%"
        zIndex={1004}
        loading={loading}
        closeIcon={false}
        className="drawer-detail"
        footer={renderFooter()}
      >
        <Layout style={{ height: "100%" }}>
          <div className="row mx-0 shadow-sm bg-white border-bottom border-light">
            <div className="col-md-12 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <Avatar size={58}>
                    {detail.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="mx-3">
                    <h4 className="mb-0">{detail.name}</h4>
                    <p className="mb-0">{detail?.email}</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Button
                    className="mx-1"
                    icon={<EditOutlined />}
                    onClick={() => setChildrenDrawer(true)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title={`Delete the product`}
                    description={`Are you sure to delete this product?`}
                    onConfirm={() => handleDetailDelete()}
                    onCancel={() => console.log("Delete canceled")}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button className="mx-1" icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          </div>
          <div className="card mt-2">
            <div className="card-header p-4">
              <p className="fo h4">Product</p>
            </div>
            <div className="card-body py-0">
              <div className="row">
                <div className="col-md-12 border-top">
                  <div className="row my-3">
                    {sortedEntries.map(([key, value], index) => (
                      <div className="col-md-4 mb-3" key={index}>
                        <span
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {key
                            .replace(/_/g, " ")
                            .replace(/^\w/, (c) => c.toUpperCase())}
                        </span>
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "#12344d",
                            fontWeight: "630",
                          }}
                        >
                          {typeof value === "object" && value !== null
                            ? value.name
                            : value || "-"}{" "}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
        <Drawer
          title="Edit"
          width="40%"
          closable={false}
          onClose={() => setChildrenDrawer(false)}
          open={childrenDrawer}
          footer={
            <Button type="primary" htmlType="submit" form={`product_edit_form`}>
              Save
            </Button>
          }
        >
          <Form
            layout="vertical"
            name={`product_edit_form`}
            initialValues={initialValues}
            onFinish={saveEdit}
          >
            {filteredModuleColumns.map((column) => (
              <Form.Item
                key={column.name}
                label={column.label}
                name={column.name}
                rules={[
                  {
                    required: column.default || false,
                    message: `${column.label} is required`,
                  },
                ]}
              >
                {renderFormItem(column)}
              </Form.Item>
            ))}
          </Form>
        </Drawer>
      </Drawer>
    </>
  );
}
