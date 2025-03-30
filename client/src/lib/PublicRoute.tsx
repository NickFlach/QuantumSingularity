import { Route } from "wouter";

interface PublicRouteProps {
  path: string;
  component: React.ComponentType;
}

export function PublicRoute({ path, component: Component }: PublicRouteProps) {
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}