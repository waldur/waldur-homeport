export default class featuresProvider {
  constructor() {
    this.disabledFeatures = {};
    this.enabledFeatures = {};
    this.visibility = true;
  }

  setVisibility(visibility) {
    this.visibility = visibility;
  }

  setDisabledFeatures(features) {
    this.disabledFeatures = features.reduce((result, feature) => {
      result[feature] = true;
      return result;
    }, {});
  }

  setEnabledFeatures(features) {
    this.enabledFeatures = features.reduce((result, feature) => {
      result[feature] = true;
      return result;
    }, {});
  }

  $get() {
    const isVisible = feature => !feature || this.enabledFeatures[feature] || this.visibility || !this.disabledFeatures[feature];
    return {isVisible};
  }
}
