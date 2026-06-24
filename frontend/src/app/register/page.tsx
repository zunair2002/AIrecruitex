import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="flex w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] m-4">
          
          {/* Left Side - Graphic */}
          <div className="hidden lg:flex w-1/2 bg-purple-50 items-center justify-center relative p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
            
            <div className="relative z-10 text-white max-w-lg">
              <h3 className="text-4xl font-bold mb-6">Build Your Dream Team</h3>
              <p className="text-purple-100 text-lg leading-relaxed mb-8">
                Join thousands of companies using Skreena to screen smarter and hire faster. Create your account today.
              </p>
              
              {/* Abstract UI representation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                  <div className="h-10 w-10 bg-white/20 rounded-xl mb-4"></div>
                  <div className="h-3 w-16 bg-white/20 rounded-full mb-2"></div>
                  <div className="h-2 w-24 bg-white/10 rounded-full"></div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl mt-8">
                  <div className="h-10 w-10 bg-white/20 rounded-xl mb-4"></div>
                  <div className="h-3 w-16 bg-white/20 rounded-full mb-2"></div>
                  <div className="h-2 w-24 bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12">
            <div className="max-w-md w-full mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
              <p className="text-gray-500 mb-8">Start streamlining your hiring process today.</p>
              
              <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="Acme Inc." 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                  <input 
                    type="email" 
                    placeholder="jane@acme.com" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                
                <button type="submit" className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-purple-200 mt-4">
                  Create Account
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </>
  );
}
