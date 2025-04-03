import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

export const loginService = {
    async authenticate(email, password) {
        try {
            const response = await axios.post(`${API_URL}/administradores/authenticate`, null, {
                params: {
                    email: email,
                    password: password
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error en autenticación:', error);
            return false;
        }
    }
};
