import axios from 'axios';
import API_CONFIG from '../config/api.config';

export const DetalleProformaService = {
    async create(detalleData) {
        try {
            // Aseguramos que el esquema sea correcto
            const detalleToCreate = {
                proforma: {
                    id: detalleData.proforma.id
                },
                producto: {
                    id: detalleData.producto.id
                },
                cantidad: detalleData.cantidad,
                precioUnitario: detalleData.precioUnitario,
                subtotal: detalleData.subtotal
            };

            console.log('🔄 Detalle de proforma a crear:', detalleToCreate);
            const response = await axios.post(API_CONFIG.getUrl('DETALLES_PROFORMA'), detalleToCreate);
            console.log('✅ Detalle de proforma creado exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al crear el detalle de proforma:', error);
            throw error;
        }
    }
};
