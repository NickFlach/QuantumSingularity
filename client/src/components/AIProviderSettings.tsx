import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, SettingsIcon, RefreshCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIProvider {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

interface ProvidersResponse {
  providers: AIProvider[];
  activeProvider: string | null;
}

export default function AIProviderSettings() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configuring, setConfiguring] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gpt-4o");
  const { toast } = useToast();

  // Fetch providers
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<ProvidersResponse>("GET", "/api/ai/providers");
      setProviders(response.providers || []);
      setActiveProvider(response.activeProvider);
    } catch (error) {
      console.error("Failed to fetch AI providers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch AI providers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Set active provider
  const setProvider = async (id: string) => {
    try {
      setConfiguring(true);
      await apiRequest("POST", "/api/ai/providers/active", { id });
      setActiveProvider(id);
      toast({
        title: "Success",
        description: `Switched to ${id} provider`,
        variant: "default"
      });
      fetchProviders(); // Refresh the list to update availability
    } catch (error) {
      console.error("Failed to set active provider:", error);
      toast({
        title: "Error",
        description: "Failed to switch provider. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConfiguring(false);
    }
  };

  // Configure a provider
  const configureProvider = async (id: string, config: any) => {
    try {
      setConfiguring(true);
      await apiRequest("POST", `/api/ai/providers/${id}/configure`, config);
      toast({
        title: "Success",
        description: `${id} provider configured successfully`,
        variant: "default"
      });
      fetchProviders(); // Refresh the list to update availability
    } catch (error) {
      console.error("Failed to configure provider:", error);
      toast({
        title: "Error",
        description: "Failed to configure provider. Please try again.",
        variant: "destructive"
      });
    } finally {
      setConfiguring(false);
    }
  };

  // Configure OpenAI provider
  const configureOpenAI = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Warning",
        description: "API key is required",
        variant: "destructive"
      });
      return;
    }
    
    configureProvider("openai", {
      apiKey,
      modelName
    });
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          AI Provider Settings
        </CardTitle>
        <CardDescription>
          Configure and manage the AI providers used by SINGULARIS PRIME
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="providers">Available Providers</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="providers" className="py-2">
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div 
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{provider.name}</h3>
                        <Badge variant={provider.available ? "default" : "outline"}>
                          {provider.available ? "Available" : "Unavailable"}
                        </Badge>
                        {activeProvider === provider.id && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {provider.description}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={activeProvider === provider.id ? "secondary" : "default"}
                      disabled={configuring || activeProvider === provider.id || !provider.available}
                      onClick={() => setProvider(provider.id)}
                    >
                      {activeProvider === provider.id ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Active
                        </>
                      ) : (
                        "Use"
                      )}
                    </Button>
                  </div>
                ))}
                
                {providers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No AI providers available</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="configure" className="py-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">OpenAI Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure the OpenAI provider for SINGULARIS PRIME
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="modelName">Model</Label>
                    <Input
                      id="modelName"
                      placeholder="Model name (e.g., gpt-4o)"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Defaults to gpt-4o if not specified
                    </p>
                  </div>
                  
                  <Button
                    onClick={configureOpenAI}
                    disabled={configuring}
                    className="w-full"
                  >
                    {configuring ? (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                        Configuring...
                      </>
                    ) : (
                      "Save Configuration"
                    )}
                  </Button>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Fallback Provider</h3>
                      <p className="text-sm text-muted-foreground">
                        Always available local provider with basic functionality
                      </p>
                    </div>
                    <Switch
                      checked={activeProvider === "fallback"}
                      onCheckedChange={(checked) => {
                        if (checked) setProvider("fallback");
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Current provider: {activeProvider || "None"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchProviders}
          disabled={loading}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}