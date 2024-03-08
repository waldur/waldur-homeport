import { useRouter } from '@uirouter/react';

export const DropdownLink = ({ state, params, ...rest }) => {
  // This component ensures that dropdown is hidden when state transition is triggered
  const router = useRouter();
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...rest}
      onClick={() => {
        setTimeout(() => {
          router.stateService.go(state, params);
        }, 100);
      }}
      aria-hidden="true"
    />
  );
};
