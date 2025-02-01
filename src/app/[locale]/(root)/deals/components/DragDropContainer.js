import React, { useState, useEffect } from "react";
import { DndContext, useSensor, MouseSensor, useSensors } from "@dnd-kit/core";
import { Spin, message } from "antd";
import DroppableContainer from "./Droppable";
export default function DragDropContainer({
  dataSource,
  stages,
  setDetailOpen,
  setDetailDocumentId,
}) {
  const [containers, setContainers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });
  const handleContainer = () => {
    try {
      const stagesMapped = stages
        .sort((a, b) => a.position - b.position)
        .reduce((acc, item) => {
          acc[item.name] = [];
          return acc;
        }, {});

      dataSource.forEach((deal) => {
        const stage = deal.deal_stage?.name;
        if (stagesMapped[stage]) {
          stagesMapped[stage].push(deal);
        }
      });

      setContainers(stagesMapped);
      setIsLoading(false);
    } catch (error) {
      console.log("Error processing deal data:", error);
    }
  };

  const sensors = useSensors(mouseSensor);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Exit if no valid drop target
    if (!over || active.id === over.id) return;

    const sourceContainerKey = Object.keys(containers).find((key) =>
      containers[key].some((item) => item.documentId === active.id)
    );

    const destinationContainerKey = over.id;

    if (sourceContainerKey === destinationContainerKey) {
      return;
    }

    if (sourceContainerKey && destinationContainerKey) {
      const draggedItem = containers[sourceContainerKey].find(
        (item) => item.documentId === active.id
      );

      const destinationStage = stages.find(
        (stage) => stage.name === destinationContainerKey
      );

      if (!destinationStage) {
        console.error("Destination stage not found");
        return;
      }

      const destinationDocumentId = destinationStage.documentId;

      // Optimistically update UI
      setContainers((prev) => {
        const updatedSource = prev[sourceContainerKey].filter(
          (item) => item.documentId !== active.id
        );
        const updatedDestination = [
          ...prev[destinationContainerKey],
          { ...draggedItem, deal_stage: destinationStage }, // Update deal_stage locally
        ];

        return {
          ...prev,
          [sourceContainerKey]: updatedSource,
          [destinationContainerKey]: updatedDestination,
        };
      });

      try {
        const response = await fetch(
          `http://141.136.47.162:1347/api/deals/${draggedItem.documentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                deal_stage: destinationDocumentId, // Update the deal stage
              },
            }),
          }
        );
        if (response.ok) {
          messageApi.success("Stage updated successfully");

          // Update the dragged item's deal_stage to match the backend response
          setContainers((prev) => {
            const updatedDestination = prev[destinationContainerKey].map(
              (item) =>
                item.documentId === active.id
                  ? { ...item, deal_stage: destinationStage }
                  : item
            );

            return {
              ...prev,
              [destinationContainerKey]: updatedDestination,
            };
          });
        } else {
          messageApi.error("Stage update failed, please try again");
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error updating deal stage:", error);

        // Revert UI update if API call fails
        setContainers((prev) => {
          const sourceItems = [...prev[sourceContainerKey]];
          const destinationItems = [...prev[destinationContainerKey]];

          // Remove draggedItem from destination and add back to source
          const revertedSource = [...sourceItems, draggedItem];
          const revertedDestination = destinationItems.filter(
            (item) => item.documentId !== draggedItem.documentId
          );

          return {
            ...prev,
            [sourceContainerKey]: revertedSource,
            [destinationContainerKey]: revertedDestination,
          };
        });
      }
    }
  };

  useEffect(() => {
    if (dataSource && stages) {
      handleContainer();
    }
  }, [dataSource, stages]);

  return (
    <div
      className="bg-white"
      style={{
        height: "calc(100vh - 240px)",
        overflow: "hidden",
        display: "flex", // Add this
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally
      }}
    >
      {isLoading ? (
        <Spin />
      ) : (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          {contextHolder}
          <div
            style={{
              display: "flex",
              height: "100%",
              overflowX: "auto",
            }}
          >
            {Object.entries(containers).map(([id, items]) => (
              <DroppableContainer
                key={id}
                id={id}
                items={items}
                setDetailOpen={setDetailOpen}
                setDetailDocumentId={setDetailDocumentId}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
