<template>
    <div class="bancos-table-container">
        <DataTable
            :value="bancos"
            :loading="loading"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} bancos"
            :filters="filters"
            filterDisplay="menu"
            :globalFilterFields="['nombreCuenta', 'banco', 'cuenta']"
            responsiveLayout="scroll"
            class="p-datatable-sm"
            emptyMessage="No se encontraron bancos"
        >
            <!-- Columna de color -->
            <Column field="color" header="Color" :sortable="false" style="width: 80px">
                <template #body="slotProps">
                    <div
                        class="color-indicator"
                        :style="{ backgroundColor: slotProps.data.color || '#007bff' }"
                        :title="slotProps.data.color || '#007bff'"
                    ></div>
                </template>
            </Column>

            <!-- Columna de nombre de cuenta -->
            <Column field="nombreCuenta" header="Nombre de Cuenta" sortable style="min-width: 200px">
                <template #body="slotProps">
                    <div class="font-medium" style="color: var(--text-color)">
                        {{ slotProps.data.nombreCuenta }}
                    </div>
                </template>
            </Column>

            <!-- Columna de banco -->
            <Column field="banco" header="Banco" sortable style="min-width: 200px">
                <template #body="slotProps">
                    <div style="color: var(--text-color)">
                        {{ slotProps.data.banco }}
                    </div>
                </template>
            </Column>

            <!-- Columna de cuenta -->
            <Column field="cuenta" header="Número de Cuenta" sortable style="min-width: 200px">
                <template #body="slotProps">
                    <div class="font-mono text-sm" style="color: var(--text-color)">
                        {{ slotProps.data.cuenta }}
                    </div>
                </template>
            </Column>

            <!-- Columna de acciones -->
            <Column header="Acciones" :exportable="false" style="min-width: 150px">
                <template #body="slotProps">
                    <div class="flex gap-2">
                        <Button
                            icon="pi pi-pencil"
                            class="p-button-rounded p-button-text p-button-sm"
                            @click="$emit('editar', slotProps.data)"
                            v-tooltip.top="'Editar banco'"
                        />
                        <Button
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-text p-button-danger p-button-sm"
                            @click="$emit('eliminar', slotProps.data)"
                            v-tooltip.top="'Eliminar banco'"
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// Definir FilterMatchMode para PrimeVue v4
const FilterMatchMode = {
    STARTS_WITH: 'startsWith',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    ENDS_WITH: 'endsWith',
    EQUALS: 'equals',
    NOT_EQUALS: 'notEquals',
    IN: 'in',
    LESS_THAN: 'lt',
    LESS_THAN_OR_EQUAL_TO: 'lte',
    GREATER_THAN: 'gt',
    GREATER_THAN_OR_EQUAL_TO: 'gte',
    BETWEEN: 'between',
    DATE_IS: 'dateIs',
    DATE_IS_NOT: 'dateIsNot',
    DATE_BEFORE: 'dateBefore',
    DATE_AFTER: 'dateAfter'
};

// Props
const props = defineProps({
    bancos: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

// Emits
defineEmits(['editar', 'eliminar']);

// Estados reactivos
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombreCuenta: { value: null, matchMode: FilterMatchMode.CONTAINS },
    banco: { value: null, matchMode: FilterMatchMode.CONTAINS },
    cuenta: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Lifecycle
onMounted(() => {
    // Inicialización si es necesaria
});
</script>

<style scoped>
.bancos-table-container {
    background-color: var(--surface-card);
    border: 1px solid var(--surface-border);
    @apply rounded-lg shadow-sm;
}

.color-indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--surface-border);
    margin: 0 auto;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.color-indicator:hover {
    transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .bancos-table-container {
        @apply overflow-x-auto;
    }
}
</style>
