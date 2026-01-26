import { describe, it, expect } from 'vitest';

import { recordToArray, arrayToRecord } from './TresBillingWeightsField';

describe('TresBillingWeightsField utilities', () => {
  describe('recordToArray', () => {
    it('should convert empty record to empty array', () => {
      const result = recordToArray({});
      expect(result).toEqual([]);
    });

    it('should convert record with single entry', () => {
      const result = recordToArray({ CPU: 0.015625 });
      expect(result).toEqual([{ key: 'CPU', value: 0.015625 }]);
    });

    it('should convert record with multiple entries', () => {
      const result = recordToArray({
        CPU: 0.015625,
        Mem: 0.001953125,
        'GRES/gpu': 0.25,
      });
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ key: 'CPU', value: 0.015625 });
      expect(result).toContainEqual({ key: 'Mem', value: 0.001953125 });
      expect(result).toContainEqual({ key: 'GRES/gpu', value: 0.25 });
    });
  });

  describe('arrayToRecord', () => {
    it('should convert empty array to empty record', () => {
      const result = arrayToRecord([]);
      expect(result).toEqual({});
    });

    it('should convert array with single entry', () => {
      const result = arrayToRecord([{ key: 'CPU', value: 0.015625 }]);
      expect(result).toEqual({ CPU: 0.015625 });
    });

    it('should convert array with multiple entries', () => {
      const result = arrayToRecord([
        { key: 'CPU', value: 0.015625 },
        { key: 'Mem', value: 0.001953125 },
        { key: 'GRES/gpu', value: 0.25 },
      ]);
      expect(result).toEqual({
        CPU: 0.015625,
        Mem: 0.001953125,
        'GRES/gpu': 0.25,
      });
    });

    it('should skip entries with empty keys', () => {
      const result = arrayToRecord([
        { key: 'CPU', value: 0.015625 },
        { key: '', value: 0.5 },
        { key: 'Mem', value: 0.001953125 },
      ]);
      expect(result).toEqual({
        CPU: 0.015625,
        Mem: 0.001953125,
      });
    });

    it('should handle zero values', () => {
      const result = arrayToRecord([{ key: 'CPU', value: 0 }]);
      expect(result).toEqual({ CPU: 0 });
    });
  });

  describe('roundtrip conversion', () => {
    it('should preserve data through record -> array -> record', () => {
      const original = {
        CPU: 0.015625,
        Mem: 0.001953125,
        'GRES/gpu': 0.25,
      };
      const asArray = recordToArray(original);
      const back = arrayToRecord(asArray);
      expect(back).toEqual(original);
    });

    it('should preserve data through array -> record -> array', () => {
      const original = [
        { key: 'CPU', value: 0.015625 },
        { key: 'Mem', value: 0.001953125 },
      ];
      const asRecord = arrayToRecord(original);
      const back = recordToArray(asRecord);
      // Note: order may differ, so we check length and contents
      expect(back).toHaveLength(original.length);
      for (const item of original) {
        expect(back).toContainEqual(item);
      }
    });
  });
});
