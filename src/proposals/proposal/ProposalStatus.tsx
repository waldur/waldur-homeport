export const ProposalStatus = () => (
  <>
    {[true, null, null, null, null].map((state, i) => {
      const bg =
        state === true
          ? 'bg-success'
          : state === false
            ? 'bg-danger'
            : 'bg-secondary';
      return (
        <span
          key={i}
          className={'w-15px h-15px d-inline-block rounded-circle me-4 ' + bg}
        ></span>
      );
    })}
  </>
);
