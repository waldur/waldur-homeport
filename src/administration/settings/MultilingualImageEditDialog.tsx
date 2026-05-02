import { FC, useCallback, useMemo, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { overrideSettings } from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { WideImageField } from '@/form/WideImageField';
import { translate } from '@/i18n';
import { LanguageUtilsService } from '@/i18n/LanguageUtilsService';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { getKeyTitle } from './utils';

interface MultilingualImageEditDialogProps {
  resolve: {
    item: { key: string; description: string; type: string };
    initialValues?: Record<string, string>;
  };
}

export const MultilingualImageEditDialog: FC<
  MultilingualImageEditDialogProps
> = ({ resolve }) => {
  const item = resolve.item;

  // Get available languages from configuration
  const languageChoices = useMemo(
    () =>
      LanguageUtilsService.getChoices()
        .sort((a, b) => a.code.localeCompare(b.code))
        .filter((lang) =>
          ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES.includes(lang.code),
        ),
    [],
  );

  // Track images per language
  const [images, setImages] = useState<Record<string, File | string | null>>(
    resolve.initialValues || {},
  );
  const [activeTab, setActiveTab] = useState(languageChoices[0]?.code || 'en');

  const handleImageChange = useCallback(
    (langCode: string, value: File | string | null) => {
      setImages((prev) => ({
        ...prev,
        [langCode]: value,
      }));
    },
    [],
  );

  const onSubmitMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      // Build body with bracket notation keys: LOGIN_LOGO_MULTILINGUAL[de], etc.
      // The formDataBodySerializer will convert this to FormData
      // Include all values (files and strings) since backend replaces the entire setting
      const body: Record<string, File | string> = {};

      for (const [langCode, image] of Object.entries(images)) {
        const key = `${item.key}[${langCode}]`;
        if (image === null) {
          body[key] = ''; // Remove image
        } else if (image instanceof File) {
          body[key] = image;
        } else if (typeof image === 'string' && image) {
          // Include existing string paths so they're preserved
          body[key] = image;
        }
      }

      return overrideSettings({
        body,
        ...formDataOptions,
      });
    },
    successMessage: translate('Multilingual logos have been updated.'),
    errorMessage: translate('Unable to update multilingual logos.'),
    onSuccess: () => {
      location.reload();
    },
  });

  const hasChanges = useMemo(() => {
    const initial = resolve.initialValues || {};
    return Object.keys(images).some((lang) => {
      const current = images[lang];
      const original = initial[lang];
      return current instanceof File || current !== original;
    });
  }, [images, resolve.initialValues]);

  return (
    <ModalDialog
      title={getKeyTitle(item.key)}
      footer={
        <>
          <CloseDialogButton className="flex-equal" />
          <SubmitButton
            submitting={onSubmitMutation.isPending}
            disabled={!hasChanges}
            className="flex-equal"
            onClick={() => onSubmitMutation.mutate()}
            type="button"
            label={translate('Confirm')}
          />
        </>
      }
    >
      <p className="text-muted mb-4">{item.description}</p>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || languageChoices[0]?.code)}
        className="mb-4"
      >
        {languageChoices.map((lang) => (
          <Tab key={lang.code} eventKey={lang.code} title={lang.label}>
            <div className="pt-4">
              <WideImageField
                input={{
                  name: `image_${lang.code}`,
                  value: images[lang.code],
                  onChange: (value) => handleImageChange(lang.code, value),
                  onBlur: () => {},
                  onDragStart: () => {},
                  onDrop: () => {},
                  onFocus: () => {},
                }}
                initialValue={resolve.initialValues?.[lang.code]}
              />
            </div>
          </Tab>
        ))}
      </Tabs>
    </ModalDialog>
  );
};
