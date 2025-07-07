import axios from 'axios';
import API_CONFIG from '../config/api.config';
import { UsuarioService } from './UsuarioService';

export const MedicoService = {
    async getAll() {
        try {
            const response = await axios.get(API_CONFIG.getUrl('MEDICOS'));
            console.log('✅ Respuesta recibida de la API:', response.data);
            console.log('🔄 Medicos:', response.data);
            console.log(`📊 Total de medicos procesados: ${response.data.length}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener medicos:', error);
            throw error;
        }
    },

    async create(medicoData) {
        try {
            // 1. Primero crear el usuario
            const usuarioData = {
                numeroDocumento: medicoData.numeroDocumento,
                nombre: medicoData.nombre,
                apellido: medicoData.apellido,
                email: medicoData.email,
                password: '123',
                telefono: medicoData.telefono,
                estado: true,
                rolId: medicoData.rolId
            };

            const usuarioCreado = await UsuarioService.create(usuarioData);

            // 2. Luego crear el médico con el ID del usuario
            const medicoConUsuario = {
                ...medicoData,
                usuarioId: usuarioCreado.id
            };

            const response = await axios.post(API_CONFIG.getUrl('MEDICOS'), medicoConUsuario);

            return response.data;
        } catch (error) {
            console.error('Error al crear el médico:', error);
            throw error;
        }
    },

    async update(id, medicoData) {
        try {
            // Obtener el médico existente
            const medicoExistente = await this.getById(id);

            // Mantener la contraseña original
            medicoData.password = medicoExistente.password;

            console.log('🔄 Medico ID:', id);
            console.log('🔄 Medico a actualizar:', medicoData);

            const response = await axios.put(API_CONFIG.getUrl('MEDICOS') + '/' + id, medicoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el medicos:', error);
            throw error;
        }
    },

    async delete(id) {
        try {
            await axios.delete(API_CONFIG.getUrl('MEDICOS') + '/' + id);
            return true;
        } catch (error) {
            console.error('Error al eliminar el medicos:', error);
            throw error;
        }
    },

    async getById(id) {
        console.log(`🚀 Obteniendo medico con ID: ${id}`);
        try {
            const response = await axios.get(`${API_CONFIG.getUrl('MEDICOS')}/${id}`);
            console.log('✅ Medico obtenido exitosamente:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener el medico:', error.message);
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
