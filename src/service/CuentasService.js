import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const CuentasService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('CUENTAS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Cuentas:', response.data);
            console.log(`📊 Total de cuentas procesadas: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cuentas:', error);
            throw error;
        }
    },

    async create(cuentaData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('CUENTAS'), cuentaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear la cuenta:', error);
            throw error;
        }
    }
};
