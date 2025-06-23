import axios from "axios";
import SpareForm from "../components/SpareForm";
import { useNavigate } from "react-router-dom";

const StockEntryForm = () => {
    const navigate = useNavigate();

    const handleCreate = async (data) => {
        try {
            await axios.post('http://localhost:4000/api/bikeparts', data);

            await axios.post('http://localhost:4000/api/cash/flow', {
                type: 'egreso',
                amount: Number(data.stock) * Number(data.amount),
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