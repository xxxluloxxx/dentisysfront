import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const CategoriasFinancierasService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('CATEGORIA_FINANCIERA'));
            console.log('🔄 Categorias Financieras:', response.data);
            console.log(`📊 Total de categorias financieras procesadas: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener categorias financieras:', error);
            throw error;
        }
    }
};
