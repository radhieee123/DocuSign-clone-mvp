"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";
import { Document } from "@/types";

interface SignaturePosition {
  x: number;
  y: number;
}

export default function SignDocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState("style");
  const [fullName, setFullName] = useState("");
  const [initials, setInitials] = useState("");
  const [signaturePlaced, setSignaturePlaced] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition>(
    { x: 200, y: 300 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const documentContainerRef = useRef<HTMLDivElement>(null);

  const loadDocument = useCallback(async () => {
    if (!params.id) {
      console.error("No document ID provided");
      setIsLoading(false);
      return;
    }

    try {
      const doc = await apiClient.getDocumentById(params.id as string);

      setDocument(doc);

      if (user && doc.recipientId !== user.id) {
        console.warn("User is not the recipient of this document");
      }

      if (doc.status === "SIGNED") {
        setSignaturePlaced(true);
      }
    } catch (error) {
      console.error("Failed to load document:", error);
      alert(
        `Failed to load document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setFullName(user.name || "User");
    setInitials(
      user.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("") || "U"
    );
    loadDocument();
  }, [user, router, loadDocument]);

  const handleAdoptSignature = () => {
    setShowSignatureModal(false);
    setSignaturePlaced(true);
  };

  const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    const chunkSize = 0x8000;
    const chunks = [];

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }

    return btoa(chunks.join(""));
  };

  const embedSignatureInPDF = async (
    pdfBase64: string,
    signatureText: string,
    position: { x: number; y: number }
  ): Promise<string> => {
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");

      const base64Data = pdfBase64.includes("base64,")
        ? pdfBase64.split("base64,")[1]
        : pdfBase64;

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pdfDoc = await PDFDocument.load(bytes);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();
      const pdfY = height - position.y - 30;

      firstPage.drawText(signatureText, {
        x: position.x,
        y: pdfY,
        size: 24,
        color: rgb(0, 0, 0),
      });

      const signedDate = new Date().toLocaleDateString();
      firstPage.drawText(`Signed on: ${signedDate}`, {
        x: position.x,
        y: pdfY - 20,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const modifiedBase64 = uint8ArrayToBase64(modifiedPdfBytes);

      const modifiedPdfDataUrl = `data:application/pdf;base64,${modifiedBase64}`;

      return modifiedPdfDataUrl;
    } catch (error) {
      console.error("Failed to embed signature:", error);
      throw error;
    }
  };

  const handleFinish = async () => {
    if (!document) return;

    setIsSigning(true);
    try {
      let signedPdfData = document.fileData;

      if (document.fileData && signaturePlaced) {
        try {
          signedPdfData = await embedSignatureInPDF(
            document.fileData,
            fullName,
            signaturePosition
          );
        } catch (embedError) {
          console.error("Failed to embed signature:", embedError);
        }
      } else {
        console.warn("Skipping signature embed:", {
          hasFileData: !!document.fileData,
          signaturePlaced: signaturePlaced,
        });
      }

      await apiClient.signDocument(params.id as string, {
        signedAt: new Date().toISOString(),
        signature: fullName,
        initials: initials,
        signaturePositionX: signaturePosition.x,
        signaturePositionY: signaturePosition.y,
        fileData: signedPdfData || undefined,
      });

      alert("Document signed successfully!");
      router.push("/dashboard");
    } catch (error) {
      alert("Failed to sign document. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!signaturePlaced || isAlreadySigned) return;

    const signatureElement = e.currentTarget as HTMLElement;
    const rect = signatureElement.getBoundingClientRect();

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !documentContainerRef.current) return;

      const containerRect =
        documentContainerRef.current.getBoundingClientRect();

      const newX = e.clientX - containerRect.left - dragOffset.x;
      const newY = e.clientY - containerRect.top - dragOffset.y;

      const maxX = containerRect.width - 200;
      const maxY = containerRect.height - 50;

      setSignaturePosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging, dragOffset.x, dragOffset.y]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      console.log("Signature positioned at:", signaturePosition);
    }
    setIsDragging(false);
  }, [isDragging, signaturePosition]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderDocumentContent = () => {
    if (!document) return null;

    if (document.fileData && document.fileType === "application/pdf") {
      return (
        <div className="w-full">
          <embed
            src={document.fileData}
            type="application/pdf"
            className="w-full h-[1200px]"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No document preview available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {document.fileName || "Document content not loaded"}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading document...</div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Document not found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            The document you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAlreadySigned = document.status === "SIGNED";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-[#1a1464] text-white px-6 py-3 flex items-center justify-between">
        <div className="text-sm">
          {isAlreadySigned
            ? "This document has been signed"
            : "Drag and drop fields from the left panel onto the document"}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleFinish}
            disabled={!signaturePlaced || isAlreadySigned || isSigning}
            className="px-6 py-2 bg-white text-purple-900 rounded-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigning ? "Signing..." : "Finish"}
          </button>
          <button className="p-2 hover:bg-purple-800 rounded">
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-purple-800 rounded"
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
      </div>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">FIELDS</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <button
              onClick={() => !isAlreadySigned && setShowSignatureModal(true)}
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span>Signature</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 border-2 border-gray-700 rounded flex items-center justify-center">
                <span className="text-xs font-bold">DS</span>
              </div>
              <span>Initial</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Date Signed</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Name</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Email Address</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Company</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Title</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
              <span>Text</span>
            </button>

            <button
              disabled={isAlreadySigned}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 border-2 border-gray-700 rounded flex items-center justify-center">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>Checkbox</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-gray-200 p-8">
          <div
            ref={documentContainerRef}
            className="max-w-4xl mx-auto bg-white shadow-lg min-h-[1200px] relative"
          >
            {renderDocumentContent()}

            {signaturePlaced && (
              <div
                className="absolute cursor-move select-none group"
                style={{
                  left: `${signaturePosition.x}px`,
                  top: `${signaturePosition.y}px`,
                  zIndex: 10,
                }}
                onMouseDown={handleMouseDown}
              >
                <div className="relative px-2 py-1">
                  <div className="font-['Brush_Script_MT',cursive] text-2xl text-gray-900">
                    {fullName}
                  </div>

                  {!isAlreadySigned && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSignaturePlaced(false);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      ×
                    </button>
                  )}

                  <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none -m-1"></div>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
          <button className="p-2 hover:bg-gray-100 rounded" title="Zoom In">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Zoom Out">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Download">
            <svg
              className="w-6 h-6"
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
          </button>
        </aside>
      </div>

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Adopt Your Signature</h2>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Confirm your name, initials, and signature.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Initials <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex space-x-6 border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setSignatureTab("style")}
                    className={`pb-2 px-1 ${
                      signatureTab === "style"
                        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    SELECT STYLE
                  </button>
                  <button
                    onClick={() => setSignatureTab("draw")}
                    className={`pb-2 px-1 ${
                      signatureTab === "draw"
                        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    DRAW
                  </button>
                  <button
                    onClick={() => setSignatureTab("upload")}
                    className={`pb-2 px-1 ${
                      signatureTab === "upload"
                        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    UPLOAD
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">PREVIEW</span>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Change Style
                    </button>
                  </div>
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-start space-x-8">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          Signed by:
                        </div>
                        <div className="font-['Brush_Script_MT',cursive] text-2xl">
                          {fullName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {document?.id.substring(0, 20)}...
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">DS</div>
                        <div className="text-xl font-semibold">{initials}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-6">
                By selecting Adopt and Sign, I agree that this mark will be the
                electronic representation of my signature or initials whenever I
                use it. I also understand that recipients of electronic
                documents I sign will be able to see my Docusign ID, which will
                include my email address.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdoptSignature}
                  className="px-6 py-3 bg-[#1a1464] text-white font-medium rounded-md hover:bg-[#14104d]"
                >
                  Adopt and Sign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-2 px-6">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span>Powered by</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-sm"></div>
              <span className="font-semibold">docusign</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button>English (US) ▼</button>
            <a href="#" className="hover:text-gray-900">
              Terms of Use
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacy
            </a>
          </div>
          <div>
            <span>Copyright © 2025 Docusign, Inc. All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
