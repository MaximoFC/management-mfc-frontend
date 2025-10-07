import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpareForm from "../components/SpareForm";
import { updateBikepart, getBikepartById } from "../services/bikepartService";
import { createFlow } from "../services/cashService";

const ReplenishStock = () => {
    const { id } = useParams();
    const [spare, setSpare] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getBikepartById(id).then(setSpare);
    }, [id]);

    const handleReplenish = async (data) => {
        const updatedStock = Number(spare.stock) + Number(data.stock);
        const totalCost = Number(data.stock) * Number(data.amount);

        try {
            await updateBikepart(id, { ...spare, stock: updatedStock });

            await createFlow({
                type: 'egreso',
                amount: totalCost,
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
