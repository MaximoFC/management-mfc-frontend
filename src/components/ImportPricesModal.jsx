import { useState, forwardRef, useImperativeHandle } from "react";

const ImportPricesModal = forwardRef((props, ref) => {
    const [file, setFile] = useState(null);

    useImperativeHandle(ref, () => ({
        getFile: () => file
    }));

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
                Subí el Excel del proveedor.
                <br />
                Columna A → Código
                <br />
                Columna E → Precio lista
            </p>

            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="border p-2 rounded"
            />
        </div>
    )
});

export default ImportPricesModal;