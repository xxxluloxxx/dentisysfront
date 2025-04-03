import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const OdontogramaService = {
    async save(odontogramaData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('ODONTOGRAMA'), odontogramaData);
            return response.data;
        } catch (error) {
            console.error('Error al guardar el odontograma:', error);
            throw error;
        }
    },

    async getByPaciente(pacienteId) {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('ODONTOGRAMA')}/paciente/${pacienteId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el odontograma del paciente:', error);
            throw error;
        }
    },

    async update(id, odontogramaData) {
        try {
            const response = await axios.put(`${API_CONFIG.getUrl('ODONTOGRAMA')}/${id}`, odontogramaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el odontograma:', error);
            throw error;
        }
    }
};
