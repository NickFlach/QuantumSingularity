import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import AIQuantumDemo from "@/pages/AIQuantumDemo";
import DocumentationPage from "@/pages/documentation-page";
import QuantumGeometryDemo from "@/pages/QuantumGeometryDemo";
import ProjectsPage from "@/pages/projects-page";
import Header from "@/components/Header";
import { AuthProvider } from "./lib/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/demo" component={AIQuantumDemo} />
      <Route path="/docs" component={DocumentationPage} />
      <Route path="/quantum-geometry" component={QuantumGeometryDemo} />
      <Route path="/projects" component={ProjectsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
