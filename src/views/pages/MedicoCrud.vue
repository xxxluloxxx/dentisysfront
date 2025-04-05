<script setup>
import { MedicoService } from '@/service/MedicoService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

onMounted(() => {
    loading.value = true;
    MedicoService.getAll()
        .then((data) => (medicos.value = data))
        .catch((error) => {
            console.error('Error al cargar los medicos:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});

const toast = useToast();
const dt = ref();
const medicos = ref();
const medicoDialog = ref(false);
const deletemedicoDialog = ref(false);
const medico = ref({});
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const multiple = ref('multiple');
const submitted = ref(false);

function openNew() {
    medico.value = {};
    submitted.value = false;
    medicoDialog.value = true;
}

function hideDialog() {
    medicoDialog.value = false;
    submitted.value = false;
}

function savePaciente() {
    submitted.value = true;

    if (medico?.value.nombre?.trim()) {
        const pacienteData = {
            tipoDocumento: medico.value.tipoDocumento,
            numeroDocumento: medico.value.numeroDocumento,
            nombre: medico.value.nombre,
            apellido: medico.value.apellido,
            email: medico.value.email,
            telefono: medico.value.telefono,
            direccion: medico.value.direccion,
            especialidad: medico.value.especialidad
        };

        if (medico.value.id) {
            updatePaciente(pacienteData);
        } else {
            createpaciente(pacienteData);
        }
    }
}

function createpaciente(pacienteData) {
    MedicoService.create(pacienteData)
        .then((response) => {
            medicos.value.push(response);
            medicoDialog.value = false;
            medico.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Medico Creado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el medico:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el medico', life: 3000 });
        });
}

function updatePaciente(pacienteData) {
    MedicoService.update(medico.value.id, pacienteData)
        .then((response) => {
            const index = findIndexById(medico.value.id);
            if (index !== -1) {
                medicos.value[index] = response;
            }
            medicoDialog.value = false;
            medico.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Medico Actualizado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al actualizar el medico:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el medico', life: 3000 });
        });
}

function editMedico(cli) {
    if (cli) {
        medico.value = { ...cli };
        medicoDialog.value = true;
    }
}

function confirmDeleteMedico(cli) {
    medico.value = cli;
    deletemedicoDialog.value = true;
}

function deleteMedico() {
    MedicoService.delete(medico.value.id)
        .then(() => {
            medicos.value = medicos.value.filter((val) => val.id !== medico.value.id);
            deletemedicoDialog.value = false;
            medico.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Medico Eliminado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el medico:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el medico', life: 3000 });
        });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < medicos.value.length; i++) {
        if (medicos.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
}

function exportCSV() {
    dt.value.exportCSV();
}
</script>

<template>
    <div>
        <div class="card">
            <DataTable
                ref="dt"
                :value="medicos"
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
                :loading="loading"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} medicos"
            >
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Médicos</h4>
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
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="numeroDocumento" header="Identificacion" sortable style="min-width: 5rem"></Column>
                <Column field="nombre" header="Nombre" sortable style="min-width: 5rem"></Column>
                <Column field="apellido" header="Apellido" sortable style="min-width: 5rem"></Column>
                <Column field="especialidad" header="Identificación" sortable style="min-width: 5rem"></Column>
                <Column field="telefono" header="Telefono" sortable style="min-width: 5rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editMedico(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteMedico(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="medicoDialog" :style="{ width: '450px' }" header="Detalles del Medico" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="tipoDocumento" class="block font-bold mb-3">Tipo documento</label>
                        <Select id="tipoDocumento" v-model="medico.tipoDocumento" :options="['CI', 'Pasaporte', 'Extranjero']" placeholder="Seleccione un tipo" class="w-full" />
                        <small v-if="submitted && !medico.tipoDocumento" class="text-red-500">El tipoDocumento es requerido.</small>
                    </div>
                    <div>
                        <label for="identificacion" class="block font-bold mb-3">Identificacion</label>
                        <InputText id="identificacion" v-model.trim="medico.numeroDocumento" required="true" autofocus :invalid="submitted && !medico.identificacion" fluid />
                        <small v-if="submitted && !medico.numeroDocumento" class="text-red-500">La identificacion es requerida.</small>
                    </div>
                </div>
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="nombre" v-model.trim="medico.nombre" required="true" autofocus :invalid="submitted && !medico.nombre" fluid />
                    <small v-if="submitted && !medico.nombre" class="text-red-500">El nombre es requerido.</small>
                </div>
                <div>
                    <label for="apellido" class="block font-bold mb-3">Apellido</label>
                    <InputText id="apellido" v-model.trim="medico.apellido" required="true" autofocus :invalid="submitted && !medico.apellido" fluid />
                    <small v-if="submitted && !medico.apellido" class="text-red-500">El apellido es requerido.</small>
                </div>
                <div>
                    <label for="email" class="block font-bold mb-3">Email</label>
                    <InputText id="email" v-model.trim="medico.email" required="true" autofocus :invalid="submitted && !medico.email" fluid />
                    <small v-if="submitted && !medico.email" class="text-red-500">El email es requerido.</small>
                </div>

                <div>
                    <label for="especialidad" class="block font-bold mb-3">Especialidad</label>
                    <InputText id="especialidad" v-model.trim="medico.especialidad" required="true" autofocus :invalid="submitted && !medico.especialidad" fluid />
                    <small v-if="submitted && !medico.especialidad" class="text-red-500">La especialidad es requerida.</small>
                </div>
                <div>
                    <label for="telefono" class="block font-bold mb-3">Teléfono</label>
                    <InputText id="telefono" v-model.trim="medico.telefono" required="true" autofocus :invalid="submitted && !medico.telefono" fluid />
                    <small v-if="submitted && !medico.telefono" class="text-red-500">El teléfono es requerido.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="savePaciente" />
            </template>
        </Dialog>

    </div>
</template>
