export default class ExpertUtilsService {
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  showRequest(expertRequest) {
    return this.$uibModal.open({
      component: 'expertRequestDetailsDialog',
      size: 'lg',
      resolve: {
        expertRequest: expertRequest,
      }
    });
  }

  createBid(expertRequest) {
    return this.$uibModal.open({
      component: 'expertBidCreateDialog',
      size: 'lg',
      resolve: {
        expertRequest: expertRequest,
      }
    });
  }
}
