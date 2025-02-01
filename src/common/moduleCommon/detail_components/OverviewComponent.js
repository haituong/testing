"use client";

import React, { useEffect, useState } from "react";
import { Spin, Dropdown, Select, Tag, Drawer, Form, Input, Button } from "antd";
import { DownOutlined, TagsOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";
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
const OverviewComponent = ({
  data,
  moduleType,
  onChildrenDrawerClose,
  childrenDrawer,
  moduleColumns,
  handleDetailOpen,
}) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(true);
  const [selectedStage, setSelectedStage] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState(
    data.tags?.map((tag) => tag.name)
  );
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]); // Fetched tags

  const fetchStages = async () => {
    try {
      const res = await fetch(
        "http://141.136.47.162:1347/api/contact-statuses"
      );
      const data = await res.json();

      // Group stages by stage_position and sort them
      const groupedStages = data.data.reduce((acc, stage) => {
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
        data?.contact_status?.name || sortedStages[0]?.default?.name
      );
    } catch (error) {
      console.error("Error fetching contact statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactField = async (field, value) => {
    try {
      let payload;
      if (field === "contact_status") {
        payload = {
          data: {
            contact_status: value,
          },
        };
      }

      // Make the API call
      const res = await fetch(
        `http://141.136.47.162:1347/api/${moduleType}s/${data.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(
          `Failed to update ${field}: ${res.status} ${res.statusText} - ${
            errorDetails.message || "Unknown error"
          }`
        );
      }

      console.log(`${field} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error.message);
    }
  };

  const handleStageClick = (stage) => {
    setSelectedStage(stage.name);
    updateContactField("contact_status", stage.documentId);
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
      return <span>{stageGroup.default?.name || "Unnamed Stage"}</span>;
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

  const updateTags = async (payload) => {
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/contacts/${data.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `Failed to update tags: ${response.status} ${response.statusText} - ${
            errorDetails.message || "Unknown error"
          }`
        );
      }
      console.log("Tags updated successfully");
    } catch (error) {
      console.error("Error updating tags:", error.message);
    }
  };

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/tags?fields[0]=name&fields[1]=color&pagination[pageSize]=25&pagination[page]=1`
      );
      const result = await response.json();
      setTags(result.data || []); // Set fetched tags
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (values) => {
    setSelectedTags(values);

    // Extract original tags from data.tags
    const oldTags =
      data.tags?.map((tag) => ({
        name: tag.name,
        documentId: tag.documentId,
      })) || [];

    // Tags to connect (added)
    const tagsToConnect = values
      .filter((tagName) => !oldTags.some((tag) => tag.name === tagName))
      .map((tagName) => ({
        name: tagName,
        documentId: tags.find((tag) => tag.name === tagName)?.documentId,
      }))
      .filter((tag) => tag.documentId); // Ensure valid documentId exists

    // Tags to disconnect (removed)
    const tagsToDisconnect = oldTags
      .filter((tag) => !values.includes(tag.name))
      .map((tag) => ({
        name: tag.name,
        documentId: tag.documentId,
      }));

    // Determine if there's any change
    const isChanged = tagsToConnect.length > 0 || tagsToDisconnect.length > 0;

    if (isChanged) {
      // Construct the payload
      const payload = {
        data: {
          tags: {
            connect: tagsToConnect.map((tag) => ({
              documentId: tag.documentId,
            })),
            disconnect: tagsToDisconnect.map((tag) => ({
              documentId: tag.documentId,
            })),
          },
        },
      };

      // Log the payload for debugging
      console.log("Payload to send:", payload);

      // Make the API call to update tags
      updateTags(payload);
    } else {
      console.log("No changes in tags");
    }
  };

  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const tagColor = tags.find((tag) => tag.name === value)?.color || "default";

    return (
      <Tag
        color={tagColor}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  const saveEdit = async (values) => {
    if (values.accounts.length > 0) {
      // Filter the selected accounts and map to their documentId
      const accounts = options
        .filter((account) => values.accounts.includes(account.value)) // Match the selected values
        .map((account) => account.documentId); // Extract the documentId
    
      values.accounts = accounts; // Update accounts with documentIds
    }
    console.log(values);
    // try {
    //   const payload = {
    //     data: values,
    //   };

    //   // Make the API call
    //   const res = await fetch(
    //     `http://141.136.47.162:1347/api/${moduleType}s/${data.documentId}`,
    //     {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(payload),
    //     }
    //   );

    //   if (!res.ok) {
    //     const errorDetails = await res.json();
    //     throw new Error(
    //       `Failed to update"
    //       }`
    //     );
    //   }

    //   console.log(`Updated successfully`);
    //   onCloseChildrenDrawer();
    //   handleDetailOpen(data.documentId);
    // } catch (error) {
    //   console.error("Error updating:", error.message);
    // }
  };

  const sortedEntries = Object.entries(data)
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

  const fetchAccounts = async (searchText) => {
    setLoadingSearch(true);
    try {
      // Simulate API call
      const response = await fetch(
        `http://141.136.47.162:1347/api/accounts?sort[0]=name:asc&filters[name][$containsi]=${encodeURIComponent(
          searchText
        )}&fields[0]=name&pagination[pageSize]=5&pagination[page]=1`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();

      setTimeout(() => {
        const accounts = data?.data || []; // Assuming the API returns a `data` array
        const options = accounts.map((item) => ({
          value: item.name,
          label: item.name,
          documentId: item.documentId,
        }));

        setOptions(options);
        setLoadingSearch(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoadingSearch(false);
    }
  };

  const debouncedFetchProducts = debounce((value) => {
    if (value.length >= 3) {
      fetchAccounts(value);
    } else {
      setOptions([]); // Clear options if input is less than 3 characters
    }
  }, 300);

  const renderFormItem = (item) => {
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
      case "relation":
        return (
          <Select
            placeholder="Select an account"
            mode="multiple" // Allow multiple selections
            notFoundContent={
              loading ? <Spin size="small" /> : "No accounts found"
            }
            showSearch
            onSearch={debouncedFetchProducts} // Fetch data dynamically
            options={options} // Options passed as props or state
          />
        );
      default:
        return <Input placeholder={`Enter ${item.label.toLowerCase()}`} />;
    }
  };
  const onCloseChildrenDrawer = () => {
    onChildrenDrawerClose();
    form.resetFields();
  };

  useEffect(() => {
    fetchStages();
    fetchTags();
  }, [data]);

  if (loading) {
    return (
      <div className="text-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header p-4">
        <p className="fo h4">Overview</p>
      </div>
      {moduleType === "contact" && (
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-12">
              <div className="mb-3">Lifecycle Stage</div>
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
                      {renderStageContent(stageGroup)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card-body py-0 border">
        <div className="row">
          <div className="col-md-8 py-3">
            <div className="row">
              <div className="col-md-12 mb-3">
                <Select
                  mode="tags"
                  placeholder="Click to add tags"
                  variant="borderless"
                  style={{ width: "100%" }}
                  value={selectedTags} // Initialize selected tags from `data`
                  onChange={handleChange}
                  tagRender={tagRender} // Render tags with colors
                  options={tags.map((tag) => ({
                    value: tag.name,
                    label: tag.name,
                  }))}
                  prefix={<TagsOutlined />}
                />
              </div>

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
          <div
            className="col-md-4 py-3"
            style={{ borderLeft: "1px solid #f0f0f0" }}
          >
            <p>Additional Information</p>
          </div>
        </div>
      </div>
      <Drawer
        title="Edit"
        width="40%"
        closable={false}
        onClose={onCloseChildrenDrawer}
        open={childrenDrawer}
        footer={
          <Button
            type="primary"
            htmlType="submit"
            form={`${moduleType}_edit_form`}
          >
            Save
          </Button>
        }
      >
        <Form
          layout="vertical"
          name={`${moduleType}_edit_form`}
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
    </div>
  );
};

export default OverviewComponent;
