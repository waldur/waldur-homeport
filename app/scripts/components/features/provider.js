export default class featuresProvider {
  constructor() {
    this.features = {};
    this.visibility = true;
  }

  setVisibility(visibility) {
    this.visibility = visibility;
  }

  setFeatures(features) {
    this.features = features.reduce((result, feature) => {
      result[feature] = true;
      return result;
    }, {});
  }

  $get() {
    const isVisible = feature => this.visibility || !this.features[feature];
    return {isVisible};
  }
}
