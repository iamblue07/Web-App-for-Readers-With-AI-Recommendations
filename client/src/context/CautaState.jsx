import React, { createContext, useState } from 'react';

export const BookContext = createContext({
  bookIds: [],
  setBookIds: () => {},
  booksDetails: [],
  setBooksDetails: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  searchWords: '',
  setSearchWords: () => {},
  genuriSelectate: [],
  setGenuriSelectate: () => {},
  pretMinim: 0,
  setPretMinim: () => {},
  pretMaxim: 9999,
  setPretMaxim: () => {},
  totalPages: 1,
  setTotalPages: () => {},
  pageInput: '',
  setPageInput: () => {},
  sortareSelectata: "Sorteaza dupa",
  setSortareSelectata: () => {}
});

export const BookProvider = ({ children }) => {
  const [bookIds, setBookIds] = useState([]);
  const [booksDetails, setBooksDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchWords, setSearchWords] = useState('');
  const [genuriSelectate, setGenuriSelectate] = useState([]);
  const [pretMinim, setPretMinim] = useState(0);
  const [pretMaxim, setPretMaxim] = useState(9999);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [sortareSelectata, setSortareSelectata] = useState("Sorteaza dupa");

  return (
    <BookContext.Provider value={{
      bookIds,
      setBookIds,
      booksDetails,
      setBooksDetails,
      currentPage,
      setCurrentPage,
      searchWords,
      setSearchWords,
      genuriSelectate,
      setGenuriSelectate,
      pretMinim,
      setPretMinim,
      pretMaxim,
      setPretMaxim,
      totalPages,
      setTotalPages,
      pageInput,
      setPageInput,
      sortareSelectata,
      setSortareSelectata
    }}>
      {children}
    </BookContext.Provider>
  );
};
