import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getEmployees, saveEmployees, Employee } from "@/utils/storage";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";

const schema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
  mobileNumber: z.string().min(10, "Enter a valid mobile number"),
});

type FormValues = z.infer<typeof schema>;

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: "", name: "", email: "", password: "", department: "", mobileNumber: "" },
  });

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditTarget(null);
    form.reset({ employeeId: "", name: "", email: "", password: "", department: "", mobileNumber: "" });
    setDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditTarget(emp);
    form.reset({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      password: emp.password || "",
      department: emp.department,
      mobileNumber: emp.mobileNumber,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    let updated: Employee[];
    if (editTarget) {
      updated = employees.map((e) =>
        e.id === editTarget.id ? { ...e, ...values } : e
      );
    } else {
      const newEmp: Employee = {
        id: crypto.randomUUID(),
        role: "employee",
        ...values,
      };
      updated = [...employees, newEmp];
    }
    saveEmployees(updated);
    setEmployees(updated);
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updated = employees.filter((e) => e.id !== deleteTarget.id);
    saveEmployees(updated);
    setEmployees(updated);
    setDeleteTarget(null);
  };

  const departments = [...new Set(employees.map((e) => e.department))];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground text-sm mt-1">{employees.length} employees registered</p>
          </div>
          <Button onClick={openAdd} data-testid="button-add-employee">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, department, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
              <Badge variant="secondary">{filtered.length} results</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">
                  {search ? "No employees match your search." : "No employees yet. Add your first employee."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Emp ID", "Name", "Email", "Department", "Mobile", "Actions"].map((h) => (
                        <th key={h} className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/40 transition-colors" data-testid={`row-employee-${emp.id}`}>
                        <td className="py-3 px-2">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{emp.employeeId}</span>
                        </td>
                        <td className="py-3 px-2 font-medium">{emp.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">{emp.email}</td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary">{emp.department}</Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{emp.mobileNumber}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(emp)}
                              data-testid={`button-edit-${emp.id}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(emp)}
                              data-testid={`button-delete-${emp.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="employeeId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl><Input placeholder="EMP001" data-testid="input-employeeId" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" data-testid="input-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="john@company.com" data-testid="input-email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Min 6 characters" data-testid="input-password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering" list="dept-list" data-testid="input-department" {...field} />
                    </FormControl>
                    <datalist id="dept-list">
                      {departments.map((d) => <option key={d} value={d} />)}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl><Input placeholder="9876543210" data-testid="input-mobile" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="button-save-employee">
                  {editTarget ? "Save Changes" : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
