<script setup>
import { computed } from 'vue';

const props = defineProps({
    filters: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['new', 'export', 'update:filters']);

const searchValue = computed({
    get: () => props.filters['global'].value,
    set: (value) => {
        emit('update:filters', { ...props.filters, global: { ...props.filters.global, value } });
    }
});
</script>

<template>
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 mb-4 rounded-t-lg">
        <div class="flex items-center gap-3">
            <i class="pi pi-user-md text-2xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white m-0">Médicos</h2>
        </div>
        <div class="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
            <div class="flex gap-2 w-full md:w-auto">
                <Tooltip target=".btn-nuevo" />
                <Button label="Nuevo" icon="pi pi-plus" severity="secondary" class="btn-nuevo font-semibold px-4 py-2" @click="emit('new')" aria-label="Agregar nuevo médico" v-tooltip.top="'Agregar nuevo médico'" />
                <Tooltip target=".btn-exportar" />
                <Button label="Exportar" icon="pi pi-upload" severity="secondary" class="btn-exportar font-semibold px-4 py-2" @click="emit('export')" aria-label="Exportar médicos" v-tooltip.top="'Exportar médicos a CSV'" />
            </div>
            <div class="relative flex-1 md:w-64">
                <IconField class="w-full">
                    <InputIcon>
                        <i class="pi pi-search text-blue-500" />
                    </InputIcon>
                    <InputText v-model="searchValue" placeholder="Buscar médicos..." aria-label="Buscar médicos" class="w-full pl-10 py-2 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
                </IconField>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Botones de acción */
.btn-nuevo,
.btn-exportar {
    transition:
        box-shadow 0.2s,
        transform 0.2s;
    box-shadow: 0 1px 4px 0 rgba(59, 130, 246, 0.08);
    border-radius: 50px;
}

.btn-nuevo:hover {
    background: #e0f2fe !important;
    color: #2563eb !important;
    transform: translateY(-2px) scale(1.05);
}

.btn-exportar:hover {
    background: #fef9c3 !important;
    color: #ca8a04 !important;
    transform: translateY(-2px) scale(1.05);
}

/* Mejorar tooltips */
:deep(.p-tooltip) {
    font-size: 1rem;
    border-radius: 6px;
    background: #2563eb;
    color: #fff;
    padding: 0.5em 1em;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}
</style>
