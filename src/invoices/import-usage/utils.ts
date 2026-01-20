import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

import { COMPONENT_USAGE_IMPORT_FORM_ID } from '@waldur/invoices/constants';

import {
  ColumnMapping,
  CustomerLookup,
  ExcelParseResult,
  UsageImportRow,
} from './types';

export { COMPONENT_USAGE_IMPORT_FORM_ID };

export const parseExcelFile = (file: File): Promise<ExcelParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as any[][];

        if (jsonData.length === 0) {
          reject(new Error('The file is empty'));
          return;
        }

        // First row is headers
        const headers = jsonData[0].map((h) => String(h).trim());

        // Rest are data rows
        const rows = jsonData.slice(1).map((row) => {
          const rowObj: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index];
          });
          return rowObj;
        });

        resolve({ headers, rows });
      } catch {
        reject(new Error('Failed to parse the Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsBinaryString(file);
  });
};

export const mapRowsToUsage = (
  rows: Record<string, any>[],
  mapping: ColumnMapping,
  customers: CustomerLookup[],
): UsageImportRow[] => {
  return rows
    .map((row) => {
      const customerName = String(row[mapping.customerColumn] || '').trim();
      const itemName = String(row[mapping.itemNameColumn] || '').trim();
      const amountValue = row[mapping.amountColumn];
      const amount = parseFloat(String(amountValue).replace(',', '.')) || 0;
      const articleCode = mapping.articleCodeColumn
        ? String(row[mapping.articleCodeColumn] || '').trim()
        : undefined;
      const serviceProviderName = mapping.serviceProviderColumn
        ? String(row[mapping.serviceProviderColumn] || '').trim()
        : undefined;
      const offeringName = mapping.offeringColumn
        ? String(row[mapping.offeringColumn] || '').trim()
        : undefined;
      const planName = mapping.planColumn
        ? String(row[mapping.planColumn] || '').trim()
        : undefined;

      // Look up customer (case-insensitive)
      const matchedCustomer = customers.find(
        (c) => c.name.toLowerCase() === customerName.toLowerCase(),
      );

      const validation = validateRow({ customerName, itemName, amount });

      let status: UsageImportRow['status'] = 'ready';
      let error: string | undefined;

      if (!validation.valid) {
        status = 'error';
        error = validation.error;
      } else if (!matchedCustomer) {
        status = 'error';
        error = 'Customer not found';
      } else if (amount === 0) {
        status = 'skipped';
        error = 'Zero amount';
      }

      return {
        uuid: uuidv4(),
        customerName,
        customerUuid: matchedCustomer?.uuid,
        customerMatched: !!matchedCustomer,
        itemName,
        amount,
        articleCode: articleCode || undefined,
        serviceProviderName: serviceProviderName || undefined,
        offeringName: offeringName || undefined,
        planName: planName || undefined,
        status,
        error,
      };
    })
    .filter((row) => row.customerName || row.itemName); // Filter out completely empty rows
};

const validateRow = (row: {
  customerName: string;
  itemName: string;
  amount: number;
}): { valid: boolean; error?: string } => {
  if (!row.customerName) {
    return { valid: false, error: 'Customer name is required' };
  }
  if (!row.itemName) {
    return { valid: false, error: 'Item name is required' };
  }
  if (isNaN(row.amount)) {
    return { valid: false, error: 'Invalid amount value' };
  }
  return { valid: true };
};

export const getImportSummary = (
  rows: UsageImportRow[],
): {
  ready: number;
  skipped: number;
  errors: number;
  total: number;
} => {
  return rows.reduce(
    (acc, row) => {
      acc.total++;
      if (row.status === 'ready') acc.ready++;
      else if (row.status === 'skipped') acc.skipped++;
      else if (row.status === 'error') acc.errors++;
      return acc;
    },
    { ready: 0, skipped: 0, errors: 0, total: 0 },
  );
};

export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: Array<{ label: string; value: number }> = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push({ label: String(year), value: year });
  }
  return years;
};

export const getMonthOptions = () => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months.map((name, index) => ({
    label: name,
    value: index + 1,
  }));
};
