import React, { useState, useEffect } from "react";
import {
  Tabs,
  Skeleton,
  Space,
  Select,
  Button,
  Table,
  Popover,
  Avatar,
  Tag,
  Checkbox,
  Drawer,
  Input,
  Modal,
  Form,
} from "antd";
import {
  EditOutlined,
  FilterOutlined,
  CloseOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { optionsByType } from "./commonVariable";
import CreateComponent from "./CreateComponent";
import DetailComponent from "./ContactDetailComponent";

export default function TableComponent({ moduleType }) {
  const [isTabLoading, setIsTabLoading] = useState(true);
  const [manageColumnOpen, setManageColumnOpen] = useState(false);
  const [tabItems, setTabItems] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [activeFilterArr, setActiveFilterArr] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [tableColumns, setTableColumns] = useState([]);
  const [moduleColumns, setModuleColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [tableSize, setTableSize] = useState("middle");
  const [selectOpen, setSelectOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [data, setData] = useState([]);
  const [isApply, setIsApply] = useState(true);
  const [isAddFilter, setIsAddFilter] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [createDrawer, setCreateDrawer] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [detailDocumentId, setDetailDocumentId] = useState(null);

  const fetchTabs = async () => {
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/views?sort[0]=createdAt:asc&filters[view_type][$eq]=${moduleType}s`
      );
      const result = await response.json();
      const tabs = result.data.map((item) => ({
        key: item.documentId,
        label: item.name,
        filter_arr: item.filter_arr || [],
      }));

      setTabItems(tabs);

      const savedActiveTab = localStorage.getItem(`${moduleType}_activeTab`);
      const savedActiveFilter = localStorage.getItem(
        `${moduleType}_activeFilter`
      );

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

    // Ensure a deep copy to avoid modifying the original `filter_arr`
    const filters = JSON.parse(JSON.stringify(selectedTab.filter_arr));

    setActiveTab(key);
    setActiveFilterArr(filters); // Reset active filters
    setSelectedColumns(filters); // Reset selected columns
    setPagination((prev) => ({
      ...prev,
      current: 1, // Reset to the first page
    }));

    // Save active tab and filters to localStorage
    localStorage.setItem(`${moduleType}_activeTab`, key);
    localStorage.setItem(`${moduleType}_activeFilter`, JSON.stringify(filters));
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
    const excludeColumns = [
      "notes",
      "tasks",
      "deals",
      "first_name",
      "last_name",
    ];

    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/content-type-builder/content-types/api::${moduleType}.${moduleType}`
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
              "contact_status",
              "accounts",
              "contacts",
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
  const fetchData = async (params = {}, applyFilter = []) => {
    try {
      const query = queryBuilder(applyFilter);
      if (query) {
        const url = `http://141.136.47.162:1347/api/${moduleType}s${query}&pagination[page]=${
          params.current || pagination.current
        }&pagination[pageSize]=${params.pageSize || pagination.pageSize}`;

        const response = await fetch(url);
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsTableLoading(false);
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
      `${moduleType}SelectedColumns`,
      JSON.stringify(updatedColumns.map((col) => col.dataIndex))
    );
    handleTableColumn();
  };
  const queryBuilder = (applyFilter = []) => {
    const baseQueries = {
      contact:
        "?populate[accounts][fields][0]=name&populate[contact_status][fields][0]=name&populate[contact_status][fields][1]=forecast_type&populate[tags][fields][0]=name&populate[tags][fields][1]=color",
      account:
        "?populate[contacts][fields][0]=name&populate[tags][fields][0]=name&populate[tags][fields][1]=color",
    };

    const prefix = baseQueries[moduleType] || "";
    const filters = applyFilter.length ? applyFilter : activeFilterArr;

    if (!filters.length) return prefix;

    const query = filters
      .map(
        ({ field, operator, value }) =>
          `&filters[${field}][${operator}]=${encodeURIComponent(value)}`
      )
      .join("");

    return `${prefix}${query}`;
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
  const handleTableColumn = () => {
    const savedSelection = JSON.parse(
      localStorage.getItem(`${moduleType}SelectedColumns`)
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
                    <Avatar.Group max={{count:3}} size="default">
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
                (a.contact_status?.name || "").localeCompare(
                  b.contact_status?.name || ""
                ),
              render: (_, { contact_status }) =>
                contact_status ? (
                  <Tag
                    color={
                      contact_status.forecast_type === "Open" ? "green" : "red"
                    }
                  >
                    {contact_status.name}
                  </Tag>
                ) : (
                  "-"
                ),
            };
          }
          break;
        case "string": // Handle string type
          if (col.name === "name") {
            // Specific handling for "name" field
            return {
              ...commonProps,
              render: (text,record) =>
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
                        setIsDetailDrawerOpen(true); // Open the detail drawer
                        setDetailDocumentId(record.documentId); // Pass the documentId
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
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleFilterField = (field) => {
    setSelectedColumns([
      ...selectedColumns,
      { field, operator: "$eq", value: "" },
    ]);
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
          <Input
            type="number"
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
    const viewKey = localStorage.getItem("contact_activeTab");
    try {
      const url = `http://141.136.47.162:1347/api/views/${viewKey}`;
      const data = {
        data: {
          filter_arr: selectedColumns,
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

  const handleSaveAsNewFilter = async (value) => {
    try {
      const url = `http://141.136.47.162:1347/api/views/`;
      const data = {
        data: {
          name: value.name,
          filter_arr: selectedColumns,
          view_type: `${moduleType}s`,
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
        localStorage.setItem(`${moduleType}_activeTab`, result.data.documentId);
        localStorage.setItem(
          `${moduleType}_activeFilter`,
          JSON.stringify(result.data.filter_arr)
        );
        setIsModalOpen(false);
        setFilterDrawerOpen(false);
      }
    } catch (error) {
      console.error("Error Update data:", error);
    } finally {
      fetchTabs();
    }
  };

  useEffect(() => {
    fetchTabs();
    fetchColumns();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeFilterArr]);

  useEffect(() => {
    if (moduleColumns.length > 0) {
      handleTableColumn();
    }
  }, [moduleColumns]);
  const onClose = () => {
    setCreateDrawer(false);
  };

  return (
    <div className="col-md-12">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col-8">
            <h3 className="page-title">
              {moduleType.charAt(0).toUpperCase() + moduleType.slice(1)}s
            </h3>
          </div>
          <div className="col-4 text-end">
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => setCreateDrawer(true)}
            >
              Add {moduleType}
            </Button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="row">
          <div className="col-12">
            {isTabLoading ? (
              <Skeleton active />
            ) : (
              <Tabs
                size="large"
                type="editable-card"
                activeKey={activeTab}
                items={tabItems}
                onChange={handleTabChange}
                style={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
              />
            )}
            {!isTabLoading && (
              <div className="d-flex align-items-center justify-content-between p-3">
                <Space>
                  <Select
                    defaultValue="middle"
                    onChange={setTableSize}
                    style={{ width: 100 }}
                    title="Table Size"
                    options={[
                      { value: "small", label: "Small" },
                      { value: "middle", label: "Middle" },
                      { value: "large", label: "Large" },
                    ]}
                  />
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                  >
                    {activeFilterArr.length > 0
                      ? `${activeFilterArr.length} filter applied`
                      : "Filter by"}
                  </Button>
                </Space>
                <Popover
                  title="Manage Columns"
                  trigger="click"
                  placement="bottomRight"
                  open={manageColumnOpen}
                  onOpenChange={() => setManageColumnOpen(!manageColumnOpen)}
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
              </div>
            )}
            <div className="table-responsive custom-table bg-white">
              <Table
                rowSelection={rowSelection}
                size={tableSize}
                dataSource={data}
                columns={tableColumns.map((col) => ({
                  ...col,
                  width: col.width || 200, // Set a default width if none is specified
                }))}
                loading={isTableLoading}
                pagination={{
                  ...pagination,
                  position: ["bottomLeft"],
                  showSizeChanger: true, // Enables page size selection
                  pageSizeOptions: ["10", "25", "50", "100"], // Page size options
                }}
                onChange={handleTableChange}
                scroll={{ x: "max-content", y: "calc(100vh - 345px)" }}
              />
            </div>
            <Drawer
              title="Filter"
              zIndex={1002}
              key="filter-drawer"
              mask={false}
              open={filterDrawerOpen}
              closeIcon={false}
              onClose={() => setFilterDrawerOpen(!filterDrawerOpen)}
              width={"25%"}
              className="filter-drawer"
              footer={
                <div className="d-flex justify-content-between align-items-center">
                  <Button disabled={isApply} onClick={handleResetFilter}>
                    Reset
                  </Button>
                  <Space>
                    <Button
                      disabled={
                        activeFilterArr.length === selectedColumns.length
                      }
                      onClick={() => setIsModalOpen(true)}
                    >
                      Save view as
                    </Button>
                    <Button
                      disabled={
                        activeFilterArr.length === selectedColumns.length
                      }
                      onClick={handleSaveFilter}
                    >
                      Save
                    </Button>
                    <Button
                      disabled={
                        activeFilterArr.length === selectedColumns.length
                      }
                      onClick={handleApplyFilter}
                    >
                      Apply
                    </Button>
                  </Space>
                </div>
              }
              extra={
                isAddFilter ? (
                  <Space>
                    <Select
                      style={{ width: 200 }}
                      placeholder="Add a field to filter"
                      showSearch
                      options={moduleColumns
                        .filter(
                          (col) =>
                            !selectedColumns.some(
                              (selected) => selected.field === col.name
                            )
                        )
                        .map((col) => ({
                          label: col.label,
                          value: col.name,
                        }))}
                      onDropdownVisibleChange={(open) => setSelectOpen(open)}
                      onChange={handleFilterField}
                    />
                    <CloseOutlined
                      onClick={() => {
                        setIsAddFilter(false);
                        setSelectOpen(false); // Ensure dropdown is closed
                      }}
                    />
                  </Space>
                ) : (
                  <Space>
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => {
                        setIsAddFilter(true);
                        setSelectOpen(true); // Open Select dropdown
                      }}
                    >
                      Add filters
                    </Button>
                    <CloseOutlined
                      onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                    />
                  </Space>
                )
              }
            >
              {selectedColumns.map((filter, index) => {
                return (
                  <div className="p-3 border-bottom" key={index}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <Space>
                        <strong>{filter.field}</strong>
                        <Select
                          style={{ width: 200 }}
                          value={filter.operator}
                          onChange={(value) =>
                            handleOperatorChange(index, value)
                          }
                          options={
                            optionsByType[
                              moduleColumns.find(
                                (col) => col.name === filter.field
                              )?.type
                            ]
                          }
                        />
                      </Space>
                      <CloseOutlined
                        onClick={() => {
                          const updatedColumns = selectedColumns.filter(
                            (_, i) => i !== index
                          );
                          setSelectedColumns(updatedColumns);
                        }}
                      />
                    </div>
                    {renderFilterContent(filter, index)}
                  </div>
                );
              })}
            </Drawer>
            <Modal
              title="Edit view"
              open={isModalOpen}
              onOk={() => setIsModalOpen(false)}
              onCancel={() => setIsModalOpen(false)}
              zIndex={1003}
              footer={[
                <Button htmlType="submit" form="save_view_as">
                  Save
                </Button>,
              ]}
            >
              <Form
                layout="vertical"
                form={form}
                name="save_view_as"
                onFinish={handleSaveAsNewFilter}
              >
                <Form.Item
                  label="View name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please input view's name!",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      </div>
      <CreateComponent
        moduleType={moduleType}
        open={createDrawer}
        onClose={onClose}
        moduleColumns={moduleColumns}
        fetchData={fetchData}
      />
      <DetailComponent
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        detailDocumentId={detailDocumentId}
        moduleType={moduleType}
        moduleColumns={moduleColumns}
        fetchData={fetchData}
      />
    </div>
  );
}
