import Layout from "../components/Layout";

import ClientBikeSelector from "../components/budget/ClientBikeSelector";
import ServicesSelector from "../components/budget/ServicesSelector";
import BikepartsSelector from "../components/budget/BikepartsSelector";
import BudgetSummary from "../components/budget/BudgetSummary";

import { useBudgetData } from "../hooks/useBudgetData";

const BudgetPage = () => {

    const { dollarRate, clients, bikes } = useBudgetData();

    return (
        <Layout>

            <div className="p-6 space-y-6">

                <ClientBikeSelector
                    clients={clients}
                    bikes={bikes}
                />

                <div className="grid grid-cols-2 gap-6">
                    <ServicesSelector />
                    <BikepartsSelector />
                </div>

                <BudgetSummary
                    dollarRate={dollarRate}
                />

            </div>

        </Layout>
    );

};

export default BudgetPage;