<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    productos: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    filters: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['edit', 'delete', 'export']);

const dt = ref();
const sortOrder = ref('asc');

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}

// Filtrado y ordenamiento unificado
const filteredProductos = computed(() => {
    if (!props.productos) return [];
    let result = [...props.productos];
    if (props.filters.global.value) {
        const searchTerm = props.filters.global.value.toLowerCase();
        result = result.filter((p) => p.nombre?.toLowerCase().includes(searchTerm) || p.categoria?.toLowerCase().includes(searchTerm) || p.descripcion?.toLowerCase().includes(searchTerm) || p.codigo?.toLowerCase().includes(searchTerm));
    }
    result.sort((a, b) => {
        const nombreA = a.nombre.toLowerCase();
        const nombreB = b.nombre.toLowerCase();
        return sortOrder.value === 'asc' ? nombreA.localeCompare(nombreB) : nombreB.localeCompare(nombreA);
    });
    return result;
});

function toggleSort() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
}

function editProduct(producto) {
    emit('edit', producto);
}

function confirmDeleteProduct(producto) {
    emit('delete', producto);
}

function exportCSV() {
    dt.value.exportCSV();
    emit('export');
}
</script>

<template>
    <div>
        <!-- Vista de escritorio -->
        <DataTable
            ref="dt"
            :value="filteredProductos"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            scrollable
            scrollHeight="600px"
            :loading="loading"
            loadingIcon="pi pi-spin pi-spinner"
            striped
            :sortField="'nombre'"
            :sortOrder="1"
            :defaultSortOrder="1"
            class="p-datatable-striped hidden md:block"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
        >
            <Column field="nombre" header="Nombre" sortable style="min-width: 10rem"></Column>
            <Column field="precio" header="Precio" sortable style="min-width: 8rem">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.precio) }}
                </template>
            </Column>
            <Column field="categoria" header="Categoria" sortable style="min-width: 10rem">
                <template #header>
                    <span class="text-purple-600 font-bold"></span>
                </template>
                <template #body="slotProps">
                    <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">{{ slotProps.data.categoria }}</span>
                </template>
            </Column>
            <Column field="descripcion" header="Descripcion" sortable style="min-width: 10rem"></Column>
            <Column header="Acciones" :exportable="false" style="min-width: 12rem">
                <template #header>
                    <span class="text-primary-600 dark:text-primary-400 font-bold"></span>
                </template>
                <template #body="slotProps">
                    <Tooltip target=".btn-editar" />
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2 btn-editar" @click="editProduct(slotProps.data)" aria-label="Editar producto" v-tooltip.top="'Editar producto'" />
                    <Tooltip target=".btn-eliminar" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="btn-eliminar" @click="confirmDeleteProduct(slotProps.data)" aria-label="Eliminar producto" v-tooltip.top="'Eliminar producto'" />
                </template>
            </Column>
        </DataTable>

        <!-- Vista móvil -->
        <div class="md:hidden -mx-4">
            <div class="flex flex-col gap-4">
                <!-- Header móvil con búsqueda y botones -->
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <h4 class="m-0 text-xl font-semibold">Productos y servicios</h4>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2">
                            <Tooltip target=".btn-nuevo-m" />
                            <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1 btn-nuevo-m" @click="$emit('new')" aria-label="Agregar nuevo producto" v-tooltip.top="'Agregar nuevo producto'" />
                            <Tooltip target=".btn-exportar-m" />
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1 btn-exportar-m" @click="exportCSV($event)" aria-label="Exportar productos" v-tooltip.top="'Exportar productos a CSV'" />
                        </div>
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" aria-label="Buscar productos" />
                            </div>
                            <Button
                                :icon="sortOrder === 'asc' ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'"
                                severity="secondary"
                                @click="toggleSort"
                                class="p-2"
                                aria-label="Ordenar alfabéticamente"
                                v-tooltip.top="'Ordenar alfabéticamente'"
                            />
                        </div>
                    </div>
                </div>

                <!-- Lista de productos en tarjetas -->
                <div class="flex flex-col gap-4 w-full">
                    <div
                        v-for="producto in filteredProductos"
                        :key="producto.id"
                        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        @click="editProduct(producto)"
                        tabindex="0"
                        aria-label="Editar producto {{ producto.nombre }}"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h3 class="text-lg font-semibold dark:text-white">{{ producto.nombre }}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Categoría: {{ producto.categoria }}</p>
                            </div>
                            <div class="flex gap-2">
                                <Tooltip target=".btn-eliminar-m" />
                                <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2 btn-eliminar-m" @click.stop="confirmDeleteProduct(producto)" aria-label="Eliminar producto" v-tooltip.top="'Eliminar producto'" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span class="font-semibold dark:text-white">Precio:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ formatCurrency(producto.precio) }}</p>
                            </div>
                            <div>
                                <span class="font-semibold dark:text-white">Descripción:</span>
                                <p class="text-gray-600 dark:text-gray-400">{{ producto.descripcion }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos personalizados para las filas alternadas de las tablas */
:deep(.p-datatable-tbody > tr:nth-child(even)) {
    background-color: rgba(0, 0, 0, 0.04);
}

:deep(.p-datatable-tbody > tr:nth-child(odd)) {
    background-color: rgba(0, 0, 0, 0.01);
}

/* Estilo para resaltar la fila al pasar el cursor */
:deep(.p-datatable-tbody > tr:hover) {
    background-color: rgba(0, 132, 255, 0.1) !important;
    cursor: pointer;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
    transition:
        background 0.2s,
        box-shadow 0.2s;
}

/* Estilo para los encabezados de las tablas */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--primary-color);
    color: var(--primary-color-text);
    font-weight: bold;
}

/* Estilo para las celdas de las tablas */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.7rem 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Botones de acción */
.btn-editar,
.btn-eliminar,
.btn-nuevo,
.btn-exportar,
.btn-nuevo-m,
.btn-exportar-m {
    transition:
        box-shadow 0.2s,
        transform 0.2s;
    box-shadow: 0 1px 4px 0 rgba(59, 130, 246, 0.08);
    border-radius: 50px;
}
.btn-editar:hover,
.btn-nuevo:hover,
.btn-nuevo-m:hover {
    background: #e0f2fe !important;
    color: #2563eb !important;
    transform: translateY(-2px) scale(1.05);
}
.btn-eliminar:hover,
.btn-eliminar-m:hover {
    background: #fee2e2 !important;
    color: #b91c1c !important;
    transform: translateY(-2px) scale(1.05);
}
.btn-exportar:hover,
.btn-exportar-m:hover {
    background: #fef9c3 !important;
    color: #ca8a04 !important;
    transform: translateY(-2px) scale(1.05);
}

/* Tarjetas móviles */
.bg-white {
    background: linear-gradient(135deg, #f8fafc 80%, #e0e7ef 100%);
}
.dark .bg-white,
.dark\:bg-gray-800 {
    background: linear-gradient(135deg, #1e293b 80%, #334155 100%);
}
.shadow {
    box-shadow: 0 2px 12px 0 rgba(59, 130, 246, 0.1);
}

/* Mejorar tooltips */
:deep(.p-tooltip) {
    font-size: 1rem;
    border-radius: 6px;
    background: #2563eb;
    color: #fff;
    padding: 0.5em 1em;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}
</style>
