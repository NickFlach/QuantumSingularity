import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Editor } from "@monaco-editor/react";
import { ChevronLeft, Save, Play, Code, FileText, Loader2, PlusCircle, Settings, Download, Atom } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project, File } from "@shared/schema";
import { withAuth } from "@/lib/AuthContext";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { sampleQuantumCode, sampleAICode, sampleQuantumGeometryCode } from "@/lib/SingularisCompiler";
import { QuantumIDE } from "@/components/QuantumIDE";

// Define form schema for new file
const fileSchema = z.object({
  name: z.string().min(2, { message: "File name must be at least 2 characters." }),
  type: z.enum(["code", "quantum_circuit", "documentation"]),
});

type FileFormValues = z.infer<typeof fileSchema>;

function ProjectDetail() {
  const params = useParams();
  const projectId = params.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [isCreateFileDialogOpen, setIsCreateFileDialogOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Queries
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    retry: 1,
  });

  const { data: files, isLoading: isLoadingFiles } = useQuery<File[]>({
    queryKey: [`/api/projects/${projectId}/files`],
    enabled: !!projectId,
    retry: 1,
  });

  // Form for creating a new file
  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      name: "",
      type: "code",
    },
  });

  // Load file content when activeFileId changes
  useEffect(() => {
    if (activeFileId && files) {
      const file = files.find(f => f.id === activeFileId);
      if (file) {
        setEditorContent(file.content);
      }
    }
  }, [activeFileId, files]);

  // Set first file as active when files are loaded
  useEffect(() => {
    if (files && files.length > 0 && !activeFileId) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);

  // Mutation to save file changes
  const updateFileMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      return apiRequest("PUT", `/api/files/${id}`, { content });
    },
    onSuccess: () => {
      toast({
        title: "File Saved",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save",
        description: error.message || "An error occurred while saving the file.",
        variant: "destructive",
      });
    },
  });

  // Mutation to create a new file
  const createFileMutation = useMutation({
    mutationFn: async (data: FileFormValues) => {
      // Generate sample content based on file type
      let content = "";
      if (data.type === "code") {
        content = sampleQuantumCode;
      } else if (data.type === "quantum_circuit") {
        content = sampleQuantumGeometryCode;
      } else {
        content = "# SINGULARIS PRIME Documentation\n\nAdd your documentation here.";
      }

      return apiRequest("POST", "/api/files", {
        name: data.name,
        projectId: projectId ? parseInt(projectId) : 0,
        type: data.type,
        content,
      });
    },
    onSuccess: (newFile: File) => {
      toast({
        title: "File Created",
        description: "Your new file has been created successfully.",
      });
      setIsCreateFileDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/files`] });
      setActiveFileId(newFile.id);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create File",
        description: error.message || "An error occurred while creating the file.",
        variant: "destructive",
      });
    },
  });

  // Mutation to execute code
  const executeCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      setIsExecuting(true);
      const response = await apiRequest("POST", "/api/execute", { code });
      return response;
    },
    onSuccess: (data: { output: string[] }) => {
      setExecutionResult(data.output);
      toast({
        title: "Code Executed",
        description: "Your SINGULARIS PRIME code has been executed successfully.",
      });
    },
    onError: (error: any) => {
      setExecutionResult([`Error: ${error.message || "An error occurred during execution."}`]);
      toast({
        title: "Execution Failed",
        description: error.message || "An error occurred during execution.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsExecuting(false);
    },
  });

  // Handle file save
  const handleSaveFile = () => {
    if (activeFileId) {
      updateFileMutation.mutate({ id: activeFileId, content: editorContent });
    }
  };

  // Handle file execution
  const handleExecuteCode = () => {
    executeCodeMutation.mutate(editorContent);
  };

  // Handle form submission for new file
  const onSubmit = (data: FileFormValues) => {
    createFileMutation.mutate(data);
  };

  // Get active file
  const activeFile = activeFileId && files ? files.find(f => f.id === activeFileId) : null;

  if (isLoadingProject) {
    return (
      <Container>
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="text-xl font-medium">Project not found</div>
          <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button variant="outline" asChild>
            <Link href="/projects">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <PageHeader 
            title={project.name} 
            description={project.description || "No description provided."}
          />
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href="/projects">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* File Explorer */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Files</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsCreateFileDialogOpen(true)}
                    title="Create New File"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingFiles ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : files && files.length > 0 ? (
                  <div className="space-y-1 px-2 pb-4">
                    {files.map((file) => {
                      const isActive = file.id === activeFileId;
                      let icon;
                      switch (file.type) {
                        case 'quantum_circuit':
                          icon = <Code className="h-4 w-4 mr-2" />;
                          break;
                        case 'documentation':
                          icon = <FileText className="h-4 w-4 mr-2" />;
                          break;
                        default:
                          icon = <Code className="h-4 w-4 mr-2" />;
                      }
                      
                      return (
                        <Button
                          key={file.id}
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start ${isActive ? 'bg-secondary' : ''}`}
                          onClick={() => setActiveFileId(file.id)}
                        >
                          {icon}
                          <span className="truncate">{file.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">No files yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsCreateFileDialogOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create First File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm font-medium">Project ID</div>
                  <div className="text-sm text-muted-foreground">{project.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Last Modified</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="pt-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Project Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor and Console */}
          <div className="col-span-12 lg:col-span-9 space-y-4">
            {activeFile ? (
              <Tabs defaultValue="basic" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="basic">Basic Editor</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced IDE</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground mr-2">
                      Current File: <span className="font-semibold">{activeFile.name}</span>
                    </div>
                  </div>
                </div>
                
                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-lg">{activeFile.name}</CardTitle>
                        <CardDescription>
                          {activeFile.type === 'quantum_circuit' 
                            ? 'Quantum Circuit Definition' 
                            : activeFile.type === 'documentation' 
                              ? 'Project Documentation' 
                              : 'SINGULARIS PRIME Code'}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleSaveFile}
                          disabled={updateFileMutation.isPending}
                        >
                          {updateFileMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={handleExecuteCode}
                          disabled={isExecuting}
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          {isExecuting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Run
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md overflow-hidden">
                        <Editor
                          height="400px"
                          language="typescript" // Using TypeScript for syntax highlighting
                          value={editorContent}
                          onChange={(value) => setEditorContent(value || "")}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 14,
                            lineNumbers: 'on',
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Console Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black rounded-md p-4 font-mono text-sm h-[200px] overflow-y-auto text-white">
                        {executionResult.length > 0 ? (
                          executionResult.map((line, index) => (
                            <div key={index} className={line.startsWith('Error:') ? 'text-red-400' : 'text-green-400'}>
                              {line}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 italic">Execute your code to see output here.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="advanced" className="h-[calc(100vh-15rem)]">
                  <div className="w-full h-full border rounded-md overflow-hidden">
                    <QuantumIDE />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  {isLoadingFiles ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  ) : (
                    <div className="space-y-4">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-medium">No file selected</h3>
                      <p className="text-muted-foreground max-w-md">
                        Select a file from the sidebar or create a new file to start coding.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setIsCreateFileDialogOpen(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create New File
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create File Dialog */}
      <Dialog open={isCreateFileDialogOpen} onOpenChange={setIsCreateFileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Add a new file to your SINGULARIS PRIME project.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Name</FormLabel>
                    <FormControl>
                      <Input placeholder="my-quantum-algorithm.singularis" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for your file.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a file type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="code">SINGULARIS PRIME Code</SelectItem>
                        <SelectItem value="quantum_circuit">Quantum Circuit</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of file determines the template that will be used.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateFileDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={createFileMutation.isPending}
                >
                  {createFileMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create File
                    </span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default withAuth(ProjectDetail);