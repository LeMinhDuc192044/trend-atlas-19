import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboard,
  getSummary,
  getPublicationsByYear,
  getTopDomains,
  getTopJournals
} from "@/api/dashboardApi";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
}

export function usePublicationsByYear() {
  return useQuery({
    queryKey: ["dashboard", "publications-by-year"],
    queryFn: getPublicationsByYear,
  });
}

export function useTopDomains() {
  return useQuery({
    queryKey: ["dashboard", "top-domains"],
    queryFn: getTopDomains,
  });
}

export function useTopJournals() {
  return useQuery({
    queryKey: ["dashboard", "top-journals"],
    queryFn: getTopJournals,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getSummary,
  });
}