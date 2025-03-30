import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseGlyphicSpell, generateUIConfig } from '@/lib/GlyphInterpreter';
import { CircleOff, Code, CopyCheck, RotateCw, Terminal, Sparkles, GitBranch, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GlyphSyntaxHighlighterProps {
  initialSpell?: string;
  onSpellExecute?: (spell: any) => void;
  readOnly?: boolean;
}

/**
 * Component for editing, highlighting, and executing G.L.Y.P.H. spells
 */
export function GlyphSyntaxHighlighter({
  initialSpell = '',
  onSpellExecute,
  readOnly = false
}: GlyphSyntaxHighlighterProps) {
  const [spellText, setSpellText] = useState<string>(initialSpell);
  const [parsedSpell, setParsedSpell] = useState<any>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; errors?: string[] } | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const { toast } = useToast();
  
  // Parse spell when text changes
  useEffect(() => {
    try {
      // Clear verification and execution results when text changes
      setVerificationResult(null);
      setExecutionResult(null);
      
      if (spellText.trim()) {
        const parsed = parseGlyphicSpell(spellText);
        setParsedSpell(parsed);
      } else {
        setParsedSpell(null);
      }
    } catch (error) {
      console.error('Error parsing glyphic spell:', error);
      setParsedSpell(null);
    }
  }, [spellText]);
  
  // Clear execution result when verification result changes
  useEffect(() => {
    if (verificationResult) {
      setExecutionResult(null);
    }
  }, [verificationResult]);
  
  // Highlight the G.L.Y.P.H. syntax
  const highlightSyntax = (text: string) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Command headers (start with 🜁, 🜂, etc.)
      if (/^[🜁🜂🜃🜄🜅🜆🜇]/.test(trimmedLine)) {
        const [glyph, ...rest] = trimmedLine.split(' ');
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="text-amber-300 text-xl mr-2">{glyph}</span>
            <span className="text-amber-100 font-semibold">{rest.join(' ')}</span>
          </div>
        );
      }
      
      // Indented glyphs (panel definitions, etc.)
      if (/^\s+[🜁🜂🜃🜄🜅🜆🜇🝮🜹]/.test(line)) {
        const indentMatch = line.match(/^(\s+)(.*)$/);
        if (indentMatch) {
          const [, indent, content] = indentMatch;
          const [glyph, ...rest] = content.split(' ');
          return (
            <div key={index} className="flex mb-1">
              <span className="text-gray-500 whitespace-pre">{indent}</span>
              <span className="text-amber-300 mr-2">{glyph}</span>
              <span className="text-blue-300">{rest.join(' ')}</span>
            </div>
          );
        }
      }
      
      // Style definitions with + signs
      if (/(DarkGlass|GoldLattice|PhaseBloom|BlackbodyGlass)/.test(trimmedLine)) {
        return (
          <div key={index} className="mb-1">
            <span className="whitespace-pre">{line.match(/^(\s*)/)?.[0]}</span>
            {line.split('+').map((part, i) => (
              <React.Fragment key={i}>
                <span className="text-green-300">{part.trim()}</span>
                {i < line.split('+').length - 1 && <span className="text-purple-300"> + </span>}
              </React.Fragment>
            ))}
          </div>
        );
      }
      
      // Logic modules with + signs
      if (/(MuskCore|Entropy|Recovery)/.test(trimmedLine)) {
        return (
          <div key={index} className="mb-1">
            <span className="whitespace-pre">{line.match(/^(\s*)/)?.[0]}</span>
            {line.split('+').map((part, i) => (
              <React.Fragment key={i}>
                <span className="text-pink-300">{part.trim()}</span>
                {i < line.split('+').length - 1 && <span className="text-purple-300"> + </span>}
              </React.Fragment>
            ))}
          </div>
        );
      }
      
      // Deploy paths
      if (/Deploy to:/.test(trimmedLine)) {
        const parts = line.split(':');
        return (
          <div key={index} className="mb-1">
            <span className="whitespace-pre">{line.match(/^(\s*)/)?.[0]}</span>
            <span>{parts[0]}:</span>
            <span className="text-cyan-300">{parts.slice(1).join(':')}</span>
          </div>
        );
      }
      
      // Default rendering
      return <div key={index} className="mb-1 text-gray-300">{line}</div>;
    });
  };
  
  // Verify the spell with the backend API
  const verifySpell = async () => {
    if (!spellText.trim()) return;
    
    setVerifying(true);
    setVerificationResult(null);
    
    try {
      const response = await fetch('/api/glyph/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spellText }),
      });
      
      const result = await response.json();
      setVerificationResult(result);
      
      if (result.valid) {
        toast({
          title: "Spell Verified",
          description: "G.L.Y.P.H. spell is valid and ready for execution.",
          className: "bg-green-950 border-green-800"
        });
      } else {
        toast({
          title: "Verification Failed",
          description: `G.L.Y.P.H. spell has issues: ${result.errors?.join(", ")}`,
          variant: "destructive",
        });
      }
      
      return result.valid;
    } catch (error) {
      console.error('Error verifying spell:', error);
      toast({
        title: "Verification Error",
        description: "Failed to communicate with the G.L.Y.P.H. binding service.",
        variant: "destructive",
      });
      return false;
    } finally {
      setVerifying(false);
    }
  };
  
  // Execute the parsed spell
  const executeSpell = async () => {
    if (!parsedSpell) return;
    
    // First verify the spell
    const isValid = await verifySpell();
    if (!isValid) return;
    
    setExecuting(true);
    
    try {
      // Call the backend execution API
      const response = await fetch('/api/glyph/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spellText }),
      });
      
      const result = await response.json();
      setExecutionResult(result);
      
      // Generate UI configuration from the spell for local display
      const uiConfig = generateUIConfig(parsedSpell);
      
      if (result.success) {
        toast({
          title: "Spell Executed",
          description: `G.L.Y.P.H. ritual "${result.ritualName}" successfully bound.`,
          className: "bg-amber-950 border-amber-800"
        });
        
        if (onSpellExecute) {
          onSpellExecute(uiConfig);
        }
      } else {
        toast({
          title: "Execution Failed",
          description: result.error || "Failed to execute G.L.Y.P.H. spell.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error executing spell:', error);
      toast({
        title: "Execution Error",
        description: "Failed to communicate with the G.L.Y.P.H. binding service.",
        variant: "destructive",
      });
    } finally {
      setExecuting(false);
    }
  };
  
  // Copy spell to clipboard
  const copySpell = () => {
    navigator.clipboard.writeText(spellText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className="w-full bg-[#0a0a0a] border-[#333333]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#e0e0e0]">
              <Terminal className="h-5 w-5 text-amber-300" />
              G.L.Y.P.H. Interpreter
            </CardTitle>
            <CardDescription className="text-[#888888]">
              Generalized Lattice Yield Protocolic Hieroglyphs
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={verifySpell}
              disabled={!parsedSpell || verifying || readOnly}
              className="border-green-700 bg-black text-green-300 hover:bg-green-900 hover:text-green-200"
            >
              {verifying ? (
                <RotateCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              <span>{verifying ? 'Verifying...' : 'Verify Spell'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={executeSpell}
              disabled={!parsedSpell || executing || verifying || readOnly}
              className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
            >
              {executing ? (
                <RotateCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              <span>{executing ? 'Executing...' : 'Execute Spell'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copySpell}
              className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
            >
              {copied ? (
                <CopyCheck className="h-4 w-4 mr-1" />
              ) : (
                <Code className="h-4 w-4 mr-1" />
              )}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Editor area */}
          <div className="relative w-full border border-amber-900/30 rounded-md bg-black/60 p-4 min-h-[300px]">
            {readOnly ? (
              <div className="font-mono text-sm text-[#e0e0e0]">
                {highlightSyntax(spellText)}
              </div>
            ) : (
              <div className="relative">
                <textarea
                  value={spellText}
                  onChange={(e) => setSpellText(e.target.value)}
                  className="w-full min-h-[300px] bg-transparent border-none outline-none font-mono text-sm text-transparent caret-amber-300 absolute inset-0 z-10 p-0 resize-none"
                  placeholder="Enter your G.L.Y.P.H. spell here..."
                />
                <div className="font-mono text-sm pointer-events-none">
                  {highlightSyntax(spellText) || (
                    <div className="text-gray-500">Enter your G.L.Y.P.H. spell here...</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Verification Results */}
          {verificationResult && (
            <Alert className={`border-0 mb-4 ${verificationResult.valid ? 'bg-green-950/40' : 'bg-red-950/40'}`}>
              <div className="flex items-center gap-2">
                {verificationResult.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                )}
                <h4 className={`text-sm font-medium ${verificationResult.valid ? 'text-green-400' : 'text-amber-400'}`}>
                  {verificationResult.valid ? 'Spell Verified' : 'Verification Failed'}
                </h4>
              </div>
              {!verificationResult.valid && verificationResult.errors && verificationResult.errors.length > 0 && (
                <AlertDescription className="mt-2 text-xs text-red-300">
                  <ul className="list-disc list-inside">
                    {verificationResult.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </Alert>
          )}
          
          {/* Execution Results */}
          {executionResult && (
            <Alert className={`border-0 mb-4 ${executionResult.success ? 'bg-amber-950/40' : 'bg-red-950/40'}`}>
              <div className="flex items-center gap-2">
                {executionResult.success ? (
                  <Sparkles className="h-4 w-4 text-amber-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                )}
                <h4 className={`text-sm font-medium ${executionResult.success ? 'text-amber-400' : 'text-red-400'}`}>
                  {executionResult.success ? `Ritual "${executionResult.ritualName}" Bound` : 'Execution Failed'}
                </h4>
              </div>
              {executionResult.success ? (
                <AlertDescription className="mt-2 text-xs text-amber-300">
                  <p>{executionResult.message}</p>
                  {executionResult.bindPath && (
                    <p className="mt-1">Bound to: <span className="text-cyan-300">{executionResult.bindPath}</span></p>
                  )}
                </AlertDescription>
              ) : (
                <AlertDescription className="mt-2 text-xs text-red-300">
                  {executionResult.error}
                </AlertDescription>
              )}
            </Alert>
          )}
          
          {/* Spell analysis */}
          {parsedSpell && (
            <div className="border border-amber-900/30 rounded-md bg-black/60 p-4">
              <h3 className="text-sm font-medium text-amber-300 mb-2 flex items-center">
                <GitBranch className="h-4 w-4 mr-2" />
                Spell Analysis
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Command:</p>
                  <p className="text-amber-100">{parsedSpell.command || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Deploy Path:</p>
                  <p className="text-amber-100">{parsedSpell.deployPath || '/control'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Panels:</p>
                  <ul className="list-disc list-inside text-blue-300">
                    {parsedSpell.panels.map((panel: string, index: number) => (
                      <li key={index}>{panel}</li>
                    ))}
                    {parsedSpell.panels.length === 0 && (
                      <li className="text-gray-500">None specified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">UI Styles:</p>
                  <ul className="list-disc list-inside text-green-300">
                    {parsedSpell.uiStyles.map((style: string, index: number) => (
                      <li key={index}>{style}</li>
                    ))}
                    {parsedSpell.uiStyles.length === 0 && (
                      <li className="text-gray-500">None specified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Logic Modules:</p>
                  <ul className="list-disc list-inside text-pink-300">
                    {parsedSpell.logicModules.map((module: string, index: number) => (
                      <li key={index}>{module}</li>
                    ))}
                    {parsedSpell.logicModules.length === 0 && (
                      <li className="text-gray-500">None specified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Recovery Glyph:</p>
                  <p className="text-amber-100 text-xl">
                    {parsedSpell.recoveryGlyph || <CircleOff className="h-4 w-4 text-gray-500" />}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between text-[#aaaaaa]">
        <div className="text-xs flex items-center">
          <span>G.L.Y.P.H. v0.37</span>
        </div>
        
        <div className="text-xs flex items-center">
          <span>Quantum Rose Syntax</span>
        </div>
      </CardFooter>
    </Card>
  );
}