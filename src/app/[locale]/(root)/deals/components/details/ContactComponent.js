import {
  Button,
  Table,
  Empty,
  Modal,
  Select,
  Spin,
  Drawer,
  Popconfirm,
} from "antd";
import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import Link from "next/link";

export default function ContactComponent({ detailData, fetchDetail }) {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailAccount, setDetailAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setIsModalOpen(false);
    try {
      const payload = {
        data: {
          contacts: {
            connect: selectedContacts,
          },
        },
      };
      await fetch(
        `http://141.136.47.162:1347/api/deals/${detailData.documentId}`,
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
      setSearchResults([]);
      setSelectedContacts([]);
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setSearchResults([]);
    setSelectedContacts([]);
  };
  const showDrawer = (id) => {
    setOpen(true);
    getDetailAccount(id);
  };

  const onClose = () => {
    setOpen(false);
    setDetailAccount(null);
  };
  const handleDelete = async (id) => {
    try {
      const payload = {
        data: {
          contacts: {
            disconnect: [id],
          },
        },
      };
      await fetch(
        `http://141.136.47.162:1347/api/deals/${detailData.documentId}`,
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
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (address) => address || "-",
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (country) => country || "-",
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

  const handleSearch = async (value) => {
    if (value.length < 3) return;
    setLoading(true);
    try {
      //   const module = column.name === "sales_account" ? "accounts" : "contacts";
      const response = await fetch(
        `http://141.136.47.162:1347/api/contacts?sort[0]=name:asc&filters[name][$containsi]=${encodeURIComponent(
          value
        )}&fields[0]=name&pagination[pageSize]=5&pagination[page]=1`
      );
      const result = await response.json();
      const options = result.data.map((item) => ({
        value: item.documentId,
        label: item.name,
      }));
      setSearchResults(options);
    } catch (error) {
      console.error(`Error fetching data for `, error);
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetchProducts = debounce((value) => {
    if (value.length >= 3) {
      handleSearch(value);
    } else {
      setSearchResults([]); // Clear options if input is less than 3 characters
    }
  }, 300);

  const getDetailAccount = async (id) => {
    setLoadingAccount(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/accounts/${id}`
      );
      const accountData = await response.json();
      setDetailAccount(accountData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAccount(false);
    }
  };

  useEffect(() => {
    if (detailData && detailData.contacts) {
      const transformedData = detailData.contacts.map((item) => ({
        key: item.id,
        name: item.name,
        phone: item.phone,
        address: item.address,
        country: item.country,
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
          <h4 className="mb-0">Contacts</h4>
          <Button onClick={showModal}>Add Contact</Button>
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
      <Modal
        title="Add contact"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Select
          style={{
            width: "100%",
          }}
          mode="multiple"
          showSearch
          notFoundContent={
            loading ? <Spin size="small" /> : "Type to search..."
          }
          filterOption={false} // Disable built-in filtering
          onSearch={(value) => debouncedFetchProducts(value)}
          options={searchResults}
          onChange={(value) => setSelectedContacts(value)}
        />
      </Modal>
      <Drawer
        title="Account Detail"
        onClose={onClose}
        open={open}
        loading={loadingAccount}
      >
        {detailAccount && (
          <div>
            <p>
              <strong>Name:</strong> {detailAccount.name || "-"}
            </p>
            <p>
              <strong>ERP Id:</strong> {detailAccount.erp_id || "-"}
            </p>
            <p>
              <strong>Phone:</strong> {detailAccount.phone || "-"}
            </p>
            <p>
              <strong>Website:</strong> {detailAccount.website || "-"}
            </p>
            <p>
              <strong>Address:</strong> {detailAccount.address || "-"}
            </p>
            <p>
              <strong>City:</strong> {detailAccount.city || "-"}
            </p>
            <p>
              <strong>State:</strong> {detailAccount.state || "-"}
            </p>
            <p>
              <strong>Country:</strong> {detailAccount.country || "-"}
            </p>
            <p>
              <strong>Zipcode:</strong> {detailAccount.Zipcode || "-"}
            </p>
            <p>
              <strong>Facebook:</strong> {detailAccount.facebook || "-"}
            </p>
            <p>
              <strong>Twitter:</strong> {detailAccount.twitter || "-"}
            </p>
            <p>
              <strong>Linkedin:</strong> {detailAccount.linkedin || "-"}
            </p>
            <p>
              <strong>Business Type:</strong>{" "}
              {detailAccount.business_type || "-"}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
