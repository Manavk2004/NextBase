import { useEffect, useRef, useState } from "react";
import { PAGINATION } from "@/config/constants";

interface UseEntitySearchProps<T extends {
    search: string;
    page: number
}>{
    params: T;
    setParams: (params: T) => void;
    debounceMs?: number
}

export function useEntitySearch<T extends {
    search: string;
    page: number;
}>({
    params,
    setParams,
    debounceMs = 500
}: UseEntitySearchProps<T>){
    const [ localSearch, setLocalSearch ] = useState(params.search)
    const paramsRef = useRef(params);
    paramsRef.current = params;

    useEffect(() => {
        if(localSearch === "" && paramsRef.current.search !== ""){
            setParams({
                ...paramsRef.current,
                search: "",
                page: PAGINATION.DEFAULT_PAGE
            })
            return
        }

        const timer = setTimeout(() => {
            if(localSearch !== paramsRef.current.search){
                setParams({
                    ...paramsRef.current,
                    search: localSearch,
                    page: PAGINATION.DEFAULT_PAGE
                })
            }
        }, debounceMs)

        return () => clearTimeout(timer)
    }, [localSearch, setParams, debounceMs])

    useEffect(() => {
        setLocalSearch(params.search)
    }, [params.search])

    return {
        searchValue: localSearch,
        onSearchChange: setLocalSearch
    }
}