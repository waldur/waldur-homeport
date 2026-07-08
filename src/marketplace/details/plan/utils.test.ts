import { describe, it, expect } from 'vitest';
import { BasePublicPlan, PublicOfferingDetails } from 'waldur-js-client';

import { combinePrices } from './utils';

describe('combinePrices', () => {
  const createOffering = (
    components: Array<{
      type: string;
      billing_type: string;
      is_prepaid?: boolean;
      limit_period?: string;
      measured_unit?: string;
    }>,
  ): PublicOfferingDetails =>
    ({
      components: components.map((c) => ({
        type: c.type,
        billing_type: c.billing_type,
        is_prepaid: c.is_prepaid ?? false,
        limit_period: c.limit_period,
        name: c.type,
        measured_unit: c.measured_unit ?? 'unit',
      })),
    }) as PublicOfferingDetails;

  const createPlan = (
    quotas: Record<string, number>,
    prices: Record<string, number>,
    unit: string = 'quantity',
  ): BasePublicPlan =>
    ({
      quotas,

      prices: Object.fromEntries(
        Object.entries(prices).map(([k, v]) => [k, String(v)]),
      ),

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

  describe('limit components across plan units', () => {
    // Reproduces production bug where daily-billed OpenStack tenant pricing
    // was displayed ~30x too low. The plan component prices are per billing
    // unit (per day), but the old code divided them by limit_period (month=30),
    // treating them as monthly prices.
    it('daily plan + monthly limit: should not divide prices by 30', () => {
      const offering = createOffering([
        {
          type: 'cores',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'cores',
        },
        {
          type: 'ram',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'GB',
        },
        {
          type: 'storage',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'GB',
        },
      ]);

      const plan = createPlan(
        { cores: 0, ram: 0, storage: 0 },
        { cores: 0.072, ram: 0.0312, storage: 0.00117 },
        'day',
      );

      const limits = { cores: 12, ram: 12, storage: 130 };
      const result = combinePrices(plan, limits, {}, offering);

      // Day multipliers: [1, 30, 365]
      const coresComp = result.components.find((c) => c.type === 'cores');
      expect(coresComp?.subTotal).toBeCloseTo(0.864); // 0.072 * 12
      expect(coresComp?.prices[0]).toBeCloseTo(0.864); // per day
      expect(coresComp?.prices[1]).toBeCloseTo(25.92); // per 30 days
      expect(coresComp?.prices[2]).toBeCloseTo(315.36); // per 365 days

      const ramComp = result.components.find((c) => c.type === 'ram');
      expect(ramComp?.subTotal).toBeCloseTo(0.3744);
      expect(ramComp?.prices[1]).toBeCloseTo(11.232);

      const storageComp = result.components.find((c) => c.type === 'storage');
      expect(storageComp?.subTotal).toBeCloseTo(0.1521);
      expect(storageComp?.prices[1]).toBeCloseTo(4.563);

      // Verify total for 30 days matches backend invoice calculation
      const total30Days = result.components.reduce(
        (sum, c) => sum + c.prices[1],
        0,
      );
      expect(total30Days).toBeCloseTo(41.715); // not ~1.39 (the old buggy value)
    });

    it('monthly plan + monthly limit: identity case', () => {
      const offering = createOffering([
        {
          type: 'cores',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'cores',
        },
      ]);

      const plan = createPlan({ cores: 0 }, { cores: 2.16 }, 'month');
      const limits = { cores: 12 };
      const result = combinePrices(plan, limits, {}, offering);

      const comp = result.components.find((c) => c.type === 'cores');
      // Month multipliers: [1, 12]
      expect(comp?.subTotal).toBeCloseTo(25.92); // 2.16 * 12
      expect(comp?.prices[0]).toBeCloseTo(25.92); // per month
      expect(comp?.prices[1]).toBeCloseTo(311.04); // per year
    });

    it('hourly plan + monthly limit: should not divide prices by 720', () => {
      const offering = createOffering([
        {
          type: 'cpu',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'cores',
        },
      ]);

      // Price is per core per hour
      const plan = createPlan({ cpu: 0 }, { cpu: 0.003 }, 'hour');
      const limits = { cpu: 8 };
      const result = combinePrices(plan, limits, {}, offering);

      const comp = result.components.find((c) => c.type === 'cpu');
      // Hour multipliers: [1, 24, 720, 8760]
      expect(comp?.subTotal).toBeCloseTo(0.024); // 0.003 * 8
      expect(comp?.prices[0]).toBeCloseTo(0.024); // per hour
      expect(comp?.prices[1]).toBeCloseTo(0.576); // per day (0.024 * 24)
      expect(comp?.prices[2]).toBeCloseTo(17.28); // per 30 days (0.024 * 720)
      expect(comp?.prices[3]).toBeCloseTo(210.24); // per 365 days (0.024 * 8760)
    });

    it('daily plan + annual limit: limit_period should not affect price', () => {
      const offering = createOffering([
        {
          type: 'license',
          billing_type: 'limit',
          limit_period: 'annual',
          measured_unit: 'seats',
        },
      ]);

      const plan = createPlan({ license: 0 }, { license: 0.5 }, 'day');
      const limits = { license: 10 };
      const result = combinePrices(plan, limits, {}, offering);

      const comp = result.components.find((c) => c.type === 'license');
      // Price is 0.5 per seat per day, NOT 0.5 per seat per year
      expect(comp?.subTotal).toBeCloseTo(5.0); // 0.5 * 10
      expect(comp?.prices[0]).toBeCloseTo(5.0); // per day
      expect(comp?.prices[1]).toBeCloseTo(150.0); // per 30 days
      expect(comp?.prices[2]).toBeCloseTo(1825.0); // per 365 days
    });

    it('daily plan + quarterly limit: limit_period should not affect price', () => {
      const offering = createOffering([
        {
          type: 'quota',
          billing_type: 'limit',
          limit_period: 'quarterly',
          measured_unit: 'units',
        },
      ]);

      const plan = createPlan({ quota: 0 }, { quota: 0.1 }, 'day');
      const limits = { quota: 20 };
      const result = combinePrices(plan, limits, {}, offering);

      const comp = result.components.find((c) => c.type === 'quota');
      expect(comp?.subTotal).toBeCloseTo(2.0); // 0.1 * 20
      expect(comp?.prices[0]).toBeCloseTo(2.0); // per day
      expect(comp?.prices[1]).toBeCloseTo(60.0); // per 30 days
      expect(comp?.prices[2]).toBeCloseTo(730.0); // per 365 days
    });

    it('monthly plan + annual limit: limit_period should not affect price', () => {
      const offering = createOffering([
        {
          type: 'support',
          billing_type: 'limit',
          limit_period: 'annual',
          measured_unit: 'hours',
        },
      ]);

      const plan = createPlan({ support: 0 }, { support: 10 }, 'month');
      const limits = { support: 5 };
      const result = combinePrices(plan, limits, {}, offering);

      const comp = result.components.find((c) => c.type === 'support');
      // Price is 10 per hour per month, NOT per year
      expect(comp?.subTotal).toBeCloseTo(50.0); // 10 * 5
      expect(comp?.prices[0]).toBeCloseTo(50.0); // per month
      expect(comp?.prices[1]).toBeCloseTo(600.0); // per year (50 * 12)
    });
  });

  describe('fixed components', () => {
    it('should use plan quotas for amount and scale with plan multipliers', () => {
      const offering = createOffering([
        { type: 'base_fee', billing_type: 'fixed', measured_unit: '' },
        { type: 'support_fee', billing_type: 'fixed', measured_unit: '' },
      ]);

      const plan = createPlan(
        { base_fee: 1, support_fee: 2 },
        { base_fee: 100, support_fee: 25 },
        'month',
      );

      const result = combinePrices(plan, {}, {}, offering);

      const baseFee = result.components.find((c) => c.type === 'base_fee');
      expect(baseFee?.amount).toBe(1);
      expect(baseFee?.subTotal).toBe(100); // 100 * 1
      expect(baseFee?.prices[0]).toBe(100); // per month
      expect(baseFee?.prices[1]).toBe(1200); // per year

      const supportFee = result.components.find(
        (c) => c.type === 'support_fee',
      );
      expect(supportFee?.amount).toBe(2);
      expect(supportFee?.subTotal).toBe(50); // 25 * 2
      expect(supportFee?.prices[0]).toBe(50);
      expect(supportFee?.prices[1]).toBe(600);
    });
  });

  describe('usage components', () => {
    it('should use usages for amount', () => {
      const offering = createOffering([
        { type: 'bandwidth', billing_type: 'usage', measured_unit: 'GB' },
      ]);

      const plan = createPlan({}, { bandwidth: 0.05 }, 'month');
      const usages = { bandwidth: 200 };
      const result = combinePrices(plan, {}, usages, offering);

      const comp = result.components.find((c) => c.type === 'bandwidth');
      expect(comp?.amount).toBe(200);
      expect(comp?.subTotal).toBeCloseTo(10.0); // 0.05 * 200
      expect(comp?.prices[0]).toBeCloseTo(10.0); // per month
      expect(comp?.prices[1]).toBeCloseTo(120.0); // per year
    });
  });

  describe('mixed billing types', () => {
    it('should aggregate totals correctly across fixed, limit, and one-time components', () => {
      const offering = createOffering([
        { type: 'base_fee', billing_type: 'fixed' },
        {
          type: 'cores',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'cores',
        },
        { type: 'setup', billing_type: 'one' },
      ]);

      const plan = createPlan(
        { base_fee: 1, cores: 0, setup: 1 },
        { base_fee: 50, cores: 10, setup: 200 },
        'month',
      );

      const limits = { cores: 4 };
      const result = combinePrices(plan, limits, {}, offering);

      // Fixed: 50 * 1 = 50
      const baseFee = result.components.find((c) => c.type === 'base_fee');
      expect(baseFee?.subTotal).toBe(50);

      // Limit: 10 * 4 = 40
      const cores = result.components.find((c) => c.type === 'cores');
      expect(cores?.subTotal).toBe(40);

      // One-time: 200 * 1 = 200
      const setup = result.components.find((c) => c.type === 'setup');
      expect(setup?.subTotal).toBe(200);

      // total = subscriptionSubTotal = fixed + limit + prepaid(none) = 50 + 40 = 90
      // (one-time non-prepaid is NOT in subscriptionSubTotal)
      expect(result.total).toBe(90);

      // totalPeriods uses subscriptionSubTotal * multipliers [1, 12]
      expect(result.totalPeriods[0]).toBe(90); // per month
      expect(result.totalPeriods[1]).toBe(1080); // per year
    });
  });

  describe('totalPeriods', () => {
    it('should match sum of component prices for each period', () => {
      const offering = createOffering([
        {
          type: 'cores',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'cores',
        },
        {
          type: 'ram',
          billing_type: 'limit',
          limit_period: 'month',
          measured_unit: 'GB',
        },
      ]);

      const plan = createPlan(
        { cores: 0, ram: 0 },
        { cores: 0.072, ram: 0.0312 },
        'day',
      );

      const limits = { cores: 12, ram: 12 };
      const result = combinePrices(plan, limits, {}, offering);

      // subscriptionSubTotal = (0.072*12) + (0.0312*12) = 0.864 + 0.3744 = 1.2384
      expect(result.total).toBeCloseTo(1.2384);

      // Day multipliers: [1, 30, 365]
      expect(result.totalPeriods[0]).toBeCloseTo(1.2384); // per day
      expect(result.totalPeriods[1]).toBeCloseTo(37.152); // per 30 days
      expect(result.totalPeriods[2]).toBeCloseTo(452.016); // per 365 days

      // totalPeriods should equal sum of component prices for each period
      for (let i = 0; i < result.totalPeriods.length; i++) {
        const sumFromComponents = result.components.reduce(
          (sum, c) => sum + c.prices[i],
          0,
        );
        expect(result.totalPeriods[i]).toBeCloseTo(sumFromComponents);
      }
    });

    it('should return correct periodKeys for each plan unit', () => {
      const offering = createOffering([
        { type: 'x', billing_type: 'limit', limit_period: 'month' },
      ]);

      const dayResult = combinePrices(
        createPlan({ x: 0 }, { x: 1 }, 'day'),
        { x: 1 },
        {},
        offering,
      );
      expect(dayResult.periodKeys).toEqual(['daily', 'monthly', 'annual']);

      const hourResult = combinePrices(
        createPlan({ x: 0 }, { x: 1 }, 'hour'),
        { x: 1 },
        {},
        offering,
      );
      expect(hourResult.periodKeys).toEqual([
        'hourly',
        'daily',
        'monthly',
        'annual',
      ]);

      const monthResult = combinePrices(
        createPlan({ x: 0 }, { x: 1 }, 'month'),
        { x: 1 },
        {},
        offering,
      );
      expect(monthResult.periodKeys).toEqual(['monthly', 'annual']);
    });
  });

  describe('volume discount preview', () => {
    const planWithDiscount = (
      quotas: Record<string, number>,
      prices: Record<string, number>,
      components: Array<{
        type: string;
        discount_formula?: string;
        discount_aggregation?: string;
      }>,
    ): BasePublicPlan =>
      ({
        quotas,
        prices: Object.fromEntries(
          Object.entries(prices).map(([k, v]) => [k, String(v)]),
        ),
        unit: 'quantity',
        components,
      }) as BasePublicPlan;

    it('applies a live discount for a per-resource limit component crossing a tier', () => {
      const offering = createOffering([{ type: 'gpu', billing_type: 'limit' }]);
      const plan = planWithDiscount({ gpu: 0 }, { gpu: 500 }, [
        {
          type: 'gpu',
          discount_formula: '15 if usage >= 8 else 0',
          discount_aggregation: 'resource',
        },
      ]);
      const gpu = combinePrices(plan, { gpu: 8 }, {}, offering).components[0];
      expect(gpu.discountApplied).toBe(true);
      expect(gpu.discountPercent).toBe(15);
      expect(gpu.discountDeferred).toBe(false);
      // 500 * 8 = 4000, minus 15% = 3400
      expect(gpu.subTotal).toBe(3400);
    });

    it('defers an aggregated-scope discount to the invoice', () => {
      const offering = createOffering([{ type: 'gpu', billing_type: 'limit' }]);
      const plan = planWithDiscount({ gpu: 0 }, { gpu: 500 }, [
        {
          type: 'gpu',
          discount_formula: '15 if usage >= 8 else 0',
          discount_aggregation: 'customer',
        },
      ]);
      const gpu = combinePrices(plan, { gpu: 8 }, {}, offering).components[0];
      expect(gpu.discountApplied).toBe(false);
      expect(gpu.discountDeferred).toBe(true);
      expect(gpu.subTotal).toBe(4000);
    });

    it('defers a usage-based discount even with per-resource scope', () => {
      const offering = createOffering([{ type: 'ram', billing_type: 'usage' }]);
      const plan = planWithDiscount({ ram: 0 }, { ram: 1 }, [
        {
          type: 'ram',
          discount_formula: '10 if usage >= 100 else 0',
          discount_aggregation: 'resource',
        },
      ]);
      const ram = combinePrices(plan, {}, { ram: 100 }, offering).components[0];
      expect(ram.discountApplied).toBe(false);
      expect(ram.discountDeferred).toBe(true);
    });

    it('previews a prepaid one-time discount on the committed quantity', () => {
      const offering = createOffering([
        { type: 'seats', billing_type: 'one', is_prepaid: true },
      ]);
      const plan = planWithDiscount({ seats: 0 }, { seats: 10 }, [
        {
          type: 'seats',
          discount_formula: '20 if usage >= 5 else 0',
          discount_aggregation: 'resource',
        },
      ]);
      const seats = combinePrices(plan, { seats: 5 }, {}, offering)
        .components[0];
      expect(seats.discountApplied).toBe(true);
      expect(seats.discountPercent).toBe(20);
      // subtotal is 20% off the committed quantity's charge
      expect(seats.subTotal).toBeCloseTo(seats.price * seats.amount * 0.8);
    });

    it('defers a per-resource discount whose formula is not tier-shaped', () => {
      const offering = createOffering([
        { type: 'disk', billing_type: 'limit' },
      ]);
      const plan = planWithDiscount({ disk: 0 }, { disk: 1 }, [
        {
          type: 'disk',
          discount_formula: 'MIN(20, usage / 100)',
          discount_aggregation: 'resource',
        },
      ]);
      const disk = combinePrices(plan, { disk: 500 }, {}, offering)
        .components[0];
      expect(disk.discountApplied).toBe(false);
      expect(disk.discountDeferred).toBe(true);
    });
  });
});
