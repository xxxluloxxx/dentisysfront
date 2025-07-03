<script setup>
import { ref } from 'vue';

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

const emit = defineEmits(['update:visible', 'save', 'cancel']);

const submitted = ref(false);

function hideDialog() {
    emit('update:visible', false);
    submitted.value = false;
}

function saveProduct() {
    submitted.value = true;
    if (!props.producto.nombre?.trim() || !props.producto.categoria?.trim() || !props.producto.descripcion?.trim()) {
        return false;
    }
    emit('save', props.producto);
    return true;
}

function cancel() {
    hideDialog();
    emit('cancel');
}
</script>

<template>
    <Dialog
        :visible="visible"
        :style="{ width: '90vw', maxWidth: '450px' }"
        header="Detalles del Producto"
        :modal="true"
        class="p-fluid"
        @update:visible="(val) => emit('update:visible', val)"
    >
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="field">
                    <label for="nombre" class="block font-bold mb-2">Nombre</label>
                    <InputText
                        id="nombre"
                        v-model.trim="producto.nombre"
                        required="true"
                        autofocus
                        :invalid="submitted && !producto.nombre"
                        class="w-full"
                        aria-required="true"
                        aria-label="Nombre"
                    />
                    <small v-if="submitted && !producto.nombre" class="text-red-500">El nombre es requerido.</small>
                </div>
                <div class="field">
                    <label for="categoria" class="block font-bold mb-2">Categoría</label>
                    <InputText
                        id="categoria"
                        v-model.trim="producto.categoria"
                        placeholder="Ingrese la categoría"
                        required="true"
                        :invalid="submitted && !producto.categoria"
                        class="w-full"
                        aria-required="true"
                        aria-label="Categoría"
                    />
                    <small v-if="submitted && !producto.categoria" class="text-red-500">La categoría es requerida.</small>
                </div>
            </div>

            <div class="field">
                <label for="description" class="block font-bold mb-2">Descripción</label>
                <Textarea
                    id="description"
                    v-model="producto.descripcion"
                    required="true"
                    rows="3"
                    cols="20"
                    class="w-full"
                    aria-required="true"
                    aria-label="Descripción"
                />
                <small v-if="submitted && !producto.descripcion" class="text-red-500">La descripción es requerida.</small>
            </div>

            <div class="field">
                <label for="price" class="block font-bold mb-2">Precio</label>
                <InputNumber
                    id="price"
                    v-model="producto.precio"
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    class="w-full"
                    aria-label="Precio"
                />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    text
                    @click="cancel"
                    aria-label="Cancelar"
                />
                <Button
                    label="Guardar"
                    icon="pi pi-check"
                    @click="saveProduct"
                    :loading="isSaving"
                    aria-label="Guardar producto"
                />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
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
