import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const ProformaService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('PROFORMAS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log(`📊 Total de proformas procesadas: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener proformas:', error);
            throw error;
        }
    },

    async getAllDetalles() {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('PROFORMAS')}/${'detalles'}`);
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log(`📊 Total de proformas procesadas: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener proformas:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo proforma con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('PROFORMAS')}/${id}`);
            console.log('✅ Proforma obtenida exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener la proforma:', error.message);
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
            const response = await axios.get(`${API_CONFIG.getUrl('PROFORMAS')}/paciente/${pacienteId}`);
            console.log(`✅ Proformas del paciente ${pacienteId} obtenidas exitosamente:`, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las proformas del paciente:', error);
            throw error;
        }
    },

    async getByMedico(medicoId) {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('PROFORMAS')}/medico/${medicoId}`);
            console.log(`✅ Proformas del médico ${medicoId} obtenidas exitosamente:`, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las proformas del médico:', error);
            throw error;
        }
    },

    async getByEstado(estado) {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('PROFORMAS')}/estado/${estado}`);
            console.log(`✅ Proformas con estado ${estado} obtenidas exitosamente:`, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las proformas por estado:', error);
            throw error;
        }
    },

    async getByRangoFechas(fechaInicio, fechaFin) {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('PROFORMAS')}/fecha`, {
                params: {
                    fechaInicio,
                    fechaFin
                }
            });
            console.log(`✅ Proformas en el rango de fechas obtenidas exitosamente:`, response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las proformas por rango de fechas:', error);
            throw error;
        }
    },

    async create(proformaData) {
        try {
            console.log('🔄 Proforma a crear:', proformaData);
            const response = await axios.post(API_CONFIG.getUrl('PROFORMAS'), proformaData);
            console.log('✅ Proforma creada exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al crear la proforma:', error);
            throw error;
        }
    },

    async update(id, proformaData) {
        try {
            const response = await axios.put(`${API_CONFIG.getUrl('PROFORMAS')}/${id}`, proformaData);
            console.log('✅ Proforma actualizada exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al actualizar la proforma:', error);
            throw error;
        }
    },

    async delete(id) {
        console.log(`🔄 Eliminando proforma con ID: ${id}`);
        try {
            await axios.delete(`${API_CONFIG.getUrl('PROFORMAS')}/${id}`);
            console.log('✅ Proforma eliminada exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar la proforma:', error);
            throw error;
        }
    }
};
