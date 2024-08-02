import { Button } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { TelemetryExampleButton } from '@waldur/administration/TelemetryExampleButton';
import { ENV } from '@waldur/configs/default';
import { post } from '@waldur/core/api';
import { FeaturesDescription } from '@waldur/features/FeaturesDescription';
import { TelemetryFeatures } from '@waldur/FeaturesEnums';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

const saveFeatures = (payload) => post('/feature-values/', payload);

const processMap = (data) =>
  Object.keys(data).reduce(
    (acc, sKey) => ({
      ...acc,
      [sKey]: Object.keys(data[sKey]).reduce(
        (acc, fKey) => ({
          ...acc,
          [fKey]: data[sKey][fKey],
        }),
        {},
      ),
    }),
    {},
  );

export const FeaturesList = connect(() => ({
  initialValues: processMap(ENV.FEATURES),
}))(
  reduxForm({
    form: 'features',
  })(({ handleSubmit }) => {
    const dispatch = useDispatch();
    const saveFeaturesCallback = async (formData) => {
      try {
        await saveFeatures(formData);
        dispatch(showSuccess(translate('Features have been updated.')));
        location.reload();
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update features.')));
      }
    };

    return (
      <form onSubmit={handleSubmit(saveFeaturesCallback)}>
        {FeaturesDescription.map((section) => (
          <FormTable.Card
            key={section.key}
            title={section.description}
            className="card-bordered mb-7"
          >
            <FormTable>
              {section.items.map((item) => (
                <tr key={item.key}>
                  <td>
                    {item.description}
                    {`${section.key}.${item.key}` ===
                    TelemetryFeatures.send_metrics ? (
                      <div>
                        <TelemetryExampleButton />
                      </div>
                    ) : null}
                  </td>
                  <td className="col-md-1">
                    <Field
                      name={`${section.key}.${item.key}`}
                      component={AwesomeCheckboxField}
                      floating={false}
                    />
                  </td>
                </tr>
              ))}
            </FormTable>
          </FormTable.Card>
        ))}
        <Button type="submit" variant="primary">
          {translate('Save')}
        </Button>
      </form>
    );
  }),
);
