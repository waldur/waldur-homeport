export default class titleService {
  // @ngInject
  constructor($document) {
    this.$document = $document;
  }

  setTitle(value) {
    this.$document[0].title = value;
  }

  getTitle() {
    return this.$document[0].title;
  }
}
