<script setup>
import DeleteConfirmationDialog from '@/components/medicos/MedicoDeleteConfirmationDialog.vue';
import MedicoForm from '@/components/medicos/MedicoForm.vue';
import MedicosHeader from '@/components/medicos/MedicosHeader.vue';
import MedicosTable from '@/components/medicos/MedicosTable.vue';
import { useExport } from '@/composables/useExport';
import { useFilters } from '@/composables/useFilters';
import { useMedicos } from '@/composables/useMedicos';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted } from 'vue';

// Toast para mostrar errores
const toast = useToast();

// Composable para gestión de médicos
const { medicos, loading, isSaving, medicoDialog, deleteDialog, currentMedico, roles, cargarMedicos, cargarRoles, openNewMedico, editMedico, closeMedicoDialog, confirmDeleteMedico, closeDeleteDialog, saveMedico, deleteMedico, validateMedico } =
    useMedicos();

// Composable para filtros
const { filters, filterData } = useFilters();

// Composable para exportación
const { exportMedicos } = useExport();

// Campos de búsqueda para médicos
const medicosSearchFields = ['nombre', 'apellido', 'numeroDocumento', 'email', 'telefono', 'especialidad'];

// Computed para médicos filtrados
const filteredMedicos = computed(() => {
    return filterData(medicos.value, medicosSearchFields);
});

// Cargar datos al montar el componente
onMounted(async () => {
    await Promise.all([cargarMedicos(), cargarRoles()]);
});

// Handlers para eventos de componentes
function handleTableEdit(medico) {
    editMedico(medico);
}

function handleTableDelete(medico) {
    confirmDeleteMedico(medico);
}

function handleTableExport() {
    try {
        exportMedicos(medicos.value, 'csv');
    } catch (error) {
        console.error('Error al exportar:', error);
    }
}

function handleFormSave(medicoData) {
    // Validar antes de guardar
    const errors = validateMedico(medicoData);

    if (errors.length > 0) {
        // Mostrar toast con el primer error
        const firstError = errors[0];
        toast.add({
            severity: 'error',
            summary: 'Error de validación',
            detail: firstError,
            life: 4000
        });

        // Si hay más de un error, mostrar el segundo en otro toast
        if (errors.length > 1) {
            setTimeout(() => {
                toast.add({
                    severity: 'error',
                    summary: 'Error de validación',
                    detail: errors[1],
                    life: 4000
                });
            }, 500);
        }

        return;
    }

    saveMedico(medicoData);
}

function handleFormCancel() {
    closeMedicoDialog();
}

function handleDeleteConfirm(medicoToDelete) {
    deleteMedico(medicoToDelete);
}

function handleDeleteCancel() {
    closeDeleteDialog();
}

function handleHeaderNew() {
    openNewMedico();
}

function handleHeaderExport() {
    handleTableExport();
}
</script>

<template>
    <div>
        <!-- Spinner de carga global -->
        <div v-if="loading || isSaving" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" animationDuration="1.5s" aria-label="Cargando..." />
        </div>
        <div class="card" :aria-busy="loading || isSaving">
            <!-- Componente de header -->
            <MedicosHeader :filters="filters" @new="handleHeaderNew" @export="handleHeaderExport" />
            <!-- Componente de tabla -->
            <MedicosTable :medicos="filteredMedicos" :loading="loading" :filters="filters" @edit="handleTableEdit" @delete="handleTableDelete" @export="handleTableExport" @new="handleHeaderNew" />
        </div>

        <!-- Componente de formulario -->
        <MedicoForm v-model:visible="medicoDialog" :medico="currentMedico" :roles="roles" :is-saving="isSaving" @save="handleFormSave" @cancel="handleFormCancel" />

        <!-- Componente de confirmación de eliminación -->
        <DeleteConfirmationDialog v-model:visible="deleteDialog" :medico="currentMedico" :is-saving="isSaving" @confirm="handleDeleteConfirm" @cancel="handleDeleteCancel" />
    </div>
</template>

<style scoped>
/* Spinner de carga */
:deep(.p-progress-spinner-circle) {
    stroke: #2563eb;
}
</style>
