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
} from "antd";
import moment from "moment";

import { useState, useEffect } from "react";
import OverviewComponent from "./details/OverviewComponent";
import MerchantComponent from "./details/MerchantComponent";
import TransactionComponent from "./details/TransactionComponent";
import debounce from "lodash.debounce";
const { Content, Sider } = Layout;
import {
  MailOutlined,
  PlusCircleOutlined,
  MoneyCollectOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  AuditOutlined,
  UnorderedListOutlined,
  WechatWorkOutlined,
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
    key: "convervations",
    icon: <WechatWorkOutlined style={iconStyle} />,
    label: "Convervations",
    disabled: true,
  },
  {
    key: "activites",
    icon: <UnorderedListOutlined style={iconStyle} />,
    label: "Activites",
    disabled: true,
  },
  {
    key: "merchants",
    icon: <AuditOutlined style={iconStyle} />,
    label: "Accounts",
    danger: true,
  },
  {
    key: "transactions",
    icon: <MoneyCollectOutlined style={iconStyle} />,
    label: "Transactions",
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
  const [addTransactionDrawer, setAddTransactionDrawer] = useState(false);
  const [form] = Form.useForm();
  const [contactOptions, setContactOptions] = useState([]); // To store the fetched options
  const [accountOptions, setAccountOptions] = useState([]); // To store the fetched options
  const [optionContactLoading, setOptionContactLoading] = useState(false);
  const [optionAccountLoading, setOptionAccountLoading] = useState(false);
  const [dealState, setDealState] = useState([]);
  const [initValue, setInitValue] = useState({});
  const [selectedStage, setSelectedStage] = useState(null);
  const [rfqType, setRfqType] = useState();
  const [marketingLeadOptions, setMarketingLeadOptions] = useState([]);
  const [leadLoadding, setLeadLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  //Fetch detail
  const disabledDate = (current) => {
    // Disable dates before today
    return current && current < moment().endOf("day");
  };
  const fetchDetail = async (id = detailDocumentId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/contacts/${id}?populate=*`
      );
      const result = await response.json();
      console.log(result)
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
      case "merchants":
        return (
          <MerchantComponent detailData={detail} fetchDetail={fetchDetail} />
        );
      // case "conversations":
      //   return <ConversationsComponent contact={contact} />;
      // case "activities":
      //   return <ActivitiesComponent contact={contact} />;
      case "transactions":
        return <TransactionComponent detailData={detail} fetchDetail={fetchDetail}/>;
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

  const fetchDealState = async () => {
    try {
      const response = await fetch(
        "http://141.136.47.162:1347/api/deal-stages?sort[0]=position:asc"
      );
      const result = await response.json();
      const formattedData = result.data.map((stage) => {
        return {
          label: stage.name,
          value: stage.documentId,
        };
      });
      setDealState(formattedData);
    } catch (error) {
      console.error("Error fetching deal state:", error);
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
        `http://141.136.47.162:1347/api/contacts/${detail.documentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        detailClose();
        fetchData();
      } else {
        console.error("Error deleting contact:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };
  const debouncedFetch = debounce((value, type) => {
    if (value.length >= 3 && type === "contact") {
      fetchContactOptions(value);
    } else if (value.length >= 3 && type === "account") {
      fetchAccountOptions(value);
    } else {
      setAccountOptions([]);
      setContactOptions([]);
    }
  }, 300);

  const fetchContactOptions = async (searchText) => {
    if (searchText.length < 3) {
      setContactOptions([]); // Clear options if search text is less than 3 characters
      return;
    }

    setOptionContactLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch(
        `http://141.136.47.162:1347/api/contacts?sort[0]=name:asc&filters[name][$containsi]=${encodeURIComponent(
          searchText
        )}&fields[0]=name&pagination[pageSize]=5&pagination[page]=1`
      );
      const result = await response.json();
      const fetchedOptions = result.data.map((contact) => ({
        label: contact.name,
        value: contact.documentId,
      }));

      setContactOptions(fetchedOptions);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setOptionContactLoading(false);
    }
  };

  const fetchAccountOptions = async (searchText) => {
    if (searchText.length < 3) {
      setAccountOptions([]); // Clear options if search text is less than 3 characters
      return;
    }

    setOptionAccountLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch(
        `http://141.136.47.162:1347/api/accounts?sort[0]=name:asc&filters[name][$containsi]=${encodeURIComponent(
          searchText
        )}&fields[0]=name&pagination[pageSize]=5&pagination[page]=1`
      );
      const result = await response.json();
      const fetchedOptions = result.data.map((account) => ({
        label: account.name,
        value: account.documentId,
        erp_id: account.erp_id,
      }));

      setAccountOptions(fetchedOptions);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setOptionAccountLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      const quoteStatusMapping = {
        0: "New",
        4: "Verified",
        11: "Approved",
      };

      // Only call createRFQ if the selected stage is "RFQ"
      let quoteData = [];
      if (selectedStage && selectedStage.label === "RFQ") {
        quoteData = await createRFQ(values);
      }

      // If quoteData is empty or not returned from createRFQ, you might want to handle it
      if (quoteData.length === 0) {
        throw new Error("No quote data received from createRFQ");
      }
      // Access the status correctly
      const QStatus = quoteStatusMapping[quoteData[0].QStatus];

      const quotationPayload = {
        data: {
          "QNumber": quoteData[0].QNumber.toString(),
          "QStatus": QStatus,
        }
      }

      const quotationResponse = await fetch("http://141.136.47.162:1347/api/quotations",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quotationPayload),
      })
      const quotationData = await quotationResponse.json();

      const quotationId = quotationData.data.documentId;

      const payload = {
        data: {
          name: values.deal_name,
          expected_close: moment(values.expected_close).format("YYYY-MM-DD"),
          currency: values.currency,
          contacts: {
            connect: values.related_contact.map((contact) => ({
              documentId: contact.value,
            })),
          },
          account: {
            connect: {
              documentId: values.related_account.value,
            },
          },
          quotations: {
            connect: {
              documentId: quotationId,
            }
          },
          deal_stage: {
            connect: {
              documentId: values.deal_stage,
            },
          },
        },
      };

      const response = await fetch("http://141.136.47.162:1347/api/deals", {
        method: "POST", // Specify the request method
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: JSON.stringify(payload), // Convert form values to a JSON string
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Close the transaction drawer and reset the form
      setAddTransactionDrawer(false);
      form.resetFields();
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };

  const getERPId = async (id) => {
    try {
      const response = await fetch(
        `http://141.136.47.162:1347/api/accounts/${id}`
      );
      const result = await response.json();
      return result.data.erp_id;
    } catch (error) {
      console.error("Error fetching erp id", error);
    }
  };

  const createRFQ = async (values) => {
    const productType = {
      BLISTER: 73,
      CAPSULE: 72,
      COMBO: 69,
      GELATIN: 77,
      GUMMY: 706,
      LIQUID: 701,
      POWDER: 74,
      SOFTGEL: 70,
      TABLET: 71,
    };
    try {
      // Transform the input values to the desired structure
      const erpId = await getERPId(values.related_account?.value);
      let transformedData = {
        ListQuote: [],
      };
      if (rfqType === "New Product Request") {
        transformedData.ListQuote = [
          {
            Printing: values.Printing || false,
            PreviouslyMfg: values.PreviouslyMfg || false,
            VendorSpec: values.VendorSpec || false,
            NonGMO: values.NonGMO || false,
            Vegan: values.Vegan || false,
            Organic: values.Organic || false,
            CustSupply: values.CustSupply || false,
            HalalCert: values.HalalCert || false,
            StabilityAdditionTest: values.StabilityAdditionTest || false,
            NSFSport: values.NSFSport || false,
            UseDefault: values.UseDefault || false,
            RestrictExcipient: values.RestrictExcipient || false,
            KosherCert: values.KosherCert || false,
            GlutenFree: values.GlutenFree || false,
            MiscAllergen: values.MiscAllergen || false,
            Others: values.Others || false,
            HasSample: values.HasSample || false,
            HasLabel: values.HasLabel || false,
            HasFormula: values.HasFormula || false,
            HasFlavorProfile: values.HasFlavorProfile || false,
            RFQStatus: values.RFQStatus || "New",
            RFQRequest: "RFQ",
            BatchSize: values.BatchSize || "",
            Flexibility: values.Flexibility || "",
            NeedMatching: values.NeedMatching || "",
            DestinationCountry: values.DestinationCountry || "",
            SizeShape: values.SizeShape || "",
            Color: values.Color || "",
            Flavor: values.Flavor || "",
            GelType: values.GelType || "",
            ListCert: values.ListCert || "",
            ProjectedServingSize: values.ProjectedServingSize || "",
            EstAnnualVolume: values.EstAnnualVolume || "",
            QNumber: 0,
            QKey: 0,
            QStatus: 0,
            MarketingLead: {
              LeadCode: values.MarketingLead || "",
            },
            ListUser: [
              {
                UserName: values.cs_DeptName || "",
                Department: {
                  DeptKey: 0,
                  DeptName: "CS",
                },
              },
            ],
            Product: {
              Description: values.product_description || "",
              ProductTypeKey: productType[values.product_type] || "",
            },
            Customer: {
              Key: erpId || "",
            },
          },
        ];
      } else if (rfqType === "Document Change Request") {
        transformedData.ListQuote = [
          {
            RFQStatus: values.RFQStatus || "New",
            RFQRequest: "RFQ",
            BatchSize: values.BatchSize || "",
            QNumber: values.quote_number,
            QKey: 0,
            QStatus: 0,
            TypeOfChange: values.TypeOfChange || "",
            OldInfo: values.OldInfo || "",
            NewInfo: values.NewInfo || "",
            QBodyNote: values.QBodyNote || "",
            MarketingLead: {
              LeadCode: values.MarketingLead || "",
            },
            ListUser: [
              {
                UserName: values.cs_DeptName || "",
                Department: {
                  DeptKey: 0,
                  DeptName: "CS",
                },
              },
            ],
            Product: {
              Description: values.product_description || "",
              ProductTypeKey: productType[values.product_type] || "",
            },
            Customer: {
              Key: erpId || "",
            },
          },
        ];
      } else {
        transformedData.ListQuote = [
          {
            RFQStatus: values.RFQStatus || "New",
            RFQRequest: "RFQ",
            BatchSize: values.BatchSize || "",
            QNumber: values.quote_number,
            QKey: 0,
            QStatus: 0,
            MarketingLead: {
              LeadCode: values.MarketingLead || "",
            },
            ListUser: [
              {
                UserName: values.cs_DeptName || "",
                Department: {
                  DeptKey: 0,
                  DeptName: "CS",
                },
              },
            ],
            Product: {
              Description: values.product_description || "",
              ProductTypeKey: productType[values.product_type] || "",
            },
            Customer: {
              Key: erpId || "",
            },
          },
        ];
      }
      const response = await fetch("api/rp/rfq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });
      const data = await response.json();
      return data;
      // Example API call to save the transformed data
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  
  const openChildrenDrawer = () => {
    if (detail) {
      setAddTransactionDrawer(true);
      fetchDealState();
      setSelectedAccount(detail.accounts[0]?.documentId || "");
      setInitValue({
        related_contact: [{ label: detail.name, value: detail.documentId }],
        related_account: {
          label: detail.accounts[0]?.name || "",
          value: detail.accounts[0]?.documentId || "",
        },
      });
    }
  };
  const handleStageChange = (value) => {
    const selectedStage = dealState.find((stage) => stage.value === value);
    setRfqType(null);
    setSelectedStage(selectedStage); // Update the selected stage
  };
  const fetchMarketingLeadOptions = async () => {
    setLeadLoading(true);
    try {
      const account_response = await fetch(
        `http://141.136.47.162:1347/api/accounts/${selectedAccount}`
      );
      const account_data = await account_response.json();
      if (account_data.data) {
        const response = await fetch(`api/rp/marketing-leads`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: account_data.data.erp_id }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMarketingLeadOptions(data);
      }
    } catch (error) {
      console.error("Error fetching marketing lead options:", error);
    } finally {
      setLeadLoading(false);
    }
  };

  const renderGeneralRfqForm = () => {
    return (
      <>
        <h4 className="my-3">RFQ Form</h4>
        <h5 className="mb-3">General information</h5>
        <Row gutter={16}>
          <Col span={12}>
            {" "}
            <Form.Item
              label="RFQ Type"
              name="rfq_type"
              rules={[
                {
                  required: true,
                  message: "Field is required",
                },
              ]}
            >
              <Select
                onChange={(value) => {
                  setRfqType(value);
                  setInitValue({
                    ...initValue,
                    rfqType: value,
                    RFQStatus: "New",
                    MarketingLead: "MK000"
                  });
                }}
                options={[
                  {
                    label: "New Product Request",
                    value: "New Product Request",
                  },
                  {
                    label: "Document Change Request",
                    value: "Document Change Request",
                  },
                  { label: "ReQuote", value: "ReQuote" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Quote Number"
              name="quote_number"
              rules={[
                {
                  required: rfqType !== "New Product Request",
                  message: "Field is required",
                },
              ]}
            >
              <Input
                disabled={rfqType === "New Product Request" ? true : false}
                placeholder="Quote Number"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="RFQ Status"
              name="RFQStatus"
              rules={[
                {
                  required: true,
                  message: "Field is required",
                },
              ]}
            >
              <Select options={[{ label: "New", value: "New" }]} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Formulator" name="formulator">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Marketing Lead" name="MarketingLead">
              <Select
                showSearch
                options={marketingLeadOptions.map((item) => ({
                  label: item,
                  value: item,
                }))}
                loading={leadLoadding} // Show loading indicator while fetching
                notFoundContent={
                  loading ? <Spin size="small" /> : "No options found"
                }
                onDropdownVisibleChange={(open) => {
                  if (open) {
                    fetchMarketingLeadOptions(); // Trigger fetch when dropdown opens
                  }
                }}
                placeholder="Select a Marketing Lead"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="CS Rep (optional)" name="DeptName">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Existing Formula (Q#/V#)" name="existing_formula">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Product Description" name="product_description">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Batch Size" name="batch_size">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Product Type" name="product_type">
              <Select
                options={[
                  { label: "BLISTER", value: "BLISTER" },
                  { label: "CAPSULE", value: "CAPSULE" },
                  { label: "COMBO", value: "COMBO" },
                  { label: "GELATIN", value: "GELATIN" },
                  { label: "GUMMY", value: "GUMMY" },
                  { label: "LIQUID", value: "LIQUID" },
                  { label: "POWDER", value: "POWDER" },
                  { label: "SOFTGEL", value: "SOFTGEL" },
                  { label: "TABLET", value: "TABLET" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
    // }
  };
  const renderAdditionRfqForm = () => {
    if (rfqType === "New Product Request") {
      return (
        <>
          <h5 className="mb-3">Additional information</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Flexibility" name="Flexibility">
                <Select
                  options={[
                    {
                      label: "Flexible",
                      value: "Flexible",
                    },
                    {
                      label: "Non flexible",
                      value: "Non flexible",
                    },
                    {
                      label: "Conditional* (defined in special instructions)",
                      value: "Conditional* (defined in special instructions)",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Need to match?" name="NeedMatching">
                <Select
                  options={[
                    {
                      label:
                        "Match exactly (including customer flavor profile)",
                      value:
                        "Match exactly (including customer flavor profile)",
                    },
                    {
                      label: "Match without customer flavor profile",
                      value: "Match without customer flavor profile",
                    },
                    {
                      label: "No (R&amp;D Rec.)",
                      value: "No (R&amp;D Rec.)",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Previously Manufactured?"
                name="PreviouslyMfg"
                valuePropName="checked"
              >
                <Checkbox>Yes</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <div className="mb-3">
            If product already exists on the market, must provide sample and
            label if matching is required
          </div>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Country of Destination"
                name="DestinationCountry"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Size/Shape" name="SizeShape">
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Gelatin Type" name="GelType">
                <Select
                  options={[
                    {
                      label: "Bovine",
                      value: "Bovine",
                    },
                    {
                      label: "Fish",
                      value: "Fish",
                    },
                    {
                      label: "Porcine",
                      value: "Porcine",
                    },
                    {
                      label: "SeaGel/Veggie",
                      value: "SeaGel/Veggie",
                    },
                    {
                      label: "R& D Rec.",
                      value: "R& D Rec.",
                    },
                    {
                      label: "StarchGel/Veggie",
                      value: "StarchGel/Veggie",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Coating" name="Coating">
                <Select
                  options={[
                    {
                      label: "Clear",
                      value: "Clear",
                    },
                    {
                      label: "Color",
                      value: "Color",
                    },
                    {
                      label: "Enteric",
                      value: "Enteric",
                    },
                    {
                      label: "Clear & Enteric",
                      value: "Clear & Enteric",
                    },
                    {
                      label: "Color & Enteric",
                      value: "Color & Enteric",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Projeted Serving Size"
                name="ProjectedServingSize"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Color Type" name="ColorType">
                <Select
                  options={[
                    {
                      label: "No Colorants (Clear)",
                      value: "No Colorants (Clear)",
                    },
                    {
                      label: "Natural Colorants Only",
                      value: "Natural Colorants Only",
                    },
                    {
                      label: "FD & C Colorants Only",
                      value: "FD & C Colorants Only",
                    },
                    {
                      label: "Both Naturals and FD & C's",
                      value: "Both Naturals and FD & C's",
                    },
                    {
                      label: "Custom* (defined in special instructions)",
                      value: "Custom* (defined in special instructions)",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Color" name="Color">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Flavor" name="Flavor">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Printing" name="Printing">
                <Select
                  options={[
                    {
                      label: "Yes",
                      value: true,
                    },
                    {
                      label: "No",
                      value: false,
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="mb-3">Choose all that apply</div>
          <div className="d-flex flex-wrap justify-content-between">
            <Form.Item name="VendorSpec" valuePropName="checked">
              <Checkbox>Vendor Specific</Checkbox>
            </Form.Item>
            <Form.Item name="CustSupply" valuePropName="checked">
              <Checkbox>Customer Supplied</Checkbox>
            </Form.Item>
            <Form.Item name="RestrictExcipient" valuePropName="checked">
              <Checkbox>Restricted Excipients</Checkbox>
            </Form.Item>
            <Form.Item name="NonGMO" valuePropName="checked">
              <Checkbox>Non-GMO</Checkbox>
            </Form.Item>
            <Form.Item name="HalalCert" valuePropName="checked">
              <Checkbox>Hatal Cert</Checkbox>
            </Form.Item>
            <Form.Item name="KosherCert" valuePropName="checked">
              <Checkbox>Kosher Cert</Checkbox>
            </Form.Item>
            <Form.Item name="Vegan" valuePropName="checked">
              <Checkbox>Vegan</Checkbox>
            </Form.Item>
            <Form.Item name="StabilityAdditionTest" valuePropName="checked">
              <Checkbox>Stability/Additional Testing</Checkbox>
            </Form.Item>
            <Form.Item name="GlutenFree" valuePropName="checked">
              <Checkbox>Gluten-free</Checkbox>
            </Form.Item>
            <Form.Item name="Organic" valuePropName="checked">
              <Checkbox>Organic</Checkbox>
            </Form.Item>
            <Form.Item name="NSFSport" valuePropName="checked">
              <Checkbox>NSF Sport</Checkbox>
            </Form.Item>
            <Form.Item name="MiscAllergen" valuePropName="checked">
              <Checkbox>MISC. Allergens</Checkbox>
            </Form.Item>
            <Form.Item name="Others" valuePropName="checked">
              <Checkbox>Other</Checkbox>
            </Form.Item>
            <Form.Item name="UseDefault" valuePropName="checked">
              <Checkbox>Use Default</Checkbox>
            </Form.Item>
          </div>
          <div>
            <Form.Item name="ListCert">
              <Input.TextArea placeholder="(*Please list any certification specifics here)" />
            </Form.Item>
          </div>
          <div className="mb-3">Choose all that apply</div>
          <div className="d-flex flex-wrap justify-content-between">
            <Form.Item name="HasSample" valuePropName="checked">
              <Checkbox>Samples</Checkbox>
            </Form.Item>
            <Form.Item name="HasLabel" valuePropName="checked">
              <Checkbox>Label</Checkbox>
            </Form.Item>
            <Form.Item name="HasFormula" valuePropName="checked">
              <Checkbox>Formula</Checkbox>
            </Form.Item>
            <Form.Item name="HasFlavorProfile" valuePropName="checked">
              <Checkbox>Flavor Profile</Checkbox>
            </Form.Item>
          </div>
        </>
      );
    } else if (rfqType === "Document Change Request") {
      return (
        <>
          <h5 className="mb-3">Additional information</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Type Of Change" name="TypeOfChange">
                <Select
                  options={[
                    {
                      label: "New Change",
                      value: "New Change",
                    },
                    {
                      label: "Revision",
                      value: "Revision",
                    },
                    {
                      label: "Obsolete",
                      value: "Obsolete",
                    },
                    {
                      label: "Biennial Review",
                      value: "Biennial Review",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="New Info" name="NewInfo">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Old Info" name="OldInfo">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Note" name="QBodyNote">
            <Input.TextArea />
          </Form.Item>
        </>
      );
    }
  };
  const handleTransactionClose = () => {
    setAddTransactionDrawer(false);
    setSelectedStage(null);
    setMarketingLeadOptions([]);
    setRfqType(null);
    form.resetFields();
  };

  useEffect(() => {
    if (detailDocumentId) {
      fetchDetail();
    }
  }, [detailDocumentId]);

  useEffect(() => {
    if (initValue) {
      form.setFieldsValue(initValue); // Explicitly update the form
    }
  }, [initValue, form]);

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
                    color="danger"
                    variant="solid"
                    className="mx-1"
                    icon={<MailOutlined />}
                  >
                    Mail
                  </Button>
                  <Button
                    color="danger"
                    variant="solid"
                    className="mx-1"
                    icon={<PlusCircleOutlined />}
                    onClick={openChildrenDrawer}
                  >
                    Add transaction
                  </Button>
                  <Button
                    className="mx-1"
                    icon={<EditOutlined />}
                    onClick={() => setChildrenDrawer(true)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title={`Delete the contact`}
                    description={`Are you sure to delete this contact?`}
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
        <Drawer
          title="Add deal"
          open={addTransactionDrawer}
          onClose={handleTransactionClose}
          width="50%"
          footer={
            <div style={{ textAlign: "right" }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => form.submit()}
              >
                Save
              </Button>
            </div>
          }
        >
          <Form
            layout="vertical"
            form={form}
            name={`add_deal_form`}
            initialValues={initValue}
            onFinish={onFinish}
          >
            <h4 className="mb-3">Basic information</h4>
            <Row gutter={16}>
              <Col span={12}>
                {" "}
                <Form.Item
                  label="Related contact"
                  name="related_contact"
                  rules={[
                    {
                      required: true,
                      message: "Field is required",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    options={contactOptions}
                    notFoundContent={
                      optionContactLoading ? (
                        <Spin size="small" />
                      ) : (
                        "Type to search..."
                      )
                    }
                    onSearch={(value) => debouncedFetch(value, "contact")}
                    showSearch
                    filterOption={false}
                    placeholder="Search contacts"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Related account"
                  name="related_account"
                  rules={[
                    {
                      required: true,
                      message: "Field is required",
                    },
                  ]}
                >
                  <Select
                    options={accountOptions}
                    notFoundContent={
                      optionAccountLoading ? (
                        <Spin size="small" />
                      ) : (
                        "Type to search..."
                      )
                    }
                    onSearch={(value) => debouncedFetch(value, "account")}
                    showSearch
                    filterOption={false}
                    placeholder="Search accounts"
                    onChange={(value) => setSelectedAccount(value)}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Deal Name */}
            <Form.Item
              label="Deal name"
              name="deal_name"
              rules={[
                {
                  required: true,
                  message: "Field is required",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Deal stage"
                  name="deal_stage"
                  rules={[
                    {
                      required: true,
                      message: "Field is required",
                    },
                  ]}
                >
                  <Select
                    options={dealState}
                    onChange={(value) => handleStageChange(value)}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                {/* Expected Close Date */}
                <Form.Item label="Expected close date" name="expected_close">
                  <DatePicker
                    disabledDate={disabledDate}
                    style={{ width: "100%" }} // Ensuring full width for DatePicker
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                {/* Currency */}
                <Form.Item label="Currency" name="currency">
                  <Select
                    options={[
                      { label: "USD", value: "USD" },
                      { label: "CNY", value: "CNY" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            {selectedStage && selectedStage.label === "RFQ" && (
              <>
                {renderGeneralRfqForm()}
                {renderAdditionRfqForm()}
              </>
            )}
          </Form>
        </Drawer>
      </Drawer>
    </>
  );
}
