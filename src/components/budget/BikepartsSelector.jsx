import { useState, useMemo } from "react";
import { useInventoryStore } from "../../store/useInventoryStore";
import { useBudgetStore } from "../../store/useBudgetStore";
import BikepartRow from "./BikepartRow";

const BikepartsSelector = () => {

    const bikeparts = useInventoryStore((s) => s.bikeparts);
    const selectedBikeparts = useBudgetStore((s) => s.selectedBikeparts);

    const addBikepart = useBudgetStore((s) => s.addBikepart);
    const updateBikepartAmount = useBudgetStore((s) => s.updateBikepartAmount);

    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {

        const term = search.toLowerCase();

        return bikeparts.filter((p) =>
            p.description?.toLowerCase().includes(term)
        );

    }, [search, bikeparts]);


    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm">

            <h2 className="text-lg font-semibold mb-4">
                Repuestos
            </h2>

            <input
                type="text"
                placeholder="Buscar repuesto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
            />

            <div className="space-y-2 max-h-[400px] overflow-y-auto">

                {filtered.map((part) => {

                    const selected = selectedBikeparts.find(
                        (p) => p.bikepart_id === part._id
                    );

                    return (
                        <BikepartRow
                            key={part._id}
                            part={part}
                            selected={selected}
                            onToggle={() => addBikepart(part._id)}
                            onAmountChange={(amount) =>
                                updateBikepartAmount(part._id, amount)
                            }
                        />
                    );
                })}

            </div>

        </div>
    );
};

export default BikepartsSelector;