export interface UsageImportRow {
  uuid: string; // Generated for tracking
  customerName: string;
  customerUuid?: string; // Resolved from lookup
  customerMatched: boolean;
  itemName: string;
  amount: number;
  articleCode?: string;
  serviceProviderName?: string;
  offeringName?: string;
  planName?: string;
  status: 'ready' | 'skipped' | 'error' | 'created';
  error?: string;
}

export interface ColumnMapping {
  customerColumn: string;
  itemNameColumn: string;
  amountColumn: string;
  articleCodeColumn?: string;
  serviceProviderColumn?: string;
  offeringColumn?: string;
  planColumn?: string;
}

export interface ExcelParseResult {
  headers: string[];
  rows: Record<string, any>[];
}

export interface CustomerLookup {
  uuid: string;
  name: string;
}
