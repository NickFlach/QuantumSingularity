const StatusBar = () => {
  return (
    <footer className="bg-[#343a40] border-t border-[#6a0dad]/30 py-1 px-3 text-xs text-gray-400 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <i className="ri-check-line text-green-500 mr-1"></i> Quantum Runtime: Online
        </div>
        <div className="flex items-center">
          <i className="ri-cpu-line mr-1"></i> QBits: 32
        </div>
        <div className="flex items-center">
          <i className="ri-radar-line mr-1"></i> Decoherence: 0.05%
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div>Singularis v0.1.0-alpha</div>
        <div>Quantum SDK: v2.3.0</div>
        <div className="flex items-center">
          <i className="ri-earth-line mr-1"></i> Latency: 187ms
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
