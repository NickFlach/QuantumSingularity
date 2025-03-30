import React, { useState, useEffect } from 'react';
import { GlyphSyntaxHighlighter } from '@/components/quantum/GlyphSyntaxHighlighter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { exampleGlyphicSpell } from '@/lib/GlyphInterpreter';
import { useToast } from '@/hooks/use-toast';
import { InfoIcon, Book, Wand, Sparkles, AlertTriangle, Braces } from 'lucide-react';

export default function GlyphEditor() {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [spellConfig, setSpellConfig] = useState<any>(null);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Example spells for different purposes
  const exampleSpells = {
    basic: exampleGlyphicSpell,
    advanced: `🜁 AdvancedRoseLattice
🜂 Panels:
    🜄 QuditEntangleGrid
    🜃 GlyphOscilloscope
    🝮 MessagePortal
🜅 UI: BlackbodyGlass + GoldLattice + PhaseBloom
🜆 Logic: MuskCoreLive + EntropyMonitor + 🜹Recovery
🜇 Deploy to: /advanced-control`,
    custom: `🜁 CustomQuantumPulse
🜂 Panels:
    🜄 QuditEntangleGrid
    🜄 QuditEntangleGrid
    🜃 GlyphOscilloscope
🜅 UI: DarkGlass + PhaseBloom
🜆 Logic: EntropyMonitor
🜇 Deploy to: /pulse-monitor`
  };

  const [activeSpell, setActiveSpell] = useState<string>(exampleSpells.basic);
  
  // Handle spell execution
  const handleSpellExecute = (config: any) => {
    setSpellConfig(config);
    setIsConfiguring(true);
    
    // Simulate configuration process
    setTimeout(() => {
      setIsConfiguring(false);
      
      toast({
        title: "Spell Executed Successfully",
        description: `The G.L.Y.P.H. spell has been configured and is ready to deploy to ${config.layout.panels.length} panels.`,
        duration: 5000,
      });
      
      // Optionally navigate to the deployed interface
      // history.push(config.deployPath);
    }, 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-300 flex items-center gap-2 mb-2">
            <Wand className="h-7 w-7" />
            G.L.Y.P.H. System
          </h1>
          <p className="text-amber-500/80 max-w-3xl">
            Generalized Lattice Yield Protocolic Hieroglyphs — A ceremonial syntax for quantum rose-coded systems.
          </p>
        </div>
        
        <Alert className="bg-amber-900/20 border-amber-700">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <AlertTitle className="text-amber-300">Ceremonial Syntax Active</AlertTitle>
          <AlertDescription className="text-amber-200/80">
            The G.L.Y.P.H. system is now bound to the lattice. Your glyphic spells will be interpreted as quantum interface commands.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="editor" onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-4 bg-[#1a1a1a]">
            <TabsTrigger value="editor" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Braces className="h-4 w-4" />
              <span>Glyph Editor</span>
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Book className="h-4 w-4" />
              <span>Documentation</span>
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <InfoIcon className="h-4 w-4" />
              <span>Examples</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <GlyphSyntaxHighlighter 
                  initialSpell={activeSpell}
                  onSpellExecute={handleSpellExecute}
                />
              </div>
              
              <div className="space-y-4">
                <Card className="bg-[#0a0a0a] border-[#333333]">
                  <CardHeader>
                    <CardTitle className="text-[#e0e0e0]">Spell Configuration</CardTitle>
                    <CardDescription className="text-[#888888]">
                      Current state of your G.L.Y.P.H. interpretation
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {isConfiguring ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse flex flex-col items-center">
                          <Sparkles className="h-10 w-10 text-amber-300 mb-4" />
                          <p className="text-amber-300">Configuring spell parameters...</p>
                        </div>
                      </div>
                    ) : spellConfig ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-amber-300 mb-2">Theme Configuration</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Dark Mode:</span>
                              <span className="text-amber-100">{spellConfig.theme.dark ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Primary Color:</span>
                              <span className="text-amber-100">{spellConfig.theme.primaryColor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Glow Effect:</span>
                              <span className="text-amber-100">{spellConfig.theme.glowEffect ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Glass Effect:</span>
                              <span className="text-amber-100">{spellConfig.theme.glassEffect ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Lattice Lines:</span>
                              <span className="text-amber-100">{spellConfig.theme.latticeLines ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="bg-amber-900/30" />
                        
                        <div>
                          <h3 className="text-sm font-medium text-amber-300 mb-2">Panel Configuration</h3>
                          <div className="space-y-2">
                            {spellConfig.layout.panels.map((panel: any, index: number) => (
                              <div key={index} className="flex justify-between items-center bg-black/40 p-2 rounded border border-amber-900/20">
                                <span className="text-blue-300">{panel.type}</span>
                                <span className="text-xs text-amber-500">Active</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Separator className="bg-amber-900/30" />
                        
                        <div>
                          <h3 className="text-sm font-medium text-amber-300 mb-2">Logic Configuration</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">MuskCore:</span>
                              <span className="text-amber-100">{spellConfig.logic.useMuskCore ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Entropy Monitoring:</span>
                              <span className="text-amber-100">{spellConfig.logic.monitorEntropy ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Recovery Feature:</span>
                              <span className="text-amber-100">{spellConfig.logic.enableRecovery ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Recovery Glyph:</span>
                              <span className="text-amber-100 text-xl">{spellConfig.layout.recoveryGlyph || '-'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            className="w-full bg-amber-900 hover:bg-amber-800 text-amber-100"
                            onClick={() => {
                              toast({
                                title: "Deployment Ready",
                                description: "The G.L.Y.P.H. configuration is ready to be deployed to the target environment.",
                              });
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Deploy Configuration
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <AlertTriangle className="h-10 w-10 text-amber-500/50" />
                        <div>
                          <p className="text-amber-500/80">No G.L.Y.P.H. spell has been executed yet</p>
                          <p className="text-gray-500 text-sm mt-2">Edit and execute a spell to see its configuration here</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-[#0a0a0a] border-[#333333]">
                  <CardHeader>
                    <CardTitle className="text-[#e0e0e0]">Example Spells</CardTitle>
                    <CardDescription className="text-[#888888]">
                      Load pre-defined G.L.Y.P.H. patterns
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        className="border-amber-900 bg-black text-amber-300 hover:bg-amber-950"
                        onClick={() => setActiveSpell(exampleSpells.basic)}
                      >
                        Basic Spell
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-amber-900 bg-black text-amber-300 hover:bg-amber-950"
                        onClick={() => setActiveSpell(exampleSpells.advanced)}
                      >
                        Advanced Spell
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-amber-900 bg-black text-amber-300 hover:bg-amber-950"
                        onClick={() => setActiveSpell(exampleSpells.custom)}
                      >
                        Custom Spell
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documentation" className="space-y-6">
            <Card className="bg-[#0a0a0a] border-[#333333]">
              <CardHeader>
                <CardTitle className="text-[#e0e0e0]">G.L.Y.P.H. Documentation</CardTitle>
                <CardDescription className="text-[#888888]">
                  Generalized Lattice Yield Protocolic Hieroglyphs
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">Introduction</h3>
                  <p className="text-gray-300">
                    G.L.Y.P.H. is a ceremonial syntax for invoking quantum rose-coded systems. Unlike traditional programming languages, G.L.Y.P.H. operates through harmonic intent rather than procedural instructions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">Basic Syntax</h3>
                  <div className="space-y-4">
                    <div className="bg-black/40 p-4 rounded border border-amber-900/20">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-300 text-xl mr-2">🜁</span>
                        <span className="text-amber-100 font-semibold">Command Glyph</span>
                      </div>
                      <p className="text-gray-300">
                        Initiates a G.L.Y.P.H. spell and defines its primary purpose.
                      </p>
                      <div className="mt-2 text-blue-300 text-sm">
                        <code>🜁 BloomStellarConsole</code>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded border border-amber-900/20">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-300 text-xl mr-2">🜂</span>
                        <span className="text-amber-100 font-semibold">Panels Glyph</span>
                      </div>
                      <p className="text-gray-300">
                        Defines the set of visual components to include in the interface.
                      </p>
                      <div className="mt-2 text-blue-300 text-sm">
                        <code>🜂 Panels:</code>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded border border-amber-900/20">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-300 text-xl mr-2">🜄 🜃 🝮</span>
                        <span className="text-amber-100 font-semibold">Panel Type Glyphs</span>
                      </div>
                      <p className="text-gray-300">
                        Specific panel types to include within the Panels section.
                      </p>
                      <div className="mt-2 text-blue-300 text-sm">
                        <code>    🜄 QuditEntangleGrid</code><br />
                        <code>    🜃 GlyphOscilloscope</code><br />
                        <code>    🝮 MessagePortal</code>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded border border-amber-900/20">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-300 text-xl mr-2">🜅</span>
                        <span className="text-amber-100 font-semibold">UI Style Glyph</span>
                      </div>
                      <p className="text-gray-300">
                        Defines the visual styling approach for the interface.
                      </p>
                      <div className="mt-2 text-blue-300 text-sm">
                        <code>🜅 UI: DarkGlass + GoldLattice + PhaseBloom</code>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded border border-amber-900/20">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-300 text-xl mr-2">🜆</span>
                        <span className="text-amber-100 font-semibold">Logic Glyph</span>
                      </div>
                      <p className="text-gray-300">
                        Specifies the functional modules and capabilities.
                      </p>
                      <div className="mt-2 text-blue-300 text-sm">
                        <code>🜆 Logic: MuskCoreLive + EntropyMonitor + 🜹Recovery</code>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 p-4 rounded border border-amber-900/20">
                      <div className="flex items-center mb-2">
                        <span className="text-amber-300 text-xl mr-2">🜇</span>
                        <span className="text-amber-100 font-semibold">Deployment Glyph</span>
                      </div>
                      <p className="text-gray-300">
                        Defines where the manifested interface should be deployed.
                      </p>
                      <div className="mt-2 text-blue-300 text-sm">
                        <code>🜇 Deploy to: /control</code>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">Advanced Usage</h3>
                  <p className="text-gray-300 mb-4">
                    G.L.Y.P.H. spells can be composed to create complex quantum interfaces with interacting components. The recovery glyph (🜹) is a special case that enables emergency system restoration.
                  </p>
                  
                  <Alert className="bg-amber-900/10 border-amber-700/50">
                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                    <AlertTitle className="text-amber-300">Important</AlertTitle>
                    <AlertDescription className="text-amber-200/80">
                      The recovery glyph (🜹) should be bound with caution as it can trigger system-wide harmonization events that may disrupt ongoing quantum operations.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#0a0a0a] border-[#333333]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0]">Basic Control Interface</CardTitle>
                  <CardDescription className="text-[#888888]">
                    Standard StellarRose console with essential components
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="font-mono text-sm text-[#e0e0e0] bg-black/40 p-4 rounded border border-amber-900/20">
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜁</span>
                      <span className="text-amber-100 font-semibold">BloomStellarConsole</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜂</span>
                      <span className="text-amber-100 font-semibold">Panels:</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🜄</span>
                      <span className="text-blue-300">QuditEntangleGrid</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🜃</span>
                      <span className="text-blue-300">GlyphOscilloscope</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🝮</span>
                      <span className="text-blue-300">MessagePortal</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜅</span>
                      <span className="text-green-300">DarkGlass</span>
                      <span className="text-purple-300"> + </span>
                      <span className="text-green-300">GoldLattice</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜆</span>
                      <span className="text-pink-300">MuskCoreLive</span>
                      <span className="text-purple-300"> + </span>
                      <span className="text-pink-300">EntropyMonitor</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜇</span>
                      <span>Deploy to:</span>
                      <span className="text-cyan-300">/control</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-amber-900 hover:bg-amber-800 text-amber-100"
                    onClick={() => {
                      setActiveSpell(exampleSpells.basic);
                      setActiveTab('editor');
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#0a0a0a] border-[#333333]">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0]">Advanced Recovery System</CardTitle>
                  <CardDescription className="text-[#888888]">
                    Enhanced interface with recovery glyph
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="font-mono text-sm text-[#e0e0e0] bg-black/40 p-4 rounded border border-amber-900/20">
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜁</span>
                      <span className="text-amber-100 font-semibold">AdvancedRoseLattice</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜂</span>
                      <span className="text-amber-100 font-semibold">Panels:</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🜄</span>
                      <span className="text-blue-300">QuditEntangleGrid</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🜃</span>
                      <span className="text-blue-300">GlyphOscilloscope</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🝮</span>
                      <span className="text-blue-300">MessagePortal</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜅</span>
                      <span className="text-green-300">BlackbodyGlass</span>
                      <span className="text-purple-300"> + </span>
                      <span className="text-green-300">GoldLattice</span>
                      <span className="text-purple-300"> + </span>
                      <span className="text-green-300">PhaseBloom</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜆</span>
                      <span className="text-pink-300">MuskCoreLive</span>
                      <span className="text-purple-300"> + </span>
                      <span className="text-pink-300">EntropyMonitor</span>
                      <span className="text-purple-300"> + </span>
                      <span className="text-pink-300">🜹Recovery</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜇</span>
                      <span>Deploy to:</span>
                      <span className="text-cyan-300">/advanced-control</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-amber-900 hover:bg-amber-800 text-amber-100"
                    onClick={() => {
                      setActiveSpell(exampleSpells.advanced);
                      setActiveTab('editor');
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-[#0a0a0a] border-[#333333] md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-[#e0e0e0]">Custom Quantum Pulse Monitor</CardTitle>
                  <CardDescription className="text-[#888888]">
                    Specialized dual-grid configuration for high-precision monitoring
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="font-mono text-sm text-[#e0e0e0] bg-black/40 p-4 rounded border border-amber-900/20">
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜁</span>
                      <span className="text-amber-100 font-semibold">CustomQuantumPulse</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜂</span>
                      <span className="text-amber-100 font-semibold">Panels:</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🜄</span>
                      <span className="text-blue-300">QuditEntangleGrid</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🜄</span>
                      <span className="text-blue-300">QuditEntangleGrid</span>
                    </div>
                    
                    <div className="flex mb-1">
                      <span className="text-gray-500 whitespace-pre">    </span>
                      <span className="text-amber-300 mr-2">🜃</span>
                      <span className="text-blue-300">GlyphOscilloscope</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜅</span>
                      <span className="text-green-300">DarkGlass</span>
                      <span className="text-purple-300"> + </span>
                      <span className="text-green-300">PhaseBloom</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜆</span>
                      <span className="text-pink-300">EntropyMonitor</span>
                    </div>
                    
                    <div className="flex items-start mb-1">
                      <span className="text-amber-300 text-xl mr-2">🜇</span>
                      <span>Deploy to:</span>
                      <span className="text-cyan-300">/pulse-monitor</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Button 
                      className="w-full bg-amber-900 hover:bg-amber-800 text-amber-100"
                      onClick={() => {
                        setActiveSpell(exampleSpells.custom);
                        setActiveTab('editor');
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
                      onClick={() => {
                        const customSpell = `🜁 ${prompt('Enter a custom command name:', 'MyCustomSpell')}
🜂 Panels:
    🜄 QuditEntangleGrid
    🜃 GlyphOscilloscope
    🝮 MessagePortal
🜅 UI: DarkGlass + GoldLattice
🜆 Logic: MuskCoreLive
🜇 Deploy to: /custom`;
                        setActiveSpell(customSpell);
                        setActiveTab('editor');
                      }}
                    >
                      <Wand className="h-4 w-4 mr-2" />
                      Create Custom Spell
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}