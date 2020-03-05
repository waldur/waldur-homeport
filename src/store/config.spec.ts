import { initConfig, reducer, isVisible } from './config';

describe('Configuration reducer', () => {
  const disabledFeatures = { freeipa: true, support: true };
  const enabledFeatures = { billing: true, marketplace: true };

  it('should merge experimental and disabled features', () => {
    const actual = reducer(
      undefined,
      initConfig({
        disabledFeatures: ['freeipa'],
        toBeFeatures: ['support'],
      }),
    );
    expect(actual.disabledFeatures).toEqual(disabledFeatures);
  });

  it('should parse enabled features', () => {
    const actual = reducer(
      undefined,
      initConfig({
        enabledFeatures: ['billing', 'marketplace'],
      }),
    );
    expect(actual.enabledFeatures).toEqual(enabledFeatures);
  });

  it('should check disabled features', () => {
    const state = { config: { disabledFeatures, enabledFeatures } };
    expect(isVisible(state, 'freeipa')).toBe(false);
    expect(isVisible(state, 'support')).toBe(false);
  });

  it('should check enabled features', () => {
    const state = { config: { disabledFeatures, enabledFeatures } };
    expect(isVisible(state, 'billing')).toBe(true);
    expect(isVisible(state, 'marketplace')).toBe(true);
  });

  it('should check visibility for all other features 1', () => {
    const state = {
      config: { disabledFeatures, enabledFeatures, featuresVisible: true },
    };
    expect(isVisible(state, 'visibleFeature')).toBe(true);
  });

  it('should check visibility for all other features 2', () => {
    const state = {
      config: { disabledFeatures, enabledFeatures, featuresVisible: false },
    };
    expect(isVisible(state, 'hiddenFeature')).toBe(false);
  });
});
