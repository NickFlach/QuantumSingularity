import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Code } from '../components/ui/code';

interface KashiwaraExampleCardProps {
  title: string;
  description: string;
  code: string;
  endpoint: string;
  payload: any;
}

export function KashiwaraExampleCard({ 
  title, 
  description, 
  code, 
  endpoint, 
  payload 
}: KashiwaraExampleCardProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('code');
  
  const executeExample = useMutation({
    mutationFn: async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to execute example');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setActiveTab('result');
      toast({
        title: 'Execution Successful',
        description: 'The example was executed successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="h-64 overflow-auto">
            <Code language="typescript">{code}</Code>
          </TabsContent>
          <TabsContent value="result" className="h-64 overflow-auto">
            {executeExample.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : result ? (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Execution Result:</h3>
                <Code language="json">
                  {JSON.stringify(result, null, 2)}
                </Code>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Execute the example to see results.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => executeExample.mutate()} 
          disabled={executeExample.isPending}
          className="w-full"
        >
          {executeExample.isPending ? 'Executing...' : 'Execute Example'}
        </Button>
      </CardFooter>
    </Card>
  );
}