import { Fragment, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { Field, initialize, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { get, post } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { CustomRadioButton } from '@waldur/marketplace/offerings/attributes/CustomRadioButton';
import { useTitle } from '@waldur/navigation/title';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

const saveFeatures = (payload) => post('/feature-values/', payload);

const parseBool = (val) => (val === true ? 'true' : 'false');

const serializeBool = (val) => (val === 'true' ? true : false);

const processMap = (processor) => (data) =>
  Object.keys(data).reduce(
    (acc, sKey) => ({
      ...acc,
      [sKey]: Object.keys(data[sKey]).reduce(
        (acc, fKey) => ({
          ...acc,
          [fKey]: processor(data[sKey][fKey]),
        }),
        {},
      ),
    }),
    {},
  );

const parseFeatures = processMap(parseBool);

const serializeFeatures = processMap(serializeBool);

const FORM_ID = 'features';

export const FeaturesList = reduxForm({
  form: 'features',
})(({ handleSubmit }) => {
  useTitle(translate('Features'));
  const dispatch = useDispatch();
  const { loading, error, value } = useAsync(loadFeatures);
  useEffect(() => {
    if (value) {
      dispatch(initialize(FORM_ID, parseFeatures(ENV.FEATURES)));
    }
  }, [value, dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load page')}</>;
  }
  const choices = [
    { value: 'true', label: translate('Yes') },
    { value: 'false', label: translate('No') },
  ];
  const saveFeaturesCallback = async (formData) => {
    try {
      await saveFeatures(serializeFeatures(formData));
      dispatch(showSuccess(translate('Features have been updated.')));
      location.reload();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to update features.')));
    }
  };

  return (
    <Panel>
      <form onSubmit={handleSubmit(saveFeaturesCallback)}>
        <Table
          responsive={true}
          bordered={true}
          striped={true}
          className="mt-3"
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
                        name={`${section.key}.${item.key}`}
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

        <Button type="submit" variant="primary">
          {translate('Save')}
        </Button>
      </form>
    </Panel>
  );
});
