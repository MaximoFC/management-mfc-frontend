import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SpareForm from "../components/SpareForm";

const EditSpare = () => {
    const { id } = useParams();
    const [spare, setSpare] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:4000/api/bikeparts/${id}`)
            .then(res => setSpare(res.data));
    }, [id]);

    const handleEdit = async (data) => {
        try {
            await axios.put(`http://localhost:4000/api/bikeparts/${id}`, data);
            navigate('/repuestos');
        } catch (err) {
            alert("Error updating spare: ", err);
        }
    };

    return spare ? <SpareForm initialData={spare} onSubmit={handleEdit} mode="update" /> : <p>Cargando...</p>;
};

export default EditSpare;
