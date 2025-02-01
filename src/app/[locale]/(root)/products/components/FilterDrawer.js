import { Button, Drawer, Form, Modal, Select, Space, Input } from "antd";
import { FilterOutlined, CloseOutlined } from "@ant-design/icons";

import { optionsByType } from "@/common/moduleCommon/commonVariable";

export default function FilterDrawer({
  onClose,
  open,
  activeFilterArr,
  selectedColumns,
  isAddFilter,
  setIsAddFilter,
  moduleColumns,
  handleFilterField,
  renderFilterContent,
  isApply,
  handleResetFilter,
  handleSaveFilter,
  handleApplyFilter,
  setSelectedColumns,
  handleOperatorChange,
  handleSaveAsNewFilter,
  isModalOpen,
  setIsModalOpen,
}) {
  const [form] = Form.useForm();
  return (
    <>
      <Drawer
        title="Filter"
        zIndex={1002}
        key="filter-drawer"
        mask={false}
        open={open}
        closeIcon={false}
        onClose={onClose}
        width={"25%"}
        className="filter-drawer"
        footer={
          <div className="d-flex justify-content-between align-items-center">
            <Button disabled={isApply} onClick={handleResetFilter}>
              Reset
            </Button>
            <Space>
              <Button
                disabled={activeFilterArr.length === selectedColumns.length}
                onClick={() => setIsModalOpen(true)}
              >
                Save view as
              </Button>
              <Button
                disabled={activeFilterArr.length === selectedColumns.length}
                onClick={handleSaveFilter}
              >
                Save
              </Button>
              <Button
                disabled={activeFilterArr.length === selectedColumns.length}
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
                onChange={handleFilterField}
              />
              <CloseOutlined
                onClick={() => {
                  setIsAddFilter(false);
                }}
              />
            </Space>
          ) : (
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setIsAddFilter(true);
                }}
              >
                Add filters
              </Button>
              <CloseOutlined onClick={onClose} />
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
                    onChange={(value) => handleOperatorChange(index, value)}
                    options={
                      optionsByType[
                        moduleColumns.find((col) => col.name === filter.field)
                          ?.type
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
        title="Save view"
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
          onFinish={(values) => handleSaveAsNewFilter(values, form)}
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
    </>
  );
}
