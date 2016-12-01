import { ISSUE_TYPES, ISSUE_STATUSES } from './constants';
import {
  randomDate,
  randomChoice,
  randomInteger,
  randomText,
  randomKey,
  randomUser,
  randomId
} from './fixtures';

// @ngInject
export default class FakeIssuesService {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.issues = randomIssues(10);
    this.filter = {};
  }

  createIssue(issue) {
    return this.$timeout(() => {
      // this.issues.unshift(issue);
    });
  }

  getList(filter) {
    return this.$timeout(() => {
      let result = this.filterList(this.filter);
      this.pages = 1;
      this.resultCount = result.length;
      return result;
    }, 0);
  }

  filterList(filter) {
    filter = filter || {};
    let result = this.issues;
    if (filter.assignee) {
      result = result.slice(0, 5);
    }
    if (filter.reporter) {
      result = result.slice(5, 10);
    }
    if (filter.customer) {
      result = result.filter(issue => issue.customer.label === filter.customer.label);
    }
    if (filter.caller) {
      result = result.filter(issue => issue.caller.label === filter.caller.label);
    }
    if (filter.type) {
      result = result.filter(issue => issue.type === filter.type.label);
    }
    if (filter.status) {
      result = result.filter(issue => issue.status === filter.status.label);
    }
    if (filter.summary) {
      result = result.filter(issue => issue.title.toLowerCase().indexOf(filter.summary) !== -1);
    }
    return result;
  }

  clearAllCacheForCurrentEndpoint() {}
}

const randomType = () => randomChoice(ISSUE_TYPES);

const randomStatus = () => randomChoice(ISSUE_STATUSES);

const randomTimeSpent = () => randomChoice([
  '2 hours', '1 day', '2 days', '1 week'
]);

const randomScope = () => randomChoice([
  'User',
  'Organization',
  'Project',
  'OpenStack Provider',
  'OpenStack Tenant',
  'OpenStack Instance',
  'OpenStack Volume',
  'netHSM',
  'Office365'
]);

const randomCompanyType = () => randomChoice([
  'Ministry',
  'ETO',
  'Private company',
  'Public company',
  'Gov owned company'
]);

const randomCustomer = () => ({
  name: randomChoice(['ABC corp.', 'XYZ corp.']),
  type: randomCompanyType(),
  registration_code: randomId(),
  address: '100 MAIN ST PO BOX 1022 SEATTLE WA 98104',
  email: 'contacts@xyz.com',
  authorized_personnel: randomUser()
});

export const CUSTOMERS = [
  angular.extend(randomCustomer(), {label: 'ABC', name: 'ABC'}),
  angular.extend(randomCustomer(), {label: 'XYZ', name: 'XYZ'})
];

function randomIssues(n) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result.push({
      key: randomKey(),
      title: randomText(),
      type: randomType(),
      status: randomStatus(),
      scope: randomScope(),
      user: randomUser(),
      caller: randomUser(),
      assigned: randomUser(),
      created: randomDate(),
      updated: randomDate(),
      timeSpent: randomTimeSpent(),
      customer: randomChoice(CUSTOMERS)
    });
  }
  return result;
}
