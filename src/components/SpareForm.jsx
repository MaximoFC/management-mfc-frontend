import { useState } from "react";

const SpareForm = ({ initialData = {}, onSubmit, mode = "create" }) => {
    const [form, setForm] = useState({
        code: '',
        type: '',
        brand: '',
        description: '',
        price: '',
        ...initialData,
        amount: '',
        stock: mode === 'replenish' ? '': initialData.stock || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form, 
            stock: Number(form.stock), 
            price: Number(form.price),
            amount: Number(form.amount)
        });
    };

    return (
        <div className="flex items-center justify-center h-dvh">
            <form 
                onSubmit={handleSubmit}
                className="p-6 flex flex-col justify-center gap-4 rounded-md shadow-md border-1 border-gray-200 bg-white"
            >
                <h2 className="text-2xl font-bold">
                    {mode === 'create' ? 'Agregar nuevo repuesto' : mode === 'update' ? 'Editar repuesto' : 'Reponer stock'}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    {(mode !== 'replenish') && (
                        <>
                            <div className="flex flex-col">
                                <label htmlFor="">Tipo de repuesto *</label>
                                <select
                                className="border-1 border-gray-300 rounded-md p-2"
                                name="type"
                                id="type"
                                value={form.type}
                                onChange={handleChange}
                                required
                                >
                                    <option value="">Seleccionar repuesto</option>
                                    <option value="Piñón">Piñón</option>
                                    <option value="Plato">Plato</option>
                                    <option value="Frenos">Frenos</option>
                                    <option value="Masas traseras">Masas traseras</option>
                                    <option value="Masas delanteras">Masas delanteras</option>
                                </select>
                            </div>
                            
                            <div className="flex flex-col">  
                                <label htmlFor="code">Código *</label>
                                <input
                                    className="border-1 border-gray-300 rounded-md p-2"
                                    type="text"
                                    name="code"
                                    id="code"
                                    placeholder="Código"
                                    value={form.code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="flex flex-col">
                                <label htmlFor="brand">Marca *</label>
                                <input
                                    className="border-1 border-gray-300 rounded-md p-2"
                                    type="text"
                                    name="brand"
                                    id="brand"
                                    placeholder="Marca"
                                    value={form.brand}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="price">Precio *</label>
                                <input
                                    className="border-1 border-gray-300 rounded-md p-2"
                                    type="number"
                                    name="price"
                                    id="price"
                                    placeholder="Precio de venta"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="flex flex-col">
                        <label htmlFor="stock">Stock *</label>
                        <input
                            className="border-1 border-gray-300 rounded-md p-2"
                            type="number"
                            name="stock"
                            id="stock"
                            placeholder={mode === 'replenish' ? 'Cantidad a agregar' : 'Cantidad'}
                            value={form.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {(mode !== 'update') && (
                    <div className="flex flex-col">
                        <label htmlFor="amount">Precio unitario (compra) *</label>
                        <input
                            type="number"
                            className="border-1 border-gray-300 rounded-md p-2"
                            name="amount"
                            id="amount"
                            placeholder="Costo por unidad"
                            value={form.amount || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}
                </div>

                {(mode !== 'replenish') && (
                    <div className="flex flex-col">
                        <label htmlFor="description">Descripción *</label>
                        <textarea
                            className="border-1 border-gray-300 rounded-md p-2"
                            name="description"
                            id="description"
                            placeholder="Descripción"
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                )}

                <button className="rounded-md bg-red-500 text-white cursor-pointer p-2 hover:bg-red-700">
                    {mode === 'update' ? 'Guardar cambios' : mode === 'replenish' ? 'Reponer stock' : 'Agregar repuesto'}
                </button>
            </form>
        </div>
    );
};

export default SpareForm;
