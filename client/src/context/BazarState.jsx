import { createContext, useState } from 'react';

export const BazarContext = createContext({
  pretMinim: 0,
  setPretMinim: () => {},
  pretMaxim: 9999,
  setPretMaxim: () => {},
  stringCautare: '',
  setStringCautare: () => {},
  categorieSelectata: 'Alege categoria',
  setCategorieSelectata: () => {},
  sortareSelectata: 'Sorteaza dupa',
  setSortareSelectata: () => {},
  dropdownCategorie: false,
  setDropdownCategorie: () => {},
  dropdownSortare: false,
  setDropdownSortare: () => {},
  anunturiPerPage: 15,
  setAnunturiPerPage: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  totalPages: 1,
  setTotalPages: () => {},
  anuntBazarIDs: [],
  setAnuntBazarIDs: () => {},
  anunturiDetails: [],
  setAnunturiDetails: () => {}
});

export const BazarProvider = ({ children }) => {
  const [pretMinim, setPretMinim] = useState(0);
  const [pretMaxim, setPretMaxim] = useState(9999);
  const [stringCautare, setStringCautare] = useState('');
  const [categorieSelectata, setCategorieSelectata] = useState('Alege categoria');
  const [sortareSelectata, setSortareSelectata] = useState('Sorteaza dupa');
  const [dropdownCategorie, setDropdownCategorie] = useState(false);
  const [dropdownSortare, setDropdownSortare] = useState(false);
  const [anunturiPerPage, setAnunturiPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anuntBazarIDs, setAnuntBazarIDs] = useState([]);
  const [anunturiDetails, setAnunturiDetails] = useState([]);

  return (
    <BazarContext.Provider value={{
      pretMinim,
      setPretMinim,
      pretMaxim,
      setPretMaxim,
      stringCautare,
      setStringCautare,
      categorieSelectata,
      setCategorieSelectata,
      sortareSelectata,
      setSortareSelectata,
      dropdownCategorie,
      setDropdownCategorie,
      dropdownSortare,
      setDropdownSortare,
      anunturiPerPage,
      setAnunturiPerPage,
      currentPage,
      setCurrentPage,
      totalPages,
      setTotalPages,
      anuntBazarIDs,
      setAnuntBazarIDs,
      anunturiDetails,
      setAnunturiDetails
    }}>
      {children}
    </BazarContext.Provider>
  );
};