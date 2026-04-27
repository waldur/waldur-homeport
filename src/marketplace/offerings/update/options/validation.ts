import { translate } from '@/i18n';

export const validateOptionForm = (values) => {
  const errors: any = {};
  if (values.type?.value === 'storage_folder_manager') {
    const soft = values.storage_folder_config?.inode_soft_multiplier;
    const hard = values.storage_folder_config?.inode_hard_multiplier;
    if (soft && hard && parseFloat(hard) < parseFloat(soft)) {
      if (!errors.storage_folder_config) {
        errors.storage_folder_config = {};
      }
      errors.storage_folder_config.inode_hard_multiplier = translate(
        'Hard inode multiplier cannot be less than soft inode multiplier',
      );
    }
  }
  return errors;
};
