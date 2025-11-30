"use client";

import React, { useEffect, useRef, useState } from "react";

interface PDFThumbnailProps {
  pdfPath: string;
  width?: number;
  height?: number;
}

export default function PDFThumbnail({
  pdfPath,
  width = 128,
  height = 176,
}: PDFThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Add a small delay to let React Strict Mode finish its double-mount cycle
    const timeoutId = setTimeout(() => {
      const generateThumbnail = async () => {
        try {
          if (cancelled) return;

          setLoading(true);
          setError(null);

          console.log("🔍 Starting PDF thumbnail generation for:", pdfPath);

          // Dynamically import PDF.js
          const pdfjsLib = await import("pdfjs-dist");

          // Set worker path
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

          console.log("✅ PDF.js loaded, version:", pdfjsLib.version);

          if (cancelled) return;

          // Load PDF
          console.log("📄 Loading PDF from:", pdfPath);
          const loadingTask = pdfjsLib.getDocument(pdfPath);
          const pdf = await loadingTask.promise;

          console.log("✅ PDF loaded successfully. Pages:", pdf.numPages);

          if (cancelled) return;

          // Get first page
          const page = await pdf.getPage(1);
          console.log("✅ First page retrieved");

          if (cancelled) return;

          // Wait a tiny bit more for canvas to be ready
          await new Promise((resolve) => setTimeout(resolve, 50));

          if (cancelled || !canvasRef.current) {
            console.log("⚠️ Canvas not ready or component cancelled");
            return;
          }

          // Calculate scale to fit canvas
          const viewport = page.getViewport({ scale: 1 });
          const scale = Math.min(
            width / viewport.width,
            height / viewport.height
          );

          const scaledViewport = page.getViewport({ scale });

          console.log("📐 Viewport calculated");

          // Get canvas and context
          const canvas = canvasRef.current;
          if (!canvas) {
            console.log("⚠️ Canvas ref is null");
            return;
          }

          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("Could not get 2D context from canvas");
          }

          canvas.width = scaledViewport.width;
          canvas.height = scaledViewport.height;

          console.log("🎨 Canvas prepared:", {
            width: canvas.width,
            height: canvas.height,
          });

          if (cancelled) return;

          // Render PDF page
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
          };

          await page.render(renderContext).promise;

          if (!cancelled) {
            console.log("✅ PDF thumbnail rendered successfully!");
            setLoading(false);
          }
        } catch (err: any) {
          if (!cancelled) {
            console.error("❌ Error generating PDF thumbnail:", err);
            console.error("Error message:", err?.message);
            setError(err?.message || "Failed to load PDF");
            setLoading(false);
          }
        }
      };

      generateThumbnail();
    }, 100); // Small delay to let React Strict Mode finish

    // Cleanup function
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      console.log("🧹 Cleaning up PDF thumbnail component");
    };
  }, [pdfPath, width, height]);

  return (
    <div
      style={{ width, height }}
      className="flex items-center justify-center bg-gray-50 rounded"
    >
      {loading && (
        <div className="absolute flex flex-col items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
      )}

      {error && (
        <div className="absolute flex flex-col items-center justify-center p-3">
          <svg
            className="w-12 h-12 text-red-400 mb-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
          </svg>
          <div className="text-xs text-red-600 text-center font-medium">
            PDF Error
          </div>
          <div className="text-xs text-red-500 text-center mt-1 break-words max-w-full px-2">
            {error}
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="shadow-sm bg-white"
        style={{
          maxWidth: width,
          maxHeight: height,
          display: loading ? "none" : "block",
        }}
      />
    </div>
  );
}
