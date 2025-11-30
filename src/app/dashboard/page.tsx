"use client";

import React, { useEffect, useState } from "react";
import PDFThumbnail from "@/components/PDFThumbnail";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";
import { Document } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { DOCUMENT_STATUS } from "@/constants";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"home" | "agreements">("home");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadDocuments();
    const interval = setInterval(loadDocuments, 5000);
    return () => clearInterval(interval);
  }, [user, router]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await apiClient.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const inboxDocs = documents.filter(
    (d) => d.recipientId === user.id && d.status === DOCUMENT_STATUS.PENDING
  );
  const actionRequired = inboxDocs.length;
  const waitingForOthers = documents.filter(
    (d) => d.senderId === user.id && d.status === DOCUMENT_STATUS.PENDING
  ).length;
  const expiringSoon = 0;
  const completed = documents.filter((d) => d.status === "SIGNED").length;
  const completedByUser = Math.floor(completed / 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 w-[104px] h-[40px]"
              >
                <Image
                  data-qa="header-docusign-logo"
                  alt="Docusign eSignature"
                  src="https://docucdn-a.akamaihd.net/olive/images/2.102.0/global-assets/ds-logo-default.svg"
                  width={104}
                  height={40}
                  className="css-1sz9cjp"
                />
              </Link>

              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`px-4 py-2 text-sm font-medium relative ${
                    activeTab === "home"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Home
                  {activeTab === "home" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("agreements")}
                  className={`px-4 py-2 text-sm font-medium relative ${
                    activeTab === "agreements"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Agreements
                  {activeTab === "agreements" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                  )}
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Templates
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Reports
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Admin
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">30 Days Left</span>
              <button className="px-4 py-2 bg-[#1a1464] text-white text-sm font-medium rounded-md hover:bg-[#14104d]">
                View Plans
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
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
              <button
                onClick={logout}
                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              >
                {user.name.charAt(0)}
                {user.name.split(" ")[1]?.charAt(0)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {activeTab === "home" ? (
        <HomeContent
          user={user}
          router={router}
          documents={documents}
          actionRequired={actionRequired}
          waitingForOthers={waitingForOthers}
          expiringSoon={expiringSoon}
          completed={completedByUser}
        />
      ) : (
        <AgreementsContent
          user={user}
          router={router}
          documents={documents}
          isLoading={isLoading}
          completedActions={completed > 0 ? 1 : 0}
        />
      )}
    </div>
  );
}

