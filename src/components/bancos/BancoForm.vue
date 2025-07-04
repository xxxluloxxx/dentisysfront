<template>
    <Dialog
        :visible="visible"
        :modal="true"
        :header="isEditing ? 'Editar Banco' : 'Nuevo Banco'"
        :style="{ width: '500px' }"
        @update:visible="$emit('update:visible', $event)"
        :closable="!loading"
        :closeOnEscape="!loading"
    >
        <form @submit.prevent="guardarBanco" class="banco-form">
            <div class="grid grid-cols-1 gap-4">
                <!-- Nombre de cuenta -->
                <div class="field">
                    <label for="nombreCuenta" class="block text-sm font-medium mb-2" style="color: var(--text-color)">
                        Nombre de Cuenta *
                    </label>
                    <InputText
                        id="nombreCuenta"
                        v-model="formData.nombreCuenta"
                        :class="{ 'p-invalid': errors.nombreCuenta }"
                        placeholder="Ej: Cuenta Principal"
                        class="w-full"
                        :disabled="loading"
                    />
                    <small v-if="errors.nombreCuenta" class="p-error">{{ errors.nombreCuenta }}</small>
                </div>

                <!-- Banco -->
                <div class="field">
                    <label for="banco" class="block text-sm font-medium mb-2" style="color: var(--text-color)">
                        Banco *
                    </label>
                    <InputText
                        id="banco"
                        v-model="formData.banco"
                        :class="{ 'p-invalid': errors.banco }"
                        placeholder="Ej: Banco del Pichincha"
                        class="w-full"
                        :disabled="loading"
                    />
                    <small v-if="errors.banco" class="p-error">{{ errors.banco }}</small>
                </div>

                <!-- Número de cuenta -->
                <div class="field">
                    <label for="cuenta" class="block text-sm font-medium mb-2" style="color: var(--text-color)">
                        Número de Cuenta *
                    </label>
                    <InputText
                        id="cuenta"
                        v-model="formData.cuenta"
                        :class="{ 'p-invalid': errors.cuenta }"
                        placeholder="Ej: 2100123456789012"
                        class="w-full font-mono"
                        :disabled="loading"
                    />
                    <small v-if="errors.cuenta" class="p-error">{{ errors.cuenta }}</small>
                </div>

                <!-- Color -->
                <div class="field">
                    <label for="color" class="block text-sm font-medium mb-2" style="color: var(--text-color)">
                        Color *
                    </label>
                    <div class="flex items-center gap-3">
                        <ColorPicker
                            v-model="formData.color"
                            :class="{ 'p-invalid': errors.color }"
                            :disabled="loading"
                        />
                        <InputText
                            v-model="formData.color"
                            placeholder="#007bff"
                            class="flex-1 font-mono"
                            :disabled="loading"
                        />
                    </div>
                    <small v-if="errors.color" class="p-error">{{ errors.color }}</small>
                </div>
            </div>
        </form>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    @click="cerrarDialogo"
                    class="p-button-text"
                    :disabled="loading"
                />
                <Button
                    :label="isEditing ? 'Actualizar' : 'Crear'"
                    :icon="isEditing ? 'pi pi-check' : 'pi pi-plus'"
                    @click="guardarBanco"
                    :loading="loading"
                    class="p-button-success"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    banco: {
        type: Object,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['update:visible', 'guardar']);

// Estados reactivos
const formData = ref({
    nombreCuenta: '',
    banco: '',
    cuenta: '',
    color: '#007bff'
});

const errors = ref({});

// Computed
const isEditing = computed(() => props.banco && props.banco.id);

// Watchers
watch(() => props.banco, (newBanco) => {
    if (newBanco) {
        formData.value = {
            nombreCuenta: newBanco.nombreCuenta || '',
            banco: newBanco.banco || '',
            cuenta: newBanco.cuenta || '',
            color: newBanco.color || '#007bff'
        };
    } else {
        resetForm();
    }
}, { immediate: true });

watch(() => props.visible, (visible) => {
    if (!visible) {
        resetForm();
    }
});

// Watcher para normalizar el color automáticamente
watch(() => formData.value.color, (newColor) => {
    if (newColor && !newColor.startsWith('#')) {
        // Si el color no tiene #, agregarlo automáticamente
        formData.value.color = '#' + newColor;
    }
});

// Métodos
function resetForm() {
    formData.value = {
        nombreCuenta: '',
        banco: '',
        cuenta: '',
        color: '#007bff'
    };
    errors.value = {};
}

function validarFormulario() {
    errors.value = {};

    if (!formData.value.nombreCuenta.trim()) {
        errors.value.nombreCuenta = 'El nombre de cuenta es requerido';
    }

    if (!formData.value.banco.trim()) {
        errors.value.banco = 'El nombre del banco es requerido';
    }

    if (!formData.value.cuenta.trim()) {
        errors.value.cuenta = 'El número de cuenta es requerido';
    } else if (!/^\d+$/.test(formData.value.cuenta.replace(/\s/g, ''))) {
        errors.value.cuenta = 'El número de cuenta debe contener solo números';
    }

    if (!formData.value.color) {
        errors.value.color = 'El color es requerido';
    } else {
        // Normalizar el color: agregar # si no lo tiene
        let colorValue = formData.value.color;
        if (!colorValue.startsWith('#')) {
            colorValue = '#' + colorValue;
        }

        if (!/^#[0-9A-F]{6}$/i.test(colorValue)) {
            errors.value.color = 'El color debe ser un código hexadecimal válido';
        } else {
            // Actualizar el valor normalizado
            formData.value.color = colorValue;
        }
    }

    return Object.keys(errors.value).length === 0;
}

function guardarBanco() {
    if (validarFormulario()) {
        const bancoData = {
            ...formData.value,
            cuenta: formData.value.cuenta.replace(/\s/g, '') // Eliminar espacios
        };

        emit('guardar', bancoData);
    }
}

function cerrarDialogo() {
    emit('update:visible', false);
}
</script>

<style scoped>
.banco-form {
    @apply space-y-4;
}

.field {
    @apply space-y-1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    :deep(.p-dialog) {
        width: 95vw !important;
        margin: 0 auto;
    }
}
</style>
