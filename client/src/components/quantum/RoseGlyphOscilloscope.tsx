import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Waves, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Filter, 
  Hash,
  Circle,
  ArrowRight,
  RotateCw
} from 'lucide-react';

// Types for the oscilloscope
export interface PhasePattern {
  id: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'artifact';
  frequency: number;
  amplitude: number;
  phase: number;
  harmonics: number[];
  glyphOverlay?: string;
  colorHue: number;
}

export interface RoseGlyphOscilloscopeProps {
  patterns?: PhasePattern[];
  title?: string;
  description?: string;
  onPatternSelected?: (patternId: string) => void;
  readOnly?: boolean;
  showGlyphs?: boolean;
  showHarmonics?: boolean;
}

// Default patterns for the oscilloscope
const defaultPatterns: PhasePattern[] = [
  {
    id: 'quantum-core',
    type: 'primary',
    frequency: 37.5,
    amplitude: 0.9,
    phase: 0,
    harmonics: [2, 3, 5],
    glyphOverlay: '🜹', // Recovery glyph
    colorHue: 45 // Gold hue
  },
  {
    id: 'entanglement-field',
    type: 'primary',
    frequency: 24.3,
    amplitude: 0.75,
    phase: Math.PI / 4,
    harmonics: [1, 4],
    glyphOverlay: '🜂',
    colorHue: 30 // Orange-gold hue
  },
  {
    id: 'coherence-pulse',
    type: 'secondary',
    frequency: 18.7,
    amplitude: 0.6,
    phase: Math.PI / 2,
    harmonics: [3],
    glyphOverlay: '🜄',
    colorHue: 60 // Yellow-gold hue
  },
  {
    id: 'magnetic-resonance',
    type: 'secondary',
    frequency: 12.4,
    amplitude: 0.45,
    phase: Math.PI / 6,
    harmonics: [2, 6],
    glyphOverlay: '🜃',
    colorHue: 15 // Red-gold hue
  },
  {
    id: 'background-entropy',
    type: 'tertiary',
    frequency: 5.2,
    amplitude: 0.25,
    phase: Math.PI / 3,
    harmonics: [1],
    glyphOverlay: '🝮',
    colorHue: 35 // Amber hue
  }
];

// Helper to generate a waveform path
const generateWaveformPath = (
  pattern: PhasePattern, 
  width: number, 
  height: number, 
  time: number,
  complexityFactor: number = 1
): string => {
  // Base parameters
  const frequency = pattern.frequency;
  const amplitude = pattern.amplitude;
  const phase = pattern.phase;
  
  // Calculate points
  const points: [number, number][] = [];
  const steps = Math.floor(width);
  
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    
    // Start with the base sine wave
    let y = Math.sin(2 * Math.PI * frequency * (i / steps) + phase + time) * amplitude;
    
    // Add harmonics for complexity
    pattern.harmonics.forEach((harmonic, index) => {
      const harmonicAmplitude = amplitude * (0.3 / (index + 1)) * complexityFactor;
      const harmonicPhase = phase + (index * Math.PI / 4);
      
      y += Math.sin(
        2 * Math.PI * frequency * harmonic * (i / steps) + harmonicPhase + time * harmonic
      ) * harmonicAmplitude;
    });
    
    // Add a subtle random factor for natural appearance
    if (complexityFactor > 0.5) {
      y += (Math.random() - 0.5) * 0.03 * amplitude;
    }
    
    // Scale to the canvas height and center
    y = height / 2 - (y * height / 2);
    
    points.push([x, y]);
  }
  
  // Convert points to SVG path
  return points.reduce((path, point, i) => {
    return path + (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1];
  }, '');
};

