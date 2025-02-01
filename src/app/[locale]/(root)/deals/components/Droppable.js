"use client";

import { useDroppable } from "@dnd-kit/core";
import DraggableItem from "./Draggable";
import { Button, Space, Badge } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export default function DroppableContainer({
  id,
  items,
  setDetailOpen,
  open,
  onClose,
  setDetailDocumentId,
  maxItems = 5,
}) {
  const { setNodeRef } = useDroppable({ id });
  const totalTransactionValue = items.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const backgroundColor =
    id.toLowerCase() === "won"
      ? "#d4edda"
      : id.toLowerCase() === "lost"
      ? "#f8d7da"
      : "#dff0ff";

  const badgeColor =
    id.toLowerCase() === "won"
      ? "green"
      : id.toLowerCase() === "lost"
      ? "red"
      : "geekblue";
  const isFull = items.length >= maxItems;
  return (
    <div ref={setNodeRef} className="droppable-container">
      <div className="card p-0" style={{ height: "100%" }}>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center p-3 droppable-header">
          <Space
            size="small"
            style={{
              width: "100%",
            }}
            className="d-flex justify-content-between align-items-center"
          >
            <div
              className="droppable-header-title"
              style={{
                backgroundColor,
              }}
            >
              {id}{" "}
              <Badge
                count={items.length}
                style={{ marginLeft: 8 }}
                color={badgeColor}
              />
            </div>

            <Button icon={<PlusOutlined />} />
          </Space>
          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              color: "#595959",
              alignSelf: "flex-start", // Align with the header title
            }}
          >
            Transaction Value: ${totalTransactionValue.toLocaleString()}
          </div>
        </div>

        {/* Body Section */}
        <div className="card-body p-0 droppable-body">
          {items.map((item) => (
            <DraggableItem
              key={item.documentId}
              id={item.documentId}
              item={item}
              setDetailOpen={setDetailOpen}
              setDetailDocumentId={setDetailDocumentId}
              open={open}
              onClose={onClose}
            />
          ))}
          {isFull && (
            <div
              className="pointer bg-white"
              style={{
                padding: "10px 0",
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              Load more!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
