export const downloadFile = async (item, API_BASE) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const url =
      item.type === "folder"
        ? `${API_BASE}/api/files/folders/${item.id}/download`
        : `${API_BASE}/api/files/${item.id}`;

    const { downloadFileWithToken } = await import("./FileDownload");
    await downloadFileWithToken({
      url,
      filename: item.name,
      token,
      type: item.type,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const restoreItem = async (item, API_BASE) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const isFolder = item.type === "folder";
  const url = isFolder
    ? `${API_BASE}/api/files/folders/${item.id}/restore`
    : `${API_BASE}/api/files/${item.id}/restore`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Restore failed");

  return isFolder ? "Mapa vraćena." : "Datoteka vraćena.";
};

export const hardDeleteItem = async (item, API_BASE) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const isFolder = item.type === "folder";
  const url = isFolder
    ? `${API_BASE}/api/files/folders/${item.id}/hard`
    : `${API_BASE}/api/files/${item.id}/hard`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Delete failed");

  return isFolder ? "Mapa trajno obrisana." : "Datoteka trajno obrisana.";
};

export const emptyTrash = async (API_BASE) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const res = await fetch(`${API_BASE}/api/files/trash`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Empty trash failed");

  return "Otpad je ispražnjen.";
};
