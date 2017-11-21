import { initConfig, reducer, isVisible } from './config';

describe('Configuration reducer', () => {
  const features = {experts: true, paypal: true};

  it('should merge experimental and disabled features', () => {
    const actual = reducer(undefined, initConfig({
      disabledFeatures: ['experts'],
      toBeFeatures: ['paypal']
    }));
    expect(actual.features).toEqual(features);
  });

  it('should check disabled feature', () => {
    const state = {features, featuresVisible: false};
    expect(isVisible(state, 'experts')).toBe(false);
    expect(isVisible(state, 'billing')).toBe(true);
  });

  it('should skip check if all features are visible', () => {
    const state = {features, featuresVisible: true};
    expect(isVisible(state, 'experts')).toBe(true);
    expect(isVisible(state, 'billing')).toBe(true);
  });
});
