<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    medico: {
        type: Object,
        required: true
    },
    isSaving: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'save', 'cancel']);

const submitted = ref(false);
const hasChanges = ref(false);
const originalMedico = ref({});

// Observar cambios en el médico para detectar modificaciones
watch(() => props.medico, (newMedico) => {
    if (newMedico && Object.keys(newMedico).length > 0) {
        originalMedico.value = { ...newMedico };
        hasChanges.value = false;
    }
}, { immediate: true, deep: true });

function checkForChanges() {
    if (!props.medico || !originalMedico.value) {
        hasChanges.value = false;
        return;
    }

    const fields = ['numeroDocumento', 'nombre', 'apellido', 'email', 'telefono', 'direccion', 'especialidad'];
    hasChanges.value = fields.some((field) => {
        const currentValue = props.medico[field] || '';
        const originalValue = originalMedico.value[field] || '';
        return currentValue !== originalValue;
    });
}

function handleSave() {
    submitted.value = true;
    if (!props.medico.numeroDocumento?.trim() ||
        !props.medico.nombre?.trim() ||
        !props.medico.apellido?.trim() ||
        !props.medico.email?.trim() ||
        !props.medico.telefono?.trim() ||
        !props.medico.especialidad?.trim()) {
        return false;
    }

    emit('save', props.medico);
    return true;
}

function handleCancel() {
    emit('cancel');
    submitted.value = false;
    hasChanges.value = false;
    originalMedico.value = {};
}

function hideDialog() {
    emit('update:visible', false);
    handleCancel();
}
</script>

<template>
    <Dialog
        :visible="visible"
        :style="{ width: '90vw', maxWidth: '450px' }"
        header="Detalles del Médico"
        :modal="true"
        class="p-fluid"
        @update:visible="hideDialog"
    >
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="numeroDocumento" class="block font-bold mb-2">Número de documento</label>
                    <InputText
                        id="numeroDocumento"
                        v-model.trim="medico.numeroDocumento"
                        required="true"
                        autofocus
                        :invalid="submitted && !medico.numeroDocumento"
                        class="w-full"
                        @input="checkForChanges"
                        aria-required="true"
                        aria-label="Número de documento"
                    />
                    <small v-if="submitted && !medico.numeroDocumento" class="text-red-500">El número de documento es requerido.</small>
                </div>
                <div class="field">
                    <label for="telefono" class="block font-bold mb-2">Teléfono</label>
                    <InputText
                        id="telefono"
                        v-model.trim="medico.telefono"
                        required="true"
                        :invalid="submitted && !medico.telefono"
                        class="w-full"
                        @input="checkForChanges"
                        aria-required="true"
                        aria-label="Teléfono"
                    />
                    <small v-if="submitted && !medico.telefono" class="text-red-500">El teléfono es requerido.</small>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="nombre" class="block font-bold mb-2">Nombre</label>
                    <InputText
                        id="nombre"
                        v-model.trim="medico.nombre"
                        required="true"
                        :invalid="submitted && !medico.nombre"
                        class="w-full"
                        @input="checkForChanges"
                        aria-required="true"
                        aria-label="Nombre"
                    />
                    <small v-if="submitted && !medico.nombre" class="text-red-500">El nombre es requerido.</small>
                </div>
                <div class="field">
                    <label for="apellido" class="block font-bold mb-2">Apellido</label>
                    <InputText
                        id="apellido"
                        v-model.trim="medico.apellido"
                        required="true"
                        :invalid="submitted && !medico.apellido"
                        class="w-full"
                        @input="checkForChanges"
                        aria-required="true"
                        aria-label="Apellido"
                    />
                    <small v-if="submitted && !medico.apellido" class="text-red-500">El apellido es requerido.</small>
                </div>
            </div>

            <div class="field">
                <label for="especialidad" class="block font-bold mb-2">Especialidad</label>
                <InputText
                    id="especialidad"
                    v-model.trim="medico.especialidad"
                    required="true"
                    :invalid="submitted && !medico.especialidad"
                    class="w-full"
                    @input="checkForChanges"
                    aria-required="true"
                    aria-label="Especialidad"
                />
                <small v-if="submitted && !medico.especialidad" class="text-red-500">La especialidad es requerida.</small>
            </div>

            <div class="field">
                <label for="email" class="block font-bold mb-2">Email</label>
                <InputText
                    id="email"
                    v-model.trim="medico.email"
                    required="true"
                    :invalid="submitted && !medico.email"
                    class="w-full"
                    @input="checkForChanges"
                    aria-required="true"
                    aria-label="Email"
                />
                <small v-if="submitted && !medico.email" class="text-red-500">El email es requerido.</small>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancelar" icon="pi pi-times" text @click="handleCancel" aria-label="Cancelar" />
                <Button label="Guardar" icon="pi pi-check" :disabled="!hasChanges" @click="handleSave" :loading="isSaving" aria-label="Guardar médico" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.p-fluid {
    width: 100%;
}

.field {
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .p-dialog {
        width: 90vw !important;
    }
}

/* Mejorar inputs y selects */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber) {
    border-radius: 8px;
    border: 1px solid #d1d5db;
    transition: border 0.2s;
}
:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-calendar:focus),
:deep(.p-inputnumber:focus) {
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
