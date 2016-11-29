import { ISSUE_TYPES, ISSUE_STATUSES } from './constants';
import { randomDate, randomChoice, randomInteger, randomText, randomKey, randomUser } from './fixtures';

// @ngInject
export default class FakeIssuesService {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.issues = randomIssues(10);
  }

  getList(filter) {
    return this.$timeout(() => {
      if (filter.assignee) {
        this.resultCount = 5;
        this.pages = 1;
        return this.issues.slice(0, 5);
      }
      if (filter.reporter) {
        this.resultCount = 5;
        this.pages = 1;
        return this.issues.slice(5, 10);
      }
      this.resultCount = this.issues.length;
      this.pages = 1;
      return this.issues;
    }, 1000);
  }
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
]);

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
      assigned: randomUser(),
      created: randomDate(),
      updated: randomDate(),
      timeSpent: randomTimeSpent()
    });
  }
  return result;
}
