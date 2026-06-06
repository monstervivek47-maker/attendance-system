import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WebcamCapture } from "@/components/WebcamCapture";
import { useAuth } from "@/hooks/useAuth";
import { getAttendanceRecords, saveAttendanceRecords, AttendanceRecord } from "@/utils/storage";
import { CheckCircle2, MapPin, Clock, Calendar, AlertCircle } from "lucide-react";

export default function MarkAttendance() {
  const { user } = useAuth();
  const [selfie, setSelfie] = useState("");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const records = getAttendanceRecords();
  const alreadyMarked = useMemo(
    () => records.find((r) => r.employeeId === user?.employeeId && r.date === today),
    [records, user, today]
  );

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocationLoading(false);
        },
        () => {
          setLocation("");
          setLocationLoading(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", { hour12: false });
  };

  const handleSubmit = () => {
    if (!selfie) {
      setError("Please capture your selfie before submitting.");
      return;
    }
    setError("");

    const now = new Date();
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      employeeId: user!.employeeId,
      employeeName: user!.name,
      selfieBase64: selfie,
      date: today,
      time: formatTime(now),
      status: "Present",
      location,
    };

    const existing = getAttendanceRecords();
    saveAttendanceRecords([...existing, record]);
    setSubmitted(true);
  };

  if (alreadyMarked || submitted) {
    const record = submitted
      ? getAttendanceRecords().find((r) => r.employeeId === user?.employeeId && r.date === today)
      : alreadyMarked;

    return (
      <Layout>
        <div className="max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
            <p className="text-muted-foreground text-sm mt-1">{formatDate(today)}</p>
          </div>
          <Card className="border-emerald-200 bg-emerald-50/60">
            <CardContent className="pt-8 pb-8 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-1">
                {submitted ? "Attendance Marked!" : "Already Checked In"}
              </h2>
              <p className="text-muted-foreground text-sm mb-5">
                {submitted
                  ? "Your attendance has been recorded successfully."
                  : "You've already marked attendance for today."}
              </p>
              {record && (
                <div className="space-y-2 text-sm text-left bg-white/70 rounded-lg p-4 border border-emerald-100">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{record.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{record.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-emerald-600">{record.status}</span>
                  </div>
                  {record.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium text-xs">{record.location}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">{formatDate(today)}</p>
        </div>

        {/* Auto-filled info */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Calendar className="h-3.5 w-3.5" />
                Date
              </div>
              <p className="text-sm font-semibold">{today}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Clock className="h-3.5 w-3.5" />
                Current Time
              </div>
              <p className="text-sm font-semibold font-mono">{formatTime(currentTime)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Location */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </div>
            {locationLoading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Getting location...</p>
            ) : location ? (
              <p className="text-sm font-semibold">{location}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Location unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Webcam */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selfie Capture</CardTitle>
          </CardHeader>
          <CardContent>
            <WebcamCapture onCapture={setSelfie} />
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg" data-testid="text-error">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!selfie}
          data-testid="button-submit-attendance"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Submit Attendance
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Attendance can only be marked once per day
        </p>
      </div>
    </Layout>
  );
}
