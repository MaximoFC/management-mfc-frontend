import { useState } from "react";
import axios from "axios";

function StockEntryForm() {
    const [code, setCode] = useState('');
    const [tipe, setTipe] = useState('');
    const [brand, setBrand] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [amount, setAmount] = useState('');   //Esto es para el endpoint /stock-ingresos, no para /repuestos
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/repuestos', {
                code: code,
                tipe: tipe,
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
        <div className="p-8">
            <form 
                onSubmit={handleSubmit}
                className="p-6 flex flex-col justify-center gap-4 border-1 border-black rounded-xl"
            >
                <h2>Registrar ingreso de repuestos</h2>
                <select
                    className="border-1 border-black rounded-xl p-2"
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value)}
                    required
                >
                    <option value="">Seleccionar repuesto</option>
                    <option value="">Piñón</option>
                    <option value="">Plato</option>
                    <option value="">Frenos</option>
                    <option value="">Masas traseras</option>
                    <option value="">Masas delanteras</option>
                </select>

                <input
                    className="border-1 border-black rounded-xl p-2"
                    type="text"
                    placeholder="Código"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />

                <input
                    className="border-1 border-black rounded-xl p-2"
                    type="text"
                    placeholder="Marca"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                />

                <input
                    className="border-1 border-black rounded-xl p-2"
                    type="text"
                    placeholder="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <input
                    className="border-1 border-black rounded-xl p-2"
                    type="number"
                    placeholder="Cantidad"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                />

                <input
                    className="border-1 border-black rounded-xl p-2"
                    type="number"
                    placeholder="Precio unitario"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />

                <input
                    className="border-1 border-black rounded-xl p-2"
                    type="number" 
                    placeholder="Precio de venta"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <button className="border-1 border-red-500 p-2 rounded-xl cursor-pointer hover:bg-red-500 hover:text-white">
                    Confirmar
                </button>

                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default StockEntryForm;