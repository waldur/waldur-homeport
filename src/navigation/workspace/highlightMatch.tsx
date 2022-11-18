export const highlightMatch = (string: string, search: string) => {
  if (string.toLowerCase().includes(search.toLowerCase())) {
    const indexOfSearch = string.indexOf(search);
    return (
      <>
        {string.substring(0, indexOfSearch)}
        <span style={{ backgroundColor: 'lightblue' }}>
          {string.substring(indexOfSearch, indexOfSearch + search.length)}
        </span>
        {string.substring(indexOfSearch + search.length)}
      </>
    );
  } else return string;
};
