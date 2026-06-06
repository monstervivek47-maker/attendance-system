import { useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEmployees, getAttendanceRecords } from "@/utils/storage";
import { Users, UserCheck, UserX, TrendingUp, Clock } from "lucide-react";

export default function AdminDashboard() {
  const employees = getEmployees();
  const records = getAttendanceRecords();

  const today = new Date().toISOString().split("T")[0];

  const todayRecords = useMemo(
    () => records.filter((r) => r.date === today),
    [records, today]
  );

  const presentCount = todayRecords.length;
  const totalEmployees = employees.length;
  const absentCount = Math.max(0, totalEmployees - presentCount);
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  const stats = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Present Today",
      value: presentCount,
      icon: <UserCheck className="h-5 w-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Absent Today",
      value: absentCount,
      icon: <UserX className="h-5 w-5" />,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatDate(today)}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's attendance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Today's Check-ins</CardTitle>
              <Badge variant="secondary">{todayRecords.length} present</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todayRecords.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">No attendance records for today yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Employee</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">ID</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Check-in Time</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Selfie</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {todayRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-attendance-${record.id}`}>
                        <td className="py-3 px-2 font-medium">{record.employeeName}</td>
                        <td className="py-3 px-2 text-muted-foreground">{record.employeeId}</td>
                        <td className="py-3 px-2 text-muted-foreground">{record.time}</td>
                        <td className="py-3 px-2">
                          {record.selfieBase64 && (
                            <img
                              src={record.selfieBase64}
                              alt="selfie"
                              className="w-10 h-10 rounded-lg object-cover border border-border"
                            />
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                            {record.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
