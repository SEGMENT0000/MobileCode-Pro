
import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/home";
import EditorPage from "./pages/editor";
import NotFoundPage from "./pages/not-found";
import { Toaster } from "./components/ui/toaster";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="dark min-h-screen bg-dark">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/editor" component={EditorPage} />
            <Route component={NotFoundPage} />
          </Switch>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
