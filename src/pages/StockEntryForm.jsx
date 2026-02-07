import SpareForm from "../components/SpareForm";
import { useNavigate } from "react-router-dom";
import { createBikepart } from "../services/bikepartService";
import { toast } from "react-toastify";

const StockEntryForm = () => {
    const navigate = useNavigate();

    const handleCreate = async (data) => {
        try {
            await createBikepart(data);
            toast.success("Repuesto creado correctamente");
            navigate('/repuestos');
        } catch (err) {
            console.error("Error creating spare: ", err);
            toast.error("Ocurrió un error al crear el repuesto");
        }
    };

    return <SpareForm onSubmit={handleCreate} mode="create" />;
};

export default StockEntryForm;