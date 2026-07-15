// src/utils/fileSorting.js
export const sortFiles = (items, { sortBy, sortDir, foldersPosition }) => {
  if (!Array.isArray(items)) return [];

  const dir = sortDir === "desc" ? -1 : 1;

  const compare = (a, b) => {
    // 1) Mape na vrhu ili miješano
    if (foldersPosition === "top" && a.type !== b.type) {
      if (a.type === "folder") return -1;
      if (b.type === "folder") return 1;
    }

    // 2) Polje po kojem sortiramo
    let aVal;
    let bVal;

    switch (sortBy) {
      case "modified":
        aVal = a.created_at ?? "";
        bVal = b.created_at ?? "";
        break;
      case "myModified":
        aVal = a.created_at ?? "";
        bVal = b.created_at ?? "";
        break;
      case "myOpened":
        aVal = a.name ?? "";
        bVal = b.name ?? "";
        break;
      case "name":
      default:
        aVal = a.name ?? "";
        bVal = b.name ?? "";
        break;
    }

    // 3) Usporedba po tipu vrijednosti
    if (typeof aVal === "string" && typeof bVal === "string") {
      const cmp = aVal.localeCompare(bVal, "hr-HR", { sensitivity: "base" });
      return cmp * dir;
    }

    if (aVal instanceof Date || bVal instanceof Date) {
      const aTime = new Date(aVal).getTime();
      const bTime = new Date(bVal).getTime();
      return (aTime - bTime) * dir;
    }

    // brojčane i ostale vrijednosti
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  };

  return [...items].sort(compare);
};
