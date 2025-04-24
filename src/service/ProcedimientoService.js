import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const ProcedimientoService = {
    async create(procedimientoData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('PROCEDIMIENTO'), procedimientoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear el procedimiento:', error);
            throw error;
        }
    },

    async update(id, procedimientoData) {
        try {
            const response = await axios.put(API_CONFIG.getUrl('PROCEDIMIENTO') + '/' + id, procedimientoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el procedimiento:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('PROCEDIMIENTO') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el procedimiento:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo procedimiento con ID: ${id}`);
        try {
            const response = await axios.get(API_CONFIG.getUrl('PROCEDIMIENTO') + '/ficha/' + id);
            console.log('✅ Procedimiento obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el procedimiento:', error.message);
            if (error.response) {
                console.error('📝 Detalles del error:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            throw error;
        }
    },

    async getByFichaId(fichaId) {
        console.log(`🚀 Obteniendo procedimientos para la ficha: ${fichaId}`);
        try {
            const response = await axios.get(API_CONFIG.getUrl('PROCEDIMIENTO') + '/ficha/' + fichaId);
            console.log('✅ Procedimientos obtenidos exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener los procedimientos de la ficha:', error.message);
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
