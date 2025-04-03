import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const PacienteService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('PACIENTES'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Pacientes:', response.data);
            console.log(`📊 Total de pacientes procesados: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            throw error;
        }
    },

    async create(clienteData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('PACIENTES'), clienteData);
            return response.data;
        } catch (error) {
            console.error('Error al crear el pacientes:', error);
            throw error;
        }
    },

    async update(id, clienteData) {
        try {
            const response = await axios.put(API_CONFIG.getUrl('PACIENTES') + '/' + id, clienteData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el pacientes:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('PACIENTES') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el pacientes:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo cliente con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('PACIENTES')}/${id}`);
            console.log('✅ Cliente obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el paciente:', error.message);
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
