import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ExpiryTrackerPage from "./pages/ExpiryTrackerPage";
import CashClosingPage from "./pages/CashClosingPage";
import WasteTrackingPage from "./pages/WasteTrackingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import WasteAlertsPage from "./pages/WasteAlertsPage";
import DailyQuantitiesPage from "./pages/DailyQuantitiesPage";
import SalesPage from "./pages/SalesPage";
import WasteCalculatorPage from "./pages/WasteCalculatorPage";
import CashClosingDetailsPage from "./pages/CashClosingDetailsPage";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/expiry-tracker"} component={ExpiryTrackerPage} />
      <Route path={"/cash-closing"} component={CashClosingPage} />
      <Route path={"/waste-tracking"} component={WasteTrackingPage} />
      <Route path={"/analytics"} component={AnalyticsPage} />
      <Route path={"/waste-alerts"} component={WasteAlertsPage} />
      <Route path={"/daily-quantities"} component={DailyQuantitiesPage} />
      <Route path={"/sales"} component={SalesPage} />
      <Route path={"/waste-calculator"} component={WasteCalculatorPage} />
      <Route path={"/cash-closing-details"} component={CashClosingDetailsPage} />
      {/* Final fallback route */}
      <Route component={Home} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
