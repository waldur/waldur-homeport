import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { AttributesTable } from '@waldur/marketplace/details/attributes/AttributesTable';
import { RootState } from '@waldur/store/reducers';

import { FORM_ID } from '../store/constants';
import { getCategory } from '../store/selectors';
import { formatAttributes } from '../store/utils';

import { hasError } from './utils';

type StateProps = ReturnType<typeof mapStateToProps>;

const PureDescriptionSummary: FunctionComponent<StateProps> = (props) => (
  <>
    <h3>{translate('Description')}</h3>
    {props.categoryInvalid ? (
      <p>{translate('Category is invalid.')}</p>
    ) : props.attributesInvalid ? (
      <p>{translate('Attributes are invalid.')}</p>
    ) : (
      <>
        <p>
          <strong>{translate('Category')}</strong>: {props.category.title}
        </p>
        {props.attributes && (
          <AttributesTable
            attributes={props.attributes}
            sections={props.sections}
          />
        )}
      </>
    )}
  </>
);

const mapStateToProps = (state: RootState) => {
  const categoryInvalid = hasError('category')(state);
  const attributesInvalid = hasError('attributes')(state);

  const formData: any = getFormValues(FORM_ID)(state);
  const category = getCategory(state);
  if (!category) {
    return {
      categoryInvalid: true,
      attributesInvalid: true,
    };
  }

  const attributes = formatAttributes(category, formData.attributes || {});
  const filterSection = (section) =>
    section.attributes.some((attr) => attributes.hasOwnProperty(attr.key));
  const sections = category.sections.filter(filterSection);

  return {
    sections,
    attributes,
    category,
    categoryInvalid,
    attributesInvalid,
  };
};

export const DescriptionSummary = connect(mapStateToProps)(
  PureDescriptionSummary,
);
