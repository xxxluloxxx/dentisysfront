<script setup>
import { ProformaService } from '@/service/Proforma';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const proformas = ref([]);
const fichaDialog = ref(false);
const deleteFichaDialog = ref(false);
const deleteFichasDialog = ref(false);
const ficha = ref({});
const selectedProformas = ref([]);
const expandedRows = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(() => {
    ProformaService.getAllDetalles()
        .then((data) => (proformas.value = data))
        .catch((error) => {
            console.error('Error al cargar las proformas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        });
});

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}

function openNew() {
    ficha.value = {};
    submitted.value = false;
    fichaDialog.value = true;
}

function hideDialog() {
    fichaDialog.value = false;
    submitted.value = false;
}

function saveProforma() {
    submitted.value = true;

    if (ficha?.value.nombre?.trim()) {
        const proformaData = {
            paciente: ficha.value.paciente,
            medico: ficha.value.medico,
            fecha: ficha.value.fecha
        };

        if (ficha.value.id) {
            updateProforma(proformaData);
        } else {
            createProforma(proformaData);
        }
    }
}

function createProforma(proformaData) {
    ProformaService.create(proformaData)
        .then((response) => {
            proformas.value.push(response);
            fichaDialog.value = false;
            ficha.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proforma Creada', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear la proforma:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la proforma', life: 3000 });
        });
}

function updateProforma(proformaData) {
    ProformaService.update(ficha.value.id, proformaData)
        .then((response) => {
            const index = findIndexById(ficha.value.id);
            if (index !== -1) {
                proformas.value[index] = response;
            }
            fichaDialog.value = false;
            ficha.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proforma Actualizada', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al actualizar la proforma:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la proforma', life: 3000 });
        });
}

function editProforma(proforma) {
    ficha.value = { ...proforma };
    fichaDialog.value = true;
}

function confirmDeleteProforma(proforma) {
    ficha.value = proforma;
    deleteFichaDialog.value = true;
}

function deleteProforma() {
    ProformaService.delete(ficha.value.id)
        .then(() => {
            proformas.value = proformas.value.filter((val) => val.id !== ficha.value.id);
            deleteFichaDialog.value = false;
            ficha.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proforma Eliminada', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar la proforma:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la proforma', life: 3000 });
        });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < proformas.value.length; i++) {
        if (proformas.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteFichasDialog.value = true;
}

function deleteSelectedProformas() {
    const deletePromises = selectedProformas.value.map((proforma) => ProformaService.delete(proforma.id));

    Promise.all(deletePromises)
        .then(() => {
            proformas.value = proformas.value.filter((val) => !selectedProformas.value.includes(val));
            deleteFichasDialog.value = false;
            selectedProformas.value = null;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Proformas Eliminadas', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar las proformas:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar las proformas', life: 3000 });
        });
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
    expandedRows.value = products.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
}

function collapseAll() {
    expandedRows.value = null;
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedProformas || !selectedProformas.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

        </div>

        <div class="card">
            <DataTable v-model:expandedRows="expandedRows" :value="proformas"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proformas"dataKey="id" tableStyle="min-width: 60rem">
                <Column expander style="width: 5rem" />
                <Column field="pacienteNombre" header="Paciente"></Column>
                <Column field="medicoNombre" header="Medico" sortable style="min-width: 1rem"></Column>
                <Column field="createdAt" header="Fecha" sortable style="min-width: 1rem"></Column>
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
                <Column header="Estado">
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

        <Dialog v-model:visible="fichaDialog" :style="{ width: '450px' }" header="Product Details" :modal="true">
            <div class="flex flex-col gap-6">
                <img v-if="ficha.image" :src="`https://primefaces.org/cdn/primevue/images/product/${ficha.image}`" :alt="ficha.image" class="block m-auto pb-4" />
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="nombre" v-model.trim="ficha.nombre" required="true" autofocus :invalid="submitted && !ficha.nombre" fluid />
                    <small v-if="submitted && !ficha.nombre" class="text-red-500">El nombre es requerido.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Descripción</label>
                    <Textarea id="description" v-model="ficha.descripcion" required="true" rows="3" cols="20" fluid />
                </div>

                <div>
                    <label for="categoria" class="block font-bold mb-3">Categoria</label>
                    <InputText id="categoria" v-model.trim="ficha.categoria" required="true" autofocus :invalid="submitted && !ficha.categoria" fluid />
                    <small v-if="submitted && !ficha.categoria" class="text-red-500">La categoría es requerida.</small>
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="codigo" class="block font-bold mb-3">Código</label>
                        <InputText id="codigo" v-model.trim="ficha.codigo" required="true" autofocus :invalid="submitted && !ficha.codigo" fluid />
                        <small v-if="submitted && !ficha.codigo" class="text-red-500">El código es requerido.</small>
                    </div>
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Precio</label>
                        <InputNumber id="price" v-model="ficha.precio" mode="currency" currency="USD" locale="en-US" fluid />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="saveProforma" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteFichaDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="ficha"
                    >Estas seguro de querer elimminar esta ficha <b>{{ ficha.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteFichaDialog = false" />
                <Button label="Si" icon="pi pi-check" @click="deleteProforma" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteFichasDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="ficha">¿Estás seguro que deseas eliminar las fichas seleccionadas?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteFichasDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProformas" />
            </template>
        </Dialog>
    </div>
</template>
