import { useState } from "react";

const useDragMove = ({ onMoveItems }) => {
  const [draggedKeys, setDraggedKeys] = useState([]);

  const handleDragStart = (event, itemKey, selectedKeys) => {
    const keysToDrag = selectedKeys.includes(itemKey)
      ? selectedKeys
      : [itemKey];

    setDraggedKeys(keysToDrag);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-internal-drag", "row-drag");
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDropOnFolder = async (event, targetFolderId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedKeys.length) {
      return;
    }

    try {
      await onMoveItems(draggedKeys, targetFolderId);
    } catch (err) {
    } finally {
      setDraggedKeys([]);
    }
  };

  const handleDropToRoot = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedKeys.length) return;

    try {
      await onMoveItems(draggedKeys, null);
    } catch (err) {
    } finally {
      setDraggedKeys([]);
    }
  };

  const cancelDrag = () => {
    setDraggedKeys([]);
  };

  return {
    draggedKeys,
    handleDragStart,
    handleDragOver,
    handleDropOnFolder,
    handleDropToRoot,
    cancelDrag,
  };
};

export default useDragMove;
