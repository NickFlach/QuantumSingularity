export interface QuantumState {
  id: string;
  coordinates: number[];
}

export interface QuantumInvariant {
  name: string;
  value: number;
}

export interface QuantumTransformation {
  transformationType: string;
  parameters: Record<string, number>;
  result: string;
  energyDelta: number;
}

export interface QuantumEntanglement {
  entanglementResult: { 
    success: boolean; 
    entanglementStrength: number; 
    description: string 
  };
  spaceProperties: { 
    spaceId: string; 
    dimension: number; 
    metric: string 
  };
  quantumEffects: {
    informationPreservation: number;
    decoherenceResistance: number;
    nonLocalityMeasure: number;
  }
}

export interface QuantumSpace {
  id: string;
  dimension: number;
  elements: string[];
  states: QuantumState[];
  transformations: QuantumTransformation[];
  entanglements: QuantumEntanglement[];
  invariants: QuantumInvariant[];
}