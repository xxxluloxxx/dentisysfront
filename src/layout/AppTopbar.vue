<script setup>
import LogoDentiSys from '@/assets/logos/logo.svg';
import { useLayout } from '@/layout/composables/layout';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';

const router = useRouter();
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

// Estado del usuario desde localStorage
const user = ref({
    name: JSON.parse(localStorage.getItem('userData'))?.nombre + ' ' + JSON.parse(localStorage.getItem('userData'))?.apellido || 'Usuario Demo',
    email: JSON.parse(localStorage.getItem('userData'))?.email || 'usuario@demo.com'
});

const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/auth/login');
};

const handleAccountSettings = () => {
    // Aquí implementarías la navegación a la página de configuración de cuenta
    console.log('Ir a configuración de cuenta');
};

const handleAgenda = () => {
    router.push('/pages/agenda');
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img :src="LogoDentiSys" alt="DentiSys Logo" class="logo-image" />
                <span>DentiSys</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" @click="handleAgenda">
                        <i class="pi pi-calendar"></i>
                        <span>Agenda</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <button
                        type="button"
                        class="layout-topbar-action"
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                    >
                        <i class="pi pi-user"></i>
                        <span>{{ user.name }}</span>
                    </button>
                    <div class="layout-topbar-menu hidden absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-64">
                        <div class="layout-topbar-menu-content flex flex-col">
                            <div class="p-3 border-b border-gray-200 dark:border-gray-700">
                                <div class="font-semibold text-gray-900 dark:text-white">{{ user.name }}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                            </div>
                            <button type="button" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-900 dark:text-white" @click="handleAccountSettings">
                                <i class="pi pi-cog mr-2"></i>
                                <span>Cuenta</span>
                            </button>
                            <button type="button" class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400" @click="handleLogout">
                                <i class="pi pi-sign-out mr-2"></i>
                                <span>Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
