import { FC } from 'react';

interface ConsoleProps {
  output: string[];
  onRun: () => void;
}

const Console: FC<ConsoleProps> = ({ output, onRun }) => {
  return (
    <div className="h-1/3 border-t border-[#6a0dad]/30 overflow-auto">
      <div className="bg-[#343a40] text-white p-2 flex justify-between items-center">
        <div className="flex space-x-3">
          <button 
            className="px-2 py-1 bg-[#6a0dad]/20 hover:bg-[#6a0dad]/40 text-sm rounded"
            onClick={onRun}
          >
            <i className="ri-play-line mr-1"></i> Run
          </button>
          <button className="px-2 py-1 bg-[#343a40] hover:bg-[#343a40]/70 text-sm rounded">
            <i className="ri-bug-line mr-1"></i> Debug
          </button>
          <button className="px-2 py-1 bg-[#343a40] hover:bg-[#343a40]/70 text-sm rounded">
            <i className="ri-terminal-line mr-1"></i> Terminal
          </button>
        </div>
        <div>
          <button className="text-gray-400 hover:text-white">
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
      <div className="bg-[#343a40]/90 p-3 font-mono text-sm h-full overflow-auto">
        {output.map((line, index) => {
          // Determine line style based on content
          let className = "text-white";
          if (line.startsWith('$')) className = "text-green-400";
          if (line.includes('[INFO]')) className = "text-[#00b4d8]";
          if (line.includes('[WARNING]')) className = "text-yellow-300";
          if (line.includes('[SUCCESS]')) className = "text-green-400";
          if (line.includes('Done')) className = line.replace('Done', '<span class="text-green-400">Done</span>');
          
          return (
            <div key={index} className={className}>
              {line.includes('<span') ? (
                <div dangerouslySetInnerHTML={{ __html: line }} />
              ) : (
                line
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Console;
