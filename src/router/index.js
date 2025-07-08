import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/auth/login'
        },
        {
            path: '/dashboard',
            component: AppLayout,
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/pages/cuentas',
                    name: 'cuentas',
                    component: () => import('@/views/pages/Cuenta.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/table2',
                    name: 'table2',
                    component: () => import('@/views/uikit/TableDoc2.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/list2',
                    name: 'list2',
                    component: () => import('@/views/uikit/ListDoc2.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/productos',
                    name: 'productos',
                    component: () => import('@/views/pages/Producto.vue')
                },

                {
                    path: '/pages/pacientes',
                    name: 'pacientes',
                    component: () => import('@/views/pages/Paciente.vue')
                },
                {
                    path: '/pages/medicos',
                    name: 'medicos',
                    component: () => import('@/views/pages/Medico.vue')
                },
                {
                    path: '/pages/fichasMedicas',
                    name: 'fichasMedicas',
                    component: () => import('@/views/pages/FichaMedicaCrud.vue')
                },
                {
                    path: '/pages/ficha-medica-vista/:id',
                    name: 'ficha-medica-vista',
                    component: () => import('@/views/pages/FichaMedicaVista.vue')
                },
                {
                    path: '/pages/ficha-vista/:id',
                    name: 'ficha-vista',
                    component: () => import('@/views/pages/FichaVista.vue')
                },
                {
                    path: '/pages/proforma',
                    name: 'proforma',
                    component: () => import('@/views/pages/ProformaCrear.vue')
                },
                {
                    path: '/pages/proformas',
                    name: 'proformas',
                    component: () => import('@/views/pages/ProformasCrud.vue')
                },
                {
                    path: '/pages/proformaVista/:id',
                    name: 'proformaVista',
                    component: () => import('@/views/pages/ProformaVista.vue')
                },
                {
                    path: '/pages/graficas',
                    name: 'graficas',
                    component: () => import('@/views/pages/Graficas.vue')
                },
                {
                    path: '/pages/agenda',
                    name: 'agenda',
                    component: () => import('@/views/pages/Agenda.vue')
                },
                {
                    path: '/pages/agendarCita',
                    name: 'agendarCita',
                    component: () => import('@/views/pages/CitaCrud.vue')
                },
                {
                    path: '/pages/odontograma',
                    name: 'odontograma',
                    component: () => import('@/views/pages/Odontograma.vue')
                },
                {
                    path: '/pages/categorias-financieras',
                    name: 'categorias-financieras',
                    component: () => import('@/views/pages/CategoriaFinanciera.vue')
                },
                {
                    path: '/pages/pagos-especialistas',
                    name: 'pago-especialista',
                    component: () => import('@/views/pages/PagoEspecialista.vue')
                },
                {
                    path: '/pages/pagos',
                    name: 'pagos',
                    component: () => import('@/views/pages/Pagos.vue')
                },
                {
                    path: '/pages/bancos',
                    name: 'bancos',
                    component: () => import('@/views/pages/Bancos.vue')
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                },
                {
                    path: '/pages/ficha-crear',
                    name: 'ficha-crear',
                    component: () => import('@/views/pages/FichaCrear.vue')
                },
                {
                    path: '/pages/configuracion',
                    name: 'configuracion',
                    component: () => import('@/views/pages/ConfiguracionUsuario.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
