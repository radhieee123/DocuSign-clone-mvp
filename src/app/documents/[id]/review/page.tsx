"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";
import { Document } from "@/types";
import PDFViewer from "@/components/PDFViewer";

type SignatureMode = "type" | "draw";

export default function ReviewSignPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("type");
  const [typedSignature, setTypedSignature] = useState("");
  const [isSignatureComplete, setIsSignatureComplete] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadDocument();
  }, [user, documentId, router]);

  const loadDocument = async () => {
    try {
      setIsLoading(true);
      const docs = await apiClient.getDocuments();
      const doc = docs.find((d) => d.id === documentId);

      if (!doc) {
        setError("Document not found");
        return;
      }

      if (doc.recipientId !== user?.id) {
        setError("You are not authorized to sign this document");
        return;
      }

      if (doc.status !== "PENDING") {
        setError(`Document is already ${doc.status}`);
        return;
      }

      setDocument(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setIsSignatureComplete(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSignatureComplete(false);
  };

  useEffect(() => {
    if (signatureMode === "type") {
      setIsSignatureComplete(typedSignature.trim().length > 0);
    }
  }, [typedSignature, signatureMode]);

  const handleFinish = async () => {
    if (!isSignatureComplete) {
      alert("Please complete your signature");
      return;
    }

    setIsSigning(true);
    try {
      await apiClient.signDocument(documentId, {
        signatureData:
          signatureMode === "type" ? typedSignature : "drawn-signature",
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign document");
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading document...</div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Document not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {document.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                From: {document.sender?.name} ({document.sender?.email})
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Document Preview
              </h2>
              <PDFViewer />
            </div>
          </div>

          {/* Signature Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sign Document
              </h2>

              {/* Signature Mode Tabs */}
              <div className="flex space-x-2 mb-4 border-b">
                <button
                  onClick={() => setSignatureMode("type")}
                  className={`px-4 py-2 font-medium text-sm ${
                    signatureMode === "type"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Type
                </button>
                <button
                  onClick={() => setSignatureMode("draw")}
                  className={`px-4 py-2 font-medium text-sm ${
                    signatureMode === "draw"
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Draw
                </button>
              </div>

              {/* Type Signature */}
              {signatureMode === "type" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type your name
                    </label>
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {typedSignature && (
                    <div className="border-2 border-gray-300 rounded-md p-4 bg-gray-50">
                      <p
                        className="text-3xl font-signature text-center"
                        style={{ fontFamily: "cursive" }}
                      >
                        {typedSignature}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Draw Signature */}
              {signatureMode === "draw" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Draw your signature
                  </label>
                  <div className="border-2 border-gray-300 rounded-md bg-white">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="w-full cursor-crosshair"
                    />
                  </div>
                  <button
                    onClick={clearCanvas}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleFinish}
                  disabled={!isSignatureComplete || isSigning}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSigning ? "Signing..." : "Finish & Sign"}
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                By clicking "Finish & Sign", you agree to sign this document
                electronically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
