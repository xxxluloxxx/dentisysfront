<script setup>
import { MenuService } from '@/service/MenuService';
import { ref, onMounted } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const menu = ref();

const convertMenuFormat = (menuData) => {
    if (!menuData || !menuData.menu) return [];
    return menuData.menu;
};

onMounted(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const rolId = userData.rolId;

    if (rolId === 1) {
        MenuService.getAll1()
            .then((data) => {
                menu.value = convertMenuFormat(data);
                console.log('🚀 Menú cargado2:', menu.value);
            })
            .catch((error) => {
                console.error('Error al cargar el menú 1:', error);
            });
    } else if (rolId === 2) {
        MenuService.getAll2()
            .then((data) => {
                menu.value = convertMenuFormat(data);
            })
            .catch((error) => {
                console.error('Error al cargar el menú 2:', error);
            });
    }
    console.log('🚀 Menú cargado:', menu.value);
});

const model1 = ref([]);
model1.value = convertMenuFormat(menu.value);

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        label: 'Odontología',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'Productos',
                icon: 'pi pi-fw pi-box',
                to: '/pages/productos'
            },
            {
                label: 'Pacientes',
                icon: 'pi pi-fw pi-user',
                to: '/pages/pacientes'
            },
            {
                label: 'Medicos',
                icon: 'pi pi-fw pi-user',
                to: '/pages/medicos'
            },
            {
                label: 'Cuentas',
                icon: 'pi pi-fw pi-money-bill',
                to: '/pages/cuentas'
            },
            {
                label: 'Ficha medica',
                icon: 'pi pi-fw pi-book',
                items: [
                    {
                        label: 'Fichas medicas',
                        icon: 'pi pi-fw pi-bars',
                        to: '/pages/fichasMedicas'
                    },
                    {
                        label: 'Ficha Crear',
                        icon: 'pi pi-fw pi-file-edit',
                        to: '/pages/ficha-crear'
                    }
                ]
            },
            {
                label: 'Proformas',
                icon: 'pi pi-fw pi-book',
                items: [
                    {
                        label: 'Proformas',
                        icon: 'pi pi-fw pi-bars',
                        to: '/pages/proformas'
                    },
                    {
                        label: 'Crear proforma',
                        icon: 'pi pi-fw pi-plus-circle',
                        to: '/pages/proforma'
                    }
                ]
            },
            {
                label: 'Agenda',
                icon: 'pi pi-fw pi-calendar',
                items: [
                    {
                        label: 'Agenda',
                        icon: 'pi pi-fw pi-calendar',
                        to: '/pages/agenda'
                    },
                    {
                        label: 'Citas',
                        icon: 'pi pi-fw pi-calendar-plus',
                        to: '/pages/agendarCita'
                    }
                ]
            },
            {
                label: 'Odontograma',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/pages/odontograma'
            },
            {
                label: 'Categorías Financieras',
                icon: 'pi pi-fw pi-tags',
                to: '/pages/categorias-financieras'
            },
            {
                label: 'Configuración',
                icon: 'pi pi-fw pi-cog',
                to: '/pages/configuracion'
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in menu" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
