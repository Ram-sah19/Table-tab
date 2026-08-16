import { queryOptions } from "@tanstack/react-query";
import { getServiceRequestsServerFn } from "./api";

export type ServiceRequestType = "waiter" | "water" | "bill" | "cleaning";
export type ServiceRequestStatus = "open" | "resolved";

export type ServiceRequest = {
  id: string;
  table_number: string;
  customer_name: string;
  type: ServiceRequestType;
  note: string;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
};

export const REQUEST_TYPES: { id: ServiceRequestType; label: string }[] = [
  { id: "waiter", label: "Call waiter" },
  { id: "water", label: "Water refill" },
  { id: "bill", label: "Bring the bill" },
  { id: "cleaning", label: "Clean table" },
];

export const REQUEST_LABEL: Record<ServiceRequestType, string> = {
  waiter: "Waiter",
  water: "Water",
  bill: "Bill",
  cleaning: "Cleaning",
};

export const serviceRequestsQuery = queryOptions({
  queryKey: ["service_requests"],
  queryFn: async () => {
    return (await getServiceRequestsServerFn()) as unknown as ServiceRequest[];
  },
  refetchInterval: 3000,
});
