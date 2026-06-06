import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEmployees, getAttendanceRecords, exportToCSV } from "@/utils/storage";
import { BarChart3, Download } from "lucide-react";

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const employees = getEmployees();
  const records = getAttendanceRecords();

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const daysInMonth = new Date(year, month, 0).getDate();
  const workingDays = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  }, [month, year, daysInMonth]);

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthStr));

  const report = useMemo(() => {
    return employees.map((emp) => {
      const empRecords = monthRecords.filter((r) => r.employeeId === emp.employeeId);
      const presentDays = new Set(empRecords.map((r) => r.date)).size;
      const absentDays = Math.max(0, workingDays - presentDays);
      const rate = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;
      return { ...emp, presentDays, absentDays, rate };
    });
  }, [employees, monthRecords, workingDays]);

  const handleExport = () => {
    const headers = ["Employee ID", "Name", "Department", "Present Days", "Absent Days", "Attendance Rate (%)"];
    const rows = report.map((r) => [r.employeeId, r.name, r.department, r.presentDays, r.absentDays, r.rate]);
    exportToCSV(`attendance-report-${monthStr}.csv`, headers, rows);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Monthly Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">Attendance summary per employee</p>
          </div>
          <Button onClick={handleExport} data-testid="button-export-csv">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="select-month"
                >
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  data-testid="select-year"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Working days this month</p>
                <p className="text-2xl font-bold text-foreground">{workingDays}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {report.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">No employees to report on. Add employees first.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Emp ID", "Name", "Department", "Present", "Absent", "Rate"].map((h) => (
                        <th key={h} className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/40 transition-colors" data-testid={`row-report-${emp.id}`}>
                        <td className="py-3 px-2">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{emp.employeeId}</span>
                        </td>
                        <td className="py-3 px-2 font-medium">{emp.name}</td>
                        <td className="py-3 px-2"><Badge variant="secondary">{emp.department}</Badge></td>
                        <td className="py-3 px-2">
                          <span className="text-emerald-600 font-semibold">{emp.presentDays}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={emp.absentDays > 0 ? "text-rose-600 font-semibold" : "text-muted-foreground"}>{emp.absentDays}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[80px]">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${emp.rate}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${emp.rate >= 80 ? "text-emerald-600" : emp.rate >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                              {emp.rate}%
                            </span>
                          </div>
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
