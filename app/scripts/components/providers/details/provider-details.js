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
        .filter(item => item.hasOwnProperty('latitude') && item.hasOwnProperty('longitude'))
        .map(item => ({
          lat: item.latitude,
          lng: item.longitude,
        }));
      if (this.markers.length > 0) {
        // eslint-disable-next-line no-undef
        this.maxbounds = new L.LatLngBounds(this.markers);
        this.center = angular.extend({zoom: 5}, this.maxbounds.getCenter());
      }
    }
  }
};

export default providerDetails;
