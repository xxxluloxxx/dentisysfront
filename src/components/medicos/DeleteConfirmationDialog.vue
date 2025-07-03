<script setup>
import { computed } from 'vue';

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

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const medicoNombre = computed(() => {
    if (props.medico && props.medico.nombre && props.medico.apellido) {
        return `${props.medico.nombre} ${props.medico.apellido}`;
    }
    return 'este médico';
});

function handleConfirm() {
    emit('confirm', props.medico);
}

function handleCancel() {
    emit('cancel');
}

function hideDialog() {
    emit('update:visible', false);
    handleCancel();
}
</script>

<template>
    <Dialog
        :visible="visible"
        :style="{ width: '450px' }"
        header="Confirmar"
        :modal="true"
        @update:visible="hideDialog"
    >
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl text-yellow-500" />
            <span v-if="medico">
                ¿Estás seguro de querer eliminar este médico <b>{{ medicoNombre }}</b>?
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
