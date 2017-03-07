import template from './provider-details.html';

const providerDetails = {
  template: template,
  bindings: {
    provider: '<'
  },
  controller: class ProviderDetailsController {
    constructor(leafletData, $timeout) {
      // @ngInject
      this.leafletData = leafletData;
      this.$timeout = $timeout;
    }

    $onInit() {
      // Workaround for bug:
      // https://github.com/tombatossals/angular-leaflet-directive/issues/49
      this.$timeout(() => this.leafletData.getMap().then(map => map.invalidateSize()));

      this.markers = [];
      this.markers = this.provider.geolocations
        .map(item => ({
          lat: item.latitude,
          lng: item.longitude,
        }));
      // eslint-disable-next-line no-undef
      this.maxbounds = new L.LatLngBounds(this.markers);
    }
  }
};

export default providerDetails;
