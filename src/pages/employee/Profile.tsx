import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getEmployees } from "@/utils/storage";
import { User, Mail, Phone, Building2, Hash, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const employees = getEmployees();
  const emp = employees.find((e) => e.employeeId === user?.employeeId);

  const fields = emp
    ? [
        { label: "Full Name", value: emp.name, icon: <User className="h-4 w-4" /> },
        { label: "Employee ID", value: emp.employeeId, icon: <Hash className="h-4 w-4" />, mono: true },
        { label: "Email Address", value: emp.email, icon: <Mail className="h-4 w-4" /> },
        { label: "Department", value: emp.department, icon: <Building2 className="h-4 w-4" />, badge: true },
        { label: "Mobile Number", value: emp.mobileNumber, icon: <Phone className="h-4 w-4" /> },
        { label: "Role", value: "Employee", icon: <ShieldCheck className="h-4 w-4" /> },
      ]
    : [];

  return (
    <Layout>
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Your account information</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{user?.name}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <Badge variant="secondary" className="mt-1">Employee</Badge>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            {emp ? (
              <div className="divide-y divide-border">
                {fields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between py-4" data-testid={`field-${field.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      {field.icon}
                      {field.label}
                    </div>
                    <div>
                      {field.badge ? (
                        <Badge variant="secondary">{field.value}</Badge>
                      ) : (
                        <span className={`text-sm font-medium ${field.mono ? "font-mono" : ""}`}>
                          {field.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-muted-foreground text-sm">Profile not found. Please contact your admin.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
