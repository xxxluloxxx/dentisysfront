<script setup>
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    producto: {
        type: Object,
        default: () => ({})
    },
    isSaving: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

function hideDialog() {
    emit('update:visible', false);
}

function confirmDelete() {
    emit('confirm');
}

function cancel() {
    hideDialog();
    emit('cancel');
}
</script>

<template>
    <Dialog
        :visible="visible"
        :style="{ width: '450px' }"
        header="Confirmar"
        :modal="true"
        @update:visible="(val) => emit('update:visible', val)"
    >
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="producto">
                ¿Estás seguro de querer eliminar este producto <b>{{ producto.nombre }}</b>?
            </span>
        </div>
        <template #footer>
            <Button
                label="No"
                icon="pi pi-times"
                text
                @click="cancel"
                aria-label="Cancelar eliminación"
            />
            <Button
                label="Sí"
                icon="pi pi-check"
                @click="confirmDelete"
                :loading="isSaving"
                aria-label="Confirmar eliminación"
            />
        </template>
    </Dialog>
</template>

<style scoped>
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
</style>
