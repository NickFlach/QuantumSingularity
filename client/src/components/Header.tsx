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
        <Link href="/projects">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-folder-line mr-1"></i> Projects
          </div>
        </Link>
        <Link href="/code-analysis">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-green-600 to-emerald-500 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-shield-check-line mr-1"></i> Code Analysis
          </div>
        </Link>
        <Link href="/quantum-visualizer">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-cyan-600 to-violet-600 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-radar-line mr-1"></i> Quantum Visualizer
          </div>
        </Link>
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
        <Link href="/quantum-circuit">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-pink-600 to-orange-500 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-code-box-line mr-1"></i> Circuit Designer
          </div>
        </Link>
        <Link href="/kashiwara-quantum">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-700 to-rose-600 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-blaze-line mr-1"></i> Kashiwara Genesis
          </div>
        </Link>
        <Link href="/examples">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-rocket-line mr-1"></i> Examples
          </div>
        </Link>
        <Link href="/control">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-red-500 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-dashboard-line mr-1"></i> StellarRose
          </div>
        </Link>
        <Link href="/glyph-editor">
          <div className="px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-700 to-orange-600 text-white cursor-pointer hover:opacity-90 transition">
            <i className="ri-magic-line mr-1"></i> G.L.Y.P.H.
          </div>
        </Link>
        <Link href="/settings">
          <div className="px-3 py-1.5 rounded-md bg-[#6a0dad]/20 hover:bg-[#6a0dad]/40 transition text-white cursor-pointer">
            <i className="ri-settings-4-line mr-1"></i> Settings
          </div>
        </Link>
        <Link href="/profile">
          <div className="px-3 py-1.5 rounded-md bg-[#00b4d8]/20 hover:bg-[#00b4d8]/40 transition text-white cursor-pointer">
            <i className="ri-account-circle-line mr-1"></i> Profile
          </div>
        </Link>
        <button className="px-3 py-1.5 rounded-md bg-[#6a0dad] text-white hover:bg-[#6a0dad]/80 transition">
          <i className="ri-github-line mr-1"></i> GitHub
        </button>
      </div>
    </header>
  );
};

export default Header;
