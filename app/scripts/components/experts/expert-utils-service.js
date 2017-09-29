export default class ExpertsUtilsService {
  constructor($uibModal) {
    this.$uibModal = $uibModal;
  }

  openDialog(expertRequest) {
    return this.$uibModal.open({
      component: 'expertContractDetails',
      size: 'lg',
      resolve: {
        expertRequest: expertRequest,
      }
    });
  }
}
