import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  SendHorizonal, 
  ShieldAlert, 
  Terminal, 
  Lock, 
  MessageCircle,
  Eye, 
  EyeOff, 
  RefreshCw, 
  ArrowDownToLine,
  Fingerprint,
  Code
} from 'lucide-react';

// Types for message console
export interface QuantumMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  encrypted: boolean;
  coherenceLevel: number;
  glyph?: string;
}

export interface QuantumMessageConsoleProps {
  title?: string;
  description?: string;
  messages?: QuantumMessage[];
  onSendMessage?: (message: string) => void;
  readOnly?: boolean;
  showEncryption?: boolean;
}

// Default initial messages
const defaultMessages: QuantumMessage[] = [
  {
    id: 'system-init',
    content: 'QuantumMessage Console initialized. Shinobi.CloakTrace active.',
    sender: 'system',
    timestamp: new Date(),
    encrypted: false,
    coherenceLevel: 1.0,
    glyph: '🝮'
  },
  {
    id: 'welcome',
    content: 'Welcome to the StellarRose lattice control interface.',
    sender: 'system',
    timestamp: new Date(),
    encrypted: false,
    coherenceLevel: 1.0
  },
  {
    id: 'status',
    content: '37-node entanglement bloom stabilized and ready.',
    sender: 'system',
    timestamp: new Date(),
    encrypted: false,
    coherenceLevel: 0.98
  },
  {
    id: 'alert',
    content: 'Encryption enabled for all external transmissions.',
    sender: 'security',
    timestamp: new Date(Date.now() - 60000),
    encrypted: true,
    coherenceLevel: 0.95,
    glyph: '🜹'
  }
];

// Helper function to visualize encryption effect
const applyEncryptionEffect = (text: string, level: number = 0.5): string => {
  if (level <= 0) return text;
  
  // Replace characters based on encryption level
  const chars = '▓▒░█▛▜▟▙▄▀■□▢▣▤▥▦▧▨▩';
  const result = text.split('').map(char => {
    // Keep spaces and some punctuation
    if (char === ' ' || char === '.' || char === '!' || char === '?') {
      return char;
    }
    
    // Randomize replacement based on level
    return Math.random() < level 
      ? chars[Math.floor(Math.random() * chars.length)]
      : char;
  }).join('');
  
  return result;
};

