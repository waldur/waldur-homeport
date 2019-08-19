export interface Issue {
  type: string;
  key: string;
  uuid: string;
  summary: string;
  caller_uuid: string;
  caller_full_name: string;
  customer_uuid: string;
  customer_name: string;
  created: string;
  modified: string;
}
