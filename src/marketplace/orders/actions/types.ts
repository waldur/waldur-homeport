export interface OrderActionProps {
  orderId: string;
  customerId?: string;
  projectId?: string;
  refetch?(): void;
}
