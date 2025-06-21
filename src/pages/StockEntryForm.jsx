import { useState } from "react";
import axios from "axios";

function StockEntryForm() {
    const [code, setCode] = useState('');
    const [type, setType] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [amount, setAmount] = useState('');   //Esto es para el endpoint /stock-ingresos, no para /repuestos
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/bikeparts', {
                code: code,
                type: type,
                brand: brand,
                description: description,
                stock: Number(stock),
                price: Number(price)
            });

            setMessage('Stock entry successful');
            setCode('');
            setDescription('');
            setStock('');
            setAmount('');
            setPrice('');
        } catch (error) {
            setMessage('Error', error);
        }
    };

    return (
        <div className="flex items-center justify-center h-dvh">
            <form 
                onSubmit={handleSubmit}
                className="p-6 flex flex-col justify-center gap-4 rounded-md shadow-md border-1 border-gray-200"
            >
                <h2 className="text-3xl font-bold">Agregar nuevo repuesto</h2>
                <div className="grid grid-cols-2 gap-4">
                    <select
                        className="border-1 border-gray-300 rounded-md p-2"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar repuesto</option>
                        <option value="Piñón">Piñón</option>
                        <option value="Plato">Plato</option>
                        <option value="Frenos">Frenos</option>
                        <option value="Masas traseras">Masas traseras</option>
                        <option value="Masas delanteras">Masas delanteras</option>
                    </select>

                    <input
                        className="border-1 border-gray-300 rounded-md p-2"
                        type="text"
                        placeholder="Código"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />

                    <input
                        className="border-1 border-gray-300 rounded-md p-2"
                        type="text"
                        placeholder="Marca"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                    />

                    <input
                        className="border-1 border-gray-300 rounded-md p-2"
                        type="number"
                        placeholder="Cantidad"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                    />

                    <input
                        className="border-1 border-gray-300 rounded-md p-2"
                        type="number"
                        placeholder="Precio unitario"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <input
                        className="border-1 border-gray-300 rounded-md p-2"
                        type="number" 
                        placeholder="Precio de venta"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                
                <textarea
                    className="border-1 border-gray-300 rounded-md p-2"
                    type="text"
                    placeholder="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <button className="rounded-md bg-red-500 text-white cursor-pointer p-2 hover:bg-red-700">
                    Confirmar
                </button>

                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default StockEntryForm;