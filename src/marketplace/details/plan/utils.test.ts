import { describe, it, expect } from 'vitest';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { combinePrices } from './utils';

describe('combinePrices', () => {
  const createOffering = (
    components: Array<{
      type: string;
      billing_type: string;
      is_prepaid?: boolean;
    }>,
  ): PublicOfferingDetails =>
    ({
      components: components.map((c) => ({
        type: c.type,
        billing_type: c.billing_type,
        is_prepaid: c.is_prepaid ?? false,
        name: c.type,
        measured_unit: 'unit',
      })),
    }) as PublicOfferingDetails;

  const createPlan = (
    quotas: Record<string, number>,
    prices: Record<string, number>,
    unit: string = 'quantity',
  ): BasePublicPlan =>
    ({
      quotas,
      prices,
      unit,
    }) as BasePublicPlan;

  // Helper to calculate total from components (same logic as frontend display)
  const calculateComponentsTotal = (
    prices: ReturnType<typeof combinePrices>,
  ) => {
    return prices.components.reduce(
      (sum, component) => sum + component.subTotal,
      0,
    );
  };

  describe('one-time component amount calculation', () => {
    it('should use quota value of 0 for one-time components instead of defaulting to 1', () => {
      const offering = createOffering([
        { type: 'slurm_cpu', billing_type: 'one' },
        { type: 'consulting_hours', billing_type: 'one' },
        { type: 'slurm_gpu', billing_type: 'one' },
      ]);

      const plan = createPlan(
        {
          slurm_cpu: 0, // explicitly set to 0
          consulting_hours: 0, // explicitly set to 0
          slurm_gpu: 40, // has a non-zero value
        },
        {
          slurm_cpu: 5,
          consulting_hours: 100,
          slurm_gpu: 15,
        },
      );

      const result = combinePrices(plan, {}, {}, offering);

      // Components with quota=0 should have amount=0, not default to 1
      const cpuComponent = result.components.find(
        (c) => c.type === 'slurm_cpu',
      );
      expect(cpuComponent?.amount).toBe(0);
      expect(cpuComponent?.subTotal).toBe(0); // 5 * 0 = 0

      const consultingComponent = result.components.find(
        (c) => c.type === 'consulting_hours',
      );
      expect(consultingComponent?.amount).toBe(0);
      expect(consultingComponent?.subTotal).toBe(0); // 100 * 0 = 0

      // Component with non-zero quota should still work
      const gpuComponent = result.components.find(
        (c) => c.type === 'slurm_gpu',
      );
      expect(gpuComponent?.amount).toBe(40);
      expect(gpuComponent?.subTotal).toBe(600); // 15 * 40 = 600

      // Total of all component subtotals should be 600
      expect(calculateComponentsTotal(result)).toBe(600);
    });

    it('should default to 1 when quota is not defined (undefined)', () => {
      const offering = createOffering([
        { type: 'some_component', billing_type: 'one' },
      ]);

      const plan = createPlan(
        {}, // no quotas defined
        { some_component: 50 },
      );

      const result = combinePrices(plan, {}, {}, offering);

      const component = result.components.find(
        (c) => c.type === 'some_component',
      );
      expect(component?.amount).toBe(1); // defaults to 1 when undefined
      expect(component?.subTotal).toBe(50); // 50 * 1 = 50
    });

    it('should default to 1 when quotas object is null', () => {
      const offering = createOffering([
        { type: 'some_component', billing_type: 'one' },
      ]);

      const plan = createPlan(
        null as any, // null quotas
        { some_component: 50 },
      );

      const result = combinePrices(plan, {}, {}, offering);

      const component = result.components.find(
        (c) => c.type === 'some_component',
      );
      expect(component?.amount).toBe(1); // defaults to 1 when null
    });
  });

  describe('regression test for production bug', () => {
    it('should calculate correct total matching backend (679.20, not 804.20)', () => {
      // This test reproduces the production bug where frontend showed 804.20
      // but backend correctly calculated 679.20
      const offering = createOffering([
        { type: 'slurm_cpu', billing_type: 'one' },
        { type: 'consulting_hours', billing_type: 'one' },
        { type: 'slurm_gpu_h100', billing_type: 'one' },
        { type: 'slurm_gpu_h200', billing_type: 'one' },
        { type: 'os_ram', billing_type: 'one' },
        { type: 'os_storage', billing_type: 'one' },
        { type: 'os_cores', billing_type: 'one' },
      ]);

      const plan = createPlan(
        {
          slurm_cpu: 0,
          consulting_hours: 0,
          slurm_gpu_h100: 40,
          slurm_gpu_h200: 0,
          os_ram: 4,
          os_storage: 1024,
          os_cores: 2,
        },
        {
          slurm_cpu: 5,
          consulting_hours: 100,
          slurm_gpu_h100: 15,
          slurm_gpu_h200: 20,
          os_ram: 2,
          os_storage: 0.05,
          os_cores: 10,
        },
      );

      const result = combinePrices(plan, {}, {}, offering);

      // Verify individual component amounts respect 0 values
      expect(
        result.components.find((c) => c.type === 'slurm_cpu')?.amount,
      ).toBe(0);
      expect(
        result.components.find((c) => c.type === 'consulting_hours')?.amount,
      ).toBe(0);
      expect(
        result.components.find((c) => c.type === 'slurm_gpu_h200')?.amount,
      ).toBe(0);

      // Verify subtotals
      expect(
        result.components.find((c) => c.type === 'slurm_cpu')?.subTotal,
      ).toBe(0);
      expect(
        result.components.find((c) => c.type === 'consulting_hours')?.subTotal,
      ).toBe(0);
      expect(
        result.components.find((c) => c.type === 'slurm_gpu_h100')?.subTotal,
      ).toBe(600); // 15 * 40
      expect(
        result.components.find((c) => c.type === 'slurm_gpu_h200')?.subTotal,
      ).toBe(0);
      expect(result.components.find((c) => c.type === 'os_ram')?.subTotal).toBe(
        8,
      ); // 2 * 4
      expect(
        result.components.find((c) => c.type === 'os_storage')?.subTotal,
      ).toBe(51.2); // 0.05 * 1024
      expect(
        result.components.find((c) => c.type === 'os_cores')?.subTotal,
      ).toBe(20); // 10 * 2

      // Expected total: 15*40 + 2*4 + 0.05*1024 + 10*2 = 600 + 8 + 51.2 + 20 = 679.2
      // Bug was: 5*1 + 100*1 + 15*40 + 20*1 + 2*4 + 0.05*1024 + 10*2 = 804.2
      expect(calculateComponentsTotal(result)).toBe(679.2);
    });
  });
});
