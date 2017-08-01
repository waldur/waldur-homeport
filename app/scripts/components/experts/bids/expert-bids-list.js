import template from './expert-bids-list.html';

const expertBidsList = {
  template,
  bindings: {
    expertRequest: '<',
  },
  controller: class ExpertBidsListController {
    // @ngInject
    constructor($rootScope, expertBidsService) {
      this.$rootScope = $rootScope;
      this.expertBidsService = expertBidsService;
      this.orderBy = 'date';
      this.orderingFields = [
        {
          name: 'date',
          label: gettext('Sort by date'),
        },
        {
          name: 'price',
          label: gettext('Sort by price'),
        }
      ];
    }

    $onInit() {
      this.fetchData();
      this.unlisten = this.$rootScope.$on('refreshBidsList', this.fetchData.bind(this));
    }

    $onDestroy() {
      this.unlisten();
    }

    fetchData() {
      this.loading = true;
      const filter = {
        request_uuid: this.expertRequest.uuid,
      };
      return this.expertBidsService.getAll(filter)
      .then(list => this.list = list)
      .finally(() => this.loading = false);
    }
  }
};

export default expertBidsList;
