import template from './payment-state.html';

// @ngInject
function PaymentStateController($scope) {
  var classes = {
    Erred: 'erred',
    Approved: 'online',
    Created: 'processing',
    Cancelled: 'offline'
  };
  this.movementClassName = null;
  this.className = 'progress-bar-primary';

  $scope.$watch(() => this.payment, () => {
    if (this.payment) {
      this.state = this.payment.state;
      var cls = classes[this.state];
      switch (cls) {
      case 'erred':
        this.className = 'progress-bar-warning';
        break;
      case 'processing':
        this.movementClassName = 'progress-striped active';
        break;
      case 'offline':
        this.className = 'progress-bar-plain';
        break;
      }
    }
  });
}

const paymentState = {
  template: template,
  bindings: {
    payment: '<'
  },
  controller: PaymentStateController
};

export default paymentState;
