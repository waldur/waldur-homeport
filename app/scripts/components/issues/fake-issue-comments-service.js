import { randomDate, randomChoice, randomText, randomKey, randomUser } from './fixtures';

// @ngInject
export default class FakeIssueCommentsService {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.comments = randomIssueComment(5);
  }

  getList() {
    return this.$timeout(() => {
      return this.comments;
    }, 1000);
  }
}

function randomIssueComment(n) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result.push({
      text: randomText(),
      created: randomDate(),
      user: randomUser(),
      key: randomKey()
    });
  }
  return result;
}
