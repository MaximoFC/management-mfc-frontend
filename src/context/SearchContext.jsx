import { createContext, useContext, useEffect, useState } from "react";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

// La barra de búsqueda del navbar solo se muestra en las páginas que la registran con este hook
export const useGlobalSearch = (placeholder) => {
    const { searchTerm, setSearchTerm, setSearchPlaceholder, setEnabled } = useSearch();

    useEffect(() => {
        setSearchPlaceholder(placeholder);
        setEnabled(true);
        return () => {
            setEnabled(false);
            setSearchTerm("");
        };
    }, [placeholder, setEnabled, setSearchPlaceholder, setSearchTerm]);

    return searchTerm;
};

export const SearchProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [enabled, setEnabled] = useState(false);
    const [searchPlaceHolder, setSearchPlaceholder] = useState("");

    return (
        <SearchContext.Provider value={{
            searchTerm, setSearchTerm,
            enabled, setEnabled,
            searchPlaceHolder, setSearchPlaceholder
        }}>
            {children}
        </SearchContext.Provider>
    );
};
