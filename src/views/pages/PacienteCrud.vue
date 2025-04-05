<script setup>
import { PacienteService } from '@/service/PacienteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

onMounted(() => {
    PacienteService.getAll()
        .then((data) => (pacientes.value = data))
        .catch((error) => {
            console.error('Error al cargar los pacientes:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al conectarse al servidor', life: 3000 });
        })
        .finally(() => {
            loading.value = false;
        });
});

const toast = useToast();
const dt = ref();
const pacientes = ref();
const loading = ref(true);
const pacienteDialog = ref(false);
const deletePacienteDialog = ref(false);
const paciente = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

function openNew() {
    paciente.value = {};
    submitted.value = false;
    pacienteDialog.value = true;
}

function hideDialog() {
    pacienteDialog.value = false;
    submitted.value = false;
}

function savePaciente() {
    submitted.value = true;

    if (paciente?.value.nombre?.trim()) {
        const pacienteData = {
            nombre: paciente.value.nombre,
            apellido: paciente.value.apellido,
            email: paciente.value.email,
            telefono: paciente.value.telefono,
            direccion: paciente.value.direccion,
            genero: paciente.value.genero,
            identificacion: paciente.value.identificacion,
            fechaNacimiento: paciente.value.fechaNacimiento
        };

        if (paciente.value.id) {
            updatePaciente(pacienteData);
        } else {
            createpaciente(pacienteData);
        }
    }
}

function createpaciente(pacienteData) {
    PacienteService.create(pacienteData)
        .then((response) => {
            pacientes.value.push(response);
            pacienteDialog.value = false;
            paciente.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente Creado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al crear el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el paciente', life: 3000 });
        });
}

function updatePaciente(pacienteData) {
    PacienteService.update(paciente.value.id, pacienteData)
        .then((response) => {
            const index = findIndexById(paciente.value.id);
            if (index !== -1) {
                pacientes.value[index] = response;
            }
            pacienteDialog.value = false;
            paciente.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente Actualizado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al actualizar el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el paciente', life: 3000 });
        });
}

function editPaciente(cli) {
    if (cli) {
        paciente.value = { ...cli };
        pacienteDialog.value = true;
    }
}

function confirmDeletePaciente(cli) {
    paciente.value = cli;
    deletePacienteDialog.value = true;
}

function deletePaciente() {
    PacienteService.delete(paciente.value.id)
        .then(() => {
            pacientes.value = pacientes.value.filter((val) => val.id !== paciente.value.id);
            deletePacienteDialog.value = false;
            paciente.value = {};
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente Eliminado', life: 3000 });
        })
        .catch((error) => {
            console.error('Error al eliminar el paciente:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el paciente', life: 3000 });
        });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < pacientes.value.length; i++) {
        if (pacientes.value[i].id === id) {
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
                :value="pacientes"
                dataKey="id"
                :paginator="true"
                :rows="10"
                scrollable
                scrollHeight="600px"
                :filters="filters"
                :loading="loading"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pacientes"
            >
                <template #header>
                    <div class="flex flex-col gap-y-4">
                        <div class="flex flex-wrap gap-2 items-center justify-start">
                            <h4 class="m-0">Pacientes</h4>
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
                <Column field="identificacion" header="Identificación" sortable style="min-width: 5rem"></Column>
                <Column field="nombre" header="Nombre" sortable style="min-width: 5rem"></Column>
                <Column field="apellido" header="Apellido" sortable style="min-width: 5rem"></Column>
                <Column field="genero" header="Genero" sortable style="min-width: 5rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 16rem"></Column>
                <Column field="telefono" header="Teléfono" sortable style="min-width: 12rem"></Column>
                <Column field="direccion" header="Direccion" sortable style="min-width: 12rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editPaciente(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePaciente(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="pacienteDialog" :style="{ width: '450px' }" header="Detalles del Paciente" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="identificacion" class="block font-bold mb-3">Identificacion</label>
                    <InputText id="identificacion" v-model.trim="paciente.identificacion" required="true" autofocus :invalid="submitted && !paciente.identificacion" fluid />
                    <small v-if="submitted && !paciente.identificacion" class="text-red-500">El nombre es requerido.</small>
                </div>
                <div>
                    <label for="nombre" class="block font-bold mb-3">Nombre</label>
                    <InputText id="nombre" v-model.trim="paciente.nombre" required="true" autofocus :invalid="submitted && !paciente.nombre" fluid />
                    <small v-if="submitted && !paciente.nombre" class="text-red-500">El nombre es requerido.</small>
                </div>
                <div>
                    <label for="apellido" class="block font-bold mb-3">Apellido</label>
                    <InputText id="apellido" v-model.trim="paciente.apellido" required="true" autofocus :invalid="submitted && !paciente.apellido" fluid />
                    <small v-if="submitted && !paciente.apellido" class="text-red-500">El apellido es requerido.</small>
                </div>
                <div>
                    <label for="email" class="block font-bold mb-3">Email</label>
                    <InputText id="email" v-model.trim="paciente.email" required="true" autofocus :invalid="submitted && !paciente.email" fluid />
                    <small v-if="submitted && !paciente.email" class="text-red-500">El email es requerido.</small>
                </div>

                <div>
                    <label for="direccion" class="block font-bold mb-3">Dirección</label>
                    <InputText id="direccion" v-model.trim="paciente.direccion" required="true" autofocus :invalid="submitted && !paciente.direccion" fluid />
                    <small v-if="submitted && !paciente.direccion" class="text-red-500">La dirección es requerida.</small>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="telefono" class="block font-bold mb-3">Teléfono</label>
                        <InputText id="telefono" v-model.trim="paciente.telefono" required="true" autofocus :invalid="submitted && !paciente.telefono" fluid />
                        <small v-if="submitted && !paciente.telefono" class="text-red-500">El teléfono es requerido.</small>
                    </div>
                    <div>
                        <label for="genero" class="block font-bold mb-3">Genero</label>
                        <Select id="genero" v-model="paciente.genero" :options="['M', 'F']" placeholder="Seleccione un tipo" class="w-full" />
                        <small v-if="submitted && !paciente.genero" class="text-red-500">El genero es requerido.</small>
                    </div>
                </div>
                <div>
                    <label for="fechaNacimiento" class="block font-bold mb-3">Fecha de Nacimiento</label>
                    <DatePicker id="fechaNacimiento" v-model="paciente.fechaNacimiento" dateFormat="dd/mm/yy" :showIcon="true" required="true" :invalid="submitted && !paciente.fechaNacimiento" />
                    <small v-if="submitted && !paciente.fechaNacimiento" class="text-red-500">La fecha de nacimiento es requerida.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Guardar" icon="pi pi-check" @click="savePaciente" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePacienteDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="paciente"
                    >¿Estás seguro de querer eliminar este paciente <b>{{ paciente.nombre }} {{ paciente.apellido }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletePacienteDialog = false" />
                <Button label="Sí" icon="pi pi-check" @click="deletePaciente" />
            </template>
        </Dialog>
    </div>
</template>
