import appstoreForm from './appstore-form';
import appstoreField from './appstore-field';
import appstoreFieldString from './appstore-field-string';
import appstoreFieldPassword from './appstore-field-password';
import appstoreFieldText from './appstore-field-text';
import appstoreFieldInteger from './appstore-field-integer';
import appstoreFieldBoolean from './appstore-field-boolean';
import appstoreFieldChoice from './appstore-field-choice';
import appstoreFieldErrors from './appstore-field-errors';
import appstoreFieldLabel from './appstore-field-label';
import fieldLabel from './field-label';
import helpicon from './help-icon';

export default module => {
  module.directive('appstoreForm', appstoreForm);
  module.directive('appstoreField', appstoreField);
  module.directive('appstoreFieldString', appstoreFieldString);
  module.directive('appstoreFieldPassword', appstoreFieldPassword);
  module.directive('appstoreFieldText', appstoreFieldText);
  module.directive('appstoreFieldInteger', appstoreFieldInteger);
  module.directive('appstoreFieldBoolean', appstoreFieldBoolean);
  module.directive('appstoreFieldChoice', appstoreFieldChoice);
  module.directive('appstoreFieldErrors', appstoreFieldErrors);
  module.directive('appstoreFieldLabel', appstoreFieldLabel);
  module.directive('fieldLabel', fieldLabel);
  module.directive('helpicon', helpicon);
}
