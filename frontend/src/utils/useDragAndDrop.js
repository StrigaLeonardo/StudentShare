import { useState, useCallback } from "react";

const useDragAndDrop = ({
  API_BASE,
  currentFolder,
  fetchItems,
  setUploading,
  setError,
  setSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const items = Array.from(e.dataTransfer.items);
    const hasFileFromPC = items.some((item) => item.kind === "file");

    if (hasFileFromPC) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const items = Array.from(e.dataTransfer.items);
    const hasFileFromPC = items.some((item) => item.kind === "file");

    if (hasFileFromPC) {
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

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

      if (!res.ok) throw new Error(`Failed to create folder "${part}"`);

      const data = await res.json();
      folderCache[currentPath] = data.id;
      parentId = data.id;
    }

    return parentId;
  };

  const uploadFiles = async (files, token) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "folderId",
        currentFolder?.id != null ? String(currentFolder.id) : ""
      );

      const response = await fetch(`${API_BASE}/api/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }
    }
  };

  const uploadFolder = async (files, folderName, token) => {
    const folderCache = {};

    for (const file of files) {
      const relPath = file.webkitRelativePath || file.name;
      const parts = relPath.split("/").filter(Boolean);

      if (parts.length === 0) continue;

      const folderParts = parts.slice(0, parts.length - 1);
      let folderId = currentFolder?.id ?? null;

      if (folderParts.length > 0) {
        folderId = await ensureFolderChain(token, folderCache, folderParts);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", folderId != null ? String(folderId) : "");

      const res = await fetch(`${API_BASE}/api/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
    }
  };

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const token = localStorage.getItem("token");
      if (!token) {
        setError?.("Niste prijavljeni.");
        return;
      }

      const items = Array.from(e.dataTransfer.items);
      if (items.length === 0) return;

      // ✅ SAMO ako je stvarno iz Explorer-a
      const hasFileFromPC = items.some((item) => item.kind === "file");
      if (!hasFileFromPC) return;

      setUploading?.(true);
      setError?.(null);
      setSuccess?.(null);

      try {
        const files = [];
        const folderEntries = [];

        for (const item of items) {
          if (item.kind === "file") {
            const entry = item.webkitGetAsEntry?.() || item.getAsEntry?.();

            if (entry) {
              if (entry.isDirectory) {
                folderEntries.push(entry);
              } else if (entry.isFile) {
                const file = item.getAsFile();
                if (file) files.push(file);
              }
            }
          }
        }

        // Upload files
        if (files.length > 0) {
          await uploadFiles(files, token);
          setSuccess?.(`Uploadano ${files.length} datoteka`);
        }

        // Upload folders
        for (const folderEntry of folderEntries) {
          const folderFiles = await readFolderRecursive(folderEntry);
          await uploadFolder(folderFiles, folderEntry.name, token);
          setSuccess?.(`Mapa "${folderEntry.name}" uspješno prenesena`);
        }

        await fetchItems?.(
          currentFolder?.id ?? null,
          currentFolder?.name ?? null
        );
      } catch (err) {
        setError?.(err.message);
      } finally {
        setUploading?.(false);
      }
    },
    [API_BASE, currentFolder, fetchItems, setUploading, setError, setSuccess]
  );

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};

const readFolderRecursive = async (entry, path = "") => {
  const files = [];

  if (entry.isFile) {
    const file = await new Promise((resolve) => entry.file(resolve));
    Object.defineProperty(file, "webkitRelativePath", {
      value: path + file.name,
      writable: false,
    });
    files.push(file);
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const entries = await new Promise((resolve) => {
      reader.readEntries(resolve);
    });

    for (const childEntry of entries) {
      const childFiles = await readFolderRecursive(
        childEntry,
        path + entry.name + "/"
      );
      files.push(...childFiles);
    }
  }

  return files;
};

export default useDragAndDrop;
