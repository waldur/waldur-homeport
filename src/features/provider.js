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
    const isVisible = feature => {
      if (!feature) {
        return true;
      }
      if (this.enabledFeatures[feature]) {
        return true;
      }
      if (this.disabledFeatures[feature]) {
        return false;
      }
      return this.visibility;
    };
    return { isVisible };
  }
}
