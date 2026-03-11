import { useBudgetStore } from "../../store/useBudgetStore";

const ClientBikeSelector = ({ clients, bikes }) => {

    const clientId = useBudgetStore((s) => s.clientId);
    const setClientId = useBudgetStore((s) => s.setClientId);

    const bikeId = useBudgetStore((s) => s.bikeId);
    const setBikeId = useBudgetStore((s) => s.setBikeId);


    const handleClientChange = (e) => {
        const value = e.target.value || null;
        setClientId(value);
    };

    const handleBikeChange = (e) => {
        const value = e.target.value || null;
        setBikeId(value);
    };


    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm">

            <h2 className="text-lg font-semibold mb-4">
                Cliente y Bicicleta
            </h2>

            <div className="grid grid-cols-2 gap-4">

                {/* Cliente */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                        Cliente
                    </label>

                    <select
                        value={clientId || ""}
                        onChange={handleClientChange}
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="">
                            Seleccionar cliente
                        </option>

                        {clients.map((client) => (
                            <option
                                key={client._id}
                                value={client._id}
                            >
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>


                {/* Bicicleta */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                        Bicicleta
                    </label>

                    <select
                        value={bikeId || ""}
                        onChange={handleBikeChange}
                        disabled={!clientId}
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="">
                            Seleccionar bicicleta
                        </option>

                        {bikes.map((bike) => (
                            <option
                                key={bike._id}
                                value={bike._id}
                            >
                                {bike.brand} {bike.model}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

        </div>
    );
};

export default ClientBikeSelector;