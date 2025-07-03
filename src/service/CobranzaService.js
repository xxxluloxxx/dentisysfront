import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const CobranzaService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('COBRANZAS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Cobranzas:', response.data);
            console.log(`📊 Total de cobranzas procesadas: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener cobranzas:', error);
            throw error;
        }
    },

    async create(cobranzaData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('COBRANZAS'), cobranzaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear el cobranzas:', error);
            throw error;
        }
    },

    async update(id, clienteData) {
        try {
            const response = await axios.put(API_CONFIG.getUrl('COBRANZAS') + '/' + id, clienteData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el cobranzas:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('COBRANZAS') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el cobranzas:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo cobranza con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('COBRANZAS')}/${id}`);
            console.log('✅ Cobranza obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el cobranza:', error.message);
            if (error.response) {
                console.error('📝 Detalles del error:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            throw error;
        }
    }
};
