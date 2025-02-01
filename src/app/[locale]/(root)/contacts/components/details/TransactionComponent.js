import { Button, Table, Empty, Drawer, Popconfirm } from "antd";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const TransactionComponent = ({ detailData, fetchDetail }) => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailDeal, setDetailDeal] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(false);

  const showDrawer = (id) => {
    setOpen(true);
    getDetailDeal(id);
  };

  const onClose = () => {
    setOpen(false);
    setDetailAccount(null);
  };
  const handleDelete = async (id) => {
    try {
      const payload = {
        data: {
          deals: {
            disconnect: [id],
          },
        },
      };
      await fetch(
        `http://141.136.47.162:1347/api/contacts/${detailData.documentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      fetchDetail();
    }
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) =>
        record.name ? (
          <Link href="#" onClick={() => showDrawer(record.documentId)}>
            {record.name}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_, record) =>
        record.amount
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: record.currency || "USD", // Fallback to "USD" if currency is missing
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(record.amount)
          : "-",
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      render: (currency) => currency || "-", // Render "-" if currency is null/undefined
    },
    {
      title: "Close Date",
      dataIndex: "expected_close",
      key: "expected_close",
      render: (expected_close) => expected_close || "-", // Render "-" if close date is null/undefined
    },
    {
      title: "Closed Date",
      dataIndex: "closed_date",
      key: "closed_date",
      render: (closed_date) => closed_date || "-", // Render "-" if closed date is null/undefined
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Delete the account"
          description="Are you sure to delete this account?"
          onConfirm={() => handleDelete(record.documentId)}
          okText="Yes"
          cancelText="No"
        >
          <Button>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  const getDetailDeal = async (id) => {
    setLoadingAccount(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/deals/${id}`
      );
      const dealData = await response.json();
      setDetailDeal(dealData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAccount(false);
    }
  };

  useEffect(() => {
    if (detailData && detailData.deals) {
      const transformedData = detailData.deals.map((item) => ({
        key: item.id,
        amount: item.amount,
        name: item.name,
        closed_date: item.closed_date,
        currency: item.currency,
        expected_close: item.expected_close,
        documentId: item.documentId,
      }));
      setData(transformedData);
    }
  }, [detailData]);

  const dataSource = data.length > 0 ? data : [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="mb-0">Transactions</h4>
        </div>
      </div>
      <div className="card-body p-0">
        {dataSource.length > 0 ? (
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
          />
        ) : (
          <Empty description="No merchants available" />
        )}
      </div>
      <Drawer
        title="Deal Detail"
        onClose={onClose}
        open={open}
        loading={loadingAccount}
      >
        {detailDeal && (
          <div>
            <p>
              <strong>Name:</strong> {detailDeal.name || "-"}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TransactionComponent;
