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
const deleteFichasDialog = ref(false);
const ficha = ref({});
const selectedFichass = ref();
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

function saveProduct() {
    submitted.value = true;

    if (ficha?.value.nombre?.trim()) {
        const productoData = {
            codigo: ficha.value.codigo,
            nombre: ficha.value.nombre,
            descripcion: ficha.value.descripcion,
            precio: ficha.value.precio,
            categoria: ficha.value.categoria
        };

        if (ficha.value.id) {
            updateProduct(productoData);
        } else {
            createProduct(productoData);
        }
    }
}

function createProduct(productoData) {
    ProductoService.createProduct(productoData)
        .then((response) => {
            fichas.value.push(response);
            fichaDialog.value = false;
            ficha.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto Creado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el producto:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el producto', life: 3000 });
        });
}

function updateProduct(productoData) {
    ProductoService.updateProduct(ficha.value.id, productoData)
        .then((response) => {
            const index = findIndexById(ficha.value.id);
            if (index !== -1) {
                fichas.value[index] = response;
            }
            fichaDialog.value = false;
            ficha.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto Actualizado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al actualizar el producto:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el producto', life: 3000 });
        });
}

function verFicha(prod) {
    router.push({
        name: 'ficha-medica-vista',
        params: { id: prod.id }
    });
}

function editProduct(prod) {
    /* ficha.value = { ...prod };
    fichaDialog.value = true; */
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Realiiza  la  accion', life: 3000 });
}

function confirmDeleteProduct(prod) {
    /* ficha.value = prod;
    deleteFichaDialog.value = true; */
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Realiiza  la  accion', life: 3000 });
}

function deleteProduct() {
    ProductoService.deleteProduct(ficha.value.id)
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

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < fichas.value.length; i++) {
        if (fichas.value[i].id === id) {
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

function deleteSelectedProducts() {
    const deletePromises = selectedFichass.value.map((product) => ProductoService.deleteProduct(product.id));

    Promise.all(deletePromises)
        .then(() => {
            fichas.value = fichas.value.filter((val) => !selectedFichass.value.includes(val));
            deleteFichasDialog.value = false;
            selectedFichass.value = null;
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Productos Eliminados', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar los productos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar los productos', life: 3000 });
        });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedFichass || !selectedFichass.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedFichass"
                :value="fichas"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Fichas médicas</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="paciente.nombre" header="Paciente" sortable style="min-width: 12rem">
                    <template #body="slotProps"> {{ slotProps.data.paciente.nombre }} {{ slotProps.data.paciente.apellido }} </template>
                </Column>
                <Column field="medico.nombre" header="Medico" sortable style="min-width: 12rem">
                    <template #body="slotProps"> {{ slotProps.data.medico.nombre }} {{ slotProps.data.medico.apellido }} </template>
                </Column>
                <Column field="createdAt" header="Fecha " sortable style="min-width: 10rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="verFicha(slotProps.data)" />
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" severity="warn" @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteProduct(slotProps.data)" />
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
                <Button label="Si" icon="pi pi-check" @click="deleteProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteFichasDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="ficha">¿Estás seguro que deseas eliminar las fichas seleccionadas?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteFichasDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>
    </div>
</template>
