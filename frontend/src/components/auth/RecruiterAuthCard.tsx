"use client";

import { useState } from "react";
import {
  AuthCardLayout,
  authInputClass,
  type AuthTab,
} from "./AuthCardParts";

function RecruiterRegisterForm() {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input type="text" placeholder="Jane" className={authInputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input type="text" placeholder="Doe" className={authInputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
        <input type="text" placeholder="Acme Inc." className={authInputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
        <input type="email" placeholder="you@company.com" className={authInputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input type="password" placeholder="Your password" className={authInputClass} />
      </div>
      <button
        type="submit"
        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
      >
        Register
      </button>
    </form>
  );
}

export function RecruiterAuthCard() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  return (
    <AuthCardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      registerForm={<RecruiterRegisterForm />}
    />
  );
}
