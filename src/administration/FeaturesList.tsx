import { useMemo, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { featureValues } from 'waldur-js-client';

import { TelemetryExampleButton } from '@waldur/administration/TelemetryExampleButton';
import { ENV } from '@waldur/core/config';
import { Panel } from '@waldur/core/Panel';
import { SaveButton } from '@waldur/core/SaveButton';
import { FeaturesDescription } from '@waldur/features/FeaturesDescription';
import { DeploymentFeatures } from '@waldur/FeaturesEnums';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';
import { TableQuery } from '@waldur/table/TableQuery';

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
  const [query, setQuery] = useState('');
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

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FeaturesDescription;

    return FeaturesDescription.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.description.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q) ||
          section.description.toLowerCase().includes(q),
      ),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <Form
      onSubmit={saveFeaturesCallback}
      initialValues={ENV.FEATURES}
      render={({ handleSubmit, submitting, dirty }) => (
        <form onSubmit={handleSubmit}>
          <Panel
            title={translate('Features')}
            cardBordered
            className="pb-1"
            bodyClassName="py-0"
            actions={
              <div className="d-flex align-items-center">
                <TableQuery query={query} setQuery={setQuery} />
                <SaveButton
                  className="ms-4"
                  type="submit"
                  onClick={handleSubmit}
                  submitting={submitting}
                  dirty={dirty}
                />
              </div>
            }
          >
            {filteredSections.map((section) => (
              <FeatureSection key={section.key} section={section} />
            ))}
          </Panel>
        </form>
      )}
    />
  );
};
