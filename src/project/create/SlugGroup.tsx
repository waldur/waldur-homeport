import { StringGroup } from '@/form';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

export const SlugGroup = ({ customer }: { customer?: Customer }) => {
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }
  const template = customer?.project_slug_template;
  const helpText = template
    ? translate(
        'If left empty, a slug in the format of "{template}" will be generated automatically.',
        { template },
      )
    : translate(
        'If left empty, the slug will be generated from the project name.',
      );
  return (
    <StringGroup
      name="slug"
      placeholder={template || translate('Auto-generated')}
      label={translate('Project slug')}
      description={helpText}
    />
  );
};
