import { useParams, useNavigate } from "react-router-dom";
import SpareForm from "../components/SpareForm";
import { updateBikepart } from "../services/bikepartService";
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
        try {
            const updated = await updateBikepart(id, data);

            updateBikepartInStore(updated);
            
            toast.success("Stock actualizado");
            navigate("/repuestos");
        } catch (err) {
            console.error(err);
            toast.error("Ocurrió un error al reponer stock");
        }
    };

    return spare ? (
        <SpareForm initialData={spare} onSubmit={handleReplenish} mode="stock" />
        ) : (
            <p>Cargando...</p>
    );
};
export default ReplenishStock;
