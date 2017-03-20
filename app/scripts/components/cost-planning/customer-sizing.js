import template from './customer-sizing.html';
import './customer-sizing.scss';

const customerSizing = {
  template,
  controllerAs: 'CustomerSizing',
  controller: class CustomerSizingTabController {
    constructor() {
      this.list = [
        {
          name: 'Monator offer',
          email: 'john@monator.com',
          views: [],
          provider: {}
        },
        {
          name: 'Webapp for Monster Inc.',
          email: 'john@monator.com',
          views: [],
          provider: {}
        },
        {
          name: 'Webapp for Monster Inc.',
          email: 'john@monator.com',
          views: [],
          provider: {}
        }
      ];
    }

    calculate(item) {
      let price = 0;
      if (item.provider.price) {
        item.views.forEach(function(view) {
          price += view.count * item.provider.price;
        });
      }
      return price;
    }
  }
};

export default customerSizing;
