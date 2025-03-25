import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Github, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GitHubIntegrationSettings() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [callbackUrl, setCallbackUrl] = useState(window.location.origin + "/api/auth/github/callback");
  const [saving, setSaving] = useState(false);
  const [configStatus, setConfigStatus] = useState<'unconfigured' | 'configured' | 'error'>('unconfigured');
  
  const { toast } = useToast();

  const saveConfig = async () => {
    if (!clientId || !clientSecret) {
      toast({
        title: "Error",
        description: "Please enter both Client ID and Client Secret",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/settings/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
          callbackUrl
        })
      });
      
      if (response.ok) {
        setConfigStatus('configured');
        toast({
          title: "Success",
          description: "GitHub integration configured successfully. You may need to restart the server for changes to take effect.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to save GitHub configuration");
      }
    } catch (error) {
      console.error("Error saving GitHub configuration:", error);
      setConfigStatus('error');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save GitHub configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/settings/github/status');
      const data = await response.json();
      
      if (data.configured) {
        setConfigStatus('configured');
      } else {
        setConfigStatus('unconfigured');
      }
    } catch (error) {
      console.error("Error checking GitHub configuration:", error);
      setConfigStatus('error');
    }
  };

  // Check configuration status on component mount
  React.useEffect(() => {
    checkConfiguration();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Github className="mr-2 h-5 w-5" /> GitHub Integration
        </CardTitle>
        <CardDescription>
          Connect SINGULARIS PRIME to GitHub to analyze repositories and enable CI/CD features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {configStatus === 'configured' && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>GitHub integration is configured</AlertTitle>
            <AlertDescription>
              Your application is successfully connected to GitHub. You can now use GitHub authentication and repository analysis features.
            </AlertDescription>
          </Alert>
        )}
        
        {configStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>
              There was an error with your GitHub configuration. Please check the values and try again.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github-client-id">GitHub OAuth App Client ID</Label>
            <Input 
              id="github-client-id" 
              value={clientId} 
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github-client-secret">GitHub OAuth App Client Secret</Label>
            <Input 
              id="github-client-secret" 
              type="password"
              value={clientSecret} 
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="••••••••••••••••••••"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github-callback-url">Callback URL</Label>
            <Input 
              id="github-callback-url" 
              value={callbackUrl} 
              onChange={(e) => setCallbackUrl(e.target.value)}
              readOnly
            />
            <p className="text-sm text-muted-foreground mt-1">
              Use this URL in your GitHub OAuth App settings
            </p>
          </div>
        </div>
        
        <div className="pt-4">
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium mb-2">How to set up a GitHub OAuth App:</h3>
          <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
            <li>Go to your GitHub account settings</li>
            <li>Navigate to Developer settings &rarr; OAuth Apps &rarr; New OAuth App</li>
            <li>Enter your application name and homepage URL</li>
            <li>Set the authorization callback URL to the value shown above</li>
            <li>Register the application and copy the Client ID and Client Secret</li>
            <li>Paste these values into the fields above and save</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}