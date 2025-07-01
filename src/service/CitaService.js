import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const CitaService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('CITAS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Citas:', response.data);
            console.log(`📊 Total de citas procesados: ${response.data.length}`);
            return response.data.map((cita) => ({
                id: cita.id,
                title: cita.pacienteNombre,
                subtitle: cita.medicoNombre,
                start: `${cita.fechaCita}T${cita.horaCita}`,
                end: `${cita.fechaCita}T${cita.horaCitaFin}`,
                backgroundColor: this.getColorByEstado(cita.estado),
                description: cita.observaciones,
                estado: cita.estado
            }));
        } catch (error) {
            console.error('Error al obtener citas:', error);
            throw error;
        }
    },

    async getAllCitas() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('CITAS'));
            console.log('✅ Respuesta recibida de la API getAllCitas:', response.data);
            console.log('🔄 Citas:', response.data);
            console.log(`📊 Total de citas procesados: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener citas:', error);
            throw error;
        }
    },

    async create(medicoData) {
        try {
            const response = await axios.post(API_CONFIG.getUrl('CITAS'), medicoData);
            return response.data;
        } catch (error) {
            console.error('Error al crear el citas:', error);
            throw error;
        }
    },

    async update(id, citaData) {
        try {
            console.log('🔄 Cita a actualizar:', citaData);
            const response = await axios.put(API_CONFIG.getUrl('CITAS') + '/' + id, citaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el citas:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('CITAS') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el citas:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo cita con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('CITAS')}/${id}`);
            console.log('✅ Cliente obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el cita:', error.message);
            if (error.response) {
                console.error('📝 Detalles del error:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            throw error;
        }
    },

    getColorByEstado(estado) {
        switch (estado?.toUpperCase()) {
            case 'PENDIENTE':
                return '#FFB72B'; // Amarillo más vibrante
            case 'CONFIRMADA':
                return '#4CAF50'; // Verde más vibrante
            case 'CANCELADA':
                return '#FF4757'; // Rojo más vibrante
            default:
                return '#95A5A6'; // Gris más vibrante por defecto
        }
    }
};
