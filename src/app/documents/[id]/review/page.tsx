"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";

export default function SignDocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState<"style" | "draw" | "upload">(
    "style"
  );
  const [fullName, setFullName] = useState("Radhika Daxini");
  const [initials, setInitials] = useState("RD");
  const [signaturePlaced, setSignaturePlaced] = useState(false);
  const [showFinishPrompt, setShowFinishPrompt] = useState(false);

  const handleAdoptSignature = () => {
    setShowSignatureModal(false);
    setSignaturePlaced(true);
    setShowFinishPrompt(true);
  };

  const handleFinish = async () => {
    try {
      await apiClient.signDocument(params.id as string);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to sign:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-[#1a1464] text-white px-6 py-3 flex items-center justify-between">
        <div className="text-sm">
          Drag and drop fields from the left panel onto the document
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleFinish}
            disabled={!signaturePlaced}
            className="px-6 py-2 bg-white text-purple-900 rounded-md font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Finish
          </button>
          <button className="p-2">
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
          <button className="p-2">
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
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">FIELDS</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <button
              onClick={() => setShowSignatureModal(true)}
              className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm"
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

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
              <div className="w-5 h-5 border-2 border-gray-700 rounded flex items-center justify-center">
                <span className="text-xs font-bold">DS</span>
              </div>
              <span>Initial</span>
            </button>

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>Stamp</span>
            </button>

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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
              <span>First Name</span>
            </button>

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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
              <span>Last Name</span>
            </button>

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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

            <button className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded text-sm">
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
          <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-[1000px] p-12 relative">
            <div className="text-xs text-gray-500 mb-4">
              Docusign Envelope ID: 510A2587-AA34-4A05-A3CB-8BE708D80C4F
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-blue-600 mb-1">
                Radhika Daxini
              </h1>
              <div className="text-blue-600 mb-1">Senior Software Engineer</div>
              <div className="text-sm text-gray-600 mb-2">
                <a href="#" className="text-blue-600">
                  daxini.radhika.001@gmail.com
                </a>{" "}
                • +91 8401406843
                <br />
                <a href="#" className="text-blue-600">
                  https://www.linkedin.com/in/radhika-daxini/
                </a>
                <br />
                Pune, 411027, India
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-700">
              With 8 years as a Senior Developer, I've specialized in optimizing
              UI, end-to-end application development, and enhancing web
              performance. Proven track record in building scalable design
              systems, interactive data visualizations, and enterprise-grade
              applications. Experienced in full-stack development with Node.js
              and Java when project requirements demand end-to-end solutions.
              Strong background in leading UI teams and mentoring developers.
              Proficient in teamwork and communication, I aim to further advance
              my technical prowess.
            </div>

            <h2 className="text-2xl font-semibold text-blue-600 mb-3">
              Professional Experience
            </h2>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <div>
                  <div className="text-blue-600 font-semibold">
                    Mastercard, Pune
                  </div>
                  <div className="text-blue-600">Senior Software Engineer</div>
                </div>
                <div className="text-blue-600 text-sm">
                  September 2024 — Present
                </div>
              </div>

              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>
                    Comet Design System - B2B Commercial Solutions
                  </strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Spearheaded the development of the Comet Design System, a
                    scalable and reusable design framework, adopted across 100+
                    B2B projects, driving consistency and reducing UI
                    development time by 30%.
                  </li>
                  <li>
                    Designed and implemented a library of 50+ reusable UI
                    components and 10+ data visualization charts, enhancing
                    cross-team collaboration and ensuring uniform branding.
                  </li>
                  <li>
                    Contributed to Proof of Concepts (POCs) for a dashboard
                    redesign, delivering stakeholder insights with real-time
                    analytics dashboards that visualized key metrics such as
                    revenue trends and corporate card usage, improving
                    decision-making processes by 20%.
                  </li>
                  <li>
                    Optimized front-end codebase, resulting in a 15% improvement
                    in application load time and a measurable uplift in user
                    engagement scores by 25%.
                  </li>
                </ul>
                <p>
                  <strong>
                    Reporting & Analytics(Smart Data) - B2B Commercial Solutions
                  </strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Led comprehensive research and development for self-service
                    reporting tool solutions, exploring multiple architectural
                    approaches to deliver scalable business intelligence
                    capabilities for B2B commercial applications.
                  </li>
                  <li>
                    Worked on enhancements on Java services to improve the
                    functionalities and different PBIs and delivered production
                    ready APIs.
                  </li>
                </ul>
              </div>
            </div>

            {signaturePlaced && (
              <div className="absolute" style={{ top: "300px", left: "200px" }}>
                <div className="bg-red-50 border-2 border-red-300 rounded p-2 relative">
                  <div className="font-['Brush_Script_MT',cursive] text-lg">
                    Radhika Daxini
                  </div>
                  <button
                    onClick={() => setSignaturePlaced(false)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
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
          <button className="p-2 hover:bg-gray-100 rounded">
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
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
          <button className="p-2 hover:bg-gray-100 rounded">
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
        </aside>
      </div>

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                    className="w-full px-4 py-2 border rounded-md"
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
                    className="w-full px-4 py-2 border rounded-md"
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
                    <button className="text-sm text-blue-600">
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
                          52B6AF9A2BDA43A...
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

      {showFinishPrompt && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-lg p-6 max-w-md border border-gray-200 z-50">
          <h3 className="text-lg font-semibold mb-2">Ready to Finish?</h3>
          <p className="text-sm text-gray-600 mb-4">
            You've completed the required fields. Review your work, then select
            Finish.
          </p>
          <button
            onClick={handleFinish}
            className="w-full py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700"
          >
            Finish
          </button>
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
            <a href="#">Terms of Use</a>
            <a href="#">Privacy</a>
          </div>
          <div>
            <span>Copyright © 2025 Docusign, Inc. All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
