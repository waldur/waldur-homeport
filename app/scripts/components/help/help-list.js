import {profileHelp, dashboardHelp, providersHelp} from './constants';

const helpList = {
  templateUrl: 'views/help/list.html',
  controller: class HelpListController {
    constructor() {
      this.providersHelp = providersHelp;
      this.profileHelp = profileHelp;
      this.dashboardHelp = dashboardHelp;
    }
  }
};

export default helpList;
