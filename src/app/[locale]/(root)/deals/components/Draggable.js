import { useDraggable } from "@dnd-kit/core";
import { Popover, Space, Tag, Avatar, Badge } from "antd";

export default function DraggableItem({
  id,
  item,
  setDetailOpen,
  setDetailDocumentId,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: "5px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    cursor: "grab",
    zIndex: isDragging ? 1000 : "auto", // Only elevate during dragging
    position: isDragging ? "absolute" : "relative", // Ensure visibility while dragging
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.1)" : "none", // Optional styling
    width: "100%",
    height: "auto",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const productList = (
    <ul style={{ paddingLeft: "20px", margin: 0, listStyleType: "disc" }}>
      {item.products.map((productData, index) => (
        <li
          key={index}
          style={{
            padding: "3px 0",
            fontSize: "12px",
            color: "#333",
          }}
        >
          {productData.product?.name}
        </li>
      ))}
    </ul>
  );

  const additionalProductsCount = item.products.length - 1;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div className="card mb-0 p-2">
        <div className="card-body p-0">
          <h5
            className="mb-2 kanban-item-title pointer"
            onClick={() => {
              setDetailOpen(true);
              setDetailDocumentId(item.documentId);
            }}
          >
            {item.name}
          </h5>
          <Space>
            <Popover
              content={
                <div>
                  <div>Transaction value</div>
                  <div>{formatCurrency(item.amount)}</div>
                </div>
              }
            >
              <p className="my-2">{formatCurrency(item.amount)}</p>
            </Popover>
            <p className="d-none"></p>
          </Space>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "nowrap",
            }}
          >
            <div className="kanban-item-description pointer">
              {item.account.name ? item.account.name : "--"}
            </div>
            <Popover
              content={<div style={{ maxWidth: "200px" }}>{productList}</div>}
              title="Products"
              trigger="hover"
              placement="bottom"
            >
              <div
                className="kanban-item-product"
                style={{
                  marginLeft: "auto", // Pushes this element to the right
                }}
              >
                {item.products.length > 0
                  ? item.products[0].product.name
                  : "No Products"}
              </div>
            </Popover>

            {item.products.length > 1 && (
              <Badge
                count={`+${additionalProductsCount}`}
                style={{ backgroundColor: "#E6F7FF", color: "#1890FF" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
