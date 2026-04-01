import { FC, useCallback, useMemo } from 'react';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { Wizard } from '@waldur/wizard';

import { FindReplaceStep } from './FindReplaceStep';
import { PreviewApplyStep } from './PreviewApplyStep';
import type { ArticleCodeFormValues } from './types';

interface OwnProps {
  resolve: {
    refetch?: () => void;
  };
}

const steps: ProgressStep[] = [
  { key: 'find-replace', label: translate('Find & Replace'), completed: false },
  {
    key: 'preview-apply',
    label: translate('Preview & Apply'),
    completed: false,
  },
];

const wizardForms = [FindReplaceStep, PreviewApplyStep];

export const ArticleCodeUpdateDialog: FC<OwnProps> = ({ resolve }) => {
  const initialValues = useMemo(
    (): Partial<ArticleCodeFormValues> => ({
      search: '',
      replace: '',
    }),
    [],
  );

  const handleSubmit = useCallback(() => {
    return Promise.resolve();
  }, []);

  return (
    <Wizard<ArticleCodeFormValues>
      title={translate('Update article codes')}
      subtitle={translate(
        'Find and replace article codes across offering components',
      )}
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      data={{ refetch: resolve?.refetch }}
      modalProps={{ bodyClassName: 'p-0' }}
    />
  );
};
