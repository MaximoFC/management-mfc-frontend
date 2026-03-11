import { useState, useMemo } from "react";
import { useInventoryStore } from "../../store/useInventoryStore";
import { useBudgetStore } from "../../store/useBudgetStore";
import ServiceRow from "./ServiceRow";

const ServicesSelector = () => {

    const services = useInventoryStore((s) => s.services);
    const selectedServices = useBudgetStore((s) => s.selectedServices);
    const toggleService = useBudgetStore((s) => s.toggleService);

    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {

        const term = search.toLowerCase();

        return services.filter((s) =>
            s.name?.toLowerCase().includes(term)
        );

    }, [search, services]);


    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm">

            <h2 className="text-lg font-semibold mb-4">
                Servicios
            </h2>

            <input
                type="text"
                placeholder="Buscar servicio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="space-y-2 max-h-[400px] overflow-y-auto">

                {filtered.map((service) => {

                    const isSelected = selectedServices.some(
                        (s) => s._id === service._id
                    );

                    return (
                        <ServiceRow
                            key={service._id}
                            service={service}
                            selected={isSelected}
                            onToggle={() => toggleService(service)}
                        />
                    );
                })}

            </div>

        </div>
    );
};

export default ServicesSelector;