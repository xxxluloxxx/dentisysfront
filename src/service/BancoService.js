import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const BancoService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('BANCOS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Bancos:', response.data);
            console.log(`📊 Total de bancos procesados: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener bancos:', error);
            throw error;
        }
    },

    async create(bancoData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('BANCOS'), bancoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear el banco:', error);
            throw error;
        }
    },

    async update(id, bancoData) {
        try {
            const response = await axios.put(API_CONFIG.getUrl('BANCOS') + '/' + id, bancoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el banco:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('BANCOS') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el banco:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo banco con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('BANCOS')}/${id}`);
            console.log('✅ Banco obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el banco:', error.message);
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
