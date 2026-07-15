import { useState } from "react";

export const useCreateFolder = ({
  API_BASE,
  fetchItems,
  currentFolder,
  setError,
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const createFolder = async (folderName) => {
    if (!folderName?.trim()) {
      setError("Naziv mape je obavezan.");
      return false;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Niste prijavljeni.");
        return false;
      }

      const trimmedName = folderName.trim();
      const res = await fetch(`${API_BASE}/api/files/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: trimmedName,
          parentFolderId: currentFolder?.id ?? null,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(`Kreiranje mape nije uspjelo: ${errorText}`);
        return false;
      }

      await fetchItems(currentFolder?.id ?? null, currentFolder?.name ?? null);
      return true;
    } catch (err) {
      console.error("Create folder error:", err);
      setError("Kreiranje mape nije uspjelo.");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createFolder,
    isCreating,
  };
};
