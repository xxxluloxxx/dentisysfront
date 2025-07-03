import { PacienteService } from '@/service/PacienteService';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

export function usePaciente() {
    const toast = useToast();

    // Estados reactivos
    const pacientes = ref([]);
    const loading = ref(true);
    const pacienteDialog = ref(false);
    const deletePacienteDialog = ref(false);
    const paciente = ref({});
    const submitted = ref(false);
    const isSaving = ref(false);

    // Función para cargar pacientes
    function cargarPacientes() {
        loading.value = true;
        PacienteService.getAll()
            .then((data) => (pacientes.value = data))
            .catch((error) => {
                console.error('Error al cargar los pacientes:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al conectarse al servidor',
                    life: 4000
                });
            })
            .finally(() => {
                loading.value = false;
            });
    }

    // Función para abrir formulario de nuevo paciente
    function openNew() {
        paciente.value = {};
        submitted.value = false;
        pacienteDialog.value = true;
    }

    // Función para cerrar diálogo
    function hideDialog() {
        pacienteDialog.value = false;
        submitted.value = false;
    }

    // Función para validar datos del paciente
    function validatePaciente(pacienteData) {
        if (!pacienteData.nombre?.trim() || !pacienteData.apellido?.trim() || !pacienteData.identificacion?.trim() || !pacienteData.direccion?.trim() || !pacienteData.genero) {
            toast.add({
                severity: 'warn',
                summary: 'Campos requeridos',
                detail: 'Por favor, complete todos los campos obligatorios.',
                life: 3500
            });
            return false;
        }
        return true;
    }

    // Función para guardar paciente (crear o actualizar)
    function savePaciente(pacienteData) {
        submitted.value = true;

        if (!validatePaciente(pacienteData)) {
            return;
        }

        isSaving.value = true;

        if (paciente.value.id) {
            updatePaciente(pacienteData);
        } else {
            createPaciente(pacienteData);
        }
    }

    // Función para crear paciente
    function createPaciente(pacienteData) {
        PacienteService.create(pacienteData)
            .then((response) => {
                pacientes.value.push(response);
                pacienteDialog.value = false;
                paciente.value = {};
                toast.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Paciente creado correctamente',
                    life: 3000
                });
            })
            .catch((error) => {
                console.error('Error al crear el paciente:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo crear el paciente',
                    life: 4000
                });
            })
            .finally(() => {
                isSaving.value = false;
            });
    }

    // Función para actualizar paciente
    function updatePaciente(pacienteData) {
        PacienteService.update(paciente.value.id, pacienteData)
            .then((response) => {
                const index = findIndexById(paciente.value.id);
                if (index !== -1) {
                    pacientes.value[index] = response;
                }
                pacienteDialog.value = false;
                paciente.value = {};
                toast.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Paciente actualizado correctamente',
                    life: 3000
                });
            })
            .catch((error) => {
                console.error('Error al actualizar el paciente:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar el paciente',
                    life: 4000
                });
            })
            .finally(() => {
                isSaving.value = false;
            });
    }

    // Función para editar paciente
    function editPaciente(pacienteSeleccionado) {
        if (pacienteSeleccionado) {
            paciente.value = { ...pacienteSeleccionado };
            pacienteDialog.value = true;
        }
    }

    // Función para confirmar eliminación
    function confirmDeletePaciente(pacienteAEliminar) {
        paciente.value = pacienteAEliminar;
        deletePacienteDialog.value = true;
    }

    // Función para eliminar paciente
    function deletePaciente() {
        PacienteService.delete(paciente.value.id)
            .then(() => {
                pacientes.value = pacientes.value.filter((pacienteItem) => pacienteItem.id !== paciente.value.id);
                deletePacienteDialog.value = false;
                paciente.value = {};
                toast.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Paciente eliminado correctamente',
                    life: 3000
                });
            })
            .catch((error) => {
                console.error('Error al eliminar el paciente:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar el paciente',
                    life: 4000
                });
            });
    }

    // Función para cancelar eliminación
    function cancelDelete() {
        deletePacienteDialog.value = false;
        paciente.value = {};
    }

    // Función auxiliar para encontrar índice por ID
    function findIndexById(id) {
        return pacientes.value.findIndex((pacienteItem) => pacienteItem.id === id);
    }

    // Retornar todo lo necesario
    return {
        // Estados
        pacientes,
        loading,
        pacienteDialog,
        deletePacienteDialog,
        paciente,
        submitted,
        isSaving,

        // Funciones
        cargarPacientes,
        openNew,
        hideDialog,
        savePaciente,
        editPaciente,
        confirmDeletePaciente,
        deletePaciente,
        cancelDelete
    };
}
