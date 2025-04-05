import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const FichaOdontologicaService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('FICHAS_MEDICAS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Fichas:', response.data);
            console.log(`📊 Total de fichas procesadas: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener fichas:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo ficha con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('FICHAS_MEDICAS')}/${id}`);
            console.log('✅ Ficha obtenida exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener la ficha:', error.message);
            if (error.response) {
                console.error('📝 Detalles del error:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            throw error;
        }
    },

    async getByPaciente(pacienteId) {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('FICHAS_MEDICAS')}/paciente/${pacienteId}`);
            console.log(`✅ Fichas del paciente ${pacienteId} obtenidas exitosamente:`, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las fichas del paciente:', error);
            throw error;
        }
    },

    async getByMedico(medicoId) {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('FICHAS_MEDICAS')}/medico/${medicoId}`);
            console.log(`✅ Fichas del médico ${medicoId} obtenidas exitosamente:`, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las fichas del médico:', error);
            throw error;
        }
    },

    async create(fichaData) {
        try {
            console.log('🔄 Ficha a crear:', fichaData);
            const response = await axios.post(API_CONFIG.getUrl('FICHAS_MEDICAS'), fichaData);
            console.log('✅ Ficha creada exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear la ficha:', error);
            throw error;
        }
    },

    async update(id, fichaData) {
        try {
            const response = await axios.put(`${API_CONFIG.getUrl('FICHAS_MEDICAS')}/${id}`, fichaData);
            console.log('✅ Ficha actualizada exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la ficha:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(`${API_CONFIG.getUrl('FICHAS_MEDICAS')}/${id}`);
            console.log('✅ Ficha eliminada exitosamente');
            return true;
        } catch (error) {
            console.error('Error al eliminar la ficha:', error);
            throw error;
        }
    }
};
