import { useMemo } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { useInventoryStore } from "../../store/useInventoryStore";

const BudgetSummary = ({ dollarRate }) => {

    const selectedServices = useBudgetStore((s) => s.selectedServices);
    const selectedBikeparts = useBudgetStore((s) => s.selectedBikeparts);

    const services = useInventoryStore((s) => s.services);
    const bikeparts = useInventoryStore((s) => s.bikeparts);

    const servicesTotal = useMemo(() => {

        if (!dollarRate) return 0;

        return selectedServices.reduce((acc, serviceId) => {

            const service = services.find(s => s._id === serviceId);

            if (!service) return acc;

            return acc + service.price_usd * dollarRate;

        }, 0);

    }, [selectedServices, services, dollarRate]);


    const partsTotal = useMemo(() => {

        if (!dollarRate) return 0;

        return selectedBikeparts.reduce((acc, part) => {

            const bikepart = bikeparts.find(b => b._id === part.bikepart_id);

            if (!bikepart) return acc;

            return acc + (bikepart.price_usd * part.amount * dollarRate);

        }, 0);

    }, [selectedBikeparts, bikeparts, dollarRate]);


    const total = servicesTotal + partsTotal;

    const formatARS = (value) => {
        return value.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        });
    };


    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm">

            <h2 className="text-lg font-semibold mb-4">
                Resumen del Presupuesto
            </h2>

            <div className="space-y-2 text-sm">

                <div className="flex justify-between">
                    <span>Servicios</span>
                    <span>{formatARS(servicesTotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Repuestos</span>
                    <span>{formatARS(partsTotal)}</span>
                </div>

                <div className="border-t pt-3 mt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatARS(total)}</span>
                </div>

            </div>

        </div>
    );
};

export default BudgetSummary;