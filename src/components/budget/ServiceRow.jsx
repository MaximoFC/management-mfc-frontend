const ServiceRow = ({ service, selected, onToggle }) => {

    return (
        <div className="flex items-center justify-between border rounded-lg px-3 py-2">

            <div className="flex items-center gap-3">

                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggle}
                />

                <div>
                    <p className="text-sm font-medium">
                        {service.name}
                    </p>

                    <p className="text-xs text-gray-500">
                        ${service.price_usd} USD
                    </p>
                </div>

            </div>

        </div>
    );
};

export default ServiceRow;