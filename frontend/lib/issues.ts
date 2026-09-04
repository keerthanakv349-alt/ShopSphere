import { api } from "@/lib/api";

export type IssueStatus = "open" | "in_progress" | "resolved";

export interface IssueReport {
  id: string;
  subject: string;
  message: string;
  status: IssueStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export async function createIssueReport(subject: string, message: string): Promise<IssueReport> {
  const { data } = await api.post<IssueReport>("/api/v1/issues", { subject, message });
  return data;
}

export async function fetchMyIssueReports(): Promise<IssueReport[]> {
  const { data } = await api.get<IssueReport[]>("/api/v1/issues");
  return data;
}
