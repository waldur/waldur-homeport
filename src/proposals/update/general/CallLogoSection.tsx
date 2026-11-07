import { UploadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { Card, CardContent, CardHeader, CardTitle, FormText } from 'waldur-ui';

import { fileSerializer, formDataOptions } from '@/core/api';
import { getAbbreviation } from '@/core/utils';
import { SubmitButton } from '@/form';
import { WideImageField } from '@/form/WideImageField';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

// Matches the cap the backend enforces on a call's logo.
const MAX_LOGO_SIZE = 2 * 1024 * 1024;

interface FormData {
  image: File | string | null;
}

interface CallLogoSectionProps {
  call: Call;
  refetch(): void;
  isReadOnly?: boolean;
}

export const CallLogoSection: FC<CallLogoSectionProps> = ({
  call,
  refetch,
  isReadOnly,
}) => {
  const logoMutation = useManagedMutation<unknown, unknown, FormData>({
    mutationFn: (data) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body: { image: fileSerializer(data.image) },
        ...formDataOptions,
      }),
    successMessage: translate('Call logo has been updated.'),
    errorMessage: translate('Unable to update call logo.'),
    refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(values) => logoMutation.mutateAsync(values)}
      initialValues={{ image: call.image }}
      render={({ handleSubmit, submitting }) => (
        <Card asChild bordered className="mb-4">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle as="div">
                <h3>{translate('Logo')}</h3>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormText className="mb-4">
                {translate(
                  'Shown on the call card in place of the initials of its name.',
                )}
              </FormText>
              <Field
                name="image"
                render={(fieldProps) => (
                  <WideImageField
                    alt={getAbbreviation(call.name, 3)}
                    initialValue={call.image}
                    max={MAX_LOGO_SIZE}
                    size={64}
                    disabled={isReadOnly}
                    disabledReason={
                      isReadOnly ? getCallReadOnlyReason(call) : undefined
                    }
                    extraActions={({ isChanged, isTooLarge }) =>
                      (isChanged || submitting) && !isReadOnly ? (
                        <SubmitButton
                          size="sm"
                          submitting={submitting}
                          disabled={isTooLarge}
                          label={translate('Save')}
                          iconNode={<UploadSimpleIcon weight="bold" />}
                        />
                      ) : null
                    }
                    {...(fieldProps as any)}
                  />
                )}
              />
            </CardContent>
          </form>
        </Card>
      )}
    />
  );
};
