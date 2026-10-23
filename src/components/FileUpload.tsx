"use client";

import React, { useCallback } from "react";
import { Upload, FileText, Image, Music, X, File } from "lucide-react";

/* ──────────────────────────────────────────
   FileUpload — Drag-and-drop area with
   file previews and removal controls
   ────────────────────────────────────────── */

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "pdf" | "audio" | "document" | "other";
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  accept?: string;
}

function classifyFile(file: File): UploadedFile["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("audio/")) return "audio";
  if (
    file.type.includes("document") ||
    file.type.includes("text") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".doc") ||
    file.name.endsWith(".docx")
  )
    return "document";
  return "other";
}

function getFileIcon(type: UploadedFile["type"]) {
  switch (type) {
    case "image":
      return Image;
    case "pdf":
      return FileText;
    case "audio":
      return Music;
    case "document":
      return FileText;
    default:
      return File;
  }
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 10,
  accept = "image/*,.pdf,audio/*,.txt,.doc,.docx",
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles: UploadedFile[] = [];
      const remaining = maxFiles - files.length;
      const toProcess = Array.from(incoming).slice(0, remaining);

      for (const file of toProcess) {
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          type: classifyFile(file),
        };

        if (uploadedFile.type === "image") {
          uploadedFile.preview = URL.createObjectURL(file);
        }

        newFiles.push(uploadedFile);
      }

      onFilesChange([...files, ...newFiles]);
    },
    [files, maxFiles, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload files by clicking or dragging"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-sm)",
          padding: "var(--space-2xl) var(--space-xl)",
          border: `2px dashed ${dragActive ? "var(--accent-green)" : "var(--border-medium)"}`,
          borderRadius: "var(--radius-lg)",
          background: dragActive
            ? "var(--accent-green-subtle)"
            : "var(--bg-secondary)",
          cursor: "pointer",
          transition: "all var(--duration-normal) var(--ease-out)",
          minHeight: 120,
        }}
      >
        <Upload
          size={24}
          style={{
            color: dragActive ? "var(--accent-green)" : "var(--text-tertiary)",
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            textAlign: "center",
          }}
        >
          <strong style={{ color: "var(--accent-green)" }}>Click to upload</strong>{" "}
          or drag and drop
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: "var(--text-tertiary)",
          }}
        >
          Images, PDFs, documents, audio — up to {maxFiles} files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => {
            if (e.target.files?.length) processFiles(e.target.files);
            e.target.value = "";
          }}
          style={{ display: "none" }}
          aria-hidden
        />
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-sm)",
          }}
        >
          {files.map((f) => {
            const IconComponent = getFileIcon(f.type);
            return (
              <div
                key={f.id}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  padding: "8px 12px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  maxWidth: 220,
                }}
              >
                {f.preview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={f.preview}
                    alt={f.file.name}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-sm)",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <IconComponent size={16} style={{ flexShrink: 0 }} />
                )}
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {f.file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.id);
                  }}
                  aria-label={`Remove ${f.file.name}`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    color: "var(--text-tertiary)",
                    flexShrink: 0,
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
