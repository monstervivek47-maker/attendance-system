import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { getEmployees } from "@/utils/storage";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const ADMIN_PASSWORD = "power@123";
const ADMIN_EMAILS = [
  "vivekyadav17@gmail.com",
  "vidhyaceo05@gmail.com",
  "jaycto18@gmail.com",
];

export default function Login() {
  const { user, login } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setLocation(user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard");
    }
  }, [user, setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: FormValues) => {
    setError("");

    const adminEmail = ADMIN_EMAILS.find((email) => email === values.email);

    if (adminEmail && values.password === ADMIN_PASSWORD) {
      login({
        id: "admin",
        employeeId: "ADMIN",
        name: "Administrator",
        email: adminEmail,
        role: "admin",
      });
      setLocation("/admin/dashboard");
      return;
    }

    const employees = getEmployees();
    const emp = employees.find(
      (e) => e.email === values.email && e.password === values.password
    );

    if (emp) {
      login({
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        role: "employee",
      });
      setLocation("/employee/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary px-12 py-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">AttendTrack</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Know who's here.<br />Every day.
          </h1>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            Selfie-based attendance that's fast, honest, and hard to fake. Built for teams that care about showing up.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "Daily Check-ins", value: "Verified" },
              { label: "Selfie Capture", value: "Webcam" },
              { label: "Location Tagging", value: "GPS" },
              { label: "CSV Export", value: "Reports" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-white font-semibold text-sm">{stat.value}</p>
                <p className="text-primary-foreground/70 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-foreground/50 text-sm">
          &copy; {new Date().getFullYear()} AttendTrack. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AttendTrack</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          data-testid="input-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg" data-testid="text-error">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" data-testid="button-submit">
                Sign In
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
