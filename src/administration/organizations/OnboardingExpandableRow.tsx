import { FC } from 'react';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const OnboardingExpandableRow: FC = ({ row }: any) => {
  const message = row.error_message;
  const traceback = row.error_traceback;
  const supportingDocs = row.supporting_documentation;

  if (!message && !traceback && !supportingDocs?.length) {
    return null;
  }

  return (
    <ExpandableContainer>
      <Field
        label={translate('Error code')}
        value={message}
        isStuck
        labelClass="me-2"
      />
      <Field
        label={translate('Traceback')}
        value={traceback}
        isStuck
        labelClass="me-2"
      />
      {supportingDocs && supportingDocs.length > 0 && (
        <Field
          label={translate('Supporting documents')}
          value={
            <div className="d-flex flex-column gap-2">
              {supportingDocs.map((doc, index) => (
                <ExternalLink
                  key={index}
                  url={doc.file}
                  label={decodeURIComponent(
                    doc.file_name
                      .split('/')
                      .pop()
                      .replace(/_[^_]+\./, '.'),
                  )}
                  iconless
                />
              ))}
            </div>
          }
          isStuck
          labelClass="me-2"
        />
      )}
    </ExpandableContainer>
  );
};
