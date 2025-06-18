// Configuración de URLs de servicios API
const API_CONFIG = {
    // URLs base para diferentes ambientes
    BASE_URL: {
        development: 'http://93.127.217.21:8082',
        production: 'http://93.127.217.21:8080' // Cambia esto por tu URL de producción
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
        DETALLES_PROFORMA: '/api/detalles-proforma',
        COBRANZAS: '/api/cobranzas',
        CUENTAS: '/api/cuentas',
        PROCEDIMIENTO: '/api/procedimientos',
        CATEGORIA_FINANCIERA: '/api/categorias',
        USUARIOS: '/api/usuarios',
        MENU1: '/api/menu/menu1',
        MENU2: '/api/menu/menu2'
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
