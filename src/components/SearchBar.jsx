import React from 'react';

const SearchBar = ({ query, onSearch }) => {
  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Search products..."
      value={query}
      onChange={(e) => onSearch(e.target.value)}
    />
  );
};

export default SearchBar;
