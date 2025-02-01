import React, { useState, useEffect } from "react";
import {
  Spin,
  Dropdown,
  Select,
  Tag,
  Drawer,
  Form,
  Input,
  Button,
  Modal,
  Space,
  Popconfirm,
  DatePicker,
} from "antd";
import { TagsOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
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
  "accounts",
  "deals",
  "QNumber",
  "QStatus",
  "products",
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
  "amount",
  "deal_stage",
  "products",
  "deal_products",
  "QNumber",
  "QStatus",
  "account",
  "contacts",
];
import moment from "moment";
export default function OverviewComponent({
  detailData,
  onChildrenDrawerClose,
  childrenDrawer,
  fetchDetail,
}) {
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [moduleColumns, setModuleColumns] = useState([]);
  const [options, setOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [optionContacts, setOptionContacts] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/tags?fields[0]=name&fields[1]=color&pagination[pageSize]=25&pagination[page]=1`
      );
      const result = await response.json();
      setTags(result.data || []); // Set fetched tags
      setSelectedTags(detailData.tags?.map((tag) => tag.name || []));
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
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
  const updateTags = async (payload) => {
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/deals/${detailData.documentId}`,
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
  const handleChange = (values) => {
    setSelectedTags(values);

    const oldTags =
      detailData.tags?.map((tag) => ({
        name: tag.name,
        documentId: tag.documentId,
      })) || [];

    const tagsToConnect = values
      .filter((tagName) => !oldTags.some((tag) => tag.name === tagName))
      .map((tagName) => ({
        name: tagName,
        documentId: tags.find((tag) => tag.name === tagName)?.documentId,
      }))
      .filter((tag) => tag.documentId);

    const tagsToDisconnect = oldTags
      .filter((tag) => !values.includes(tag.name))
      .map((tag) => ({
        name: tag.name,
        documentId: tag.documentId,
      }));

    const isChanged = tagsToConnect.length > 0 || tagsToDisconnect.length > 0;

    if (isChanged) {
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
      updateTags(payload);
      // Log the payload for debugging
      console.log("Payload to send:", payload);
    } else {
      console.log("No changes in tags");
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
    const excludeColumns = [
      "notes",
      "tasks",
      "deals",
      "first_name",
      "last_name",
      "accounts",
    ];

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
            ["name", "contact_status", "account", "contacts", "tags"].includes(
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
  const sortedEntries = Object.entries(detailData)
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

  const editEntries = Object.entries(detailData)
    .filter(([key]) => !excludeEdit.includes(key))
    .sort(([keyA], [keyB]) => {
      if (keyA === "name") return -1;
      if (keyB === "name") return 1;
      return 0;
    });

  const initialValues = editEntries.reduce((acc, [key, value]) => {
    if (key === "contacts") {
      acc[key] = value ? value.map((contact) => contact.name) : [];
    } else if (key === "expected_close" || key === "closed_date") {
      acc[key] = value ? moment(value, "YYYY-MM-DD") : null;
    } else if (typeof value === "object" && value !== null) {
      acc[key] = value.name || value;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});

  const fetchAccounts = async (searchText) => {
    setLoadingSearch(true);
    console.log(searchText);
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

  const fetchContacts = async (searchText) => {
    setLoadingSearch(true);
    try {
      // Simulate API call
      const response = await fetch(
        `http://141.136.47.162:1347/api/contacts?sort[0]=name:asc&filters[name][$containsi]=${encodeURIComponent(
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

        setOptionContacts(options);
        setLoadingSearch(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoadingSearch(false);
    }
  };
  const debouncedFetchContact = debounce((value) => {
    if (value.length >= 3) {
      fetchContacts(value);
    } else {
      setOptionContacts([]); // Clear options if input is less than 3 characters
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
      case "date":
        return (
          <DatePicker
            style={{ width: "100%" }}
            placeholder={`Select ${item.label.toLowerCase()}`}
            format="YYYY-MM-DD" // Customize the date format as needed
            disabledDate={(current) => {
              return current && current < moment().startOf("day");
            }}
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
        `http://141.136.47.162:1347/api/deals/${detailData.documentId}`,
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
      onChildrenDrawerClose();
      fetchDetail(detailData.documentId);
    } catch (error) {
      console.error("Error updating:", error.message);
    }
  };
  function timeFromNow(dateString) {
    const now = new Date();
    const givenDate = new Date(dateString);
    const diffInMs = now - givenDate; // Difference in milliseconds
    const diffInSeconds = Math.floor(diffInMs / 1000);

    if (diffInSeconds < 60) {
      return diffInSeconds === 1
        ? "a second ago"
        : `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1
        ? "a minute ago"
        : `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? "an hour ago" : `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return diffInDays === 1 ? "a day ago" : `${diffInDays} days ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? "a month ago" : `${diffInMonths} months ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears === 1 ? "a year ago" : `${diffInYears} years ago`;
  }

  const saveNote = async (values) => {
    try {
      if (editingNoteId) {
        // If editing, update the note
        const payload = {
          data: {
            note: values.note,
          },
        };
        const res = await fetch(
          `http://141.136.47.162:1347/api/notes/${editingNoteId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to update the note");
        }
      } else {
        // If adding a new note
        const payload = {
          data: {
            note: values.note,
          },
        };
        const createRes = await fetch(`http://141.136.47.162:1347/api/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!createRes.ok) {
          throw new Error("Failed to create the note");
        }

        const createdNote = await createRes.json();
        const noteDocumentId = createdNote?.data?.id;

        const connectPayload = {
          data: {
            notes: {
              connect: [noteDocumentId],
            },
          },
        };

        const connectRes = await fetch(
          `http://141.136.47.162:1347/api/deals/${detailData.documentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(connectPayload),
          }
        );

        if (!connectRes.ok) {
          throw new Error("Failed to connect the note to the deal");
        }
      }

      setIsModalOpen(false); // Close the modal
      setEditingNoteId(null); // Reset editing state
      fetchDetail(detailData.documentId); // Refresh the notes
    } catch (error) {
      console.error("Error saving note:", error.message);
    }
  };

  const handleEdit = (note) => {
    setEditingNoteId(note.documentId); // Set the note ID for editing
    form.setFieldsValue({ note: note.note }); // Set the note value in the form
    setIsModalOpen(true); // Open the modal
  };

  const deleteNote = async (noteId) => {
    try {
      const res = await fetch(
        `http://141.136.47.162:1347/api/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update the note");
      }
      fetchDetail(detailData.documentId);
    } catch (error) {
      console.error("Error deleting note:", error.message);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [detailData]);

  useEffect(() => {
    if (childrenDrawer) {
      fetchColumns();
    }
  }, [childrenDrawer]);

  return (
    <div className="card">
      <div className="card-header p-4">
        <p className="fo h4">Deal Details</p>
      </div>
      <div className="card-body py-0 border py-2">
        <div className="row">
          <div className="col-md-8 py-3">
            <div className="row">
              <div className="col-md-12 mb-3">
                <Select
                  mode="tags"
                  placeholder="Click to add tags"
                  variant="borderless"
                  style={{ width: "100%" }}
                  value={selectedTags}
                  onChange={handleChange}
                  tagRender={tagRender}
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
            <Button
              style={{ width: "100%" }}
              className="py-4"
              onClick={() => {
                setEditingNoteId(null); // Reset editing state for a new note
                form.resetFields(); // Clear the form
                setIsModalOpen(true);
              }}
            >
              Add a note...
            </Button>
            {detailData.notes?.map((note) => (
              <div
                key={note.documentId}
                className="mt-2 d-flex align-items-center justify-content-between py-2 border-bottom"
              >
                <div style={{ maxWidth: "calc(100% - 80px)" }}>
                  <div className="note-text-ellipsis">{note.note}</div>
                  <i>{timeFromNow(note.createdAt)}</i>
                </div>
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(note)}
                  />
                  <Popconfirm
                    title={`Delete the note`}
                    description={`Are you sure to delete this note?`}
                    onConfirm={() => deleteNote(note.documentId)}
                    onCancel={() => console.log("Delete canceled")}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button className="mx-1" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>
            ))}
          </div>

          <Modal
            open={isModalOpen}
            onOk={() => form.submit()} // Submit the form on 'Ok'
            onCancel={() => setIsModalOpen(false)}
            title={editingNoteId ? "Edit note" : "Add note"}
          >
            <Form
              form={form} // Associate the form instance
              layout="vertical"
              name="contact_note_form"
              onFinish={saveNote} // Handle form submission
            >
              <Form.Item
                name="note" // Name of the field
                rules={[{ required: true, message: "Please enter a note" }]} // Validation rule
              >
                <Input.TextArea placeholder="Enter note" />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
      <Drawer
        title="Edit"
        width="40%"
        closable={false}
        onClose={onChildrenDrawerClose}
        open={childrenDrawer}
        footer={
          <Button type="primary" htmlType="submit" form={`deal_edit_form`}>
            Save
          </Button>
        }
      >
        <Form
          layout="vertical"
          name={`deal_edit_form`}
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
}
