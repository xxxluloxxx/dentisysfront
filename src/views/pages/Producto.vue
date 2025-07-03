<script setup>
import ProductoDeleteDialog from '@/components/productos/ProductoDeleteDialog.vue';
import ProductoForm from '@/components/productos/ProductoForm.vue';
import ProductosHeader from '@/components/productos/ProductosHeader.vue';
import ProductosTable from '@/components/productos/ProductosTable.vue';
import { useProductos } from '@/composables/useProductos';
import ProgressSpinner from 'primevue/progressspinner';

// Usar el composable de productos
const { productos, loading, productoDialog, deleteProductoDialog, producto, filters, isSaving, openNew, hideDialog, saveProduct, editProduct, confirmDeleteProduct, deleteProduct } = useProductos();
</script>

<template>
    <div>
        <!-- Spinner de carga global -->
        <div v-if="loading || isSaving" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" animationDuration="1.5s" aria-label="Cargando..." />
        </div>
        <div class="card" :aria-busy="loading || isSaving">
            <!-- Componente de header -->
            <ProductosHeader :filters="filters" @new="openNew" @export="() => {}" />
            <!-- Componente de tabla -->
            <ProductosTable :productos="productos" :loading="loading" :filters="filters" @edit="editProduct" @delete="confirmDeleteProduct" @new="openNew" @export="() => {}" />
        </div>

        <!-- Componente de formulario -->
        <ProductoForm v-model:visible="productoDialog" :producto="producto" :is-saving="isSaving" @save="saveProduct" @cancel="hideDialog" />

        <!-- Componente de diálogo de eliminación -->
        <ProductoDeleteDialog v-model:visible="deleteProductoDialog" :producto="producto" :is-saving="isSaving" @confirm="deleteProduct" @cancel="deleteProductoDialog = false" />
    </div>
</template>

<style scoped>
/* Spinner de carga */
:deep(.p-progress-spinner-circle) {
    stroke: #2563eb;
}
</style>
