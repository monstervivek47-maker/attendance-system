import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getAttendanceRecords, AttendanceRecord } from "@/utils/storage";
import { CalendarCheck, Search, MapPin } from "lucide-react";

export default function AdminAttendance() {
  const records = getAttendanceRecords();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");
  const [viewSelfie, setViewSelfie] = useState<AttendanceRecord | null>(null);

  const filtered = useMemo(() => {
    return records.filter(
      (r) =>
        r.date === selectedDate &&
        (search === "" ||
          r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          r.employeeId.toLowerCase().includes(search.toLowerCase()))
    );
  }, [records, selectedDate, search]);

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
          <h1 className="text-2xl font-bold text-foreground">Daily Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">View attendance records by date</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                  data-testid="input-date"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or employee ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{formatDate(selectedDate)}</p>
              <Badge variant="secondary">{filtered.length} present</Badge>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">
                  {search ? "No records match your search." : "No attendance records for this date."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Employee", "ID", "Time", "Location", "Selfie", "Status"].map((h) => (
                        <th key={h} className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/40 transition-colors" data-testid={`row-record-${record.id}`}>
                        <td className="py-3 px-2 font-medium">{record.employeeName}</td>
                        <td className="py-3 px-2">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{record.employeeId}</span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{record.time}</td>
                        <td className="py-3 px-2">
                          {record.location ? (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs">
                              <MapPin className="h-3 w-3" />
                              {record.location}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {record.selfieBase64 ? (
                            <button
                              onClick={() => setViewSelfie(record)}
                              className="focus:outline-none"
                              data-testid={`button-selfie-${record.id}`}
                            >
                              <img
                                src={record.selfieBase64}
                                alt="selfie"
                                className="w-10 h-10 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            </button>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">{record.status}</Badge>
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

      {/* Selfie viewer */}
      <Dialog open={!!viewSelfie} onOpenChange={(open) => !open && setViewSelfie(null)}>
        <DialogContent className="max-w-sm">
          {viewSelfie && (
            <div className="space-y-3">
              <div>
                <p className="font-semibold">{viewSelfie.employeeName}</p>
                <p className="text-sm text-muted-foreground">{viewSelfie.date} at {viewSelfie.time}</p>
              </div>
              <img
                src={viewSelfie.selfieBase64}
                alt="Attendance selfie"
                className="w-full rounded-lg border border-border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
