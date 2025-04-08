<script setup>
import { ref, onMounted } from 'vue';
import { CategoriasFinancierasService } from '@/service/CategoriaFinancieraService';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';

const categorias = ref([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const categoriaSeleccionada = ref(null);

const formData = ref({
    nombre: '',
    descripcion: '',
    ingreso: false
});

const cargarCategorias = async () => {
    try {
        const response = await CategoriasFinancierasService.getAll();
        categorias.value = response;
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};

const openModal = (categoria = null) => {
    categoriaSeleccionada.value = categoria;
    if (categoria) {
        formData.value = { ...categoria };
    } else {
        formData.value = {
            nombre: '',
            descripcion: '',
            ingreso: false
        };
    }
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    categoriaSeleccionada.value = null;
    formData.value = {
        nombre: '',
        descripcion: '',
        ingreso: false
    };
};

const guardarCategoria = async () => {
    try {
        if (categoriaSeleccionada.value) {
            // TODO: Implementar actualización
            // await CategoriasFinancierasService.update(categoriaSeleccionada.value.id, formData.value)
        } else {
            // TODO: Implementar creación
            // await CategoriasFinancierasService.create(formData.value)
        }
        await cargarCategorias();
        closeModal();
    } catch (error) {
        console.error('Error al guardar categoría:', error);
    }
};

const confirmarEliminar = (categoria) => {
    categoriaSeleccionada.value = categoria;
    showDeleteModal.value = true;
};

const eliminarCategoria = async () => {
    try {
        // TODO: Implementar eliminación
        // await CategoriasFinancierasService.delete(categoriaSeleccionada.value.id)
        await cargarCategorias();
        showDeleteModal.value = false;
        categoriaSeleccionada.value = null;
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
    }
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

onMounted(() => {
    cargarCategorias();
});
</script>

<template>
    <div class="categoria-financiera-container">
        <div class="header-section">
            <h1 class="text-2xl font-bold mb-4">Categorías Financieras</h1>
            <button @click="openModal()" class="btn-primary flex items-center gap-2">
                <i class="pi pi-plus"></i>
                Nueva Categoría
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="categoria in categorias" :key="categoria.id" class="categoria-card" :class="{ ingreso: categoria.ingreso, gasto: !categoria.ingreso }">
                <div class="card-header">
                    <h3 class="text-xl font-semibold">{{ categoria.nombre }}</h3>
                    <div class="tipo-badge" :class="{ ingreso: categoria.ingreso, gasto: !categoria.ingreso }">
                        {{ categoria.ingreso ? 'Ingreso' : 'Gasto' }}
                    </div>
                </div>
                <p class="descripcion">{{ categoria.descripcion }}</p>
                <div class="card-footer">
                    <div class="fechas">
                        <small>Creado: {{ formatDate(categoria.createdAt) }}</small>
                    </div>
                    <div class="acciones">
                        <button @click="openModal(categoria)" class="btn-icon" title="Editar">
                            <i class="pi pi-pencil"></i>
                        </button>
                        <button @click="confirmarEliminar(categoria)" class="btn-icon delete" title="Eliminar">
                            <i class="pi pi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para Crear/Editar -->
        <Dialog v-model:visible="showModal" :modal="true" :header="categoriaSeleccionada ? 'Editar Categoría' : 'Nueva Categoría'" class="p-fluid">
            <div class="form-container">
                <div class="field">
                    <label for="nombre">Nombre</label>
                    <InputText id="nombre" v-model="formData.nombre" required autofocus />
                </div>
                <div class="field">
                    <label for="descripcion">Descripción</label>
                    <Textarea id="descripcion" v-model="formData.descripcion" rows="3" required />
                </div>
                <div class="field">
                    <label class="flex items-center gap-2">
                        <Checkbox v-model="formData.ingreso" :binary="true" />
                        Es un ingreso
                    </label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" @click="closeModal" class="p-button-text" />
                <Button label="Guardar" icon="pi pi-check" @click="guardarCategoria" class="p-button-success" />
            </template>
        </Dialog>

        <!-- Modal de Confirmación de Eliminación -->
        <Dialog v-model:visible="showDeleteModal" :modal="true" header="Confirmar Eliminación" class="p-fluid">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span>¿Está seguro de eliminar la categoría "{{ categoriaSeleccionada?.nombre }}"?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" @click="showDeleteModal = false" class="p-button-text" />
                <Button label="Sí" icon="pi pi-check" @click="eliminarCategoria" class="p-button-danger" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.categoria-financiera-container {
    padding: 1.5rem;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.categoria-card {
    background: var(--surface-card);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    border-left: 4px solid var(--surface-border);
}

.categoria-card.ingreso {
    border-left-color: var(--green-500);
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), var(--surface-card));
}

.categoria-card.gasto {
    border-left-color: var(--red-500);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--surface-card));
}

.categoria-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.tipo-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tipo-badge.ingreso {
    background-color: rgba(34, 197, 94, 0.2);
    color: var(--green-500);
    border: 1px solid var(--green-500);
}

.tipo-badge.gasto {
    background-color: rgba(239, 68, 68, 0.2);
    color: var(--red-500);
    border: 1px solid var(--red-500);
}

.descripcion {
    color: var(--text-color-secondary);
    margin-bottom: 1rem;
    line-height: 1.5;
    padding: 0.5rem;
    background-color: var(--surface-hover);
    border-radius: 0.5rem;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--surface-border);
}

.fechas {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

.acciones {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
}

.btn-icon:hover {
    background-color: var(--surface-hover);
}

.btn-icon.delete:hover {
    background-color: var(--red-100);
    color: var(--red-700);
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

:deep(.p-dialog) {
    max-width: 500px;
}

:deep(.p-dialog .p-dialog-header) {
    padding: 1rem;
}

:deep(.p-dialog .p-dialog-content) {
    padding: 1rem;
}

:deep(.p-dialog .p-dialog-footer) {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}
</style>
