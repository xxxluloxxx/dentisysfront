<script setup>
import { ProformaService } from '@/service/Proforma';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const proformas = ref([]);
const loading = ref(true);
const deleteproformaDialog = ref(false);
const proforma = ref({});
const expandedRows = ref([]);
const multiple = ref('multiple');
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(() => {
    loading.value = true;
    ProformaService.getAllDetalles()
        .then((data) => (proformas.value = data))
        .catch((error) => {
            console.error('Error al cargar las proformas:', error);
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

function obtenerFecha(value) {
    if (value) {
        const fecha = new Date(value);
        return fecha.toISOString().split('T')[0];
    }
    return '';
}

function confirmDeleteProforma(proforma) {
    proforma.value = proforma;
    deleteproformaDialog.value = true;
}

function deleteProforma() {
    ProformaService.delete(proforma.value.id)
        .then(() => {
            proformas.value = proformas.value.filter((val) => val.id !== proforma.value.id);
            deleteproformaDialog.value = false;
            proforma.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proforma Eliminada', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar la proforma:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la proforma', life: 3000 });
        });
}

function exportCSV() {
    dt.value.exportCSV();
}

function getEstadoSeverity(estado) {
    switch (estado) {
        case 'PAGADA':
            return 'success';
        case 'PENDIENTE':
            return 'warn';
        case 'CANCELADA':
            return 'danger';
        default:
            return null;
    }
}

function expandAll() {
    expandedRows.value = proformas.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
}

function collapseAll() {
    expandedRows.value = null;
}
</script>

<template>
    <div>
        <div class="card">
            <DataTable
                v-model:expandedRows="expandedRows"
                :value="proformas"
                :loading="loading"
                :paginator="true"
                :rows="10"
                scrollable
                scrollHeight="600px"
                :sortMode="multiple"
                :multiSortMeta="[
                    { field: 'medicoNombre', order: 1 },
                    { field: 'pacienteNombre', order: 1 }
                ]"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proformas"
                dataKey="id"
                tableStyle="min-width: 60rem"
            >
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Proformas</h4>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-end">
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <div class="flex flex-wrap justify-end gap-2">
                                <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
                                <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
                            </div>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </div>
                </template>

                <Column expander style="width: 5rem" />
                <Column field="medicoNombre" header="Medico" sortable style="min-width: 1rem"></Column>
                <Column field="pacienteNombre" header="Paciente" sortable style="min-width: 1rem"></Column>
                <Column field="createdAt" header="Fecha" sortable style="min-width: 1rem">
                    <template #body="slotProps">
                        {{ obtenerFecha(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="subtotal" header="Subtotal">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.subtotal) }}
                    </template>
                </Column>
                <Column field="iva" header="IVA" sortable style="min-width: 1rem"></Column>
                <Column field="total" header="Total">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.total) }}
                    </template>
                </Column>
                <Column header="Estado" sortable style="min-width: 1rem" sortField="estado" :sortFunction="(a, b) => a.estado.localeCompare(b.estado)">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.estado" :severity="getEstadoSeverity(slotProps.data.estado)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="editProforma(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" severity="warn" @click="editProforma(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProforma(slotProps.data)" />
                    </template>
                </Column>
                <template #expansion="slotProps">
                    <div class="p-4">
                        <h5>Productos de la proforma</h5>
                        <DataTable :value="slotProps.data.detalles">
                            <Column field="productoNombre" header="Producto" sortable></Column>
                            <Column field="precioUnitario" header="Precio" sortable>
                                <template #body="slotProps">
                                    {{ formatCurrency(slotProps.data.precioUnitario) }}
                                </template>
                            </Column>
                            <Column field="cantidad" header="Cantidad" sortable></Column>
                            <Column field="subtotal" header="Subtotal" sortable>
                                <template #body="slotProps">
                                    {{ formatCurrency(slotProps.data.subtotal) }}
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </DataTable>
        </div>

        <Dialog v-model:visible="proformaDialog" :style="{ width: '450px' }" header="Product Details" :modal="true">
            <div class="flex flex-col gap-6">
                <img v-if="proforma.image" :src="`https://primefaces.org/cdn/primevue/images/product/${proforma.image}`" :alt="proforma.image" class="block m-auto pb-4" />
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="nombre" v-model.trim="proforma.nombre" required="true" autofocus :invalid="submitted && !proforma.nombre" fluid />
                    <small v-if="submitted && !proforma.nombre" class="text-red-500">El nombre es requerido.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="description" v-model="proforma.descripcion" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="categoria" class="block font-bold mb-3">Categoria</label>
                    <InputText id="categoria" v-model.trim="proforma.categoria" required="true" autofocus :invalid="submitted && !proforma.categoria" fluid />
                    <small v-if="submitted && !proforma.categoria" class="text-red-500">La categoría es requerida.</small>
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="codigo" class="block font-bold mb-3">Código</label>
                        <InputText id="codigo" v-model.trim="proforma.codigo" required="true" autofocus :invalid="submitted && !proforma.codigo" fluid />
                        <small v-if="submitted && !proforma.codigo" class="text-red-500">El código es requerido.</small>
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Precio</label>
                        <InputNumber id="price" v-model="proforma.precio" mode="currency" currency="USD" locale="en-US" fluid />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveProforma" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteproformaDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="proforma"
                    >Estas seguro de querer elimminar esta proforma <b>{{ proforma.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteproformaDialog = false" />
                <Button label="Si" icon="pi pi-check" @click="deleteProforma" />
            </template>
        </Dialog>
    </div>
</template>
