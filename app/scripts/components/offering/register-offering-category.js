// @ngInject
export default function registerOfferingCategory(features, $q, offeringsService, AppstoreCategoriesService) {
  const parseResponse = offering => ({
    key: offering.uuid,
    label: offering.config.label,
    icon: offering.config.icon || 'fa-gear',
    image: offering.config.image,
    description: offering.config.description,
    category: offering.config.category || gettext('Custom request'),
    state: 'appstore.offering',
    price: offering.config.price,
  });

  const parseError = error => {
    if (error.status === 424) {
      return [];
    }
    throw error;
  };

  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible('support') || !features.isVisible('offering')) {
      return $q.when([]);
    }

    return offeringsService.getConfiguration()
      .then(offerings => offerings.map(parseResponse)).catch(parseError);
  });
}
