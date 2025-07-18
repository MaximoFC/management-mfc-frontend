import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [onSearch, setOnSearch] = useState(null);
    const [searchPlaceHolder, setSearchPlaceholder] = useState('Buscar cliente, trabajo o repuesto');

    return (
        <SearchContext.Provider value={{
            searchTerm, setSearchTerm,
            onSearch, setOnSearch,
            searchPlaceHolder, setSearchPlaceholder
            }}>
            {children}
        </SearchContext.Provider>
    );
};