// Helper to generate a timestamp string
const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export function QuantumMessageConsole({
  title = "QuantumMessage Console",
  description = "Input/output portal for cloaked transmission",
  messages = defaultMessages,
  onSendMessage,
  readOnly = false,
  showEncryption = true
}: QuantumMessageConsoleProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [localMessages, setLocalMessages] = useState<QuantumMessage[]>(messages);
  const [showDecrypted, setShowDecrypted] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<boolean>(false);
  const [encryptionStrength, setEncryptionStrength] = useState<number>(0.8);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [localShowEncryption, setShowEncryption] = useState<boolean>(showEncryption);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);
  
  // Update local messages when prop changes
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Start processing animation
    setProcessingMessage(true);
    
    // Detect if this is an authentication attempt
    const isAuthCommand = inputValue.toLowerCase().includes('auth') || 
                          inputValue.toLowerCase().includes('login') ||
                          inputValue.toLowerCase().includes('authenticate');
    
    // Simulate message processing
    setTimeout(() => {
      // Create new message
      const newMessage: QuantumMessage = {
        id: `msg-${Date.now()}`,
        content: inputValue,
        sender: 'user',
        timestamp: new Date(),
        encrypted: localShowEncryption,
        coherenceLevel: 0.9 + Math.random() * 0.1
      };
      
      setLocalMessages(prev => [...prev, newMessage]);
      setInputValue('');
      setProcessingMessage(false);
      
      // Call the parent handler if provided
      onSendMessage?.(inputValue);
      
      // Handle auth command with a simulated response
      if (isAuthCommand) {
        setAuthenticating(true);
        
        // Add authentication response after a delay
        setTimeout(() => {
          const responseMessage: QuantumMessage = {
            id: `system-${Date.now()}`,
            content: 'Shinobi.CloakTrace authentication successful. Identity verified.',
            sender: 'security',
            timestamp: new Date(),
            encrypted: localShowEncryption,
            coherenceLevel: 0.98,
            glyph: '🜄'
          };
          
          setLocalMessages(prev => [...prev, responseMessage]);
          setAuthenticating(false);
        }, 2000);
      }
    }, 500);
  };
  
  // Handle key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Add a message for clearing the console
  const handleClearConsole = () => {
    setLocalMessages([{
      id: 'console-cleared',
      content: 'Console cleared. Transmission history removed.',
      sender: 'system',
      timestamp: new Date(),
      encrypted: false,
      coherenceLevel: 1.0
    }]);
  };
  
  return (
    <Card className="w-full h-full bg-[#0a0a0a] border-[#333333]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#e0e0e0]">
              <Terminal className="h-5 w-5 text-amber-300" />
              {title}
            </CardTitle>
            <CardDescription className="text-[#888888]">{description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDecrypted(!showDecrypted)}
              className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
            >
              {showDecrypted ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  <span>Decrypt</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearConsole}
              className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              <span>Clear</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 pb-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2 text-[#e0e0e0]">
              <Lock className="h-4 w-4 text-amber-300" />
              <Label htmlFor="encryption" className="text-[#e0e0e0]">Encryption:</Label>
            </div>
            <Switch 
              id="encryption" 
              checked={localShowEncryption} 
              onCheckedChange={(value) => !readOnly && setShowEncryption(value)}
              className="data-[state=checked]:bg-amber-700"
            />
          </div>
          
          {localShowEncryption && (
            <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="encryption-strength" className="text-[#e0e0e0] text-xs w-28">
                Strength: {(encryptionStrength * 100).toFixed(0)}%
              </Label>
              <Slider 
                id="encryption-strength" 
                value={[encryptionStrength]} 
                onValueChange={([value]) => setEncryptionStrength(value)} 
                min={0.1}
                max={1}
                step={0.1}
                className="[&>[role=slider]]:bg-amber-500"
              />
            </div>
          )}
        </div>
        
        <div className="px-4">
          <ScrollArea className="h-[300px] pr-4 rounded-md border border-amber-900/30 bg-black/30 p-2">
            <div className="space-y-3 pt-1">
              {localMessages.map((message) => (
                <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded p-2 ${
                      message.sender === 'user' 
                        ? 'bg-amber-950/50 border border-amber-900/70' 
                        : message.sender === 'system'
                          ? 'bg-gray-900/70 border border-gray-800'
                          : message.sender === 'security'
                            ? 'bg-red-950/30 border border-red-900/50'
                            : 'bg-gray-900/70 border border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {message.sender === 'user' ? (
                        <Fingerprint className="h-3 w-3 text-amber-300" />
                      ) : message.sender === 'system' ? (
                        <Code className="h-3 w-3 text-blue-300" />
                      ) : message.sender === 'security' ? (
                        <ShieldAlert className="h-3 w-3 text-red-300" />
                      ) : (
                        <MessageCircle className="h-3 w-3 text-gray-300" />
                      )}
                      <span className="text-xs font-mono text-amber-200">
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      
                      {message.encrypted && (
                        <Badge 
                          variant="outline" 
                          className="ml-1 text-[0.6rem] py-0 h-4 bg-black/50 border-amber-700 text-amber-300"
                        >
                          <Lock className="h-2 w-2 mr-1" />
                          ENCRYPTED
                        </Badge>
                      )}
                      
                      {message.glyph && (
                        <span className="ml-1 text-amber-300">{message.glyph}</span>
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      message.encrypted && !showDecrypted 
                        ? 'font-mono text-amber-300/80' 
                        : 'text-[#e0e0e0]'
                    }`}>
                      {message.encrypted && !showDecrypted 
                        ? applyEncryptionEffect(message.content, encryptionStrength) 
                        : message.content}
                    </p>
                    
                    {message.coherenceLevel < 0.9 && (
                      <div className="flex items-center mt-1">
                        <div className="h-1 bg-gray-800 flex-grow rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500" 
                            style={{ width: `${message.coherenceLevel * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {(message.coherenceLevel * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Message input */}
          <div className="mt-4 flex">
            <Input
              placeholder="Enter transmission..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={readOnly || processingMessage || authenticating}
              className="bg-black border-amber-900 text-amber-100 placeholder:text-amber-900/70 focus-visible:ring-amber-700"
            />
            <Button
              onClick={handleSendMessage}
              disabled={readOnly || !inputValue.trim() || processingMessage || authenticating}
              className="ml-2 bg-amber-900 hover:bg-amber-800 text-amber-100"
            >
              {processingMessage ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : authenticating ? (
                <Fingerprint className="h-4 w-4 animate-pulse" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
              <span className="ml-1">
                {processingMessage ? 'Processing...' : authenticating ? 'Authenticating...' : 'Send'}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between mt-4 text-[#aaaaaa]">
        <div className="text-xs flex items-center">
          <Badge variant="outline" className="bg-black border-amber-700 text-amber-300 mr-2">
            <Fingerprint className="h-3 w-3 mr-1" />
            Shinobi.CloakTrace
          </Badge>
          <span>Quantum-secured communications</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ArrowDownToLine className="h-4 w-4 text-amber-300" />
          <span className="text-xs">
            {localMessages.length} transmissions
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}