import { ISSUE_TYPES } from './constants';
import { randomDate, randomChoice, randomInteger, randomText, randomKey, randomUser } from './fixtures';

// @ngInject
export default class FakeIssuesService {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.issues = randomIssues(10);
  }

  getList(filter) {
    return this.$timeout(() => {
      this.resultCount = this.issues.length;
      this.pages = 1;
      return this.issues;
    }, 1000);
  }
}

const randomType = () => randomChoice(ISSUE_TYPES);

const randomResolution = () => randomChoice([
  'Resolved', 'Unresolved', "Won't fix"
]);

function randomIssues(n) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result.push({
      key: randomKey(),
      title: randomText(),
      type: randomType(),
      resolution: randomResolution(),
      user: randomUser(),
      assigned: randomUser(),
      created: randomDate(),
      updated: randomDate()
    });
  }
  return result;
}
