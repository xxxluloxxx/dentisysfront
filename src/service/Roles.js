import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const RolesService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('ROLES'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Roles:', response.data);
            console.log(`📊 Total de roles procesados: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener roles:', error);
            throw error;
        }
    },

    async create(rolData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('ROLES'), rolData);
            return response.data;
        } catch (error) {
            console.error('Error al crear el rol:', error);
            throw error;
        }
    },

    async update(id, rolData) {
        try {
            const response = await axios.put(API_CONFIG.getUrl('ROLES') + '/' + id, rolData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el rol:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('ROLES') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el rol:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo rol con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('ROLES')}/${id}`);
            console.log('✅ Rol obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el rol:', error.message);
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
