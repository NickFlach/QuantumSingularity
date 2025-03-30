import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Lock, Shield, Eye, Sparkles, Key } from 'lucide-react';

export interface ShinobiCloakTraceAuthProps {
  onAuthenticate: (success: boolean) => void;
}

export function ShinobiCloakTraceAuth({ onAuthenticate }: ShinobiCloakTraceAuthProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Handle the authentication process
  const handleAuthenticate = () => {
    // Reset error state
    setErrorMessage('');
    setIsAuthenticating(true);
    
    // Simulate authentication process with the Shinobi.CloakTrace system
    setTimeout(() => {
      // In a real system, this would make an API call to verify credentials
      // For demo purposes, we'll just check for any non-empty values
      if (username && password && token) {
        onAuthenticate(true);
      } else {
        setErrorMessage('Authentication failed. Please provide all credentials.');
        setIsAuthenticating(false);
      }
    }, 1500);
  };
  
  // Handle key press in token field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAuthenticate();
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-[#0a0a0a] border-[#333333]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#e0e0e0] flex items-center">
              <Fingerprint className="h-5 w-5 mr-2 text-amber-300" />
              Shinobi.CloakTrace
            </CardTitle>
            <CardDescription className="text-[#888888]">
              Secure quantum authentication portal
            </CardDescription>
          </div>
          <Badge className="bg-amber-900/30 text-amber-300 border-amber-700">
            <Lock className="h-3 w-3 mr-1" />
            QUANTUM SECURED
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#e0e0e0] flex items-center">
            <Shield className="h-4 w-4 mr-2 text-amber-300" />
            Operator ID
          </label>
          <Input
            placeholder="Enter your operator ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isAuthenticating}
            className="bg-black border-amber-900 text-amber-100 placeholder:text-amber-900/70 focus-visible:ring-amber-700"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#e0e0e0] flex items-center">
            <Lock className="h-4 w-4 mr-2 text-amber-300" />
            Synchronization Key
          </label>
          <Input
            type="password"
            placeholder="Enter your synchronization key"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isAuthenticating}
            className="bg-black border-amber-900 text-amber-100 placeholder:text-amber-900/70 focus-visible:ring-amber-700"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#e0e0e0] flex items-center">
            <Key className="h-4 w-4 mr-2 text-amber-300" />
            Quantum Token
          </label>
          <Input
            placeholder="Enter your quantum token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAuthenticating}
            className="bg-black border-amber-900 text-amber-100 placeholder:text-amber-900/70 focus-visible:ring-amber-700 font-mono"
          />
          <p className="text-xs text-amber-700 italic">
            Secure 37-dimensional quantum-entangled authentication
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-300 p-2 rounded text-sm">
            {errorMessage}
          </div>
        )}
        
        <Button
          onClick={handleAuthenticate}
          disabled={isAuthenticating}
          className="w-full bg-amber-900 hover:bg-amber-800 text-amber-100"
        >
          {isAuthenticating ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              Authenticating...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Authenticate
            </>
          )}
        </Button>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2 border-t border-amber-900/30 pt-4">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-[#888888]">Connection Status:</span>
          <Badge className="bg-green-900/30 text-green-300 border-green-700">
            SECURE
          </Badge>
        </div>
        
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-[#888888]">Entanglement Protocol:</span>
          <span className="text-xs text-amber-300 font-mono">StellarRose-37D</span>
        </div>
        
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-[#888888]">Quantum Coherence:</span>
          <div className="flex items-center">
            <div className="h-1 w-20 bg-gray-800 rounded-full overflow-hidden mr-2">
              <div className="h-full bg-amber-500" style={{ width: '96%' }} />
            </div>
            <span className="text-xs text-amber-300">96%</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}