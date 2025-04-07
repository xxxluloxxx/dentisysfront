import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

export default {
    async getCuentas() {
        try {
            const response = await axios.get(`${API_URL}/cuentas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener las cuentas:', error);
            throw error;
        }
    }
};
