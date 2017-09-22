import template from './expert-request-create.html';

const expertRequestCreate = {
  template,
  bindings: {
    expert: '<',
    errors: '<',
    model: '=',
    cancel: '&',
    save: '&',
  }
};

export default expertRequestCreate;
