<template>
    <div class="bancos-header">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <!-- Título y descripción -->
            <div class="header-title-section">
                <i class="pi pi-building header-icon" style="color: var(--primary-color)"></i>
                <div class="header-text">
                    <h1 class="header-title" style="color: var(--text-color)">Gestión de Bancos</h1>
                    <p class="header-subtitle" style="color: var(--text-color-secondary)">Administra la información bancaria</p>
                </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex flex-col sm:flex-row gap-2">
                <Button
                    label="Nuevo Banco"
                    icon="pi pi-plus"
                    @click="$emit('nuevo-banco')"
                    class="p-button-success"
                />
                <Button
                    label="Exportar"
                    icon="pi pi-download"
                    @click="$emit('exportar')"
                    class="p-button-outlined"
                />
            </div>
        </div>

        <!-- Filtros -->
        <div class="filters-section mt-6">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <div class="search-input-container">
                        <i class="pi pi-search search-icon" />
                        <InputText
                            v-model="searchTerm"
                            placeholder="Buscar bancos..."
                            class="w-full search-input"
                            @input="$emit('buscar', searchTerm)"
                        />
                    </div>
                </div>
                <div class="flex gap-2">
                    <Button
                        label="Limpiar"
                        icon="pi pi-times"
                        @click="limpiarFiltros"
                        class="p-button-outlined p-button-secondary"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// Props y emits
defineEmits(['nuevo-banco', 'exportar', 'buscar']);

// Estados reactivos
const searchTerm = ref('');

// Métodos
function limpiarFiltros() {
    searchTerm.value = '';
    $emit('buscar', '');
}
</script>

<style scoped>
.bancos-header {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
    @apply rounded-lg p-6 shadow-sm mb-6;
}

.header-title-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
}

.header-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.header-title {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
    padding: 0;
}

.header-subtitle {
    font-size: 1rem;
    line-height: 1.4;
    margin: 4px 0 0 0;
    padding: 0;
}

.filters-section {
    border-top: 1px solid var(--surface-border);
    @apply pt-4;
}

.search-input-container {
    position: relative;
    width: 100%;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary);
    z-index: 1;
    pointer-events: none;
}

.search-input {
    padding-left: 40px !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .bancos-header {
        @apply p-4;
    }
}
</style>
