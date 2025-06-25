import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const MenuService = {
    async getMenu(rol) {
        console.log('🚀 Iniciando petición a la API de menu 1...');
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('MENU')}/${rol}`);
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Menu 1:', response.data);
            console.log(`📊 Total de categorias procesadas: ${response.data.length}`);

            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener menu 1:', error.message);
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
