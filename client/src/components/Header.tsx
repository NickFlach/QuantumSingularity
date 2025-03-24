import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-[#343a40] border-b border-[#6a0dad]/30 p-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="animate-pulse">
              <i className="ri-radio-button-line text-[#00b4d8] text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-white">SINGULARIS PRIME <span className="text-sm bg-[#6a0dad] px-2 py-0.5 rounded-md ml-2">ALPHA v0.1</span></h1>
          </div>
        </Link>
      </div>
      <div className="flex space-x-4">
        <Link href="/demo">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-flashlight-line mr-1"></i> AI-Quantum Demo
          </div>
        </Link>
        <Link href="/quantum-geometry">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-space-ship-line mr-1"></i> Quantum Geometry
          </div>
        </Link>
        <Link href="/settings">
          <div className="px-3 py-1.5 rounded-md bg-[#6a0dad]/20 hover:bg-[#6a0dad]/40 transition text-white cursor-pointer">
            <i className="ri-settings-4-line mr-1"></i> Settings
          </div>
        </Link>
        <button className="px-3 py-1.5 rounded-md bg-[#00b4d8]/20 hover:bg-[#00b4d8]/40 transition text-white">
          <i className="ri-account-circle-line mr-1"></i> Profile
        </button>
        <button className="px-3 py-1.5 rounded-md bg-[#6a0dad] text-white hover:bg-[#6a0dad]/80 transition">
          <i className="ri-github-line mr-1"></i> GitHub
        </button>
      </div>
    </header>
  );
};

export default Header;
