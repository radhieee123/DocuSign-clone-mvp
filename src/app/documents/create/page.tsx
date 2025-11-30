"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";
import { USERS, MESSAGES, getOtherUser } from "@/constants";

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function CreateDocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: "1", name: "", email: "", role: "Needs to Sign" },
  ]);
  const [isOnlySigner, setIsOnlySigner] = useState(false);
  const [setSigningOrder, setSetSigningOrder] = useState(false);
  const [subject, setSubject] = useState("Complete with Docusign");
  const [message, setMessage] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState("Every day");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [templateFileData, setTemplateFileData] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");

  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  React.useEffect(() => {
    const templateData = localStorage.getItem("templatePDF");
    if (templateData) {
      try {
        const template = JSON.parse(templateData);

        const base64Data = template.fileData.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const file = new File([blob], template.fileName, {
          type: "application/pdf",
        });

        setUploadedFiles([
          {
            id: "1",
            name: template.fileName,
            size: template.fileSize || file.size,
            type: template.fileType,
            file: file,
          },
        ]);

        setTemplateFileData(template.fileData);

        setSubject(template.title);
        setDocumentTitle(template.title);

        localStorage.removeItem("templatePDF");
      } catch (error) {
        console.error("Failed to parse template data:", error);
        localStorage.removeItem("templatePDF");
      }
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now().toString(), name: "", email: "", role: "Needs to Sign" },
    ]);
  };

  const handleUpdateRecipient = (id: string, field: string, value: string) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error("File read error:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleNext = async () => {
    setIsLoading(true);
    setError("");

    try {
      const firstRecipient = recipients[0];
      if (!firstRecipient.name || !firstRecipient.email) {
        setError("Please fill in recipient name and email");
        setIsLoading(false);
        return;
      }

      const users = await apiClient.getUsers();

      let recipient = users.find(
        (u) => u.email.toLowerCase() === firstRecipient.email.toLowerCase()
      );

      if (!recipient) {
        recipient = users.find((u) => u.id !== user?.id);
        if (!recipient) {
          recipient = users[0];
        }
      }

      if (!recipient) {
        setError(
          "No recipient found. Please ensure at least 2 users exist in the system."
        );
        setIsLoading(false);
        return;
      }

      let fileData: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (templateFileData) {
        fileData = templateFileData;
        fileName = uploadedFiles[0]?.name || "template.pdf";
        fileType = "application/pdf";
      } else if (uploadedFiles.length > 0) {
        const uploadedFile = uploadedFiles[0];
        fileName = uploadedFile.name;
        fileType = uploadedFile.type;

        try {
          fileData = await fileToBase64(uploadedFile.file);
        } catch (err) {
          console.error("Failed to read file:", err);
          setError("Failed to read file. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      const documentTitle = subject || "Document";

      const doc = await apiClient.createDocument({
        title: documentTitle,
        recipientId: recipient.id,
        fileData: fileData || undefined,
        fileName: fileName || undefined,
        fileType: fileType || undefined,
      });

      setTemplateFileData(null);
      setDocumentTitle("");

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Document creation error:", err);
      setError(err?.message || "Failed to create document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h1 className="text-sm text-gray-700">
              Upload a Document and Add Envelope Recipients
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
              ADVANCED OPTIONS
            </button>
            <button className="px-4 py-2 text-sm text-white bg-[#4c00fb] rounded-md hover:bg-[#4c00fb]">
              VIEW & PLANS
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-[75%] mx-auto space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <section className="">
            <button className="w-full flex items-center justify-between px-6 py-4 text-left">
              <h2 className="text-base font-medium text-gray-900">
                Add documents
              </h2>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <div className="px-6 pb-6 border-t border-gray-200">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                className={`mt-6 border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } cursor-pointer`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Drop your files here or
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadClick();
                    }}
                    className="px-4 py-2 bg-[#4c00fb] text-white text-sm font-medium rounded-[4px] hover:bg-#4c00fb flex items-center space-x-2"
                  >
                    Upload
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      width="16"
                      height="16"
                      aria-hidden="true"
                      fill="rgba(255, 255, 255, 1)"
                      focusable="false"
                      data-qa="icon-element-menuTriangleDown"
                    >
                      <path d="M10.62 12.73 15 8H5l4.38 4.73a.85.85 0 0 0 1.24 0"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <hr />

          <section className="">
            <button className="w-full flex items-center justify-between px-6 py-4 text-left">
              <h2 className="text-base font-medium text-gray-900">
                Add recipients
              </h2>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <div className="px-6 pb-6 border-t border-gray-200">
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOnlySigner}
                      onChange={(e) => setIsOnlySigner(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      I am the only signer
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setSigningOrder}
                      onChange={(e) => setSetSigningOrder(e.target.checked)}
                      className="w-4 h-4 text-[#4c00fb] border-gray-300 rounded focus:ring-[#4c00fb]"
                    />
                    <span className="text-sm text-gray-700">
                      Set signing order
                    </span>
                    <a
                      href="#"
                      className="text-sm text-[#4c00fb] hover:text-[#4c00fb]"
                    >
                      View
                    </a>
                  </label>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Use seeded emails:{" "}
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        {USERS.ALEX.EMAIL}
                      </code>{" "}
                      or{" "}
                      <code className="bg-blue-100 px-1 py-0.5 rounded">
                        {USERS.BLAKE.EMAIL}
                      </code>
                    </p>
                  </div>
                  {recipients.map((recipient, index) => (
                    <div
                      key={recipient.id}
                      className="border-l-4 border-cyan-400 bg-white p-4 rounded-r-lg shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={recipient.name}
                                onChange={(e) =>
                                  handleUpdateRecipient(
                                    recipient.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                              />
                              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <select
                              key={`email-${recipient.id}-${recipient.email}`}
                              value={recipient.email || ""}
                              onChange={(e) => {
                                const selectedEmail = e.target.value;
                                handleUpdateRecipient(
                                  recipient.id,
                                  "email",
                                  e.target.value
                                );
                                setRecipients((prev) =>
                                  prev.map((r) => {
                                    if (r.id === recipient.id) {
                                      const name =
                                        selectedEmail === USERS.ALEX.EMAIL
                                          ? "Alex"
                                          : selectedEmail === USERS.ALEX.EMAIL
                                          ? "Blake"
                                          : r.name;
                                      return {
                                        ...r,
                                        email: selectedEmail,
                                        name,
                                      };
                                    }
                                    return r;
                                  })
                                );
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
                            >
                              {!recipient.email ? (
                                <option value="">Select recipient...</option>
                              ) : null}
                              {user?.email === USERS.ALEX.EMAIL ? (
                                <option value={USERS.BLAKE.EMAIL}>
                                  Blake (blake@acme.com)
                                </option>
                              ) : user?.email === USERS.BLAKE.EMAIL ? (
                                <option value={USERS.ALEX.EMAIL}>
                                  Alex ({USERS.ALEX.EMAIL})
                                </option>
                              ) : (
                                <>
                                  <option value={USERS.ALEX.EMAIL}>
                                    Alex ({USERS.ALEX.EMAIL})
                                  </option>
                                  <option value={USERS.BLAKE.EMAIL}>
                                    Blake (blake@acme.com)
                                  </option>
                                </>
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                              <span>{recipient.role}</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                              <span>Customize</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                          {recipients.length > 1 && (
                            <button
                              onClick={() =>
                                handleRemoveRecipient(recipient.id)
                              }
                              className="text-gray-400 hover:text-red-600"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddRecipient}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Add Recipient</span>
                  </button>
                  <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <hr />

          <section className="">
            <button className="w-full flex items-center justify-between px-6 py-4 text-left">
              <h2 className="text-base font-medium text-gray-900">
                Add message
              </h2>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <div className="px-6 pb-6 border-t border-gray-200">
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    maxLength={100}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {subject.length}/100
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    placeholder="Enter Message"
                    maxLength={10000}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {message.length}/10000
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency of reminders
                  </label>
                  <select
                    value={reminderFrequency}
                    onChange={(e) => setReminderFrequency(e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white"
                  >
                    <option>Every day</option>
                    <option>Every 2 days</option>
                    <option>Every 3 days</option>
                    <option>Every week</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <hr />
        </div>
      </main>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="mx-auto flex justify-end">
          <button
            onClick={handleNext}
            disabled={isLoading || !recipients[0].name || !recipients[0].email}
            className="px-8 py-2 bg-[#4c00fb] text-white font-medium rounded-md hover:bg-[#4c00fb] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
