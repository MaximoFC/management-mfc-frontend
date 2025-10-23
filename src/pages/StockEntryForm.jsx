import SpareForm from "../components/SpareForm";
import { useNavigate } from "react-router-dom";
import { createBikepart } from "../services/bikepartService";
import { createFlow } from "../services/cashService";
import { toast } from "react-toastify";

const StockEntryForm = () => {
    const navigate = useNavigate();

    const handleCreate = async (data) => {
        const totalCost = Number(data.stock) * Number(data.amount);

        if (isNaN(totalCost) || totalCost <= 0) {
            toast.warning("El monto total debe ser mayor a 0");
            return;
        }

        try {
            const newPart = await createBikepart(data);
            
            const flowData = {
                type: 'egreso',
                amount: totalCost,
                description: `Compra de nuevo repuesto ${newPart.description}`,
                employee_id: null
            };

            await createFlow(flowData);
            
            navigate('/repuestos');
        } catch (err) {
            console.error("Error creating spare: ", err);
            toast.error("Ocurrió un error al crear el repuesto o registrar el flujo de caja");
        }
    };

    return <SpareForm onSubmit={handleCreate} mode="create" />;
};

export default StockEntryForm;