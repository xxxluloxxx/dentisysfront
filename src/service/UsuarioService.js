import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const UsuarioService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('USUARIOS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Usuarios:', response.data);
            console.log(`📊 Total de usuarios procesados: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    async create(usuarioData) {
        try {
            usuarioData.password = '123';
            const response = await axios.post(API_CONFIG.getUrl('USUARIOS'), usuarioData);
            return response.data;
                } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    },

    async update(id, usuarioData) {
        try {
            console.log('🔄 Actualizando usuario con ID:', id);
            console.log('🔄 Datos a actualizar:', usuarioData);
            // Obtener el usuario existente

            const response = await axios.put(API_CONFIG.getUrl('USUARIOS') + '/' + id, usuarioData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('USUARIOS') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo usuario con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('USUARIOS')}/${id}`);
            console.log('✅ Usuario obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el usuario:', error.message);
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
