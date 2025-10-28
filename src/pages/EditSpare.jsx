import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpareForm from "../components/SpareForm";
import { toast } from "react-toastify";
import api from "../services/api";

const EditSpare = () => {
    const { id } = useParams();
    const [spare, setSpare] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/bikeparts/${id}`)
            .then(res => setSpare(res.data));
    }, [id]);

    const handleEdit = async (data) => {
        try {
            await api.put(`/bikeparts/${id}`, data);
            navigate('/repuestos');
        } catch (err) {
            toast.error("Error updating spare: ", err);
        }
    };

    return spare ? <SpareForm initialData={spare} onSubmit={handleEdit} mode="update" /> : <p>Cargando...</p>;
};

export default EditSpare;