// Helper to generate a glyph path
const generateGlyphPath = (
  pattern: PhasePattern,
  width: number,
  height: number,
  time: number
): string => {
  // Base parameters for the glyph
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.4 * pattern.amplitude;
  const petals = pattern.harmonics.length > 0 ? pattern.harmonics[0] + 3 : 5;
  const rotation = time * pattern.frequency * 0.2 + pattern.phase;
  
  // Generate points for a rose curve
  const points: [number, number][] = [];
  const steps = 100;
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 + rotation;
    
    // Rose curve formula: r = a * sin(n * theta)
    const r = size * Math.sin(petals * angle) * (0.8 + 0.2 * Math.sin(time * 2));
    
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    
    points.push([x, y]);
  }
  
  // Convert points to SVG path
  return points.reduce((path, point, i) => {
    return path + (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1];
  }, '');
};

export function RoseGlyphOscilloscope({
  patterns = defaultPatterns,
  title = "RoseGlyph Oscilloscope",
  description = "Phase pattern visualizer with glyphic overlays",
  onPatternSelected,
  readOnly = false,
  showGlyphs = true,
  showHarmonics = true
}: RoseGlyphOscilloscopeProps) {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [time, setTime] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(true);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const [visualMode, setVisualMode] = useState<'waveform' | 'circular' | 'spectrogram'>('waveform');
  const [complexity, setComplexity] = useState<number>(0.8);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [localShowGlyphs, setShowGlyphs] = useState<boolean>(showGlyphs || false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Animation effect
  useEffect(() => {
    if (animating) {
      const animate = () => {
        setTime(prev => prev + 0.05);
        const frameId = requestAnimationFrame(animate);
        setAnimationFrameId(frameId);
      };
      
      const frameId = requestAnimationFrame(animate);
      setAnimationFrameId(frameId);
      
      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [animating]);
  
  // Handle pattern click
  const handlePatternClick = (patternId: string) => {
    if (readOnly) return;
    
    setSelectedPattern(patternId);
    onPatternSelected?.(patternId);
    
    // Check if it's the recovery glyph
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern?.glyphOverlay === '🜹') {
      // Trigger recovery animation
      triggerRecoveryAnimation();
    }
  };
  
  // Recovery animation effect
  const triggerRecoveryAnimation = () => {
    // Save current state
    const currentMode = visualMode;
    const currentAnimation = animating;
    
    // Flash effect
    setAnimating(false);
    setVisualMode('circular');
    
    // Sequence of animations
    setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        setAnimating(false);
        setTimeout(() => {
          setAnimating(true);
          setTimeout(() => {
            // Return to original state
            setVisualMode(currentMode);
            setAnimating(currentAnimation);
          }, 1000);
        }, 200);
      }, 800);
    }, 200);
  };
  
  // Get the selected pattern details
  const selectedPatternDetails = patterns.find(p => p.id === selectedPattern);
  
  return (
    <Card className="w-full bg-[#0a0a0a] border-[#333333]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#e0e0e0]">
              {visualMode === 'waveform' && <Waves className="h-5 w-5 text-amber-300" />}
              {visualMode === 'circular' && <Circle className="h-5 w-5 text-amber-300" />}
              {visualMode === 'spectrogram' && <Activity className="h-5 w-5 text-amber-300" />}
              {title}
            </CardTitle>
            <CardDescription className="text-[#888888]">{description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnimating(!animating)}
              className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
            >
              <RotateCw className={`h-4 w-4 ${animating ? 'text-amber-300 animate-spin' : ''}`} />
              <span className="ml-1">{animating ? 'Pause' : 'Run'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTime(0)}
              className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="ml-1">Reset</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={visualMode} onValueChange={(value) => setVisualMode(value as any)} className="mb-4">
          <TabsList className="w-full justify-start mb-2 bg-[#1a1a1a]">
            <TabsTrigger value="waveform" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Waves className="h-4 w-4" />
              <span>Waveform</span>
            </TabsTrigger>
            <TabsTrigger value="circular" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Circle className="h-4 w-4" />
              <span>Circular</span>
            </TabsTrigger>
            <TabsTrigger value="spectrogram" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Activity className="h-4 w-4" />
              <span>Spectrogram</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[#e0e0e0]">
              <Filter className="h-4 w-4 text-amber-300" />
              <Label htmlFor="complexity" className="text-[#e0e0e0]">Complexity:</Label>
            </div>
            <div className="w-32">
              <Slider 
                id="complexity" 
                value={[complexity]} 
                onValueChange={([value]) => setComplexity(value)} 
                min={0.1}
                max={1}
                step={0.1}
                className="[&>[role=slider]]:bg-amber-500"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <Label htmlFor="show-glyphs" className="text-[#e0e0e0]">Show Glyphs:</Label>
            </div>
            <Switch 
              id="show-glyphs" 
              checked={localShowGlyphs} 
              onCheckedChange={(value) => !readOnly && setShowGlyphs(value)}
              className="data-[state=checked]:bg-amber-700"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-amber-300" />
              <Label htmlFor="show-labels" className="text-[#e0e0e0]">Show Labels:</Label>
            </div>
            <Switch 
              id="show-labels" 
              checked={showLabels} 
              onCheckedChange={setShowLabels}
              className="data-[state=checked]:bg-amber-700"
            />
          </div>
        </div>
        
        <div className="relative w-full bg-black rounded-lg overflow-hidden border border-amber-900" style={{ height: '300px' }}>
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%" 
            className="w-full h-full cursor-pointer"
          >
            {/* Background grid */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Render patterns based on visualization mode */}
            {visualMode === 'waveform' && (
              <>
                {/* Waveform view */}
                {patterns.map((pattern, index) => {
                  const svgWidth = svgRef.current?.clientWidth || 800;
                  const svgHeight = svgRef.current?.clientHeight || 300;
                  const path = generateWaveformPath(pattern, svgWidth, svgHeight, time, complexity);
                  const selected = pattern.id === selectedPattern;
                  
                  return (
                    <g key={pattern.id} onClick={() => handlePatternClick(pattern.id)}>
                      {/* Main waveform path */}
                      <path
                        d={path}
                        fill="none"
                        stroke={`hsl(${pattern.colorHue}, 80%, 60%)`}
                        strokeWidth={selected ? 3 : 2}
                        strokeOpacity={selected ? 1 : 0.8}
                        className="transition-all duration-300"
                      />
                      
                      {/* Glow effect */}
                      <path
                        d={path}
                        fill="none"
                        stroke={`hsl(${pattern.colorHue}, 90%, 70%)`}
                        strokeWidth={selected ? 6 : 4}
                        strokeOpacity={selected ? 0.3 : 0.2}
                        filter="blur(4px)"
                        className="transition-all duration-300"
                      />
                      
                      {/* Pattern label */}
                      {showLabels && (
                        <text
                          x={20 + (index * 120)}
                          y={20}
                          fill={`hsl(${pattern.colorHue}, 80%, 70%)`}
                          fontSize="12"
                          fontFamily="monospace"
                          className={selected ? 'font-bold' : ''}
                        >
                          {pattern.id}
                        </text>
                      )}
                      
                      {/* Glyph overlay if enabled */}
                      {showGlyphs && pattern.glyphOverlay && (
                        <text
                          x={svgWidth - 80 + (index * 25)}
                          y={30}
                          fill={`hsl(${pattern.colorHue}, 80%, 70%)`}
                          fontSize="18"
                          fontFamily="serif"
                          className={selected ? 'animate-pulse' : ''}
                        >
                          {pattern.glyphOverlay}
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            )}
            
            {visualMode === 'circular' && (
              <>
                {/* Circular view */}
                {patterns.map((pattern, index) => {
                  const svgWidth = svgRef.current?.clientWidth || 800;
                  const svgHeight = svgRef.current?.clientHeight || 300;
                  const path = generateGlyphPath(pattern, svgWidth, svgHeight, time);
                  const selected = pattern.id === selectedPattern;
                  
                  // Calculate position for stacked circular patterns
                  const centerX = svgWidth / 2;
                  const centerY = svgHeight / 2;
                  
                  return (
                    <g 
                      key={pattern.id} 
                      onClick={() => handlePatternClick(pattern.id)}
                      transform={`translate(${(index - Math.floor(patterns.length / 2)) * 20}, 0)`}
                    >
                      {/* Main glyph path */}
                      <path
                        d={path}
                        fill="none"
                        stroke={`hsl(${pattern.colorHue}, 80%, 60%)`}
                        strokeWidth={selected ? 2.5 : 1.5}
                        strokeOpacity={selected ? 1 : 0.8}
                        className="transition-all duration-300"
                      />
                      
                      {/* Glow effect */}
                      <path
                        d={path}
                        fill="none"
                        stroke={`hsl(${pattern.colorHue}, 90%, 70%)`}
                        strokeWidth={selected ? 5 : 3}
                        strokeOpacity={selected ? 0.3 : 0.2}
                        filter="blur(4px)"
                        className="transition-all duration-300"
                      />
                      
                      {/* Pattern label */}
                      {showLabels && (
                        <text
                          x={centerX - 100 + (index * 50)}
                          y={svgHeight - 20}
                          fill={`hsl(${pattern.colorHue}, 80%, 70%)`}
                          fontSize="12"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className={selected ? 'font-bold' : ''}
                        >
                          {pattern.id}
                        </text>
                      )}
                      
                      {/* Glyph overlay if enabled */}
                      {showGlyphs && pattern.glyphOverlay && (
                        <text
                          x={centerX - 100 + (index * 50)}
                          y={40}
                          fill={`hsl(${pattern.colorHue}, 80%, 70%)`}
                          fontSize="18"
                          fontFamily="serif"
                          textAnchor="middle"
                          className={selected ? 'animate-pulse' : ''}
                        >
                          {pattern.glyphOverlay}
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            )}
            
            {visualMode === 'spectrogram' && (
              <>
                {/* Spectrogram view - simplified representation */}
                <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.3)" />
                
                {patterns.map((pattern, index) => {
                  const svgWidth = svgRef.current?.clientWidth || 800;
                  const svgHeight = svgRef.current?.clientHeight || 300;
                  const selected = pattern.id === selectedPattern;
                  
                  // Calculate frequency band position
                  const maxFreq = Math.max(...patterns.map(p => p.frequency));
                  const yPos = svgHeight - (pattern.frequency / maxFreq) * (svgHeight - 40) - 20;
                  const bandHeight = 10 + pattern.amplitude * 20;
                  
                  // Time-varying intensity based on phase
                  const intensityOffset = Math.sin(pattern.phase + time * pattern.frequency) * 20;
                  
                  return (
                    <g key={pattern.id} onClick={() => handlePatternClick(pattern.id)}>
                      {/* Frequency band */}
                      <rect
                        x={20}
                        y={yPos - bandHeight / 2}
                        width={svgWidth - 40}
                        height={bandHeight}
                        fill={`hsl(${pattern.colorHue}, 80%, ${40 + intensityOffset}%)`}
                        fillOpacity={selected ? 0.8 : 0.6}
                        rx={3}
                        className="transition-all duration-300"
                      />
                      
                      {/* Harmonics */}
                      {showHarmonics && pattern.harmonics.map((harmonic, hIndex) => {
                        const harmYPos = svgHeight - (pattern.frequency * harmonic / maxFreq) * (svgHeight - 40) - 20;
                        if (harmYPos < 10) return null; // Skip if out of bounds
                        
                        return (
                          <rect
                            key={`${pattern.id}-h${hIndex}`}
                            x={20}
                            y={harmYPos - (bandHeight / 3) / 2}
                            width={svgWidth - 40}
                            height={bandHeight / 3}
                            fill={`hsl(${pattern.colorHue}, 60%, ${30 + intensityOffset/2}%)`}
                            fillOpacity={selected ? 0.7 : 0.4}
                            rx={2}
                            className="transition-all duration-300"
                          />
                        );
                      })}
                      
                      {/* Pattern label */}
                      {showLabels && (
                        <text
                          x={10}
                          y={yPos + 4}
                          fill={`hsl(${pattern.colorHue}, 80%, 70%)`}
                          fontSize="11"
                          fontFamily="monospace"
                          className={selected ? 'font-bold' : ''}
                        >
                          {pattern.id}
                        </text>
                      )}
                      
                      {/* Frequency value */}
                      {showLabels && (
                        <text
                          x={svgWidth - 60}
                          y={yPos + 4}
                          fill={`hsl(${pattern.colorHue}, 80%, 70%)`}
                          fontSize="11"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {pattern.frequency.toFixed(1)} Hz
                        </text>
                      )}
                      
                      {/* Glyph overlay if enabled */}
                      {showGlyphs && pattern.glyphOverlay && (
                        <text
                          x={svgWidth - 30}
                          y={yPos + 5}
                          fill={`hsl(${pattern.colorHue}, 80%, 70%)`}
                          fontSize="14"
                          fontFamily="serif"
                          textAnchor="middle"
                          className={selected ? 'animate-pulse' : ''}
                        >
                          {pattern.glyphOverlay}
                        </text>
                      )}
                    </g>
                  );
                })}
                
                {/* Axis labels */}
                <text x="10" y="15" fill="#888" fontSize="10">
                  Frequency (Hz)
                </text>
                <text x={svgRef.current?.clientWidth ? svgRef.current.clientWidth - 10 : 790} y={svgRef.current?.clientHeight ? svgRef.current.clientHeight - 5 : 295} fill="#888" fontSize="10" textAnchor="end">
                  Time
                </text>
              </>
            )}
            
            {/* Time marker for spectrogram */}
            {visualMode === 'spectrogram' && (
              <line
                x1={(time % 10) * (svgRef.current?.clientWidth || 800) / 10}
                y1={0}
                x2={(time % 10) * (svgRef.current?.clientWidth || 800) / 10}
                y2={svgRef.current?.clientHeight || 300}
                stroke="rgba(255, 215, 0, 0.5)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
            )}
          </svg>
          
          {/* Selected pattern details overlay */}
          {selectedPatternDetails && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/80 rounded-lg border border-amber-700 text-[#e0e0e0]">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {selectedPatternDetails.type === 'primary' && <Zap className="h-4 w-4 text-amber-300" />}
                {selectedPatternDetails.type === 'secondary' && <Waves className="h-4 w-4 text-amber-300" />}
                {selectedPatternDetails.type === 'tertiary' && <Activity className="h-4 w-4 text-amber-300" />}
                {selectedPatternDetails.type === 'artifact' && <ArrowRight className="h-4 w-4 text-amber-300" />}
                {selectedPatternDetails.id}
                {selectedPatternDetails.glyphOverlay && (
                  <span className="ml-2 text-amber-200">{selectedPatternDetails.glyphOverlay}</span>
                )}
              </h4>
              
              <div className="mt-2 text-xs text-[#aaaaaa] grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex justify-between">
                  <span>Frequency:</span>
                  <span className="font-medium text-amber-300">
                    {selectedPatternDetails.frequency.toFixed(1)} Hz
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Amplitude:</span>
                  <span className="font-medium text-amber-300">
                    {(selectedPatternDetails.amplitude * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Phase:</span>
                  <span className="font-medium text-amber-300">
                    {(selectedPatternDetails.phase / Math.PI).toFixed(2)}π
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Harmonics:</span>
                  <span className="font-medium text-amber-300">
                    {selectedPatternDetails.harmonics.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between text-[#aaaaaa]">
        <div className="text-xs">
          {patterns.filter(p => p.type === 'primary').length} Primary, {' '}
          {patterns.filter(p => p.type === 'secondary').length} Secondary, {' '}
          {patterns.filter(p => p.type === 'tertiary' || p.type === 'artifact').length} Other
        </div>
        
        <div className="flex items-center space-x-2">
          <Waves className="h-4 w-4 text-amber-300" />
          <span className="text-xs">
            Time: {time.toFixed(2)}s
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}