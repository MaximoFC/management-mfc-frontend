import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpareForm from "../components/SpareForm";

const ReplenishStock = () => {
    const { id } = useParams();
    const [spare, setSpare] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:4000/api/bikeparts/${id}`)
            .then(res => setSpare(res.data));
    }, [id]);

    const handleReplenish = async (data) => {
        const updatedStock = Number(spare.stock) + Number(data.stock);
        try {
            await axios.put(`http://localhost:4000/api/bikeparts/${id}`, { ...spare, stock: updatedStock });

            await axios.post('http://localhost:4000/api/cash/flow', {
                type: 'egreso',
                amount: Number(data.stock) * Number(data.amount),
                description: `Reposición de stock: ${spare.description}`
            })
            
            navigate('/repuestos');
        } catch (err) {
            alert("Error updating spare: ", err);
        }
    };

    return spare ? <SpareForm initialData={spare} onSubmit={handleReplenish} mode="replenish" /> : <p>Cargando...</p>;
};

export default ReplenishStock;
