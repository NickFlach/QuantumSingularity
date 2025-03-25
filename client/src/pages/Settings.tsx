import React from "react";
import { Container } from "@/components/ui/container";
import AIProviderSettings from "@/components/AIProviderSettings";
import GitHubIntegrationSettings from "@/components/GitHubIntegrationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <Container className="pt-6 pb-16">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 mr-2" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Configure SINGULARIS PRIME language settings, AI providers, and integrations
      </p>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="language">Language Settings</TabsTrigger>
          <TabsTrigger value="quantum">Quantum Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai" className="mt-0">
          <AIProviderSettings />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-0">
          <div className="space-y-8">
            <GitHubIntegrationSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="language" className="mt-0">
          <div className="rounded-lg border p-8 text-center space-y-4">
            <h3 className="text-xl font-medium">Language Settings</h3>
            <p className="text-muted-foreground">
              Configure SINGULARIS PRIME language settings and syntax preferences
            </p>
            <p className="text-sm">Coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="quantum" className="mt-0">
          <div className="rounded-lg border p-8 text-center space-y-4">
            <h3 className="text-xl font-medium">Quantum Settings</h3>
            <p className="text-muted-foreground">
              Configure quantum simulation parameters and entanglement options
            </p>
            <p className="text-sm">Coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
}