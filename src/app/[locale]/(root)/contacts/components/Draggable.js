import { useDraggable } from "@dnd-kit/core";
import { Popover, Space, Tag, Avatar } from "antd";

export default function DraggableItem({ id, item, showDrawer,setDetailOpen,setDetailDocumentId }) {
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

  // Display tags logic
  const maxTags = 2; // Maximum number of tags to display
  const visibleTags = item.tags.slice(0, maxTags);
  const hiddenTags = item.tags.slice(maxTags);

  const popoverContent = (
    <ul style={{ paddingLeft: "20px", margin: 0, listStyleType: "disc" }}>
      {hiddenTags.map((tag, index) => (
        <li
          key={index}
          style={{
            padding: "3px 0",
            fontSize: "12px",
            color: "#333",
          }}
        >
          {tag.name}
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div className="card mb-0 p-2">
        <div className="card-body p-0">
          <h5
            className="mb-2 kanban-item-title pointer"
            onClick={() => {
              setDetailOpen(true)
              setDetailDocumentId(item.documentId)
            }}
          >
            <Space>
              <Avatar size="small">{item.name.charAt(0).toUpperCase()}</Avatar>
              {item.name}
            </Space>
          </h5>
          <div>
            <div className="kanban-item-tags">
              {item.tags.length === 0 ? (
                <span>--</span> // Display "--" if there are no tags
              ) : (
                <>
                  {visibleTags.map((tag, index) => (
                    <Tag key={index} color={tag.color}>
                      {tag.name}
                    </Tag>
                  ))}
                  {hiddenTags.length > 0 && (
                    <Popover
                      content={
                        <div style={{ maxWidth: "200px" }}>
                          {popoverContent}
                        </div>
                      }
                      title="More Tags"
                      trigger="hover"
                      placement="bottom"
                    >
                      <Tag color="grey">+{hiddenTags.length} more</Tag>
                    </Popover>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
