<template>
    <Dialog
        :visible="visible"
        :modal="true"
        header="Confirmar Eliminación"
        :style="{ width: '400px' }"
        @update:visible="$emit('update:visible', $event)"
        :closable="!loading"
        :closeOnEscape="!loading"
    >
        <div class="confirmation-content">
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-3xl" style="color: #f59e0b"></i>
                <div>
                    <h3 class="text-lg font-semibold" style="color: var(--text-color)">
                        ¿Eliminar banco?
                    </h3>
                </div>
            </div>

            <p style="color: var(--text-color-secondary)" class="mb-4">
                ¿Estás seguro de que deseas eliminar el banco
                <strong style="color: var(--text-color)">{{ banco?.nombreCuenta }}</strong>?
            </p>

            <div class="banco-details p-3 rounded-lg" style="background-color: var(--surface-100); border: 1px solid var(--surface-border);">
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span style="color: var(--text-color-secondary)">Banco:</span>
                        <span style="color: var(--text-color)" class="ml-1">{{ banco?.banco }}</span>
                    </div>
                    <div>
                        <span style="color: var(--text-color-secondary)">Cuenta:</span>
                        <span style="color: var(--text-color)" class="ml-1 font-mono">{{ banco?.cuenta }}</span>
                    </div>
                </div>
            </div>

            <div class="mt-4 p-3 rounded-lg" style="background-color: #fef3c7; border: 1px solid #f59e0b;">
                <p class="text-sm" style="color: #92400e;">
                    <i class="pi pi-info-circle mr-2"></i>
                    Esta acción no se puede deshacer. Todos los datos asociados a este banco serán eliminados permanentemente.
                </p>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    @click="cancelar"
                    class="p-button-text"
                    :disabled="loading"
                />
                <Button
                    label="Eliminar"
                    icon="pi pi-trash"
                    @click="confirmarEliminacion"
                    :loading="loading"
                    class="p-button-danger"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
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
const emit = defineEmits(['update:visible', 'confirmar']);

// Métodos
function cancelar() {
    emit('update:visible', false);
}

function confirmarEliminacion() {
    emit('confirmar', props.banco);
}
</script>

<style scoped>
.confirmation-content {
    @apply space-y-4;
}

.banco-details {
    @apply space-y-2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    :deep(.p-dialog) {
        width: 95vw !important;
        margin: 0 auto;
    }
}
</style>
