import { FC } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-56 bg-[#1a1a2e] border-r border-[#6a0dad]/30 flex flex-col">
      <div className="p-3 border-b border-[#6a0dad]/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">PROJECT</h2>
          <button className="text-[#00b4d8] hover:text-white transition">
            <i className="ri-add-line"></i>
          </button>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full bg-[#343a40]/50 border border-[#6a0dad]/30 rounded-md py-1 px-2 text-sm focus:outline-none focus:border-[#00b4d8]"
          />
          <i className="ri-search-line absolute right-2 top-1.5 text-gray-400"></i>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        <div className="p-2">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1 hover:text-white cursor-pointer">
            <span>
              <i className="ri-arrow-down-s-line"></i> src
            </span>
            <div className="flex space-x-1">
              <i className="ri-add-line hover:text-[#00b4d8]"></i>
              <i className="ri-more-2-fill hover:text-[#00b4d8]"></i>
            </div>
          </div>
          
          <div className="pl-4">
            <div 
              className={`flex items-center text-sm py-1 cursor-pointer ${
                activeTab === "main.singularis" ? "text-[#00b4d8]" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab("main.singularis")}
            >
              <i className="ri-code-line mr-1"></i> main.singularis
            </div>
            <div 
              className={`flex items-center text-sm py-1 cursor-pointer ${
                activeTab === "quantum_ops.singularis" ? "text-[#00b4d8]" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab("quantum_ops.singularis")}
            >
              <i className="ri-code-line mr-1"></i> quantum_ops.singularis
            </div>
            <div 
              className="flex items-center text-sm py-1 text-gray-300 hover:text-white cursor-pointer"
              onClick={() => setActiveTab("ai_protocols.singularis")}
            >
              <i className="ri-code-line mr-1"></i> ai_protocols.singularis
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1 mt-2 hover:text-white cursor-pointer">
            <span>
              <i className="ri-arrow-right-s-line"></i> lib
            </span>
            <div className="flex space-x-1">
              <i className="ri-add-line hover:text-[#00b4d8]"></i>
              <i className="ri-more-2-fill hover:text-[#00b4d8]"></i>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1 mt-2 hover:text-white cursor-pointer">
            <span>
              <i className="ri-arrow-right-s-line"></i> tests
            </span>
            <div className="flex space-x-1">
              <i className="ri-add-line hover:text-[#00b4d8]"></i>
              <i className="ri-more-2-fill hover:text-[#00b4d8]"></i>
            </div>
          </div>
          
          <div className="flex items-center text-sm py-1 text-gray-300 hover:text-white cursor-pointer">
            <i className="ri-file-text-line mr-1"></i> README.md
          </div>
          <div className="flex items-center text-sm py-1 text-gray-300 hover:text-white cursor-pointer">
            <i className="ri-file-text-line mr-1"></i> LICENSE
          </div>
        </div>
      </div>
      
      <div className="border-t border-[#6a0dad]/30 p-3">
        <h3 className="text-sm font-semibold mb-2">QUANTUM RESOURCES</h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center text-gray-300 hover:text-[#00b4d8] cursor-pointer">
            <i className="ri-book-2-line mr-1"></i> Documentation
          </div>
          <div className="flex items-center text-gray-300 hover:text-[#00b4d8] cursor-pointer">
            <i className="ri-stack-line mr-1"></i> QKD Libraries
          </div>
          <div className="flex items-center text-gray-300 hover:text-[#00b4d8] cursor-pointer">
            <i className="ri-terminal-box-line mr-1"></i> Quantum Simulator
          </div>
          <div className="flex items-center text-gray-300 hover:text-[#00b4d8] cursor-pointer" onClick={() => window.location.href = '/kashiwara-quantum'}>
            <i className="ri-function-line mr-1"></i> Kashiwara Genesis
          </div>
          <div className="flex items-center text-gray-300 hover:text-[#00b4d8] cursor-pointer" onClick={() => window.location.href = '/glyph-editor'}>
            <i className="ri-magic-line mr-1"></i> G.L.Y.P.H. Editor
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
