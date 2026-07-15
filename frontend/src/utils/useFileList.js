import { useState, useCallback } from "react";

const useFileList = ({
  API_BASE,
  endpoint = "/api/files/browse",
  trashFilter = false,
  setError: externalSetError,
  setSuccess: externalSetSuccess,
  setInfo: externalSetInfo,
}) => {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchItems = useCallback(
    async (folderId = null, folderName = null) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const query = folderId != null ? `?folderId=${folderId}` : "";
        const res = await fetch(`${API_BASE}${endpoint}${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Fetch failed:", res.status);
          return;
        }

        let items = await res.json();

        if (trashFilter && endpoint.includes("/trash")) {
          if (folderId == null) {
            items = items.filter(
              (x) =>
                (x.type === "folder" && x.parent_folder_id == null) ||
                (x.type === "file" &&
                  x.parent_folder_id == null &&
                  (x.folder_id == null || x.folder_id === x.parent_folder_id))
            );
          } else {
            items = items.filter((x) => {
              if (x.type === "folder" && x.parent_folder_id === folderId)
                return true;
              if (x.type === "file" && x.parent_folder_id === folderId)
                return true;
              return false;
            });
          }
        }

        setFiles(items);
        setCurrentFolder(
          folderId != null ? { id: folderId, name: folderName || "" } : null
        );
      } catch (err) {
        console.error("Fetch error:", err);
      }
    },
    [API_BASE, endpoint, trashFilter]
  );

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      (externalSetError || setError)("Niste prijavljeni. Molimo prijavite se.");
      return;
    }

    setUploading(true);
    (externalSetError || setError)(null);
    (externalSetSuccess || setSuccess)(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "folderId",
        currentFolder && currentFolder.id != null
          ? String(currentFolder.id)
          : ""
      );

      const response = await fetch(`${API_BASE}/api/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Neuspješan upload");
      }

      const data = await response.json();
      (externalSetSuccess || setSuccess)(`Uploadano: ${data.name}`);

      await fetchItems(currentFolder?.id ?? null, currentFolder?.name ?? null);
    } catch (err) {
      (externalSetError || setError)(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const ensureFolderChain = async (token, folderCache, pathParts) => {
    let parentId = currentFolder?.id ?? null;
    let currentPath = "";

    for (const part of pathParts) {
      if (!part) continue;

      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (folderCache[currentPath]) {
        parentId = folderCache[currentPath];
        continue;
      }

      const res = await fetch(`${API_BASE}/api/files/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: part,
          parentFolderId: parentId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Greška pri kreiranju mape "${part}".`);
      }

      const data = await res.json();
      folderCache[currentPath] = data.id;
      parentId = data.id;
    }

    return parentId;
  };

  const handleFolderUpload = async (event) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      event.target.value = "";
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      (externalSetError || setError)("Niste prijavljeni. Molimo prijavite se.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    (externalSetError || setError)(null);
    (externalSetSuccess || setSuccess)(null);

    try {
      const folderCache = {};
      const filesArray = Array.from(fileList);

      for (const file of filesArray) {
        const relPath = file.webkitRelativePath || file.name;
        const parts = relPath.split("/").filter(Boolean);

        if (parts.length === 0) continue;

        const fileName = parts[parts.length - 1];
        const folderParts = parts.slice(0, parts.length - 1);

        let folderId = currentFolder?.id ?? null;
        if (folderParts.length > 0) {
          folderId = await ensureFolderChain(token, folderCache, folderParts);
        }

        const formData = new FormData();
        formData.append("file", file);
        if (folderId != null) {
          formData.append("folderId", String(folderId));
        } else {
          formData.append("folderId", "");
        }

        const res = await fetch(`${API_BASE}/api/files`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Neuspješan upload datoteke "${fileName}".`);
        }
      }

      (externalSetSuccess || setSuccess)("Mapa je uspješno prenesena.");
      await fetchItems(currentFolder?.id ?? null, currentFolder?.name ?? null);
    } catch (err) {
      console.error(err);
      (externalSetError || setError)(
        err.message || "Greška pri prijenosu mape."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return {
    files,
    currentFolder,
    fetchItems,
    handleFileUpload,
    handleFolderUpload,
    uploading,
    error,
    success,
    setUploading,
    setError,
    setSuccess,
  };
};

export default useFileList;
