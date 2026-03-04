import * as fs from 'fs';
import * as path from 'path';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import {
  getImportSummary,
  getMonthOptions,
  getYearOptions,
  mapRowsToUsage,
  parseExcelFile,
} from './utils';

vi.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

// Polyfill File.arrayBuffer for jsdom (used by read-excel-file/browser)
beforeAll(() => {
  if (!File.prototype.arrayBuffer) {
    File.prototype.arrayBuffer = function () {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(this);
      });
    };
  }
});

/**
 * Load a fixture xlsx file and wrap it in a File object for browser-API testing.
 */
function loadFixtureFile(filename: string): File {
  const filePath = path.resolve(__dirname, 'fixtures', filename);
  const buffer = fs.readFileSync(filePath);
  return new File([buffer], filename, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ─── Integration tests: real xlsx parsing ───────────────────────────────
// These tests parse real .xlsx files (valid Open XML archives) through
// parseExcelFile, verifying that the read-excel-file library produces the
// same output contract that the old xlsx (SheetJS) library did.

describe('parseExcelFile (integration)', () => {
  it('should parse a real xlsx file with headers and data rows', async () => {
    const file = loadFixtureFile('sample.xlsx');
    const result = await parseExcelFile(file);

    expect(result.headers).toEqual(['Customer', 'Item', 'Amount']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({
      Customer: 'Acme Corp',
      Item: 'VM Instance',
      Amount: 100,
    });
    expect(result.rows[1]).toEqual({
      Customer: 'Beta Inc',
      Item: 'Storage',
      Amount: 50.5,
    });
  });

  it('should return headers with empty rows array for headers-only xlsx', async () => {
    const file = loadFixtureFile('headers-only.xlsx');
    const result = await parseExcelFile(file);

    expect(result.headers).toEqual(['Customer', 'Item', 'Amount']);
    expect(result.rows).toHaveLength(0);
  });

  it('should produce output compatible with mapRowsToUsage', async () => {
    const file = loadFixtureFile('sample.xlsx');
    const { rows } = await parseExcelFile(file);

    const customers = [
      { uuid: 'cust-1', name: 'Acme Corp' },
      { uuid: 'cust-2', name: 'Beta Inc' },
    ];
    const mapping = {
      customerColumn: 'Customer',
      itemNameColumn: 'Item',
      amountColumn: 'Amount',
    };

    const usageRows = mapRowsToUsage(rows, mapping, customers);

    expect(usageRows).toHaveLength(2);
    expect(usageRows[0]).toMatchObject({
      customerName: 'Acme Corp',
      customerUuid: 'cust-1',
      customerMatched: true,
      itemName: 'VM Instance',
      amount: 100,
      status: 'ready',
    });
    expect(usageRows[1]).toMatchObject({
      customerName: 'Beta Inc',
      customerUuid: 'cust-2',
      customerMatched: true,
      itemName: 'Storage',
      amount: 50.5,
      status: 'ready',
    });
  });
});

// ─── Unit tests: mapRowsToUsage ─────────────────────────────────────────

describe('mapRowsToUsage', () => {
  const mapping = {
    customerColumn: 'Customer',
    itemNameColumn: 'Item',
    amountColumn: 'Amount',
  };

  const customers = [
    { uuid: 'cust-1', name: 'Acme Corp' },
    { uuid: 'cust-2', name: 'Beta Inc' },
  ];

  it('should map rows with matched customers', () => {
    const rows = [
      { Customer: 'Acme Corp', Item: 'VM Instance', Amount: '100' },
    ];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      customerName: 'Acme Corp',
      customerUuid: 'cust-1',
      customerMatched: true,
      itemName: 'VM Instance',
      amount: 100,
      status: 'ready',
    });
  });

  it('should mark unmatched customers as error', () => {
    const rows = [{ Customer: 'Unknown Corp', Item: 'Storage', Amount: '50' }];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result[0]).toMatchObject({
      customerMatched: false,
      status: 'error',
      error: 'Customer not found',
    });
  });

  it('should mark zero amount as skipped', () => {
    const rows = [{ Customer: 'Acme Corp', Item: 'Item', Amount: '0' }];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result[0].status).toBe('skipped');
    expect(result[0].error).toBe('Zero amount');
  });

  it('should match customers case-insensitively', () => {
    const rows = [{ Customer: 'acme corp', Item: 'Item', Amount: '10' }];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result[0].customerMatched).toBe(true);
    expect(result[0].customerUuid).toBe('cust-1');
  });

  it('should validate missing customer name', () => {
    const rows = [{ Customer: '', Item: 'Item', Amount: '10' }];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result[0].status).toBe('error');
    expect(result[0].error).toBe('Customer name is required');
  });

  it('should validate missing item name', () => {
    const rows = [{ Customer: 'Acme Corp', Item: '', Amount: '10' }];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result[0].status).toBe('error');
    expect(result[0].error).toBe('Item name is required');
  });

  it('should filter out completely empty rows', () => {
    const rows = [
      { Customer: 'Acme Corp', Item: 'Item', Amount: '10' },
      { Customer: '', Item: '', Amount: '' },
    ];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result).toHaveLength(1);
  });

  it('should handle comma decimal separator', () => {
    const rows = [{ Customer: 'Acme Corp', Item: 'Item', Amount: '10,50' }];
    const result = mapRowsToUsage(rows, mapping, customers);

    expect(result[0].amount).toBe(10.5);
  });

  it('should map optional columns when provided', () => {
    const extendedMapping = {
      ...mapping,
      articleCodeColumn: 'Code',
      serviceProviderColumn: 'Provider',
      offeringColumn: 'Offering',
      planColumn: 'Plan',
    };
    const rows = [
      {
        Customer: 'Acme Corp',
        Item: 'Item',
        Amount: '10',
        Code: 'ART-001',
        Provider: 'ProviderA',
        Offering: 'Offer1',
        Plan: 'Basic',
      },
    ];
    const result = mapRowsToUsage(rows, extendedMapping, customers);

    expect(result[0]).toMatchObject({
      articleCode: 'ART-001',
      serviceProviderName: 'ProviderA',
      offeringName: 'Offer1',
      planName: 'Basic',
    });
  });
});

// ─── Unit tests: getImportSummary ───────────────────────────────────────

describe('getImportSummary', () => {
  it('should count statuses correctly', () => {
    const rows = [
      { status: 'ready' },
      { status: 'ready' },
      { status: 'skipped' },
      { status: 'error' },
    ] as any;

    const summary = getImportSummary(rows);
    expect(summary).toEqual({ ready: 2, skipped: 1, errors: 1, total: 4 });
  });

  it('should return zeros for empty array', () => {
    expect(getImportSummary([])).toEqual({
      ready: 0,
      skipped: 0,
      errors: 0,
      total: 0,
    });
  });
});

// ─── Unit tests: helpers ────────────────────────────────────────────────

describe('getYearOptions', () => {
  it('should return 6 years starting from current year', () => {
    const options = getYearOptions();
    const currentYear = new Date().getFullYear();

    expect(options).toHaveLength(6);
    expect(options[0].value).toBe(currentYear);
    expect(options[5].value).toBe(currentYear - 5);
  });
});

describe('getMonthOptions', () => {
  it('should return 12 months', () => {
    const options = getMonthOptions();
    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ label: 'January', value: 1 });
    expect(options[11]).toEqual({ label: 'December', value: 12 });
  });
});
