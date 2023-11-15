import { useRouter } from '@uirouter/react';

export const DropdownLink = ({ state, params, ...rest }) => {
  // This component ensures that dropdown is hidden when state transition is triggered
  const router = useRouter();
  return (
    <a
      {...rest}
      onClick={() => {
        setTimeout(() => {
          router.stateService.go(state, params);
        }, 100);
      }}
    />
  );
};
