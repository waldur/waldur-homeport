import template from './provider-details.html';
import loadLeafleat from '../../../shims/load-leaflet';

const providerDetails = {
  template: template,
  bindings: {
    provider: '<'
  },
  controller: class ProviderDetailsController {
    constructor($injector, $timeout, $ocLazyLoad) {
      // @ngInject
      this.$injector = $injector;
      this.$timeout = $timeout;
      this.$ocLazyLoad = $ocLazyLoad;
    }

    $onInit() {
      this.markers = [];
      this.markers = this.provider.geolocations
        .filter(item => item.hasOwnProperty('latitude') && item.hasOwnProperty('longitude'))
        .map(item => ({
          lat: item.latitude,
          lng: item.longitude,
        }));
      if (this.markers.length > 0) {
        this.loading = true;
        loadLeafleat().then(module => {
          this.$ocLazyLoad.load({name: module.default});
          this.$timeout(() => {

            // Workaround for bug:
            // https://github.com/tombatossals/angular-leaflet-directive/issues/49
            const leafletData = this.$injector.get('leafletData');
            leafletData.getMap().then(map => map.invalidateSize());

            // eslint-disable-next-line no-undef
            this.maxbounds = new L.LatLngBounds(this.markers);
            this.center = angular.extend({zoom: 5}, this.maxbounds.getCenter());
            this.loading = false;
          });
        });
      }
    }
  }
};

export default providerDetails;
