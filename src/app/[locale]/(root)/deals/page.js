"use client";

import React, { useState, useEffect } from "react";
import {
  Tabs,
  Skeleton,
  Space,
  Select,
  Button,
  Popover,
  Avatar,
  Tag,
  Checkbox,
  Dropdown,
  Input,
  Badge,
  InputNumber,
} from "antd";
import {
  EditOutlined,
  FilterOutlined,
  PlusCircleOutlined,
  TableOutlined,
  AppstoreOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  InteractionOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import TableComponent from "./components/TableComponent";
import FilterDrawer from "./components/FilterDrawer";
import { optionsByType } from "@/common/moduleCommon/commonVariable";
import DragDropContainer from "./components/DragDropContainer";
import DetailDrawerComponent from "./components/DetailDrawerComponent"
const items = [
  {
    key: "1",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.antgroup.com"
      >
        1st menu item
      </a>
    ),
    icon: <InteractionOutlined />,
  },
  {
    key: "2",
    label: (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.aliyun.com"
      >
        2nd menu item
      </a>
    ),
    icon: <InteractionOutlined />,
  },
];

const PipelinePage = () => {
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [tabItems, setTabItems] = useState([]);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tableSize, setTableSize] = useState("middle");
  const [viewType, setViewType] = useState("table");
  const [activeFilterArr, setActiveFilterArr] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [moduleColumns, setModuleColumns] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [manageColumnOpen, setManageColumnOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isAddFilter, setIsAddFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApply, setIsApply] = useState(true);
  const [moduleStage, setModuleStage] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDocumentId, setDetailDocumentId] = useState(false);
  const [createDrawer, setCreateDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
  });

  //Tabs
  const fetchTabs = async () => {
    setIsTabLoading(true);
    try {
      const response = await fetch(
        "http://141.136.47.162:1347/api/views?sort[0]=createdAt:asc&filters[view_type][$eq]=deals"
      );
      const result = await response.json();
      const tabs = result.data.map((item) => ({
        key: item.documentId,
        label: item.name,
        filter_arr: item.filter_arr || [],
        isSave: item.isSave,
      }));
      setTabItems(tabs);
      const savedActiveTab = localStorage.getItem("deal_activeTab");
      const savedActiveFilter = localStorage.getItem("deal_activeFilter");

      if (savedActiveTab && savedActiveFilter) {
        setActiveTab(savedActiveTab);
        setActiveFilterArr(JSON.parse(savedActiveFilter));
        setSelectedColumns(JSON.parse(savedActiveFilter));
      } else if (tabs.length > 0) {
        setActiveTab(tabs[0].key);
        setActiveFilterArr(tabs[0].filter_arr);
        setSelectedColumns(tabs[0].filter_arr);
      }
    } catch (error) {
      console.error("Error fetching tabs:", error);
    } finally {
      setIsTabLoading(false);
    }
  };
  const handleTabChange = (key) => {
    const selectedTab = tabItems.find((tab) => tab.key === key);
    if (!selectedTab) return;
    const filters = JSON.parse(JSON.stringify(selectedTab.filter_arr));

    setActiveTab(key);
    setActiveFilterArr(filters);
    setSelectedColumns(filters);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
    localStorage.setItem(`deal_activeTab`, key);
    localStorage.setItem(`deal_activeFilter`, JSON.stringify(filters));
  };
  const onAddTab = async () => {
    setIsTabLoading(true);
    try {
      const newTab = {
        data: {
          name: "Untitled view",
          view_type: "deals",
          filter_arr: [],
        },
      };
      const response = await fetch("http://141.136.47.162:1347/api/views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTab),
      });
      const result = await response.json();
      localStorage.setItem(`deal_activeTab`, result.data.documentId);
      localStorage.setItem(
        `deal_activeFilter`,
        JSON.stringify(result.data.filter_arr)
      );
    } catch {
      console.error("Error adding tab");
    } finally {
      setIsTabLoading(false);
      fetchTabs();
      setFilterDrawerOpen(true);
    }
  };
  const onRemoveTab = async (key) => {
    setIsTabLoading(true);
    try {
      await fetch(`http://141.136.47.162:1347/api/views/${key}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Re-fetch tabs to get the updated list
      const response = await fetch(
        "http://141.136.47.162:1347/api/views?sort[0]=createdAt:asc&filters[view_type][$eq]=deals"
      );
      const result = await response.json();
      const tabs = result.data.map((item) => ({
        key: item.documentId,
        label: item.name,
        filter_arr: item.filter_arr || [],
        isSave: item.isSave,
      }));

      setTabItems(tabs);
      // If the removed tab was the active one, set the first tab as active
      if (key === activeTab && tabs.length > 0) {
        const firstTab = tabs[0];
        setActiveTab(firstTab.key);
        setActiveFilterArr(firstTab.filter_arr);
        setSelectedColumns(firstTab.filter_arr);
        localStorage.setItem("deal_activeTab", firstTab.key);
        localStorage.setItem(
          "deal_activeFilter",
          JSON.stringify(firstTab.filter_arr)
        );
      }
    } catch (error) {
      console.error("Error removing tab:", error);
    } finally {
      setIsTabLoading(false);
    }
  };
  const onTabEdit = (targetKey, action) => {
    if (action === "add") {
      onAddTab();
    } else {
      onRemoveTab(targetKey);
    }
  };

  //Table
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const fetchData = async (params = {}, applyFilter = []) => {
    setIsDataLoading(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/deals${queryBuilder(
          applyFilter
        )}&pagination[page]=${
          params.current || pagination.current
        }&pagination[pageSize]=${params.pageSize || pagination.pageSize}`
      );
      const result = await response.json();
      const formattedData = result.data.map((item) => ({
        ...item,
        key: item.documentId,
      }));
      setData(formattedData);
      setPagination({
        ...pagination,
        current: result.meta.pagination.page,
        pageSize: result.meta.pagination.pageSize,
        total: result.meta.pagination.total,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsDataLoading(false);
    }
  };
  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
    fetchData({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  //Columns
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
    const excludeColumns = ["products", "deal_products", "contacts"];

    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/content-type-builder/content-types/api::deal.deal`
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
            [
              "name",
              "amount",
              "account",
              "currency",
              "deal_stage",
              "tags",
            ].includes(key) || attributes[key].required,
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
  const handleColumnChange = (name, checked) => {
    const newColumn = moduleColumns.find((col) => col.name === name);
    const updatedColumns = checked
      ? [
          ...tableColumns,
          {
            title: newColumn.label,
            dataIndex: newColumn.name,
            key: newColumn.name,
            sorter: (a, b) =>
              typeof a[newColumn.name] === "string"
                ? (a[newColumn.name] || "").localeCompare(
                    b[newColumn.name] || ""
                  )
                : (a[newColumn.name] || 0) - (b[newColumn.name] || 0),
          },
        ]
      : tableColumns.filter((col) => col.dataIndex !== name);

    setTableColumns(updatedColumns);
    localStorage.setItem(
      `dealSelectedColumns`,
      JSON.stringify(updatedColumns.map((col) => col.dataIndex))
    );
    handleTableColumn();
  };
  const handleTableColumn = () => {
    const savedSelection = JSON.parse(
      localStorage.getItem(`dealSelectedColumns`)
    );
    const selectedColumns = savedSelection
      ? savedSelection.map((name) =>
          moduleColumns.find((col) => col.name === name)
        )
      : moduleColumns.filter((col) => col.default);

    const tableColumns = selectedColumns.map((col) => {
      const commonProps = {
        title: col.label,
        dataIndex: col.name,
        key: col.name,
        width: 230,
      };

      switch (col.type) {
        case "datetime":
          return {
            ...commonProps,
            width: 150,
            sorter: (a, b) => new Date(a[col.name]) - new Date(b[col.name]),
            render: (text) =>
              text ? new Date(text).toLocaleDateString() : "-",
          };
        case "relation":
          if (col.relation === "oneToMany") {
            return {
              ...commonProps,
              sorter: (a, b) =>
                (a[col.name]?.length || 0) - (b[col.name]?.length || 0),
              render: (_, record) => {
                const relatedItems = record[col.name] || [];
                if (col.targetAttribute) {
                  return relatedItems.length > 0 ? (
                    <Avatar.Group max={{ count: 3 }} size="default">
                      {relatedItems.map((item) => (
                        <Popover content={item.name} key={item.id}>
                          <Avatar style={{ backgroundColor: "#f56a00" }}>
                            {item.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Popover>
                      ))}
                    </Avatar.Group>
                  ) : (
                    "-"
                  );
                } else {
                  return relatedItems.length > 0 ? (
                    <Space wrap size="small">
                      {relatedItems.slice(0, 3).map((item, index) => (
                        <Tag color={item?.color || "default"} key={index}>
                          {item?.name || "Unnamed"}
                        </Tag>
                      ))}
                      {relatedItems.length > 3 && (
                        <Tag color="blue">+{relatedItems.length - 3} more</Tag>
                      )}
                    </Space>
                  ) : (
                    "-"
                  );
                }
              },
            };
          } else if (col.relation === "manyToOne" && col.targetAttribute) {
            return {
              ...commonProps,
              sorter: (a, b) =>
                (a[col.name]?.length || 0) - (b[col.name]?.length || 0),
              render: (_, record) =>
                record[col.name] ? <span>{record[col.name].name}</span> : "-",
            };
          } else if (col.relation === "oneToOne") {
            return {
              ...commonProps,
              sorter: (a, b) =>
                (a.deal_stage?.name || "").localeCompare(
                  b.deal_stage?.name || ""
                ),
              render: (_, { deal_stage }) =>
                deal_stage ? (
                  <Tag
                    color={
                      deal_stage.forecast_type === "Open" ? "green" : "red"
                    }
                  >
                    {deal_stage.name}
                  </Tag>
                ) : (
                  "-"
                ),
            };
          }
          break;
        case "string":
          if (col.name === "name") {
            return {
              ...commonProps,
              sorter: (a, b) =>
                typeof a[col.name] === "string"
                  ? (a[col.name] || "").localeCompare(b[col.name] || "")
                  : 0,
              render: (text, record) =>
                text ? (
                  <Space>
                    <Avatar
                      style={{ backgroundColor: "#87d068" }}
                      size="middle"
                    >
                      {text.charAt(0).toUpperCase()}
                    </Avatar>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        setDetailOpen(true); // Open the detail drawer
                        setDetailDocumentId(record.documentId);
                      }}
                    >
                      {text}
                    </Link>
                  </Space>
                ) : (
                  "-"
                ),
            };
          } else {
            // Default handling for other string fields
            return {
              ...commonProps,
              sorter: (a, b) =>
                typeof a[col.name] === "string"
                  ? (a[col.name] || "").localeCompare(b[col.name] || "")
                  : 0,
              render: (text) => (
                <span
                  style={{
                    display: "inline-block",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={text}
                >
                  {text || "-"}
                </span>
              ),
            };
          }
        default:
          return {
            ...commonProps,
            sorter: (a, b) =>
              typeof a[col.name] === "string"
                ? (a[col.name] || "").localeCompare(b[col.name] || "")
                : a[col.name] - b[col.name],
            render: (text) => (
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={text}
              >
                {text || "-"}
              </span>
            ),
          };
      }
    });

    setTableColumns(tableColumns);
  };

  //Filter
  const handleFilterField = (field) => {
    setSelectedColumns([
      ...selectedColumns,
      { field, operator: "$eq", value: "" },
    ]);
    setIsAddFilter(false);
  };
  const handleOperatorChange = (index, operator) => {
    const updatedColumns = [...selectedColumns];
    updatedColumns[index].operator = operator;
    updatedColumns[index].operatorLabel = optionsByType[
      moduleColumns.find((col) => col.name === updatedColumns[index].field)
        ?.type
    ].find((option) => option.value === operator)?.label;

    if (operator === "$null" || operator === "$notNull") {
      updatedColumns[index].value = true;
    }

    setSelectedColumns(updatedColumns);
  };
  const renderFilterContent = (filter, index) => {
    const filterColumn = moduleColumns.find((col) => col.name === filter.field);
    if (!filterColumn) return null;

    const { type, enum: enumOptions } = filterColumn;
    console.log(filterColumn);
    // Skip rendering the input for $null and $notNull
    if (filter.operator === "$null" || filter.operator === "$notNull") {
      return null;
    }

    switch (type) {
      case "enumeration":
        return (
          <Select
            style={{ width: 200 }}
            value={filter.value}
            onChange={(value) => {
              const updatedColumns = [...selectedColumns];
              updatedColumns[index].value = value;
              setSelectedColumns(updatedColumns);
            }}
            options={enumOptions.map((option) => ({
              label: option,
              value: option,
            }))}
          />
        );
      case "datetime":
        return (
          <Space>
            <input
              type="date"
              value={filter.value || ""}
              onChange={(e) => {
                const updatedColumns = [...selectedColumns];
                updatedColumns[index].value = e.target.value;
                setSelectedColumns(updatedColumns);
              }}
            />
          </Space>
        );
      case "relation":
        // Extract unique relation values from the current data table
        const uniqueRelations = Array.from(
          new Set(
            data.flatMap((item) =>
              Array.isArray(item[filter.field])
                ? item[filter.field].map((relation) => relation.name)
                : item[filter.field]?.name
                ? [item[filter.field].name]
                : []
            )
          )
        ).map((relation) => ({
          label: relation,
          value: relation,
        }));

        return (
          <Select
            style={{ width: 200 }}
            value={filter.value}
            onChange={(value) => {
              const updatedColumns = [...selectedColumns];
              updatedColumns[index].value = value;
              setSelectedColumns(updatedColumns);
            }}
            options={uniqueRelations}
          />
        );
      case "number":
        return (
          <InputNumber
            value={filter.value || ""}
            onChange={(e) => {
              const updatedColumns = [...selectedColumns];
              updatedColumns[index].value = e.target.value;
              setSelectedColumns(updatedColumns);
            }}
          />
        );
      case "float":
        return (
          <InputNumber
            value={filter.value || ""}
            onChange={(e) => {
              const updatedColumns = [...selectedColumns];
              updatedColumns[index].value = e.target.value;
              setSelectedColumns(updatedColumns);
            }}
          />
        );
      case "string":
      default:
        return (
          <Input
            type="text"
            value={filter.value || ""}
            onChange={(e) => {
              const updatedColumns = [...selectedColumns];
              updatedColumns[index].value = e.target.value;
              setSelectedColumns(updatedColumns);
            }}
          />
        );
    }
  };
  const handleApplyFilter = () => {
    fetchData(
      {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      selectedColumns
    );
    setIsApply(false);
  };
  const handleResetFilter = () => {
    setSelectedColumns(activeFilterArr);
    fetchData({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
    setIsApply(true);
  };
  const handleSaveFilter = async () => {
    const viewKey = localStorage.getItem("deal_activeTab");
    try {
      const url = `http://141.136.47.162:1347/api/views/${viewKey}`;
      const data = {
        data: {
          filter_arr: selectedColumns,
          isSave: true,
        },
      };
      const response = await fetch(url, {
        method: "PUT", // Use PUT for updating the resource
        headers: {
          "Content-Type": "application/json", // Specify JSON content
        },
        body: JSON.stringify(data), // Convert data to JSON string
      });
      if (!response.ok) {
        // Handle HTTP errors
        throw new Error(`Failed to update view: ${response.statusText}`);
      }

      const result = await response.json(); // Parse JSON response
      setTabItems((prevTabItems) =>
        prevTabItems.map((tab) =>
          tab.key === viewKey
            ? { ...tab, filter_arr: selectedColumns } // Update the current tab's filter_arr
            : tab
        )
      );
    } catch (error) {
      console.error("Error Update data:", error);
    } finally {
      setActiveFilterArr(selectedColumns);
      setSelectedColumns(selectedColumns);
    }
  };
  const handleSaveAsNewFilter = async (value, form) => {
    try {
      const url = `http://141.136.47.162:1347/api/views/`;
      const data = {
        data: {
          name: value.name,
          filter_arr: selectedColumns,
          view_type: "deals",
          isSave: true,
        },
      };
      const response = await fetch(url, {
        method: "POST", // Use PUT for updating the resource
        headers: {
          "Content-Type": "application/json", // Specify JSON content
        },
        body: JSON.stringify(data), // Convert data to JSON string
      });
      if (!response.ok) {
        // Handle HTTP errors
        throw new Error(`Failed to update view: ${response.statusText}`);
      }
      const result = await response.json(); // Parse JSON response
      if (result.data) {
        localStorage.setItem(`deal_activeTab`, result.data.documentId);
        localStorage.setItem(
          `deal_activeFilter`,
          JSON.stringify(result.data.filter_arr)
        );
        setIsModalOpen(false);
        setFilterDrawerOpen(false);
      }
    } catch (error) {
      console.error("Error Update data:", error);
    } finally {
      fetchTabs();
      form.resetFields();
    }
  };

  //Stages
  const fetchModuleStage = async () => {
    try {
      const response = await fetch(
        "http://141.136.47.162:1347/api/deal-stages?sort[0]=position:asc"
      );
      const module_stage = await response.json();
      setModuleStage(module_stage.data);
    } catch (error) {
      console.log(error);
    }
  };

  //Common
  const queryBuilder = (applyFilter = []) => {
    const prefix = "?populate[0]=account&populate[1]=deal_stage&populate[2]=contacts&populate[3]=products.product&populate[4]=tags";
    const filters = applyFilter.length ? applyFilter : activeFilterArr;

    if (!filters.length) return prefix;

    const query = filters
      .map(
        ({ field, operator, value }) =>
          `&filters[${field}][${operator}]=${encodeURIComponent(value)}`
      )
      .join("");
    console.log(query);

    return `${prefix}${query}`;
  };

  useEffect(() => {
    fetchTabs();
    fetchColumns();
    fetchModuleStage();
  }, []);

  useEffect(() => {
    if (moduleColumns.length > 0) {
      handleTableColumn();
    }
  }, [moduleColumns]);

  useEffect(() => {
    fetchData();
  }, [activeFilterArr]);

  return (
    <div className="row" style={{ height: "100%" }}>
      <div className="card-body p-0 px-2">
        <div className="col-md-12">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col-8">
                <h3 className="page-title">Deals</h3>
              </div>
              <div className="col-4 text-end">
                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={() => setCreateDrawer(true)}
                >
                  Add deal
                </Button>
              </div>
            </div>
          </div>
          <div className="card m-0">
            <div className="row">
              <div className="col-12">
                {isTabLoading && isDataLoading ? (
                  <Skeleton active />
                ) : (
                  <Tabs
                    size="large"
                    type="editable-card"
                    activeKey={activeTab}
                    items={tabItems.map((tab) => ({
                      key: tab.key,
                      label: (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {tab.label} {!tab.isSave && "**"}
                          {tab.key === activeTab && ( // Show badge only for the active tab
                            <Badge count={data.length} showZero color="grey" />
                          )}
                        </span>
                      ),
                    }))}
                    onEdit={onTabEdit}
                    onChange={handleTabChange}
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                  />
                )}
                {isTabLoading ? (
                  <Skeleton active />
                ) : (
                  <div className="d-flex align-items-center justify-content-between p-3">
                    <Space>
                      <Select
                        value={viewType}
                        style={{ width: 120 }}
                        onChange={(value) => {
                          setViewType(value), fetchData();
                        }}
                        options={[
                          {
                            value: "table",
                            label: (
                              <>
                                <TableOutlined style={{ marginRight: 8 }} />
                                Table
                              </>
                            ),
                          },
                          {
                            value: "kanban",
                            label: (
                              <>
                                <AppstoreOutlined style={{ marginRight: 8 }} />
                                Kanban
                              </>
                            ),
                          },
                        ]}
                      />
                      {viewType === "table" && (
                        <Select
                          defaultValue="middle"
                          style={{ width: 135 }}
                          onChange={(value) => setTableSize(value)}
                          options={[
                            {
                              value: "middle",
                              label: (
                                <>
                                  <FullscreenExitOutlined
                                    style={{ marginRight: 8 }}
                                  />
                                  Compact
                                </>
                              ),
                            },
                            {
                              value: "large",
                              label: (
                                <>
                                  <FullscreenOutlined
                                    style={{ marginRight: 8 }}
                                  />
                                  Comfortable
                                </>
                              ),
                            },
                          ]}
                        />
                      )}

                      <Button
                        icon={<FilterOutlined />}
                        onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                      >
                        {activeFilterArr.length > 0
                          ? `${activeFilterArr.length} filter applied`
                          : "Filter by"}
                      </Button>
                      {viewType === "table" && (
                        <Dropdown
                          disabled={selectedRowKeys.length === 0}
                          trigger={["click"]}
                          menu={{
                            items,
                          }}
                        >
                          <Button icon={<InteractionOutlined />}>
                            Bulk actions
                          </Button>
                        </Dropdown>
                      )}
                    </Space>
                    {viewType === "table" && (
                      <Popover
                        title="Manage Columns"
                        trigger="click"
                        placement="bottomRight"
                        open={manageColumnOpen}
                        onOpenChange={() =>
                          setManageColumnOpen(!manageColumnOpen)
                        }
                        content={
                          <div>
                            {moduleColumns
                              .filter((col) => col.visible)
                              .map((column) => (
                                <div
                                  key={column.name}
                                  style={{ marginBottom: "10px" }}
                                >
                                  <Checkbox
                                    disabled={column.default}
                                    checked={tableColumns.some(
                                      (col) => col.dataIndex === column.name
                                    )}
                                    onChange={(e) =>
                                      handleColumnChange(
                                        column.name,
                                        e.target.checked
                                      )
                                    }
                                  >
                                    {column.label}
                                  </Checkbox>
                                </div>
                              ))}
                          </div>
                        }
                      >
                        <Button icon={<EditOutlined />}>Manage Columns</Button>
                      </Popover>
                    )}
                  </div>
                )}
                {viewType === "table" ? (
                  <div className="table-responsive custom-table bg-white">
                    <TableComponent
                      rowSelection={rowSelection}
                      loading={isDataLoading}
                      size={tableSize}
                      dataSource={data}
                      columns={tableColumns.map((col) => ({
                        ...col,
                        width: col.width || 200, // Set a default width if none is specified
                      }))}
                      onChange={handleTableChange}
                      pagination={{
                        ...pagination,
                        position: ["bottomLeft"],
                        showSizeChanger: true, // Enables page size selection
                        pageSizeOptions: ["10", "25", "50", "100"], // Page size options
                      }}
                    />
                  </div>
                ) : (
                  <DragDropContainer
                    dataSource={data}
                    stages={moduleStage}
                    setDetailOpen={setDetailOpen}
                    setDetailDocumentId={setDetailDocumentId}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(!filterDrawerOpen)}
        activeFilterArr={activeFilterArr}
        selectedColumns={selectedColumns}
        isAddFilter={isAddFilter}
        setIsAddFilter={setIsAddFilter}
        moduleColumns={moduleColumns}
        handleFilterField={handleFilterField}
        renderFilterContent={renderFilterContent}
        isApply={isApply}
        handleResetFilter={handleResetFilter}
        handleSaveFilter={handleSaveFilter}
        handleApplyFilter={handleApplyFilter}
        setSelectedColumns={setSelectedColumns}
        handleOperatorChange={handleOperatorChange}
        handleSaveAsNewFilter={handleSaveAsNewFilter}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        tabItems={tabItems}
      />
      {/* <CreateComponent
        open={createDrawer}
        onClose={() => setCreateDrawer(false)}
        moduleColumns={moduleColumns}
        fetchData={fetchData}
      /> */}
      <DetailDrawerComponent
        detailOpen={detailOpen}
        detailDocumentId={detailDocumentId}
        detailClose={() => setDetailOpen(!detailOpen)}
        fetchData={fetchData}
      />
    </div>
  );
};

export default PipelinePage;
