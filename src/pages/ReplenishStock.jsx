import { useParams, useNavigate } from "react-router-dom";
import SpareForm from "../components/SpareForm";
import { updateBikepart } from "../services/bikepartService";
import { createFlow } from "../services/cashService";
import { useInventoryStore } from "../store/useInventoryStore";
import { toast } from "react-toastify";

const ReplenishStock = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const spare = useInventoryStore(s => 
        s.bikeparts.find(b => b._id === id)
    );

    const updateBikepartInStore = useInventoryStore(s => s.updateBikepart);

    const handleReplenish = async (data) => {
        const updatedStock = Number(spare.stock) + Number(data.stock);
        const totalCost = Number(data.stock) * Number(data.amount);

        try {
            const updated = await updateBikepart(id, {
                ...spare,
                stock: updatedStock
            });

            updateBikepartInStore(updated);

            await createFlow({
                type: "egreso",
                amount: totalCost,
                description: `Reposición de stock: ${spare.description}`
            });
            
            toast.success("Stock actualizado");
            navigate("/repuestos");
        } catch (err) {
            console.error(err);
            toast.error("Ocurrió un error al reponer stock");
        }
    };

    return spare ? (
        <SpareForm initialData={spare} onSubmit={handleReplenish} mode="replenish" />
        ) : (
            <p>Cargando...</p>
    );
};
export default ReplenishStock;
