import React from "react";
import {
  MdFolder,
  MdInsertDriveFile,
  MdPictureAsPdf,
  MdImage,
  MdDescription,
  MdCode,
  MdAudioFile,
  MdVideocam,
  MdArchive,
  MdTableChart,
  MdSlideshow,
} from "react-icons/md";

const getFileIcon = (item) => {
  if (item.type === "folder") return MdFolder;

  const ext = item.name?.split(".").pop()?.toLowerCase();
  const mime = item.mime_type?.toLowerCase();

  if (ext === "pdf" || mime?.includes("pdf")) return MdPictureAsPdf;
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext) ||
    mime?.startsWith("image/")
  )
    return MdImage;
  if (
    ["doc", "docx", "odt", "txt", "rtf"].includes(ext) ||
    mime?.includes("word") ||
    mime?.includes("text")
  )
    return MdDescription;
  if (["xls", "xlsx", "csv"].includes(ext) || mime?.includes("spreadsheet"))
    return MdTableChart;
  if (["ppt", "pptx"].includes(ext) || mime?.includes("powerpoint"))
    return MdSlideshow;
  if (
    ["mp3", "wav", "flac", "aac", "ogg"].includes(ext) ||
    mime?.startsWith("audio/")
  )
    return MdAudioFile;
  if (
    ["mp4", "avi", "mkv", "mov", "wmv"].includes(ext) ||
    mime?.startsWith("video/")
  )
    return MdVideocam;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return MdArchive;
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "cs",
      "html",
      "css",
    ].includes(ext)
  )
    return MdCode;

  return MdInsertDriveFile;
};

const FileIcon = ({ item, className = "file-icon" }) => {
  const IconComp = getFileIcon(item);
  return <IconComp className={className} />;
};

export { getFileIcon };
export default FileIcon;