function HomeContent({
  user,
  router,
  documents,
  actionRequired,
  waitingForOthers,
  expiringSoon,
  completed,
}: any) {
  const recentCompleted = documents
    .filter((d: any) => d.status === "SIGNED")
    .slice(0, 5);

  const formatDate = (date: any) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Less than 1 minute ago";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleDownload = async (doc: any) => {
    try {
      if (doc.fileData) {
        const link = document.createElement("a");
        link.href = doc.fileData;
        link.download = doc.fileName || `${doc.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const fullDoc = await apiClient.getDocumentById(doc.id);

      if (fullDoc.fileData) {
        const link = document.createElement("a");
        link.href = fullDoc.fileData;
        link.download = fullDoc.fileName || `${fullDoc.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("No file data available for this document");
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleTemplateSelect = async (pdfPath: string, title: string) => {
    try {
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileName = pdfPath.split("/").pop() || "template.pdf";
      const file = new File([blob], fileName, { type: "application/pdf" });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;

        localStorage.setItem(
          "templatePDF",
          JSON.stringify({
            fileData: base64data,
            fileName: fileName,
            fileType: "application/pdf",
            fileSize: file.size,
            title: title,
            fileObject: {
              name: fileName,
              size: file.size,
              type: "application/pdf",
            },
          })
        );

        router.push("/documents/create");
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Failed to process template. Please try again.");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to load template:", error);
      alert(
        "Failed to load template. Please ensure the PDF exists in public/sample-pdfs/"
      );
    }
  };

  return (
    <>
      <div className="bg-[#260559] text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-light mb-6">Welcome back</h1>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user.name.charAt(0)}
                  {user.name.split(" ")[1]?.charAt(0)}
                </div>
                <span className="text-lg font-['Brush_Script_MT',cursive] italic">
                  {user.name.split(" ")[0]} {user.name.split(" ")[1]}
                </span>
              </div>
            </div>

            <div className="flex-1 ml-20">
              <div className="text-sm text-gray-300 mb-4">Last 6 Months</div>
              <div className="grid grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-light mb-2">
                    {actionRequired}
                  </div>
                  <div className="text-sm text-gray-300">Action Required</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-light mb-2">
                    {waitingForOthers}
                  </div>
                  <div className="text-sm text-gray-300">
                    Waiting for Others
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-light mb-2">{expiringSoon}</div>
                  <div className="text-sm text-gray-300">Expiring Soon</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-light mb-2">{completed}</div>
                  <div className="text-sm text-gray-300">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light text-gray-900">
                Get Started or Use Templates
              </h2>
              <button className="text-sm text-gray-700 hover:text-gray-900 flex items-center space-x-1 border border-gray-300 px-4 py-2 rounded-md">
                <span>Browse all Templates</span>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-100 rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-normal text-gray-900 mb-8">
                  Sign or get signatures
                </h3>
                <button
                  onClick={() => router.push("/documents/create")}
                  className="px-12 py-3 bg-[#4c00fb] text-white font-medium rounded-md hover:bg-[#4c00fb] text-base"
                >
                  Start
                </button>
              </div>

              <div
                onClick={() =>
                  handleTemplateSelect(
                    "/sample-pdfs/sample-contract.pdf",
                    "Employment Contract"
                  )
                }
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-3 bg-gray-50">
                  <div className="text-xs text-gray-600">Starter Templates</div>
                </div>
                <div className="h-56 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                  <PDFThumbnail
                    pdfPath="/sample-pdfs/sample.pdf"
                    width={128}
                    height={176}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Employment Eligibility
                    <br />
                    Verification: I-9
                  </h3>
                </div>
              </div>

              <div
                onClick={() =>
                  handleTemplateSelect(
                    "/sample-pdfs/sample-contract.pdf",
                    "Employment Contract"
                  )
                }
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-3 bg-gray-50">
                  <div className="text-xs text-gray-600">Starter Templates</div>
                </div>
                <div className="h-56 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                  <PDFThumbnail
                    pdfPath="/sample-pdfs/sample-invoice.pdf"
                    width={128}
                    height={176}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Sample W9
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {recentCompleted.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center space-x-2 mb-4">
                <h2 className="text-xl font-normal text-gray-900">
                  Agreement activity
                </h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
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
              </div>

              <div className="space-y-3">
                {recentCompleted.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="text-sm text-gray-900">
                          Here is your signed document:{" "}
                          <span className="font-medium">{doc.title}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(doc.signedAt || doc.requestedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-green-600 font-medium">
                        Completed
                      </span>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 p-12 bg-[#f7f6f7]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-700 mb-2">
              Want to participate in Docusign research studies such as surveys,
              interviews,
              <br />
              and testing of new product ideas and features?
            </p>
            <a
              href="#"
              className="text-sm text-purple-600 hover:text-purple-700 underline"
            >
              Join our Product Experience Research Panel
            </a>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex items-center space-x-2 hover:text-gray-900 cursor-pointer">
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
              <span>Support Home</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-gray-900 cursor-pointer">
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
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
              <span>Community</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-gray-900 cursor-pointer">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Trust Center</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AgreementsContent({
  user,
  router,
  documents,
  isLoading,
  completedActions,
}: any) {
  const inboxDocuments = documents.filter(
    (d: any) => d.recipientId === user.id && d.status === "PENDING"
  );
  const hasDocuments = inboxDocuments.length > 0;

  const formatDateTime = (date: any) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-gray-700">
              Get started
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-48 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all"
                  style={{ width: `${(completedActions / 4) * 100}%` }}
                ></div>
              </div>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                {completedActions}/4 actions completed
              </a>
            </div>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              What&apos;s next?
            </button>
          </div>
          <button
            onClick={() => router.push("/documents/create")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {completedActions > 0 ? "Invite Your Team" : "Send a Document"}
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4">
            <button
              onClick={() => router.push("/documents/create")}
              className="w-full py-3 bg-[#1a1464] text-white font-medium rounded-md hover:bg-[#14104d]"
            >
              Start Now
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <div className="mb-4">
              <button className="flex items-center space-x-2 text-xs font-medium text-gray-500 mb-2 w-full">
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
                <span>ENVELOPES</span>
              </button>

              <div className="space-y-1">
                <button className="flex items-center space-x-3 w-full px-3 py-2 bg-white rounded text-sm font-medium text-gray-900">
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <span>Inbox</span>
                </button>

                <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-white rounded text-sm text-gray-700">
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span>Sent</span>
                </button>

                <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-white rounded text-sm text-gray-700">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Completed</span>
                </button>

                <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-white rounded text-sm text-gray-700">
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
                  <span>Action Required</span>
                </button>

                <button className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 underline">
                  Show More
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-white rounded text-sm text-gray-700">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>PowerForms</span>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span>New navigation</span>
            </label>
          </div>
        </aside>

        <main className="flex-1 bg-white">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-light text-gray-900 pl-4 border-l-4 border-purple-600">
                  Inbox
                </h1>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Shared Access</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Inbox and Folders"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Last 6 months</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Status</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Sender</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Advanced search</option>
                </select>
                <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                  Clear
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-600">Loading...</div>
              </div>
            ) : hasDocuments ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-6 py-3">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NAME
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LAST CHANGE
                        <svg
                          className="w-4 h-4 inline-block ml-1"
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
                      </th>
                      <th className="px-6 py-3"></th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inboxDocuments.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doc.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            To: {doc.recipient?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-900">
                              Need to sign
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDateTime(doc.requestedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              router.push(`/documents/${doc.id}/review`)
                            }
                            className="px-6 py-2 bg-[#1a1464] text-white font-medium rounded-md hover:bg-[#14104d] text-sm"
                          >
                            Sign
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
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
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-8 relative">
                  <div className="w-56 h-56 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-32 h-32 text-purple-200"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="absolute bottom-8 right-8">
                      <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={4}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-normal text-gray-900 mb-2">
                  Your inbox is empty
                </h2>
                <p className="text-sm text-gray-600 text-center max-w-md">
                  When someone sends you an envelope, it will show up here. Edit
                  the date range to view older envelopes.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <button>English (US) ▼</button>
            <a href="#" className="hover:text-gray-900">
              Contact Us
            </a>
            <a href="#" className="hover:text-gray-900">
              Terms of Use
            </a>
            <a href="#" className="hover:text-gray-900">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900">
              Intellectual Property
            </a>
            <a href="#" className="hover:text-gray-900">
              Trust
            </a>
          </div>
          <div>
            <span>Copyright © 2025 Docusign, Inc. All rights reserved</span>
          </div>
        </div>
      </footer>
    </>
  );
}
