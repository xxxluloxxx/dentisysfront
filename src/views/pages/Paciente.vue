<script setup>
import DeleteConfirmationDialog from '@/components/pacientes/DeleteConfirmationDialog.vue';
import PacienteForm from '@/components/pacientes/PacienteForm.vue';
import PacientesTable from '@/components/pacientes/PacientesTable.vue';
import { usePaciente } from '@/composables/usePaciente';
import { onMounted } from 'vue';

// Usar el composable
const { pacientes, loading, pacienteDialog, deletePacienteDialog, paciente, submitted, isSaving, cargarPacientes, openNew, hideDialog, savePaciente, editPaciente, confirmDeletePaciente, deletePaciente, cancelDelete } = usePaciente();

onMounted(() => {
    cargarPacientes();
});
</script>

<template>
    <div>
        <!-- Spinner de carga global -->
        <div v-if="loading || isSaving" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" animationDuration="1.5s" aria-label="Cargando..." />
        </div>

        <!-- Componente de tabla modularizado -->
        <PacientesTable :pacientes="pacientes" :loading="loading" @edit="editPaciente" @delete="confirmDeletePaciente" @new="openNew" @export="() => {}" />

        <!-- Componente de formulario modularizado -->
        <PacienteForm v-model:visible="pacienteDialog" :paciente="paciente" :submitted="submitted" :is-saving="isSaving" @save="savePaciente" @cancel="hideDialog" />

        <!-- Componente de confirmación de eliminación modularizado -->
        <DeleteConfirmationDialog v-model:visible="deletePacienteDialog" :paciente="paciente" :is-saving="isSaving" @confirm="deletePaciente" @cancel="cancelDelete" />
    </div>
</template>

<style scoped>
/* Spinner de carga */
:deep(.p-progress-spinner-circle) {
    stroke: #2563eb;
}

/* Mejorar inputs y selects */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar) {
    border-radius: 8px;
    border: 1px solid #d1d5db;
    transition: border 0.2s;
}
:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-calendar:focus) {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #93c5fd44;
}

/* Mejorar los diálogos */
:deep(.p-dialog) {
    border-radius: 16px;
    box-shadow: 0 4px 32px 0 rgba(59, 130, 246, 0.12);
}
:deep(.p-dialog .p-dialog-header) {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
}
:deep(.p-dialog .p-dialog-footer) {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
}

/* Mejorar los mensajes de error */
.text-red-500 {
    font-size: 0.95em;
    font-weight: 500;
    margin-top: 2px;
}
</style>
