// @ngInject
export default class FakeIssueCommentsService {
  constructor($timeout) {
    this.$timeout = $timeout;
  }

  getList() {
    return this.$timeout(() => {
      return FAKE_COMMENTS;
    }, 1000);
  }
}

const FAKE_COMMENTS = [
  {
    email: 'victor.mireyev@gmail.com',
    text: 'Conference on the sales results for the previous year.',
    created: new Date(12, 6, 2014),
    name: 'Alice Lebowski',
    key: 'ISSUE-3'
  },
  {
    email: 'victor@opennodecloud.com',
    text: 'Many desktop publishing packages and web page editors now use Lorem.',
    created: new Date(10, 5, 2014),
    name: 'Walter Lebowski',
    key: 'ISSUE-4'
  },
  {
    email: 'victor.mireyev@gmail.com',
    text: ' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    created: new Date(10, 5, 2014),
    name: 'Walter Lebowski',
    key: 'ISSUE-5'
  },
  {
    email: 'victor@opennodecloud.com',
    text: ' Web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).',
    created: new Date(10, 5, 2014),
    name: 'Bob Lebowski',
    key: 'ISSUE-6'
  },
  {
    email: 'victor.mireyev@gmail.com',
    text: ' Go to shop and find some products.',
    created: new Date(10, 5, 2014),
    name: 'Tomy Branko',
    key: 'ISSUE-7'
  }
];
