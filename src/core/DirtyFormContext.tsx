import { createContext, useContext, useEffect } from 'react';
import { useFormState } from 'react-final-form';

export const DirtyFormContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsDirty: (_: boolean) => {},
});

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
