// @ngInject
export default class FakeIssuesService {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.issues = randomIssues(10);
  }

  getList(filter) {
    return this.$timeout(() => {
      if (filter.personal) {
        return this.issues.slice(5);
      }
      return this.issues;
    }, 1000);
  }
}

function randomDate() {
  return new Date(+(new Date()) - Math.floor(Math.random()*10000000000));
}

function randomChoice(items) {
  const i = Math.round(Math.random() * (items.length - 1));
  return items[i];
}

function randomTitle() {
  return randomChoice([
    'Desktop publishing packages and web page editors now use Lorem Ipsum as their default model text',
    'This is issue with the coresponding note',
    'There are many variations of passages of Lorem Ipsum available, but the majority have suffered',
  ]);
}

function randomUsername() {
  return randomChoice([
    'Alice Lebowski',
    'Walter Lebowski',
    'Bob Lebowski'
  ]);
}

function randomStatus() {
  return randomChoice([
    'FIXED',
    'TODO',
    'BUG'
  ]);
}

function randomKey() {
  const i = 10 + Math.round(Math.random() * 100);
  return `ISSUE-${i}`;
}

function randomIssues(n) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result.push({
      key: randomKey(),
      title: randomTitle(),
      status: randomStatus(),
      user_username: randomUsername(),
      created: randomDate(),
    });
  }
  return result;
}
