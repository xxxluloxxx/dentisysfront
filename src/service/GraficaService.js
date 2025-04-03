import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const GraficaService = {
    async getEstadisticasProformas() {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('GRAFICAS')}/estadisticas-proformas`);
            console.log('✅ Estadísticas de proformas obtenidas exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las estadísticas de proformas:', error);
            throw error;
        }
    }
};
