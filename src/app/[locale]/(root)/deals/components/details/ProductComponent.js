import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Form,
  Drawer,
  Space,
  List,
  Spin,
  Input,
  Select,
  Col,
  Row,
  InputNumber,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";

const ProductComponent = ({ data, id, fetchDetailData }) => {
  const [open, setOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const onFinish = async (values) => {
    console.log("Received values of form:", values);

    if (!values.products || !values.products.length) {
      console.error("No products added");
      return;
    }

    try {
      // Calculate the total amount
      const totalAmount = values.products.reduce((sum, product) => {
        return sum + Number(product.amount || 0); // Ensure amount is treated as a number
      }, 0);

      // Prepare the formatted data
      const formattedData = {
        data: {
          amount: totalAmount,
          products: values.products.map((product) => ({
            unit_price: product.unit_price,
            base_price: product.base_price,
            margin: product.margin,
            quantity: product.quantity,
            discount: product.discount,
            product: {
              connect: [
                {
                  documentId: product.product_id, // Map product_id to documentId
                },
              ],
            },
          })),
        },
      };

      console.log("Sending formatted data:", formattedData);

      // Send a POST request
      const response = await fetch(
        `http://141.136.47.162:1347/api/deals/${id}`,
        {
          method: "PUT", // Use POST for creating data
          headers: {
            "Content-Type": "application/json", // Specify JSON content type
          },
          body: JSON.stringify(formattedData), // Send formattedData as JSON
        }
      );

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        throw new Error(`Failed to submit data: ${response.statusText}`);
      }

      // Handle success
      const responseData = await response.json();
      console.log("Successfully submitted data:", responseData);
    } catch (error) {
      // Handle errors
      console.error("An error occurred:", error.message);
    } finally {
      setOpen(false);
      fetchDetailData();
    }
  };

  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

  useEffect(() => {
    setProducts(data.products);
    setTotalAmount(data.amount);
    // setTempProduct(data.products);
  }, [data]);

  const fetchProducts = async (searchText) => {
    setLoading(true);
    try {
      // Simulate API call
      const response = await fetch(
        `http://141.136.47.162:1347/api/products?sort[0]=name:asc&filters[name][$containsi]=${encodeURIComponent(
          searchText
        )}&fields[0]=name&pagination[pageSize]=5&pagination[page]=1`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();

      setTimeout(() => {
        const products = data?.data || []; // Assuming the API returns a `data` array
        const options = products.map((item) => ({
          value: item.name,
          label: item.name,
          documentId: item.documentId,
        }));

        setOptions(options);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const debouncedFetchProducts = debounce((value) => {
    if (value.length >= 3) {
      fetchProducts(value);
    } else {
      setOptions([]); // Clear options if input is less than 3 characters
    }
  }, 300);

  const initialProducts = products.map((item) => {
    // Ensure numeric values
    const basePrice = Number(item.base_price) || 0;
    const margin = Number(item.margin) || 0; // Margin in percentage
    const quantity = Number(item.quantity) || 0;
    const discount = Number(item.discount) || 0; // Discount in percentage

    // Calculate unit price with margin
    const unitPrice = basePrice + (basePrice * margin) / 100;

    // Calculate amount before discount
    const amountBeforeDiscount = unitPrice * quantity;

    // Apply discount to the amount
    const amount =
      amountBeforeDiscount - (amountBeforeDiscount * discount) / 100;

    // Return the formatted object
    return {
      product_id: item.product.documentId,
      product_name: item.product.name,
      base_price: basePrice,
      margin: margin,
      unit_price: unitPrice,
      quantity: quantity,
      discount: discount,
      amount: amount, // Final amount after margin and discount
      currency_code: item.currency_code, // Optional, if needed for display
    };
  });
  return (
    <div className="card">
      <List
        header={
          <div className="d-flex align-items-center justify-content-between">
            <p className="fo h4">Products</p>
            <Button icon={<PlusOutlined />} onClick={showDrawer}>
              Add or edit products
            </Button>
          </div>
        }
        footer={
          // <div className="text-center">Showing {products.length} products</div>
          <div className="text-left">
            <strong>Total Amount: </strong>
            <span>${data.amount.toLocaleString()}</span>
          </div>
        }
        bordered
        dataSource={products}
        renderItem={(item) => (
          <List.Item>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Typography.Text
                style={{
                  fontWeight: 600,
                  color: "#1890FF",
                  marginBottom: "8px",
                }}
              >
                {item.product.name}
              </Typography.Text>
              <div className="d-flex justify-content-between">
                <div>
                  <span className="product-detail-label">Base price</span>
                  <p className="product-detail-value">
                    ${item.base_price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="product-detail-label">Margin</span>
                  <p className="product-detail-value">{item.margin}%</p>
                </div>
                <div>
                  <span className="product-detail-label">Unit Price</span>
                  <p className="product-detail-value">
                    ${item.unit_price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="product-detail-label">Quantity</span>
                  <p className="product-detail-value">{item.quantity}</p>
                </div>
                <div>
                  <span className="product-detail-label">Discount</span>
                  <p className="product-detail-value">{item.discount}%</p>
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
      <Drawer
        closable={false}
        className="drawer-detail"
        onClose={onClose}
        title={
          <div className="p-3">
            <h4 style={{ color: "#12344D", marginBottom: "4px" }}>
              Add or edit products
            </h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>
              The products you add below will determine the value of this
              transaction.
            </p>
          </div>
        }
        open={open}
        width="75%"
        extra={
          <Space>
            <Button
              className="bg-primary"
              htmlType="submit"
              form="dynamic_form_nest_item"
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </Space>
        }
      >
        <div className="p-3">
          <Row gutter={8} style={{ marginBottom: "10px" }}>
            <Col span={11}>Product name</Col>
            <Col span={2}>Base price</Col>
            <Col span={2}>Margin</Col>
            <Col span={2}>Unit Price</Col>
            <Col span={2}>Quantity</Col>
            <Col span={2}>Discount</Col>
            <Col span={2}>Amount</Col>
            <Col span={1}></Col>
          </Row>
          <Form
            name="dynamic_form_nest_item"
            form={form}
            onFinish={onFinish}
            style={{ width: "100%" }}
            autoComplete="off"
            initialValues={{ products: initialProducts }}
            onValuesChange={(changedValues, allValues) => {
              // Update the unit price when base_price or margin changes
              const updatedProducts = allValues.products.map((product) => {
                const {
                  base_price = 0,
                  margin = 0,
                  quantity = 0,
                  discount = 0,
                } = product || {};
                const basePrice = Number(base_price) || 0;
                const marginValue = Number(margin) || 0;
                const quantityValue = Number(quantity) || 0;
                const discountValue = Number(discount) || 0;
                const calculatedUnitPrice =
                  basePrice + (basePrice * marginValue) / 100;
                const calculatedAmount = calculatedUnitPrice * quantityValue;
                const netAmount =
                  calculatedAmount - (calculatedAmount * discountValue) / 100;
                return {
                  ...product,
                  unit_price: isNaN(calculatedUnitPrice)
                    ? 0
                    : calculatedUnitPrice,
                  amount: isNaN(netAmount) ? 0 : netAmount,
                };
              });
              form.setFieldsValue({ products: updatedProducts });
              const total = updatedProducts.reduce(
                (sum, product) => sum + product.amount,
                0
              );
              setTotalAmount(total);
            }}
          >
            <Form.List name="products">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "product_id"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing base price",
                          },
                        ]}
                      >
                        <Input type="hidden" />
                      </Form.Item>
                      <Col span={11}>
                        <Form.Item
                          {...restField}
                          name={[name, "product_name"]}
                          rules={[
                            {
                              required: true,
                              message: "Missing product",
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            placeholder="Product name"
                            onSearch={debouncedFetchProducts}
                            filterOption={false} // Disable default filtering
                            notFoundContent={
                              loading ? (
                                <Spin size="small" />
                              ) : (
                                "No products found"
                              )
                            }
                            options={options}
                            onChange={(value, option) => {
                              // Get the current products from the form
                              const formValues = form.getFieldValue("products");

                              // Set the documentId for the selected product
                              formValues[name].product_id = option.documentId; // Set documentId to product_id

                              // Update the form's values
                              form.setFieldsValue({ products: formValues });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item
                          {...restField}
                          name={[name, "base_price"]}
                          rules={[
                            {
                              required: true,
                              message: "Missing base price",
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder="Base price"
                            formatter={(value) =>
                              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) =>
                              value?.replace(/\$\s?|(,*)/g, "")
                            }
                            defaultValue={0}
                            disabled={
                              !form.getFieldValue([
                                "products",
                                name,
                                "product_name",
                              ])
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item
                          {...restField}
                          name={[name, "margin"]}
                          rules={[
                            {
                              required: true,
                              message: "Missing margin",
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder="Margin (%)"
                            min={0}
                            max={100}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value?.replace("%", "")}
                            defaultValue={0}
                            disabled={
                              !form.getFieldValue([
                                "products",
                                name,
                                "product_name",
                              ])
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item {...restField} name={[name, "unit_price"]}>
                          <InputNumber
                            placeholder="Unit price"
                            formatter={(value) =>
                              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) =>
                              value?.replace(/\$\s?|(,*)/g, "")
                            }
                            defaultValue={0}
                            readOnly
                            disabled={
                              !form.getFieldValue([
                                "products",
                                name,
                                "product_name",
                              ])
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item
                          {...restField}
                          name={[name, "quantity"]}
                          rules={[
                            {
                              required: true,
                              message: "Missing quantity",
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder="Quantity"
                            defaultValue={0}
                            disabled={
                              !form.getFieldValue([
                                "products",
                                name,
                                "product_name",
                              ])
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item {...restField} name={[name, "discount"]}>
                          <InputNumber
                            placeholder="Discount (%)"
                            min={0}
                            max={100}
                            formatter={(value) => `${value}%`}
                            parser={(value) => value?.replace("%", "")}
                            defaultValue={0}
                            disabled={
                              !form.getFieldValue([
                                "products",
                                name,
                                "product_name",
                              ])
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item {...restField} name={[name, "amount"]}>
                          <InputNumber
                            placeholder="Amount"
                            formatter={(value) =>
                              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) =>
                              value?.replace(/\$\s?|(,*)/g, "")
                            }
                            defaultValue={0}
                            readOnly
                            disabled={
                              !form.getFieldValue([
                                "products",
                                name,
                                "product_name",
                              ])
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        <MinusCircleOutlined
                          style={{ cursor: "pointer", marginTop: "8px" }}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add product
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <div className="product-drawer-pricing">
              <strong>Total</strong>
              <div>
                $
                {totalAmount.toLocaleString("en-US")}
              </div>
            </div>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default ProductComponent;
