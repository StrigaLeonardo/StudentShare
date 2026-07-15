// src/components/DocumentViewer/DocumentViewer.jsx
import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "./DocumentViewer.css";

const DocumentViewer = ({ file, API_BASE, onClose }) => {
  if (!file) return null;

  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const fileUrl = `${API_BASE}/api/files/${file.id}`;
  const ext = file.name.split(".").pop().toLowerCase();

  const token = localStorage.getItem("token");

  const renderContent = () => {
    // PDF
    if (ext === "pdf") {
      return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="document-viewer-content">
            <Viewer
              fileUrl={fileUrl}
              httpHeaders={{
                Authorization: `Bearer ${token}`,
              }}
              withCredentials={true}
              plugins={[defaultLayoutPluginInstance]}
            />
          </div>
        </Worker>
      );
    }

    // Slike
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
      return (
        <div className="document-viewer-content image-viewer">
          <img src={fileUrl} alt={file.name} />
        </div>
      );
    }

    // Video
    if (["mp4", "webm", "ogg", "mov"].includes(ext)) {
      return (
        <div className="document-viewer-content video-viewer">
          <video src={fileUrl} controls />
        </div>
      );
    }

    // Audio
    if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
      return (
        <div className="document-viewer-content audio-viewer">
          <audio src={fileUrl} controls />
        </div>
      );
    }

    // Office dokumenti (Microsoft Viewer - TREBA JAVNI URL!)
    if (["docx", "xlsx", "pptx", "doc", "xls", "ppt"].includes(ext)) {
      // Za localhost - prikaži poruku
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        return (
          <div className="document-viewer-content fallback-viewer">
            <div className="fallback-message">
              <h3>Office dokumenti nisu dostupni za pregled na localhost-u</h3>
              <p>Microsoft Office Viewer zahtijeva javno dostupan URL.</p>
              <a href={fileUrl} download={file.name} className="download-btn">
                Preuzmi {file.name}
              </a>
            </div>
          </div>
        );
      }

      const publicUrl = `${window.location.origin}${fileUrl}`;
      return (
        <div className="document-viewer-content office-viewer">
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              publicUrl,
            )}`}
            frameBorder="0"
            title={file.name}
          />
        </div>
      );
    }

    // Text files
    if (["txt", "md", "json", "xml", "csv"].includes(ext)) {
      return (
        <div className="document-viewer-content text-viewer">
          <iframe src={fileUrl} title={file.name} />
        </div>
      );
    }

    // Fallback - download
    return (
      <div className="document-viewer-content fallback-viewer">
        <div className="fallback-message">
          <h3>Pregled nije dostupan za ovaj tip datoteke</h3>
          <p>Tip datoteke: .{ext}</p>
          <a href={fileUrl} download={file.name} className="download-btn">
            Preuzmi {file.name}
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="document-viewer-backdrop" onClick={onClose}>
      <div
        className="document-viewer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="document-viewer-header">
          <h2 className="document-viewer-title">{file.name}</h2>
          <button
            type="button"
            className="document-viewer-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default DocumentViewer;
