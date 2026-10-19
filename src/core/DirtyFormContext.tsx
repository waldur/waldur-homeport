import { useContext, useEffect } from 'react';
import { useFormState } from 'react-final-form';

import { DirtyFormContext } from 'waldur-ui';

// The context lives in waldur-ui, beside the ModalRoot that reads it; the
// react-final-form side that reports into it stays here.
export { DirtyFormContext };

const useDirtyForm = (isDirty: boolean) => {
  const { setIsDirty } = useContext(DirtyFormContext);

  useEffect(() => {
    setIsDirty(isDirty);
    return () => {
      // If the component unmounts, we should clear the dirty state
      // However, we only clear it if we were the ones who set it dirty,
      // or we just clear it regardless to be safe.
      setIsDirty(false);
    };
  }, [isDirty, setIsDirty]);
};

export const DirtyStateReporter = () => {
  const { dirty } = useFormState({ subscription: { dirty: true } });
  useDirtyForm(dirty);
  return null;
};
