"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";

export default function CreateDocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "recipient" | "message">(
    "recipient"
  );
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [needToSign, setNeedToSign] = useState(false);
  const [subject, setSubject] = useState(
    "Complete with Docusign: Document.pdf"
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleNext = () => {
    if (step === "recipient" && recipientName && recipientEmail) {
      setStep("message");
    }
  };

  const handleSign = async () => {
    setIsLoading(true);
    try {
      const users = await apiClient.getUsers();
      if (users.length > 0) {
        await apiClient.createDocument({
          title: subject,
          recipientId: users[0].id,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create document"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-600"
            >
              ×
            </button>
            <span className="text-sm text-gray-700">{subject}</span>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md">
            VIEW PLANS
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {step === "recipient" && (
            <div>
              <h1 className="text-2xl font-normal mb-6">Add a recipient</h1>
              <div className="bg-white border-l-4 border-cyan-400 p-6 rounded">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="Radhika Daxini"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={needToSign}
                    onChange={(e) => setNeedToSign(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="text-sm">
                    I also need to sign the document
                  </span>
                </label>
              </div>
              <button
                onClick={handleNext}
                disabled={!recipientName || !recipientEmail}
                className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {step === "message" && (
            <div>
              <h1 className="text-2xl font-normal mb-6">Add message</h1>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {subject.length}/100
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="Enter Message"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    0/10000
                  </div>
                </div>
              </div>
              <button
                onClick={handleSign}
                disabled={isLoading}
                className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {isLoading ? "Sending..." : "Sign"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
