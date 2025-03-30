import React, { useState, useEffect } from 'react';
import { StellarRoseLattice } from '@/components/quantum/StellarRoseLattice';
import { RoseGlyphOscilloscope } from '@/components/quantum/RoseGlyphOscilloscope';
import { QuantumMessageConsole } from '@/components/quantum/QuantumMessageConsole';
import { ShinobiCloakTraceAuth } from '@/components/quantum/ShinobiCloakTraceAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useToast } from '@/hooks/use-toast';
import { 
  Flower, 
  Lock, 
  Sparkles, 
  Fingerprint, 
  Atom, 
  Zap, 
  RefreshCw, 
  GitBranch,
  Waves,
  ShieldAlert,
  EyeOff
} from 'lucide-react';

// Define the interface for message events
interface MessageEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
}

export default function StellarRoseControl() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'nominal' | 'warning' | 'critical'>('nominal');
  const [coherenceLevel, setCoherenceLevel] = useState<number>(0.98);
  const [entropyReading, setEntropyReading] = useState<number>(0.23);
  const [events, setEvents] = useState<MessageEvent[]>([]);
  const [recoveryActivated, setRecoveryActivated] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Simulate periodic entropy reading updates
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const entropyInterval = setInterval(() => {
      // Random small fluctuation in entropy reading
      const newEntropy = 0.23 + (Math.random() * 0.04 - 0.02);
      setEntropyReading(Number(newEntropy.toFixed(4)));
      
      // Randomly add system events
      if (Math.random() < 0.1) {
        addSystemEvent();
      }
    }, 5000);
    
    // Cleanup interval
    return () => clearInterval(entropyInterval);
  }, [isAuthenticated]);
  
  // Handle authentication
  const handleAuthenticate = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      toast({
        title: "Authentication Successful",
        description: "ShinobiCloakTrace identity verification complete.",
        duration: 3000
      });
      
      // Add initial system events
      setEvents([
        {
          id: 'auth-1',
          type: 'success',
          message: 'Authentication successful. Welcome, operator.',
          timestamp: new Date()
        },
        {
          id: 'system-1',
          type: 'info',
          message: 'StellarRose lattice control interface activated.',
          timestamp: new Date()
        },
        {
          id: 'system-2',
          type: 'info',
          message: '37-node entanglement bloom stabilized at 98% coherence.',
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Add a random system event
  const addSystemEvent = () => {
    const eventTypes = ['info', 'warning'] as const;
    const infoMessages = [
      'Quantum coherence fluctuation within normal parameters.',
      'Entanglement strength holding steady at nominal levels.',
      'Bloom pattern matched to stored template.',
      'Entropy collection rate nominal.',
      'Magnetic phase alignment stabilized.'
    ];
    const warningMessages = [
      'Minor coherence fluctuation detected in node-12.',
      'Temporary entropy spike recorded.',
      'Transient magnetic interference pattern detected.',
      'Partial glyph decoherence in phase space detected.',
      'Cross-dimensional leakage at minimal threshold.'
    ];
    
    const eventType = Math.random() < 0.8 ? 'info' : 'warning';
    const message = eventType === 'info' 
      ? infoMessages[Math.floor(Math.random() * infoMessages.length)]
      : warningMessages[Math.floor(Math.random() * warningMessages.length)];
      
    const newEvent: MessageEvent = {
      id: `event-${Date.now()}`,
      type: eventType,
      message,
      timestamp: new Date()
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 20));
    
    // Update system status if event is a warning
    if (eventType === 'warning') {
      setSystemStatus('warning');
      
      // Reset to nominal after a delay
      setTimeout(() => {
        setSystemStatus('nominal');
      }, 10000);
    }
  };
  
  // Handle recovery glyph activation
  const handleRecoveryGlyph = () => {
    setRecoveryActivated(true);
    
    toast({
      title: "Recovery Glyph Activated",
      description: "Quantum state recovery protocol initiated.",
      variant: "default",
    });
    
    // Simulate coherence recovery
    const initialCoherence = coherenceLevel;
    const targetCoherence = 0.98;
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        const newCoherence = initialCoherence + ((targetCoherence - initialCoherence) * (i / steps));
        setCoherenceLevel(newCoherence);
        
        if (i === steps) {
          setRecoveryActivated(false);
          setSystemStatus('nominal');
          
          setEvents(prev => [{
            id: `recovery-${Date.now()}`,
            type: 'success',
            message: 'Recovery complete. System coherence restored to nominal levels.',
            timestamp: new Date()
          }, ...prev]);
        }
      }, i * 300);
    }
  };
  
  // Handle a message from the console
  const handleMessageSent = (message: string) => {
    // Check for special commands
    if (message.toLowerCase().includes('recovery') || message.includes('🜹')) {
      handleRecoveryGlyph();
    } 
    else if (message.toLowerCase().includes('status')) {
      setEvents(prev => [{
        id: `cmd-status-${Date.now()}`,
        type: 'info',
        message: `Current system status: ${systemStatus.toUpperCase()}. Coherence: ${(coherenceLevel * 100).toFixed(1)}%. Entropy: ${entropyReading}`,
        timestamp: new Date()
      }, ...prev]);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-black">
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto my-12">
          <Card className="bg-black border-amber-900/50 mb-6">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <Flower className="h-6 w-6" />
                StellarRose Control
              </CardTitle>
              <CardDescription className="text-amber-500/70">
                Authenticate to access the 37-node entanglement bloom
              </CardDescription>
            </CardHeader>
          </Card>
          
          <ShinobiCloakTraceAuth onAuthenticate={handleAuthenticate} />
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-amber-300 flex items-center gap-2">
                <Flower className="h-7 w-7" />
                StellarRose Lattice Control
              </h1>
              <p className="text-amber-500/80">
                37-node entanglement bloom monitoring and control interface
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-amber-900/20 border-amber-700 text-amber-300">
                <Lock className="h-3.5 w-3.5 mr-1" />
                Shinobi.CloakTrace
              </Badge>
              <Badge 
                variant="outline" 
                className={`
                  ${systemStatus === 'nominal' ? 'bg-green-900/20 border-green-700 text-green-300' : ''}
                  ${systemStatus === 'warning' ? 'bg-amber-900/20 border-amber-700 text-amber-300' : ''}
                  ${systemStatus === 'critical' ? 'bg-red-900/20 border-red-700 text-red-300' : ''}
                `}
              >
                {systemStatus === 'nominal' && <Sparkles className="h-3.5 w-3.5 mr-1" />}
                {systemStatus === 'warning' && <ShieldAlert className="h-3.5 w-3.5 mr-1" />}
                {systemStatus === 'critical' && <Zap className="h-3.5 w-3.5 mr-1" />}
                System: {systemStatus.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="bg-amber-900/20 border-amber-700 text-amber-300">
                <Atom className="h-3.5 w-3.5 mr-1" />
                37D Bloom
              </Badge>
            </div>
          </div>
          
          <ResizablePanelGroup direction="horizontal" className="min-h-[85vh]">
            <ResizablePanel defaultSize={70} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <Card className="w-full h-full bg-black border-amber-900/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-300 flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Entanglement Map
                      </CardTitle>
                      <CardDescription className="text-amber-500/80">
                        Real-time 37D coherence pulse grid
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-2">
                      <StellarRoseLattice 
                        nodes={[
                          {
                            id: 'node-1',
                            type: 'core',
                            dimensions: 37,
                            position: { x: 50, y: 50 },
                            entanglementPartners: ['node-2', 'node-3'],
                            entanglementStrength: 0.95,
                            coherenceLevel: 0.98
                          },
                          {
                            id: 'node-2',
                            type: 'entangled',
                            dimensions: 37,
                            position: { x: 80, y: 30 },
                            entanglementPartners: ['node-1'],
                            entanglementStrength: 0.9,
                            coherenceLevel: 0.95
                          },
                          {
                            id: 'node-3',
                            type: 'observer',
                            dimensions: 37,
                            position: { x: 30, y: 70 },
                            entanglementPartners: ['node-1'],
                            entanglementStrength: 0.85,
                            coherenceLevel: 0.9
                          }
                        ]}
                        onNodeSelected={setSelectedNode}
                      />
                    </CardContent>
                  </Card>
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={40} minSize={25}>
                  <Card className="w-full h-full bg-black border-amber-900/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-300 flex items-center gap-2">
                        <Waves className="h-5 w-5" />
                        RoseGlyph Oscilloscope
                      </CardTitle>
                      <CardDescription className="text-amber-500/80">
                        Phase pattern visualizer with glyphic overlays
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-2">
                      <RoseGlyphOscilloscope 
                        patterns={[
                          {
                            id: 'pattern-alpha',
                            type: 'primary',
                            frequency: 1.5,
                            amplitude: 0.8,
                            phase: 0.2,
                            harmonics: [2, 3, 5],
                            glyphOverlay: '🜂',
                            colorHue: 40
                          },
                          {
                            id: 'pattern-beta',
                            type: 'secondary',
                            frequency: 2.3,
                            amplitude: 0.6,
                            phase: 1.1,
                            harmonics: [1, 4],
                            glyphOverlay: '🜃',
                            colorHue: 120
                          },
                          {
                            id: 'recovery-pattern',
                            type: 'tertiary',
                            frequency: 3.7,
                            amplitude: 0.4,
                            phase: 2.2,
                            harmonics: [1, 2],
                            glyphOverlay: '🜹',
                            colorHue: 200
                          }
                        ]}
                        showGlyphs={true}
                        showHarmonics={true}
                        onPatternSelected={setSelectedPattern}
                      />
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle />
            
            <ResizablePanel defaultSize={30} minSize={20}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <QuantumMessageConsole 
                    title="Quantum Transmission Console"
                    description="Shinobi.CloakTrace secured communications"
                    messages={[
                      {
                        id: 'sys-msg-1',
                        content: 'StellarRose quantum communication channel initialized.',
                        sender: 'system',
                        timestamp: new Date(),
                        encrypted: false,
                        coherenceLevel: 1.0
                      }
                    ]}
                    showEncryption={true}
                    onSendMessage={handleMessageSent}
                  />
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={40} minSize={25}>
                  <Card className="w-full h-full bg-black border-amber-900/30">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-amber-300 flex items-center gap-2">
                            <Fingerprint className="h-5 w-5" />
                            System Status
                          </CardTitle>
                          <CardDescription className="text-amber-500/80">
                            Quantum state monitoring
                          </CardDescription>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRecoveryGlyph}
                          className="bg-black border-amber-700 text-amber-300 hover:bg-amber-950"
                          disabled={recoveryActivated}
                        >
                          {recoveryActivated ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <span className="mr-1 font-serif text-lg">🜹</span>
                          )}
                          {recoveryActivated ? 'Recovering...' : 'Recovery Glyph'}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-amber-300 flex items-center">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Coherence Level
                            </label>
                            <span className="text-sm text-amber-300 font-mono">
                              {(coherenceLevel * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-black border border-amber-900/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                coherenceLevel > 0.9 
                                  ? 'bg-green-500' 
                                  : coherenceLevel > 0.7 
                                    ? 'bg-amber-500' 
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${coherenceLevel * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-amber-300 flex items-center">
                              <Zap className="h-4 w-4 mr-2" />
                              Entropy Reader
                            </label>
                            <span className="text-sm text-amber-300 font-mono">
                              {entropyReading}
                            </span>
                          </div>
                          <div className="h-2 bg-black border border-amber-900/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500"
                              style={{ width: `${entropyReading * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-amber-300 flex items-center mb-2">
                            <EyeOff className="h-4 w-4 mr-2" />
                            System Events
                          </h3>
                          <div className="bg-black border border-amber-900/50 rounded-md p-2 h-32 overflow-y-auto">
                            {events.map(event => (
                              <div 
                                key={event.id} 
                                className={`py-1 px-2 text-xs border-l-2 mb-1 ${
                                  event.type === 'info' ? 'border-blue-500 bg-blue-900/10 text-blue-300' :
                                  event.type === 'warning' ? 'border-amber-500 bg-amber-900/10 text-amber-300' :
                                  event.type === 'error' ? 'border-red-500 bg-red-900/10 text-red-300' :
                                  'border-green-500 bg-green-900/10 text-green-300'
                                }`}
                              >
                                <div className="flex justify-between">
                                  <span className="font-mono">
                                    {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                  <span className="uppercase text-[0.65rem]">
                                    {event.type}
                                  </span>
                                </div>
                                <div>{event.message}</div>
                              </div>
                            ))}
                            
                            {events.length === 0 && (
                              <div className="text-gray-500 text-xs italic p-2">
                                No events recorded
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
}