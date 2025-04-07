<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

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
                label: 'Ficha medica',
                icon: 'pi pi-fw pi-book',
                items: [
                    {
                        label: 'Fichas medicas',
                        icon: 'pi pi-fw pi-bars',
                        to: '/pages/fichasMedicas'
                    },
                    {
                        label: 'Crear ficha medica',
                        icon: 'pi pi-fw pi-plus-circle',
                        to: '/pages/fichaMedica'
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
                label: 'Graficas',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/pages/graficas'
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
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
