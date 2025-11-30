"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { USERS } from "@/constants";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setPassword("password123");
      setStep("password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
    setStep("password");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="px-8 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-[100px] h-[30px] flex items-center justify-center">
            <Image
              data-qa="header-docusign-logo"
              alt="Docusign eSignature"
              src="https://docucdn-a.akamaihd.net/olive/images/2.102.0/global-assets/ds-logo-default.svg"
              width={100}
              height={30}
              className="css-1sz9cjp"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-24">
        <div className="w-full max-w-[552px] bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] px-12 py-10">
          <div className="mb-8">
            <h1 className="text-[28px] font-normal text-[#2c2c2c] mb-3 leading-tight">
              Log in to Docusign
            </h1>
            <p className="text-[15px] text-[#595959] font-normal leading-snug">
              {step === "email"
                ? "Enter your email to log in."
                : "Enter your password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailNext} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[13px] font-medium text-[#2c2c2c] mb-2"
                >
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[52px] px-4 text-[15px] border-2 border-[#6B4DE8] rounded-[4px] text-[#2c2c2c] placeholder-[#999] focus:outline-none focus:border-[#6B4DE8] focus:ring-0 transition-colors"
                  placeholder="Enter email"
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                />
              </div>

              <button
                type="submit"
                className="w-full h-[52px] bg-[#1a0d4d] text-white text-[15px] font-semibold tracking-wider rounded-[4px] hover:bg-[#150a3d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a0d4d] transition-colors"
              >
                NEXT
              </button>

              <button
                type="button"
                className="w-full h-[52px] bg-[#f0f0f0] text-[#2c2c2c] text-[15px] font-medium rounded-[4px] hover:bg-[#e5e5e5] focus:outline-none transition-colors"
              >
                Sign Up for Free
              </button>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">
                  Quick Login (Demo Only)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => quickLogin(USERS.ALEX.EMAIL)}
                    className="py-2.5 px-3 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Alex (Sender)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin(USERS.BLAKE.EMAIL)}
                    className="py-2.5 px-3 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Blake (Signer)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-[#2c2c2c] mb-2"
                >
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] px-4 text-[15px] border-2 border-[#6B4DE8] rounded-[4px] text-[#2c2c2c] placeholder-[#999] focus:outline-none focus:border-[#6B4DE8] focus:ring-0 transition-colors"
                  placeholder="Enter password"
                  autoFocus
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                />
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-[#6B4DE8] hover:text-[#5839d1] font-medium"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="text-[#6B4DE8] hover:text-[#5839d1]"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-[#1a0d4d] text-white text-[15px] font-semibold tracking-wider rounded-[4px] hover:bg-[#150a3d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a0d4d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-[#e0e0e0] py-4 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[11px] text-[#666666]">
          <div className="flex items-center space-x-1.5">
            <span>Powered by</span>
            <div className="flex items-center space-x-1">
              <div className="w-[50px] h-[10px] rounded-[2px]">
                <Image
                  data-qa="header-docusign-logo"
                  alt="Docusign eSignature"
                  src="https://docucdn-a.akamaihd.net/olive/images/2.102.0/global-assets/ds-logo-default.svg"
                  width={50}
                  height={10}
                  className="css-1sz9cjp"
                />
              </div>
            </div>
          </div>
          <div className="hidden xl:flex items-center space-x-5">
            <button className="hover:text-[#2c2c2c] flex items-center">
              English (US)
              <svg
                className="w-3 h-3 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <a href="#" className="hover:text-[#2c2c2c]">
              Contact Us
            </a>
            <a href="#" className="hover:text-[#2c2c2c]">
              Terms of Use
            </a>
            <a href="#" className="hover:text-[#2c2c2c]">
              Privacy
            </a>
            <a href="#" className="hover:text-[#2c2c2c]">
              Intellectual Property
            </a>
            <a href="#" className="hover:text-[#2c2c2c]">
              Trust
            </a>
          </div>
          <div className="hidden lg:block">
            <span>Copyright © 2025 Docusign, Inc. All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
