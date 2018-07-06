import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingCreateDialog } from './OfferingCreateDialog';

const enhance = compose(
  withTranslation,
  reduxForm({form: 'marketplaceOfferingCreate'}),
);

const OfferingCreateContainer = enhance(OfferingCreateDialog);

export default connectAngularComponent(OfferingCreateContainer);
