// @ngInject
export default class titleService {
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
