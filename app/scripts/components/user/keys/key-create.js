import template from './key-create.html';

const keyCreate = {
  template: template,
  controller: KeyAddController,
  controllerAs: 'KeyAdd',
};

export default keyCreate;

// @ngInject
function KeyAddController(baseControllerAddClass, keysService, $state, $q) {
  let controllerScope = this;
  let Controller = baseControllerAddClass.extend({
    init: function() {
      this.service = keysService;
      this.controllerScope = controllerScope;
      this._super();
      this.listState = 'profile.keys';
    },
    successRedirect: function() {
      $state.go('profile.keys');
    },
    save: function() {
      if (this.instance.name) {
        return this._super();
      } else {
        if (this.instance.public_key) {
          let key = this.instance.public_key.split(' ');
          if (key[2]) {
            this.instance.name = key[2].trim();
            return this._super();
          } else {
            this.errors = {name: [gettext('This field may not be blank.')]};
          }
        } else {
          this.errors = {public_key: [gettext('This field may not be blank.')]};
        }
      }
      return $q.reject();
    }
  });

  controllerScope.__proto__ = new Controller();
}
