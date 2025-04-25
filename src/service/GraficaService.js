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
    },
    async getEstadisticasGenerales() {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('GRAFICAS')}/estadisticas-generales`);
            console.log('✅ Estadísticas generales obtenidas exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las estadísticas generales:', error);
            throw error;
        }
    },
    async getEstadisticasProductosFrecuentes() {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('GRAFICAS')}/productos-frecuentes`);
            console.log('✅ Estadísticas productos frecuentes obtenidas exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener los productos frecuentes:', error);
            throw error;
        }
    },
    async getEstadisticasCitasSemana() {
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('GRAFICAS')}/estadisticas-citas-semana`);
            console.log('✅ Estadísticas citas semana obtenidas exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener las estadísticas de citas semana:', error);
            throw error;
        }
    }

};
