import { useMemo } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getAttendanceRecords, getEmployees } from "@/utils/storage";
import { CheckCircle2, Clock, CalendarCheck, ArrowRight, UserCircle } from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const records = getAttendanceRecords();
  const employees = getEmployees();

  const today = new Date().toISOString().split("T")[0];

  const myRecords = useMemo(
    () => records.filter((r) => r.employeeId === user?.employeeId),
    [records, user]
  );

  const markedToday = useMemo(
    () => myRecords.find((r) => r.date === today),
    [myRecords, today]
  );

  const thisMonthStr = today.slice(0, 7);
  const monthCount = new Set(myRecords.filter((r) => r.date.startsWith(thisMonthStr)).map((r) => r.date)).size;

  const totalCount = new Set(myRecords.map((r) => r.date)).size;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const emp = employees.find((e) => e.employeeId === user?.employeeId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        {/* Greeting */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <UserCircle className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{greeting()}, {user?.name?.split(" ")[0]}</h1>
            <p className="text-muted-foreground text-sm">{formatDate(today)}</p>
          </div>
        </div>

        {/* Today's status */}
        <Card className={markedToday ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {markedToday ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                ) : (
                  <Clock className="h-8 w-8 text-amber-600" />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {markedToday ? "Attendance Marked" : "Attendance Pending"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {markedToday
                      ? `Checked in at ${markedToday.time}`
                      : "You haven't marked attendance yet today"}
                  </p>
                </div>
              </div>
              {markedToday ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100">Present</Badge>
              ) : (
                <Button size="sm" onClick={() => setLocation("/employee/attendance")} data-testid="button-mark-attendance">
                  Mark Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card data-testid="card-month-attendance">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">This Month</p>
              <p className="text-3xl font-bold text-foreground mt-1">{monthCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">days present</p>
            </CardContent>
          </Card>
          <Card data-testid="card-total-attendance">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">days attended</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocation("/employee/attendance")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
            data-testid="button-quick-attendance"
          >
            <CalendarCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Mark Attendance</p>
              <p className="text-xs text-muted-foreground">Capture selfie</p>
            </div>
          </button>
          <button
            onClick={() => setLocation("/employee/history")}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
            data-testid="button-quick-history"
          >
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">View History</p>
              <p className="text-xs text-muted-foreground">{totalCount} records</p>
            </div>
          </button>
        </div>

        {/* Profile summary */}
        {emp && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">Your Profile</p>
                <button onClick={() => setLocation("/employee/profile")} className="text-xs text-primary hover:underline" data-testid="link-profile">
                  View full profile
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-mono font-medium">{emp.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <Badge variant="secondary">{emp.department}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
