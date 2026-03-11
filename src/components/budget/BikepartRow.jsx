const BikepartRow = ({ part, selected, onToggle, onAmountChange }) => {

    return (
        <div className="flex items-center justify-between border rounded-lg px-3 py-2">

            <div className="flex items-center gap-3">

                <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={onToggle}
                />

                <div>
                    <p className="text-sm font-medium">
                        {part.description}
                    </p>

                    <p className="text-xs text-gray-500">
                        ${part.price_usd} USD
                    </p>
                </div>

            </div>

            {selected && (
                <input
                    type="number"
                    min="1"
                    value={selected.amount}
                    onChange={(e) =>
                        onAmountChange(Number(e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1 text-sm"
                />
            )}

        </div>
    );
};

export default BikepartRow;