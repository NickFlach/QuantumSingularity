import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import AIQuantumDemo from "@/pages/AIQuantumDemo";
import DocumentationPage from "@/pages/documentation-page";
import QuantumGeometryDemo from "@/pages/QuantumGeometryDemo";
import QuantumCircuitDesignerPage from "@/pages/QuantumCircuitDesignerPage";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetail from "@/pages/project-detail";
import ProfilePage from "@/pages/profile-page";
import AuthPage from "@/pages/auth-page";
import QuantumExperience from "@/pages/QuantumExperience";
import CodeAnalysisPage from "@/pages/CodeAnalysisPage";
import Header from "@/components/Header";
import { AuthProvider } from "./lib/AuthContext";
import { ProtectedRoute } from "./lib/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={QuantumExperience} />
      <ProtectedRoute path="/home" component={Home} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/demo" component={AIQuantumDemo} />
      <ProtectedRoute path="/docs" component={DocumentationPage} />
      <ProtectedRoute path="/quantum-geometry" component={QuantumGeometryDemo} />
      <ProtectedRoute path="/quantum-circuit" component={QuantumCircuitDesignerPage} />
      <ProtectedRoute path="/code-analysis" component={CodeAnalysisPage} />
      <ProtectedRoute path="/projects" component={ProjectsPage} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetail} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const showHeader = location !== '/auth';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {showHeader && <Header />}
          <main className={`flex-1 ${!showHeader ? 'pt-0' : ''}`}>
            <Router />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
