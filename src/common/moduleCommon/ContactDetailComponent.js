import { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Avatar,
  Dropdown,
  Menu,
  Layout,
  Popconfirm,
} from "antd";
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
import OverviewComponent from "./detail_components/OverviewComponent";
import MerchantComponent from "./detail_components/MerchantComponent";

const { Content, Sider } = Layout;
export default function DetailComponent({
  open,
  onClose,
  detailDocumentId,
  moduleType,
  fetchData,
  moduleColumns,
}) {
  const [selectedKey, setSelectedKey] = useState("overview");
  const [detailData, setDetailData] = useState({});
  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const [isLoading, setIsloading] = useState(false);

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

  const handleDetailOpen = async (id) => {
    try {
      setIsloading(true);
      const response = await fetch(
        `http://141.136.47.162:1347/api/${moduleType}s/${id}?populate=*`
      );
      const result = await response.json();

      if (response.ok && result.data) {
        setDetailData(result.data); // Set fetched contact details
      }
    } catch (error) {
      console.error("Error fetching contact details:", error);
    } finally {
      setIsloading(false);
    }
  };

  const handleDetailDelete = async () => {
    try {
      setIsloading(true);
      const response = await fetch(
        `http://141.136.47.162:1347/api/${moduleType}s/${detailData.documentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        onClose();
        fetchData();
      } else {
        console.error("Error deleting contact:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setIsloading(false);
    }
  };

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  const closeDetail = () => {
    onClose();
    fetchData();
  };

  const renderFooter = () => (
    <div style={{ textAlign: "left" }}>
      <Button onClick={closeDetail} style={{ marginRight: 8 }}>
        Close
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (selectedKey) {
      case "overview":
        return (
          <OverviewComponent
            data={detailData}
            moduleType={moduleType}
            onChildrenDrawerClose={onChildrenDrawerClose}
            childrenDrawer={childrenDrawer}
            handleDetailOpen={handleDetailOpen}
            moduleColumns={moduleColumns}
          />
        );
      case "merchants":
        return <MerchantComponent data={detailData.accounts}/>;
      // case "conversations":
      //   return <ConversationsComponent contact={contact} />;
      // case "activities":
      //   return <ActivitiesComponent contact={contact} />;
      // case "transactions":
      //   return <TransactionsComponent contact={contact} />;
      default:
        return (
          <OverviewComponent
            data={detailData}
            moduleType={moduleType}
            onChildrenDrawerClose={onChildrenDrawerClose}
            childrenDrawer={childrenDrawer}
            handleDetailOpen={handleDetailOpen}
            moduleColumns={moduleColumns}
          />
        );
    }
  };

  const showChildrenDrawer = () => {
    setChildrenDrawer(true);
  };
  const onChildrenDrawerClose = () => {
    setChildrenDrawer(false);
  };

  useEffect(() => {
    if (detailDocumentId) {
      handleDetailOpen(detailDocumentId);
    }
  }, [detailDocumentId]);

  return (
    <Drawer
      open={open}
      zIndex={1010}
      width="78%"
      closeIcon={null}
      className="drawer-detail"
      footer={renderFooter()}
    >
      {!isLoading && detailData ? (
        <>
          <Layout style={{ height: "100%" }}>
            <div className="row mx-0 shadow-sm bg-white border-bottom border-light">
              <div className="col-md-12 p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Avatar size={58}>
                      {detailData.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="mx-3">
                      <h4 className="mb-0">{detailData.name}</h4>
                      <p className="mb-0">{detailData?.email}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Button
                      color="danger"
                      variant="solid"
                      className="mx-1"
                      icon={<MailOutlined />}
                    >
                      Mail
                    </Button>
                    <Button
                      color="danger"
                      variant="solid"
                      className="mx-1"
                      icon={<PlusCircleOutlined />}
                    >
                      Add transaction
                    </Button>
                    <Button
                      className="mx-1"
                      icon={<EditOutlined />}
                      onClick={showChildrenDrawer}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title={`Delete the ${moduleType}`}
                      description={`Are you sure to delete this ${moduleType}?`}
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
            <Layout>
              <Sider
                width={200}
                style={{
                  background: "#fff",
                  height: "100%",
                  borderRight: "1px solid #e8e8e8",
                  borderTop: "1px solid #e8e8e8",
                  padding: 0,
                }}
                trigger={null}
              >
                <Menu
                  theme="light"
                  mode="inline"
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                  }}
                  defaultSelectedKeys={selectedKey}
                  selectedKeys={[selectedKey]} // Highlight selected menu
                  onClick={handleMenuClick}
                  items={detailMenuItems}
                />
              </Sider>
              <Layout
                style={{
                  padding: "12px 0 0 12px",
                  background: "#fafafa",
                }}
              >
                <Content
                  style={{
                    padding: 0,
                    margin: 0,
                    minHeight: 280,
                    background: "#fff",
                  }}
                >
                  {renderContent()}
                </Content>
              </Layout>
            </Layout>
          </Layout>
        </>
      ) : (
        <p>No contact selected.</p>
      )}
    </Drawer>
  );
}
