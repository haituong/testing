import { Button, Table, Empty } from "antd";
import React, { useState, useEffect } from "react";

export default function MerchantComponent({ detailData }) {
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
    },
    {
      title: "Business Type",
      dataIndex: "business_type",
      key: "business_type",
    },
  ];

  useEffect(() => {
    if (detailData && detailData.accounts) {
      const transformedData = detailData.accounts.map((item) => ({
        key: item.id,
        name: item.name,
        phone: item.phone,
        address: item.address,
        city: item.city,
        state: item.state,
        country: item.country,
        business_type: item.business_type,
      }));
      setData(transformedData);
    }
  }, [detailData]);

  const dataSource = data.length > 0 ? data : [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="mb-0">Merchants</h4>
          <Button>Add Merchant</Button>
        </div>
      </div>
      <div className="card-body p-0">
        {dataSource.length > 0 ? (
          <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 5 }} />
        ) : (
          <Empty description="No merchants available" />
        )}
      </div>
    </div>
  );
}
