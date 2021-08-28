import { Fragment } from 'react';
import { Table } from 'react-bootstrap';
import { useAsync } from 'react-use';
import { Field, reduxForm } from 'redux-form';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { CustomRadioButton } from '@waldur/marketplace/offerings/attributes/CustomRadioButton';
import { useTitle } from '@waldur/navigation/title';

interface FeatureItem {
  key: string;
  description: string;
}

interface FeatureSection {
  key: string;
  description: string;
  items: FeatureItem[];
}

const loadFeatures = () => get<FeatureSection[]>('/features-description/');

export const FeaturesList = reduxForm({ form: 'features' })(() => {
  useTitle(translate('Features'));
  const { loading, error, value } = useAsync(loadFeatures);
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load page')}</>;
  }
  const choices = [
    { value: 'true', label: translate('Yes') },
    { value: '', label: translate('No') },
  ];

  return (
    <Panel>
      <Table
        responsive={true}
        bordered={true}
        striped={true}
        className="m-t-md"
      >
        <tbody>
          {value.data.map((section) => (
            <Fragment key={section.key}>
              <tr>
                <td colSpan={2}>
                  <h3>{section.description}</h3>
                </td>
              </tr>

              {section.items.map((item) => (
                <tr key={item.key}>
                  <td>{item.description}</td>
                  <td>
                    <Field
                      name={`${section.key}-${item.key}`}
                      choices={choices}
                      component={CustomRadioButton}
                    ></Field>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
});
