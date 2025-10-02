import axios from "axios";
import SpareForm from "../components/SpareForm";
import { useNavigate } from "react-router-dom";
import { createBikepart } from "../services/bikepartService";

const StockEntryForm = () => {
    const navigate = useNavigate();

    const handleCreate = async (data) => {
        const totalCost = Number(data.stock) * Number(data.amount);

        try {
            await createBikepart(data);

            await axios.post('http://localhost:4000/api/cash/flow', {
                type: 'egreso',
                amount: totalCost,
                description: `Compra de nuevo repuesto: ${data.description}`
            })
            
            navigate('/repuestos');
        } catch (err) {
            alert("Error creating spare: ", err);
        }
    };

    return <SpareForm onSubmit={handleCreate} mode="create" />;
};

export default StockEntryForm;