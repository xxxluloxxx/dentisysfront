<script setup>
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    paciente: {
        type: Object,
        default: () => ({})
    },
    isSaving: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['confirm', 'cancel', 'update:visible']);

function handleConfirm() {
    emit('confirm');
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
    <Dialog :visible="visible" @update:visible="handleHide" :style="{ width: '450px' }" header="Confirmar" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="paciente">
                ¿Estás seguro de querer eliminar este paciente
                <b>{{ paciente.nombre }} {{ paciente.apellido }}</b
                >?
            </span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="handleCancel" aria-label="Cancelar eliminación" />
            <Button label="Sí" icon="pi pi-check" @click="handleConfirm" :loading="isSaving" aria-label="Confirmar eliminación" />
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
