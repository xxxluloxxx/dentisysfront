<script setup>
import { ProductoService } from '@/service/ProductoService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const productos = ref();
const loading = ref(false);
const productoDialog = ref(false);
const deleteProductoDialog = ref(false);
const producto = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const sortAsc = ref(true);

onMounted(() => {
    loading.value = true;
    ProductoService.getAllProducts()
        .then((data) => (productos.value = data))
        .catch((error) => {
            console.error('Error al cargar los productos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}

function openNew() {
    producto.value = {};
    submitted.value = false;
    productoDialog.value = true;
}

function hideDialog() {
    productoDialog.value = false;
    submitted.value = false;
}

function saveProduct() {
    submitted.value = true;

    if (producto?.value.nombre?.trim()) {
        const productoData = {
            codigo: producto.value.codigo,
            nombre: producto.value.nombre,
            descripcion: producto.value.descripcion,
            precio: producto.value.precio,
            categoria: producto.value.categoria
        };

        if (producto.value.id) {
            updateProduct(productoData);
        } else {
            createProduct(productoData);
        }
    }
}

function createProduct(productoData) {
    ProductoService.createProduct(productoData)
        .then((response) => {
            productos.value.push(response);
            productoDialog.value = false;
            producto.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto Creado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el producto:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el producto', life: 3000 });
        });
}

function updateProduct(productoData) {
    ProductoService.updateProduct(producto.value.id, productoData)
        .then((response) => {
            const index = findIndexById(producto.value.id);
            if (index !== -1) {
                productos.value[index] = response;
            }
            productoDialog.value = false;
            producto.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto Actualizado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al actualizar el producto:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el producto', life: 3000 });
        });
}

function editProduct(prod) {
    producto.value = { ...prod };
    productoDialog.value = true;
}

function confirmDeleteProduct(prod) {
    producto.value = prod;
    deleteProductoDialog.value = true;
}

function deleteProduct() {
    ProductoService.deleteProduct(producto.value.id)
        .then(() => {
            productos.value = productos.value.filter((val) => val.id !== producto.value.id);
            deleteProductoDialog.value = false;
            producto.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto Eliminado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el producto:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el producto', life: 3000 });
        });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < productos.value.length; i++) {
        if (productos.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
}

function exportCSV() {
    dt.value.exportCSV();
}

const filteredProductos = computed(() => {
    if (!productos.value) return [];

    let result = [...productos.value];

    // Aplicar filtro de búsqueda
    if (filters.value.global.value) {
        const searchTerm = filters.value.global.value.toLowerCase();
        result = result.filter((producto) => producto.nombre.toLowerCase().includes(searchTerm) || producto.categoria.toLowerCase().includes(searchTerm) || producto.descripcion.toLowerCase().includes(searchTerm));
    }

    // Aplicar ordenamiento
    return result.sort((a, b) => {
        const comparison = a.nombre.localeCompare(b.nombre);
        return sortAsc.value ? comparison : -comparison;
    });
});

const toggleSort = () => {
    sortAsc.value = !sortAsc.value;
};
</script>

<template>
    <div>
        <div class="card">
            <!-- Vista de escritorio -->
            <DataTable
                ref="dt"
                :value="productos"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                scrollable
                scrollHeight="600px"
                :loading="loading"
                loadingIcon="pi pi-spin pi-spinner"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                class="hidden md:block"
            >
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Productos y servicios</h4>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-end">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                            </IconField>
                        </div>
                    </div>
                </template>
                <Column field="nombre" header="Nombre" sortable style="min-width: 10rem"></Column>
                <Column field="precio" header="Precio" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.precio) }}
                    </template>
                </Column>
                <Column field="categoria" header="Categoria" sortable style="min-width: 10rem"></Column>
                <Column field="descripcion" header="Descripcion" sortable style="min-width: 10rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
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
                                <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="flex-1" @click="openNew" />
                                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="flex-1" @click="exportCSV($event)" />
                            </div>
                            <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." class="w-full" />
                                </div>
                                <Button :icon="sortAsc ? 'pi pi-sort-alpha-down' : 'pi pi-sort-alpha-up'" severity="secondary" @click="toggleSort" class="p-2" />
                            </div>
                        </div>
                    </div>

                    <!-- Lista de productos en tarjetas -->
                    <div class="flex flex-col gap-4 w-full">
                        <div v-for="producto in filteredProductos" :key="producto.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-lg font-semibold dark:text-white">{{ producto.nombre }}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Categoría: {{ producto.categoria }}</p>
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-pencil" outlined rounded class="p-2" @click="editProduct(producto)" />
                                    <Button icon="pi pi-trash" outlined rounded severity="danger" class="p-2" @click="confirmDeleteProduct(producto)" />
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

        <Dialog v-model:visible="productoDialog" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles del Producto" :modal="true" class="p-fluid">
            <div class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="nombre" class="block font-bold mb-2">Nombre</label>
                        <InputText id="nombre" v-model.trim="producto.nombre" required="true" autofocus :invalid="submitted && !producto.nombre" class="w-full" />
                        <small v-if="submitted && !producto.nombre" class="text-red-500">El nombre es requerido.</small>
                    </div>
                    <div class="field">
                        <label for="categoria" class="block font-bold mb-2">Categoría</label>
                        <InputText id="categoria" v-model.trim="producto.categoria" required="true" :invalid="submitted && !producto.categoria" class="w-full" />
                        <small v-if="submitted && !producto.categoria" class="text-red-500">La categoría es requerida.</small>
                    </div>
                </div>

                <div class="field">
                    <label for="description" class="block font-bold mb-2">Descripción</label>
                    <Textarea id="description" v-model="producto.descripcion" required="true" rows="3" cols="20" class="w-full" />
                </div>

                <div class="field">
                    <label for="price" class="block font-bold mb-2">Precio</label>
                    <InputNumber id="price" v-model="producto.precio" mode="currency" currency="USD" locale="en-US" class="w-full" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Guardar" icon="pi pi-check" @click="saveProduct" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductoDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="producto"
                    >¿Estás seguro de querer eliminar este producto <b>{{ producto.nombre }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductoDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>
    </div>
</template>
