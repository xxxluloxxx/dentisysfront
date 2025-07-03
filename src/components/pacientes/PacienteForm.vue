<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    paciente: {
        type: Object,
        default: () => ({})
    },
    submitted: {
        type: Boolean,
        default: false
    },
    isSaving: {
        type: Boolean,
        default: false
    },
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['save', 'cancel', 'update:visible']);

const pacienteLocal = ref({});

// Sincronizar el paciente local con las props
watch(
    () => props.paciente,
    (newPaciente) => {
        pacienteLocal.value = { ...newPaciente };
    },
    { immediate: true, deep: true }
);

function handleSave() {
    emit('save', pacienteLocal.value);
}

function handleCancel() {
    emit('cancel');
    emit('update:visible', false);
}

function handleHide() {
    emit('update:visible', false);
}
</script>

<template>
    <Dialog :visible="visible" @update:visible="handleHide" :style="{ width: '90vw', maxWidth: '450px' }" header="Detalles del Paciente" :modal="true" class="p-fluid">
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="identificacion" class="block font-bold mb-2">Identificación</label>
                    <InputText id="identificacion" v-model.trim="pacienteLocal.identificacion" required="true" autofocus :invalid="submitted && !pacienteLocal.identificacion" class="w-full" aria-required="true" aria-label="Identificación" />
                    <small v-if="submitted && !pacienteLocal.identificacion" class="text-red-500"> La identificación es requerida. </small>
                </div>
                <div class="field">
                    <label for="nombre" class="block font-bold mb-2">Nombre</label>
                    <InputText id="nombre" v-model.trim="pacienteLocal.nombre" required="true" :invalid="submitted && !pacienteLocal.nombre" class="w-full" aria-required="true" aria-label="Nombre" />
                    <small v-if="submitted && !pacienteLocal.nombre" class="text-red-500"> El nombre es requerido. </small>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="apellido" class="block font-bold mb-2">Apellido</label>
                    <InputText id="apellido" v-model.trim="pacienteLocal.apellido" required="true" :invalid="submitted && !pacienteLocal.apellido" class="w-full" aria-required="true" aria-label="Apellido" />
                    <small v-if="submitted && !pacienteLocal.apellido" class="text-red-500"> El apellido es requerido. </small>
                </div>
                <div class="field">
                    <label for="email" class="block font-bold mb-2">Email</label>
                    <InputText id="email" v-model.trim="pacienteLocal.email" class="w-full" aria-label="Email" />
                </div>
            </div>

            <div class="field">
                <label for="direccion" class="block font-bold mb-2">Dirección</label>
                <InputText id="direccion" v-model.trim="pacienteLocal.direccion" required="true" :invalid="submitted && !pacienteLocal.direccion" class="w-full" aria-required="true" aria-label="Dirección" />
                <small v-if="submitted && !pacienteLocal.direccion" class="text-red-500"> La dirección es requerida. </small>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                    <InputText id="telefono" v-model.trim="pacienteLocal.telefono" class="w-full" aria-label="Teléfono" />
                </div>
                <div class="field">
                    <label for="genero" class="block font-bold mb-2">Género</label>
                    <Select id="genero" v-model="pacienteLocal.genero" :options="['M', 'F']" placeholder="Seleccione un tipo" required="true" :invalid="submitted && !pacienteLocal.genero" class="w-full" aria-required="true" aria-label="Género" />
                    <small v-if="submitted && !pacienteLocal.genero" class="text-red-500"> El género es requerido. </small>
                </div>
            </div>

            <div class="field">
                <label for="fechaNacimiento" class="block font-bold mb-2">Fecha de Nacimiento</label>
                <DatePicker id="fechaNacimiento" v-model="pacienteLocal.fechaNacimiento" dateFormat="dd/mm/yy" :showIcon="true" class="w-full" aria-label="Fecha de nacimiento" />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" text @click="handleCancel" aria-label="Cancelar" />
                <Button label="Guardar" icon="pi pi-check" @click="handleSave" :loading="isSaving" aria-label="Guardar paciente" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
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
