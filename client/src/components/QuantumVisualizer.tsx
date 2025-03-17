const QuantumVisualizer = () => {
  return (
    <div className="text-center">
      <div className="flex items-center space-x-6 mb-4">
        <div className="text-right w-16">
          <div className="mb-6">|0⟩ Alice</div>
          <div>|0⟩ Bob</div>
        </div>
        <div className="flex-1 font-mono">
          <div className="flex items-center">
            <div className="h-0.5 w-12 bg-gray-400"></div>
            <div className="border border-[#00b4d8] rounded w-8 h-8 flex items-center justify-center">H</div>
            <div className="h-0.5 w-12 bg-gray-400"></div>
            <div className="border border-[#6a0dad] rounded-full w-3 h-3"></div>
            <div className="h-12 w-0.5 bg-[#6a0dad]"></div>
          </div>
          <div className="flex items-center mt-4">
            <div className="h-0.5 w-24 bg-gray-400"></div>
            <div className="border border-[#6a0dad] rounded-full w-3 h-3"></div>
            <div className="h-0.5 w-12 bg-gray-400"></div>
            <div className="border border-[#00b4d8] rounded w-8 h-8 flex items-center justify-center">H</div>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-400 mt-2">Bell State Entanglement for QKD Protocol</div>
      
      <div className="mt-8 p-4 border border-[#6a0dad]/30 rounded-md bg-[#343a40]/20">
        <h3 className="text-[#00b4d8] font-semibold mb-2">Bell State: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2</h3>
        <p className="text-sm">This quantum circuit creates entanglement between two qubits, enabling quantum key distribution.</p>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-left">
            <h4 className="font-semibold text-sm text-gray-300">Measurements</h4>
            <div className="mt-2 text-xs space-y-1">
              <div>Probability |00⟩: 0.5</div>
              <div>Probability |11⟩: 0.5</div>
              <div>Probability |01⟩: 0.0</div>
              <div>Probability |10⟩: 0.0</div>
            </div>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-sm text-gray-300">Security Properties</h4>
            <div className="mt-2 text-xs space-y-1">
              <div>Eavesdropping Detection: Yes</div>
              <div>Security Level: Quantum</div>
              <div>Key Generation Rate: ~256 bits/s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumVisualizer;
