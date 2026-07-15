import { useState, useMemo } from "react";

const useSelection = () => {
  const [selectedKeys, setSelectedKeys] = useState([]);

  const isSelected = (key) => selectedKeys.includes(key);

  const selectOnly = (key) => {
    setSelectedKeys([key]);
  };

  const toggleOne = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const clearSelection = () => setSelectedKeys([]);

  const getSelectionStats = (items) => {
    let folders = 0;
    let files = 0;
    items.forEach((item) => {
      const key = `${item.type}-${item.id}`;
      if (!selectedKeys.includes(key)) return;
      if (item.type === "folder") folders++;
      else files++;
    });
    return { total: folders + files, folders, files };
  };

  const selectionCount = useMemo(() => selectedKeys.length, [selectedKeys]);

  return {
    selectedKeys,
    isSelected,
    selectOnly,
    toggleOne,
    clearSelection,
    getSelectionStats,
    selectionCount,
  };
};

export default useSelection;
