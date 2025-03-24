import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { AuthForms } from "@/components/AuthForms";

export default function AuthPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left section: Auth forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <AuthForms onSuccess={handleAuthSuccess} />
      </div>

      {/* Right section: Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 flex-col items-center justify-center p-8 text-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">SINGULARIS PRIME</h1>
          <h2 className="text-2xl mb-6">The Future of Quantum Programming</h2>
          <p className="mb-8 text-lg">
            A revolutionary platform that combines quantum computing with
            AI-driven optimization for unprecedented computational power.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 15a5 5 0 0 1 5-5h5v5a5 5 0 0 1-10 0Z" />
                  <path d="M7 15v-3a3 3 0 0 1 6 0v0" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Quantum Acceleration</h3>
                <p>Harness the power of quantum algorithms and entanglement</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Governance</h3>
                <p>
                  Built-in protocols and safeguards for responsible AI operations
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0l-1.58-5.58A2 2 0 0 0 16.55 9H7.45a2 2 0 0 0-1.87 1.42L4 16" />
                  <path d="M12 16v3" />
                  <path d="M8 16v.01" />
                  <path d="M16 16v.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Integrated Development</h3>
                <p>
                  Comprehensive IDE with real-time compilation and visualization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}