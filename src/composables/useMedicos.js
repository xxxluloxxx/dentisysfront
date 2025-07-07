import { MedicoService } from '@/service/MedicoService';
import { RolesService } from '@/service/Roles';
import { UsuarioService } from '@/service/UsuarioService';
import { useToast } from 'primevue/usetoast';
import { computed, readonly, ref } from 'vue';

export function useMedicos() {
    const toast = useToast();

    // Estados reactivos
    const medicos = ref([]);
    const roles = ref([]);
    const loading = ref(true);
    const isSaving = ref(false);
    const medicoDialog = ref(false);
    const deleteDialog = ref(false);
    const currentMedico = ref({});

    // Computed properties
    const hasMedicos = computed(() => medicos.value.length > 0);
    const medicosCount = computed(() => medicos.value.length);

    // Funciones de carga de datos
    async function cargarMedicos() {
        try {
            loading.value = true;
            const data = await MedicoService.getAll();
            medicos.value = data;
        } catch (error) {
            console.error('Error al cargar los médicos:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al conectarse al servidor',
                life: 4000
            });
        } finally {
            loading.value = false;
        }
    }

    // Función para cargar roles
    async function cargarRoles() {
        try {
            const data = await RolesService.getAll();
            roles.value = data;
        } catch (error) {
            console.error('Error al cargar los roles:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los roles',
                life: 4000
            });
        }
    }

    // Funciones de gestión de médicos
    function openNewMedico() {
        currentMedico.value = {
            numeroDocumento: '',
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            direccion: '',
            especialidad: '',
            rolId: null
        };
        medicoDialog.value = true;
    }

    function editMedico(medico) {
        if (medico) {
            currentMedico.value = { ...medico };
            medicoDialog.value = true;
        }
    }

    function closeMedicoDialog() {
        medicoDialog.value = false;
        currentMedico.value = {};
    }

    function confirmDeleteMedico(medico) {
        currentMedico.value = medico;
        deleteDialog.value = true;
    }

    function closeDeleteDialog() {
        deleteDialog.value = false;
        currentMedico.value = {};
    }

    // Funciones CRUD
    async function createMedico(medicoData) {
        try {
            isSaving.value = true;
            const response = await MedicoService.create(medicoData);

            medicos.value.push(response);
            closeMedicoDialog();
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Médico creado correctamente',
                life: 3000
            });
            return response;
        } catch (error) {
            console.error('Error al crear el médico:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo crear el médico',
                life: 4000
            });
            throw error;
        } finally {
            isSaving.value = false;
        }
    }

    async function updateMedico(medicoData) {
        try {
            isSaving.value = true;
            const medicoId = currentMedico.value.id;

            // Obtener médico completo para acceder al usuarioId
            const medicoCompleto = await MedicoService.getById(medicoId);
            const usuarioId = medicoCompleto.usuarioId;

            if (usuarioId) {
                await UsuarioService.update(usuarioId, medicoData);
            } else {
                throw new Error('No se encontró el ID del usuario asociado al médico');
            }

            const response = await MedicoService.update(medicoId, medicoData);

            // Actualizar en la lista local
            const index = findIndexById(medicoId);
            if (index !== -1) {
                medicos.value[index] = response;
            }

            closeMedicoDialog();
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Médico actualizado correctamente',
                life: 3000
            });
            return response;
        } catch (error) {
            console.error('Error al actualizar el médico:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el médico',
                life: 4000
            });
            throw error;
        } finally {
            isSaving.value = false;
        }
    }

    async function deleteMedico(medicoToDelete) {
        try {
            isSaving.value = true;
            await MedicoService.delete(medicoToDelete.id);
            medicos.value = medicos.value.filter((val) => val.id !== medicoToDelete.id);
            closeDeleteDialog();
            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Médico eliminado correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error al eliminar el médico:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el médico',
                life: 4000
            });
            throw error;
        } finally {
            isSaving.value = false;
        }
    }

    async function saveMedico(medicoData) {
        if (medicoData.id) {
            return await updateMedico(medicoData);
        } else {
            return await createMedico(medicoData);
        }
    }

    // Funciones auxiliares
    function findIndexById(id) {
        return medicos.value.findIndex((m) => m.id === id);
    }

    function getMedicoById(id) {
        return medicos.value.find((m) => m.id === id);
    }

    // Validaciones
    function validateMedico(medico) {
        const errors = [];

        if (!medico.numeroDocumento?.trim()) {
            errors.push('El número de documento es requerido');
        }

        if (!medico.nombre?.trim()) {
            errors.push('El nombre es requerido');
        }

        if (!medico.apellido?.trim()) {
            errors.push('El apellido es requerido');
        }

        if (!medico.email?.trim()) {
            errors.push('El email es requerido');
        } else if (!isValidEmail(medico.email)) {
            errors.push('El email no tiene un formato válido');
        }

        if (!medico.telefono?.trim()) {
            errors.push('El teléfono es requerido');
        }

        if (!medico.especialidad?.trim()) {
            errors.push('La especialidad es requerida');
        }

        if (!medico.rolId) {
            errors.push('El rol es requerido');
        }

        return errors;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Retornar todo lo necesario para usar en componentes
    return {
        // Estados
        medicos: readonly(medicos),
        loading: readonly(loading),
        isSaving: isSaving, // No readonly para permitir modificaciones internas
        medicoDialog: readonly(medicoDialog),
        deleteDialog: readonly(deleteDialog),
        currentMedico: currentMedico, // No readonly para permitir modificaciones en el formulario
        roles: readonly(roles), // Retornar roles como readonly

        // Computed
        hasMedicos,
        medicosCount,

        // Funciones de gestión
        cargarMedicos,
        openNewMedico,
        editMedico,
        closeMedicoDialog,
        confirmDeleteMedico,
        closeDeleteDialog,
        cargarRoles, // Agregar la nueva función

        // Funciones CRUD
        createMedico,
        updateMedico,
        deleteMedico,
        saveMedico,

        // Funciones auxiliares
        findIndexById,
        getMedicoById,
        validateMedico,

        // Setters para diálogos (necesarios para v-model)
        setMedicoDialog: (value) => medicoDialog.value = value,
        setDeleteDialog: (value) => deleteDialog.value = value,
        setCurrentMedico: (value) => currentMedico.value = value
    };
}
