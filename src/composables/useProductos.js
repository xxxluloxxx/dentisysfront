import { ProductoService } from '@/service/ProductoService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

export function useProductos() {
    const toast = useToast();

    // Estado reactivo
    const productos = ref([]);
    const loading = ref(true);
    const productoDialog = ref(false);
    const deleteProductoDialog = ref(false);
    const producto = ref({});
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const isSaving = ref(false);

    // Cargar productos
    function cargarProductos() {
        loading.value = true;
        ProductoService.getAllProducts()
            .then((data) => (productos.value = data))
            .catch((error) => {
                console.error('Error al cargar los productos:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al conectarse al servidor',
                    life: 4000
                });
            })
            .finally(() => {
                loading.value = false;
            });
    }

    // Abrir formulario para nuevo producto
    function openNew() {
        producto.value = {};
        productoDialog.value = true;
    }

    // Cerrar diálogo
    function hideDialog() {
        productoDialog.value = false;
    }

    // Guardar producto (crear o actualizar)
    function saveProduct(productoData) {
        isSaving.value = true;
        const data = {
            codigo: productoData.codigo,
            nombre: productoData.nombre,
            descripcion: productoData.descripcion,
            precio: productoData.precio,
            categoria: productoData.categoria
        };

        if (productoData.id) {
            updateProduct(data);
        } else {
            createProduct(data);
        }
    }

    // Crear nuevo producto
    function createProduct(productoData) {
        ProductoService.createProduct(productoData)
            .then((response) => {
                productos.value.push(response);
                productoDialog.value = false;
                producto.value = {};
                toast.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Producto creado correctamente',
                    life: 3000
                });
            })
            .catch((error) => {
                console.error('Error al crear el producto:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo crear el producto',
                    life: 4000
                });
            })
            .finally(() => {
                isSaving.value = false;
            });
    }

    // Actualizar producto existente
    function updateProduct(productoData) {
        ProductoService.updateProduct(producto.value.id, productoData)
            .then((response) => {
                const index = findIndexById(producto.value.id);
                if (index !== -1) {
                    productos.value[index] = response;
                }
                productoDialog.value = false;
                producto.value = {};
                toast.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Producto actualizado correctamente',
                    life: 3000
                });
            })
            .catch((error) => {
                console.error('Error al actualizar el producto:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar el producto',
                    life: 4000
                });
            })
            .finally(() => {
                isSaving.value = false;
            });
    }

    // Editar producto
    function editProduct(prod) {
        producto.value = { ...prod };
        productoDialog.value = true;
    }

    // Confirmar eliminación
    function confirmDeleteProduct(prod) {
        producto.value = prod;
        deleteProductoDialog.value = true;
    }

    // Eliminar producto
    function deleteProduct() {
        ProductoService.deleteProduct(producto.value.id)
            .then(() => {
                productos.value = productos.value.filter((val) => val.id !== producto.value.id);
                deleteProductoDialog.value = false;
                producto.value = {};
                toast.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Producto eliminado correctamente',
                    life: 3000
                });
            })
            .catch((error) => {
                console.error('Error al eliminar el producto:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar el producto',
                    life: 4000
                });
            });
    }

    // Buscar índice por ID
    function findIndexById(id) {
        return productos.value.findIndex((p) => p.id === id);
    }

    // Cargar datos al montar el componente
    onMounted(() => {
        cargarProductos();
    });

    return {
        // Estado
        productos,
        loading,
        productoDialog,
        deleteProductoDialog,
        producto,
        filters,
        isSaving,

        // Métodos
        cargarProductos,
        openNew,
        hideDialog,
        saveProduct,
        editProduct,
        confirmDeleteProduct,
        deleteProduct,
        findIndexById
    };
}
