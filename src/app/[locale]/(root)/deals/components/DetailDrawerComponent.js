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
  message,
  Dropdown,
} from "antd";
import moment from "moment";

import { useState, useEffect } from "react";
import OverviewComponent from "./details/OverviewComponent";
import ContactComponent from "./details/ContactComponent";
import ProductComponent from "./details/ProductComponent";
import QuotationComponent from "./details/QuotationComponent";
import debounce from "lodash.debounce";
const { Content, Sider } = Layout;
import {
  DownOutlined,
  ProductOutlined,
  MoneyCollectOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  AuditOutlined,
  UnorderedListOutlined,
  WechatWorkOutlined,
  SnippetsOutlined
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
    key: "contacts",
    icon: <AuditOutlined style={iconStyle} />,
    label: "Contacts",
    danger: true,
  },
  {
    key: "quotation",
    icon: <SnippetsOutlined style={iconStyle} />,
    label: "Quotations",
    danger: true,
  },
  {
    key: "products",
    icon: <ProductOutlined style={iconStyle} />,
    label: "Products",
    danger: true,
  },
];

export default function DetailDrawerComponent({
  detailOpen,
  detailDocumentId,
  detailClose,
  fetchData,
}) {
  const [detail, setDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("overview");
  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [stages, setStages] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchDetail = async (id = detailDocumentId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/deals/${id}?populate[0]=account&populate[1]=deal_stage&populate[2]=contacts&populate[3]=products.product&populate[4]=tags&populate[5]=notes`
      );
      const result = await response.json();
      setDetail(result.data);
    } catch {
      console.log("Error");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "overview":
        return (
          <OverviewComponent
            detailData={detail}
            onChildrenDrawerClose={() => setChildrenDrawer(false)}
            childrenDrawer={childrenDrawer}
            fetchDetail={fetchDetail}
          />
        );
      // case "products":
      //   return (
      //     <ProductComponent
      //       data={detail}
      //       id={detail.documentId}
      //       fetchDetailData={fetchDetail}
      //     />
      //   );
      case "quotation":
        return (<QuotationComponent/>)
      case "contacts":
        return (
          <ContactComponent detailData={detail} fetchDetail={fetchDetail} />
        );
      // case "conversations":
      //   return <ConversationsComponent contact={contact} />;
      // case "activities":
      //   return <ActivitiesComponent contact={contact} />;
      // case "transactions":
      //   return <TransactionsComponent contact={contact} />;
      default:
        return (
          <OverviewComponent
            detailData={detail}
            onChildrenDrawerClose={() => setChildrenDrawer(false)}
            childrenDrawer={childrenDrawer}
            fetchDetail={fetchDetail}
          />
        );
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
        `http://141.136.47.162:1347/api/deals/${detail.documentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        detailClose();
        fetchData();
      } else {
        console.error("Error deleting deal:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await fetch("http://141.136.47.162:1347/api/deal-stages");
      const status_list = await res.json();

      // Group stages by stage_position and sort them
      const groupedStages = status_list.data.reduce((acc, stage) => {
        const stagePosition = stage.stage_position;
        if (!acc[stagePosition]) acc[stagePosition] = [];
        acc[stagePosition].push(stage);
        return acc;
      }, {});

      const sortedStages = Object.keys(groupedStages)
        .sort((a, b) => a - b) // Sort by stage_position
        .map((key) => {
          const stageGroup = groupedStages[key].sort(
            (a, b) => a.position - b.position
          ); // Sort by position
          return {
            stage_position: key,
            stages: stageGroup,
            default: stageGroup.find((stage) => stage.forecast_type === "Open"),
          };
        });
      setStages(sortedStages);
      setSelectedStage(
        detail?.deal_stage?.name || sortedStages[0]?.default?.name
      );
    } catch (error) {
      console.error("Error fetching contact statuses:", error);
    } finally {
      setLoading(false);
    }
  };
  const getStageClass = (stageGroup, index) => {
    const currentGroupIndex = stages.findIndex((s) =>
      s.stages.some((stage) => stage.name === selectedStage)
    );

    const isCurrent = stageGroup.stages.some(
      (stage) => stage.name === selectedStage
    );

    if (isCurrent) {
      const currentStage = stageGroup.stages.find(
        (stage) => stage.name === selectedStage
      );

      if (
        currentStage?.forecast_type === "Closed Lost" &&
        index <= currentGroupIndex
      ) {
        return "stage-completed stage-closed-lost"; // Red background for current and previous stages
      }
      if (currentStage?.name === "Open" && index <= currentGroupIndex) {
        return "stage-completed stage-won"; // Green background for Won
      }
      return "stage-current"; // Default current stage
    }

    if (currentGroupIndex > -1) {
      const isCompleted = index < currentGroupIndex;
      const currentStage = stages[currentGroupIndex]?.stages.find(
        (stage) => stage.name === selectedStage
      );

      if (currentStage?.forecast_type === "Closed Lost" && isCompleted) {
        return "stage-completed stage-closed-lost"; // Red background for previous stages
      }

      if (currentStage?.forecast_type === "Open" && isCompleted) {
        return "stage-completed"; // Blue background for previous stages
      }
    }
  };

  const renderStageContent = (stageGroup) => {
    if (stageGroup.stages.length === 1) {
      // If only one stage, render as a simple span
      return (
        <span onClick={() => handleStageClick(stageGroup.stages[0])}>
          {stageGroup.default?.name || "Unnamed Stage"}
        </span>
      );
    }

    // If multiple stages, render as a dropdown
    const items = stageGroup.stages.map((stage) => ({
      key: stage.documentId,
      label: stage.name,
      onClick: () => handleStageClick(stage),
    }));

    return (
      <Dropdown menu={{ items }} trigger={["click"]}>
        <span>
          {stageGroup.stages.find((stage) => stage.name === selectedStage)
            ?.name ||
            stageGroup.default?.name ||
            "Unnamed Stage"}{" "}
          <DownOutlined />
        </span>
      </Dropdown>
    );
  };
  const handleStageClick = (stage) => {
    setSelectedStage(stage.name);
    updateDealStage(stage);
  };
  const updateDealStage = async (stage) => {
    try {
      const payload = {
        data: {
          deal_stage: stage.documentId,
        },
      };
      const response = await fetch(
        `http://141.136.47.162:1347/api/deals/${detail.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        messageApi.success("Stage updated successfully");
      }
      if (!response.ok) {
        messageApi.error("Stage updated failed, please try again");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating deal stage:", error);
    }
  };
  const calculateDaysSinceCreated = (createdAt) => {
    const currentDate = new Date();
    const createdDate = new Date(createdAt);

    // Calculate the difference in milliseconds
    const differenceInTime = currentDate - createdDate;

    // Convert milliseconds to days
    const differenceInDays = Math.ceil(
      differenceInTime / (1000 * 60 * 60 * 24)
    );

    return differenceInDays; // Return only the number of days
  };

  const calculateDaysRemaining = (expectedCloseDate) => {
    const currentDate = new Date();
    const expectedClose = new Date(expectedCloseDate);

    // Calculate the difference in milliseconds
    const differenceInTime = expectedClose - currentDate;

    // Convert milliseconds to days
    const differenceInDays = Math.ceil(
      differenceInTime / (1000 * 60 * 60 * 24)
    );

    return differenceInDays > 0 ? differenceInDays : 0; // Return 0 if the date is in the past
  };

  useEffect(() => {
    if (detailDocumentId) {
      fetchDetail();
      fetchStages();
    }
  }, [detailDocumentId]);

  return (
    <>
      <Drawer
        open={detailOpen}
        width="78%"
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
                    title={`Delete the deal`}
                    description={`Are you sure to delete this deal?`}
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
            <div className="col-md-12 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex flex-column">
                  <span className="deal-sub-title text-ellipsis">
                    Related contact
                  </span>
                  {detail.contacts && detail.contacts.length > 0 ? (
                    <Avatar.Group>
                      {detail.contacts.map((contact) => {
                        return (
                          <Avatar key={contact.id} size="small">
                            {contact.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        );
                      })}
                    </Avatar.Group>
                  ) : (
                    <div>--</div>
                  )}
                </div>
                <div className="d-flex flex-column">
                  <span className="deal-sub-title text-ellipsis">
                    Related company
                  </span>
                  {detail.account && detail.account.name ? (
                    <span className="kanban-item-description pointer">
                      {detail.account.name}
                    </span>
                  ) : (
                    <span>--</span>
                  )}
                </div>
                <div className="d-flex flex-column">
                  <span className="deal-sub-title text-ellipsis">
                    Sales Owner
                  </span>
                  <span>Sales Owner</span>
                </div>
                <div className="d-flex flex-column">
                  <span className="deal-sub-title text-ellipsis">
                    Expected close date
                  </span>
                  <span>
                    <span>
                      {calculateDaysRemaining(detail.expected_close)} days
                      remaining
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-12 py-3 px-4 border">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span>
                    <strong>Created: </strong>
                    {calculateDaysSinceCreated(detail?.createdAt)} days
                  </span>
                  <div>
                    <strong>Closed date: </strong>
                    {detail?.closed_date}
                  </div>
                </div>
                <div className="d-flex strip-stages-controls-wrapper">
                  <div className="strip-container">
                    {stages.map((stageGroup, index) => (
                      <a
                        key={stageGroup.stage_position}
                        className={`strip-stage ${getStageClass(
                          stageGroup,
                          index
                        )} ${index === stages.length - 1 ? "last-stage" : ""}`}
                      >
                        {contextHolder}
                        {renderStageContent(stageGroup)}
                      </a>
                    ))}
                  </div>
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
                selectedKeys={[selectedKey]}
                onClick={(e) => setSelectedKey(e.key)}
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
      </Drawer>
    </>
  );
}
