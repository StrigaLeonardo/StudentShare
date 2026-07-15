import { useState } from "react";

export const renameFileWithToken = async ({ url, newName, token }) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ NewName: newName }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Neuspješno preimenovanje datoteke");
  }
};

const useRename = ({ API_BASE, currentFolder, fetchItems, setError }) => {
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleRename = (item) => {
    setRenameTarget(item);
    setRenameValue(item.name || "");
  };

  const handleRenameCancel = () => {
    setRenameTarget(null);
    setRenameValue("");
  };

  const handleRenameConfirm = async (newName) => {
    if (!renameTarget) return;

    const trimmed = newName.trim();
    if (!trimmed || trimmed === renameTarget.name) {
      handleRenameCancel();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const isFolder = renameTarget.type === "folder";
      const baseUrl = isFolder
        ? `${API_BASE}/api/files/folders/${renameTarget.id}/rename`
        : `${API_BASE}/api/files/${renameTarget.id}/rename`;

      await renameFileWithToken({
        url: baseUrl,
        newName: trimmed,
        token,
      });

      handleRenameCancel();
      await fetchItems(currentFolder?.id ?? null, currentFolder?.name ?? null);
    } catch (err) {
      console.error(err);
      setError("Preimenovanje nije uspjelo.");
    }
  };

  return {
    renameTarget,
    renameValue,
    handleRename,
    handleRenameConfirm,
    handleRenameCancel,
  };
};

export default useRename;
