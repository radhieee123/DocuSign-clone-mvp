"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MOCK_PDF_URL = "sample-pdfs/sample-contract.pdf";

export default function PDFViewer() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setError("Failed to load document");
    setLoading(false);
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  if (error) {
    return (
      <div className="w-full bg-gray-100 rounded-md p-8">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Sample Contract Agreement
            </h2>
            <p className="text-sm text-gray-500">Document ID: #12345</p>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Agreement Terms
            </h3>

            <p className="text-gray-700 mb-4">
              This agreement ("Agreement") is entered into as of [Date] by and
              between:
            </p>

            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>
                <strong>Party A:</strong> Sender Alex, alex@acme.com
              </li>
              <li>
                <strong>Party B:</strong> Signer Blake, blake@acme.com
              </li>
            </ul>

            <p className="text-gray-700 mb-4">
              <strong>1. Purpose:</strong> This is a sample document for
              demonstration purposes only. The actual DocuSign MVP would display
              a real PDF document here using the react-pdf library.
            </p>

            <p className="text-gray-700 mb-4">
              <strong>2. Terms:</strong> Both parties agree to the terms and
              conditions as outlined in this agreement. This document serves as
              a mock representation of a legally binding contract that would
              typically require signatures from all parties involved.
            </p>

            <p className="text-gray-700 mb-4">
              <strong>3. Signature:</strong> By signing this document
              electronically, you acknowledge that you have read, understood,
              and agree to be bound by the terms of this agreement.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-300">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Sender:</p>
                  <p className="font-semibold">_________________</p>
                  <p className="text-xs text-gray-500 mt-1">Sender Alex</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Recipient (Sign here):
                  </p>
                  <p className="font-semibold">_________________</p>
                  <p className="text-xs text-gray-500 mt-1">Signer Blake</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>This is a mock document for MVP demonstration purposes.</p>
            <p>
              In production, a real PDF would be rendered using react-pdf
              library.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <p className="text-gray-600">Loading document...</p>
        </div>
      )}

      <div className="bg-gray-100 rounded-md overflow-hidden">
        <Document
          file={MOCK_PDF_URL}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-96">
              <p className="text-red-600">
                Failed to load PDF. Showing placeholder instead.
              </p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="mx-auto"
          />
        </Document>

        {numPages && (
          <div className="bg-white border-t border-gray-300 px-4 py-3 flex items-center justify-between">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <p className="text-sm text-gray-700">
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500 text-center">
        Note: Place a sample PDF file at /public/sample-contract.pdf for full
        PDF rendering.
      </p>
    </div>
  );
}
