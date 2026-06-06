import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { getAttendanceRecords, AttendanceRecord } from "@/utils/storage";
import { History, MapPin } from "lucide-react";

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [viewSelfie, setViewSelfie] = useState<AttendanceRecord | null>(null);

  const records = getAttendanceRecords();
  const myRecords = useMemo(
    () =>
      records
        .filter((r) => r.employeeId === user?.employeeId)
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [records, user]
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance History</h1>
          <p className="text-muted-foreground text-sm mt-1">{myRecords.length} total records</p>
        </div>

        <Card>
          <CardContent className="pt-4">
            {myRecords.length === 0 ? (
              <div className="text-center py-16">
                <History className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">No attendance records yet.</p>
                <p className="text-muted-foreground text-xs mt-1">Mark your first attendance to see it here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Date", "Check-in Time", "Location", "Selfie", "Status"].map((h) => (
                        <th key={h} className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-muted/40 transition-colors" data-testid={`row-history-${record.id}`}>
                        <td className="py-3 px-2 font-medium">{formatDate(record.date)}</td>
                        <td className="py-3 px-2 font-mono text-muted-foreground">{record.time}</td>
                        <td className="py-3 px-2">
                          {record.location ? (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
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

      {/* Selfie viewer */}
      <Dialog open={!!viewSelfie} onOpenChange={(open) => !open && setViewSelfie(null)}>
        <DialogContent className="max-w-sm">
          {viewSelfie && (
            <div className="space-y-3">
              <div>
                <p className="font-semibold">{formatDate(viewSelfie.date)}</p>
                <p className="text-sm text-muted-foreground">Check-in at {viewSelfie.time}</p>
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
