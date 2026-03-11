import { useState, useEffect } from "react";
import { useBudgetStore } from "../store/useBudgetStore";
import { fetchDollarRate } from "../services/utilsService";
import { fetchClients } from "../services/clientService";
import { fetchBikesByClient } from "../services/bikeService";

export const useBudgetData = () => {

    const [dollarRate, setDollarRate] = useState(null);
    const [clients, setClients] = useState([]);
    const [bikes, setBikes] = useState([]);

    const clientId = useBudgetStore((s) => s.clientId);
    const setBikeId = useBudgetStore((s) => s.setBikeId);


    useEffect(() => {

        const loadInitialData = async () => {

            try {

                const dollar = await fetchDollarRate();
                setDollarRate(dollar);

                const clientsData = await fetchClients();
                setClients(clientsData);

            } catch (error) {
                console.error("Error loading initial budget data", error);
            }

        };

        loadInitialData();

    }, []);


    useEffect(() => {

        const loadBikes = async () => {

            if (!clientId) {
                setBikes([]);
                setBikeId(null);
                return;
            }

            try {

                const bikesData = await fetchBikesByClient(clientId);
                setBikes(bikesData);

            } catch (error) {
                console.error("Error loading bikes", error);
            }

        };

        loadBikes();

    }, [clientId, setBikeId]);


    return {
        dollarRate,
        clients,
        bikes
    };

};