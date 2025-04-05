// Configuración de URLs de servicios API
const API_CONFIG = {
    // URLs base para diferentes ambientes
    BASE_URL: {
        development: 'http://localhost:8081',
        production: 'https://dentisys-production.up.railway.app', // Cambia esto por tu URL de producción
        staging: 'https://staging-api.tudominio.com' // Cambia esto por tu URL de staging
    },

    // Endpoints específicos
    ENDPOINTS: {
        LOGIN: '/api',
        PRODUCTOS: '/api/productos',
        PACIENTES: '/api/pacientes',
        MEDICOS: '/api/medicos',
        FICHAS_MEDICAS: '/api/fichas-medicas',
        PROFORMAS: '/api/proformas',
        GRAFICAS: '/api/graficas',
        CITAS: '/api/citas',
        ODONTOGRAMA: '/api/odontograma',
        IMAGENES_FICHA: '/api/imagenes-fichas',
        DETALLES_PROFORMA: '/api/detalles-proforma'
    },

    // Función helper para obtener la URL base según el ambiente
    getBaseUrl: function () {
        const env = process.env.NODE_ENV || 'development';
        return this.BASE_URL[env];
    },

    // Función helper para obtener la URL completa de un endpoint
    getUrl: function (endpoint) {
        return `${this.getBaseUrl()}${this.ENDPOINTS[endpoint]}`;
    }
};
export default API_CONFIG;
