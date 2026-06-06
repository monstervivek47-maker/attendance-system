import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivateRoute } from "@/components/PrivateRoute";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import EmployeeManagement from "@/pages/admin/Employees";
import AdminAttendance from "@/pages/admin/Attendance";
import Reports from "@/pages/admin/Reports";
import EmployeeDashboard from "@/pages/employee/Dashboard";
import MarkAttendance from "@/pages/employee/MarkAttendance";
import AttendanceHistory from "@/pages/employee/History";
import Profile from "@/pages/employee/Profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />

      <Route path="/admin/dashboard">
        <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
      </Route>
      <Route path="/admin/employees">
        <PrivateRoute role="admin"><EmployeeManagement /></PrivateRoute>
      </Route>
      <Route path="/admin/attendance">
        <PrivateRoute role="admin"><AdminAttendance /></PrivateRoute>
      </Route>
      <Route path="/admin/reports">
        <PrivateRoute role="admin"><Reports /></PrivateRoute>
      </Route>

      <Route path="/employee/dashboard">
        <PrivateRoute role="employee"><EmployeeDashboard /></PrivateRoute>
      </Route>
      <Route path="/employee/attendance">
        <PrivateRoute role="employee"><MarkAttendance /></PrivateRoute>
      </Route>
      <Route path="/employee/history">
        <PrivateRoute role="employee"><AttendanceHistory /></PrivateRoute>
      </Route>
      <Route path="/employee/profile">
        <PrivateRoute role="employee"><Profile /></PrivateRoute>
      </Route>

      <Route>
        <Redirect to="/login" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
