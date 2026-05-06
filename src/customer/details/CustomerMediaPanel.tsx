import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Form, Field } from 'react-final-form';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { WideImageField } from '@/form/WideImageField';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';

import { CustomerEditPanelProps } from './types';

interface CustomerMediaPanelOwnProps extends CustomerEditPanelProps {
  embedded?: boolean;
}

export const CustomerMediaPanel = (props: CustomerMediaPanelOwnProps) => {
  const abbreviation = useMemo(
    () => getItemAbbreviation(props.customer),
    [props.customer],
  );

  const content = (
    <Form
      initialValues={{ image: props.customer.image }}
      onSubmit={props.callback}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Field
            name="image"
            component={(fieldProps) => (
              <WideImageField
                alt={abbreviation}
                initialValue={props.customer.image}
                max={2 * 1024 * 1024} // 2MB
                size={64}
                extraActions={({ isChanged, isTooLarge }) =>
                  isChanged || submitting ? (
                    <CompactSubmitButton
                      submitting={submitting}
                      label={translate('Save')}
                      disabled={isTooLarge}
                      iconNode={<UploadSimpleIcon weight="bold" />}
                    />
                  ) : null
                }
                {...(fieldProps as any)}
              />
            )}
          />
        </form>
      )}
    />
  );

  if (props.embedded) {
    return <div className="p-7">{content}</div>;
  }

  return (
    <Card className="card-bordered mb-5">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Logo')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>{content}</Card.Body>
    </Card>
  );
};
