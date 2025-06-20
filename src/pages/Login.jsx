import { useState } from "react";
import { loginEmployee } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginEmployee(name, password);
            localStorage.setItem('token', res.token);
            localStorage.setItem('employee', JSON.stringify(res.employee));
            console.log('Successful login', res.employee);
            navigate('/dashboard');
            alert("Iniciaste sesión")
            //Añadir limpieza del formulario cuando todo esté funcional
        } catch (error) {
            setError(error.message || 'Login error');
        }
    };

    return (
        <div className="p-8">
            <form 
                onSubmit={handleSubmit}
                className="flex flex-col justify-center gap-4 border-1 border-black rounded-xl p-6"
            >
                <h2>Login</h2>
                <input 
                    type="text" 
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-1 border-black rounded-xl p-2"
                />
                <input 
                    type="password" 
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-1 border-black rounded-xl p-2"
                />
                <button 
                    type="submit"
                    className="border-1 border-red-500 p-2 rounded-xl cursor-pointer hover:bg-red-500 hover:text-white"
                >
                    Ingresar
                </button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}

export default Login;