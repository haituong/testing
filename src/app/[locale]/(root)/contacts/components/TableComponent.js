import { Table } from "antd";

export default function TableComponent({
  rowSelection,
  loading,
  size,
  dataSource,
  columns,
  pagination,
  onChange
}) {
  return (
    <>
      <Table
        rowSelection={rowSelection}
        loading={loading}
        size={size}
        dataSource={dataSource}
        columns={columns}
        onChange={onChange}
        pagination={{
          ...pagination,
          position: ["bottomLeft"],
          showSizeChanger: true, // Enables page size selection
          pageSizeOptions: ["10", "25", "50", "100"], // Page size options
        }}
        scroll={{ x: "max-content", y: "calc(100vh - 345px)" }}
      />
    </>
  );
}
