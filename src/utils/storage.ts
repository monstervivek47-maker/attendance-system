export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  department: string;
  mobileNumber: string;
  role: "employee";
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  selfieBase64: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: "Present" | "Absent";
  location: string;
}

export type UserSession = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "admin" | "employee";
};

const EMPLOYEES_KEY = "employees";
const ATTENDANCE_KEY = "attendanceRecords";
const CURRENT_USER_KEY = "currentUser";

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveAttendanceRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};

export const getCurrentUser = (): UserSession | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: UserSession) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
