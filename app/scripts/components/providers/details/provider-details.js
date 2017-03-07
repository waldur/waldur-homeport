import template from './provider-details.html';

const providerDetails = {
  template: template,
  bindings: {
    provider: '<'
  },
  controller: class ProviderDetailsController {
    $onInit() {
      this.markers = this.provider.geolocations
        .map(item => ({
          lat: item.latitude,
          lng: item.longitude,
        }));
      if (this.markers.length > 0) {
        this.maxbounds = new L.LatLngBounds(this.markers);
      }
    }
  }
};

export default providerDetails;
