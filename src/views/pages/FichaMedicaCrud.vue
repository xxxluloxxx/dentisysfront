<script setup>
import { FichaOdontologicaService } from '@/service/FichaMedica';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const dt = ref();
const fichas = ref();
const fichaDialog = ref(false);
const deleteFichaDialog = ref(false);
const multiple = ref('multiple');
const ficha = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

onMounted(() => {
    FichaOdontologicaService.getAll()
        .then((data) => (fichas.value = data))
        .catch((error) => {
            console.error('Error al cargar los productos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        });
});

function hideDialog() {
    fichaDialog.value = false;
    submitted.value = false;
}

function verFicha(prod) {
    router.push({
        name: 'ficha-medica-vista',
        params: { id: prod.id }
    });
}

function confirmDeleteFicha(prod) {
    ficha.value = prod;
    deleteFichaDialog.value = true;
}

function deleteFicha() {
    FichaOdontologicaService.deleteProduct(ficha.value.id)
        .then(() => {
            fichas.value = fichas.value.filter((val) => val.id !== ficha.value.id);
            deleteFichaDialog.value = false;
            ficha.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto Eliminado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el producto:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el producto', life: 3000 });
        });
}

function exportCSV() {
    dt.value.exportCSV();
}

function obtenerFecha(value) {
    if (value) {
        const fecha = new Date(value);
        return fecha.toISOString().split('T')[0];
    }
    return '';
}
</script>

<template>
    <div>
        <div class="card">
            <DataTable
                ref="dt"
                :value="fichas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                scrollable
                scrollHeight="600px"
                :sortMode="multiple"
                :multiSortMeta="[
                    { field: 'createdAt', order: 1 },
                    { field: 'medico.nombre', order: 1 },
                ]"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} fichas"
            >
            <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-end">
                            <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                        </div>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <div class="flex flex-wrap gap-2 items-center justify-start">
                                <h4 class="m-0">Fichas médicas</h4>
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

                <Column field="createdAt" header="Fecha " sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        {{ obtenerFecha(slotProps.data.createdAt) }}
                    </template>
                </Column>
                <Column field="medico.nombre" header="Medico" sortable style="min-width: 12rem">
                    <template #body="slotProps"> {{ slotProps.data.medico.nombre }} {{ slotProps.data.medico.apellido }} </template>
                </Column>
                <Column field="paciente.nombre" header="Paciente" sortable style="min-width: 12rem">
                    <template #body="slotProps"> {{ slotProps.data.paciente.nombre }} {{ slotProps.data.paciente.apellido }} </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="verFicha(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" severity="warn" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteFicha(slotProps.data)" />
                    </template>
                </Column>
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
                <Button label="Guardar" icon="pi pi-check" @click="saveProduct" />
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
                <Button label="Si" icon="pi pi-check" @click="deleteFicha" />
            </template>
        </Dialog>

    </div>
</template>
