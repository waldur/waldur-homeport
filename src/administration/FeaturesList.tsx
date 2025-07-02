import { Button } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { featureValues } from 'waldur-js-client';

import { TelemetryExampleButton } from '@waldur/administration/TelemetryExampleButton';
import { ENV } from '@waldur/core/config';
import { FeaturesDescription } from '@waldur/features/FeaturesDescription';
import { DeploymentFeatures } from '@waldur/FeaturesEnums';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';

const FeatureSection = ({ section }) => (
  <FormTable.Card title={section.description} className="card-bordered mb-5">
    <FormTable>
      {section.items.map((item) => (
        <FormTable.Item
          key={item.key}
          description={
            <>
              {item.description}
              {`${section.key}.${item.key}` ===
              DeploymentFeatures.send_metrics ? (
                <div>
                  <TelemetryExampleButton />
                </div>
              ) : null}
            </>
          }
          actions={
            <Field
              name={`${section.key}.${item.key}`}
              component={AwesomeCheckboxField as any}
              data-testid={`${section.key}.${item.key}`}
            />
          }
        />
      ))}
    </FormTable>
  </FormTable.Card>
);

export const FeaturesList = () => {
  const { showErrorResponse, showSuccess } = useNotify();

  const saveFeaturesCallback = async (formData) => {
    try {
      await featureValues({ body: formData });
      showSuccess(translate('Features have been updated.'));
      location.reload();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update features.'));
    }
  };

  return (
    <Form
      onSubmit={saveFeaturesCallback}
      initialValues={ENV.FEATURES}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          {FeaturesDescription.map((section) => (
            <FeatureSection key={section.key} section={section} />
          ))}
          <Button type="submit" variant="primary" disabled={submitting}>
            {translate('Save')}
          </Button>
        </form>
      )}
    />
  );
};
