import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';

interface PureAttributeFilterOrganizationGroupProps {
  organizationGroups: OrganizationGroup[];
}

export const AttributeFilterOrganizationGroup: FunctionComponent<PureAttributeFilterOrganizationGroupProps> =
  (props) => (
    <section>
      <h3 className="text-gray-700 mb-6">{translate('Organization groups')}</h3>
      {props.organizationGroups.map(
        (organizationGroup: OrganizationGroup, i) => (
          <Field
            name={`list-organization-groups-${i}`}
            key={organizationGroup.uuid}
            component={AwesomeCheckboxField}
            label={organizationGroup.name}
            className="ms-2 mb-2"
            normalize={(v) => (v ? organizationGroup.uuid : '')}
          />
        ),
      )}
    </section>
  );
