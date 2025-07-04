<script setup>
// Imports de componentes
import BancoDeleteConfirmationDialog from '../../components/bancos/BancoDeleteConfirmationDialog.vue';
import BancoForm from '../../components/bancos/BancoForm.vue';
import BancosHeader from '../../components/bancos/BancosHeader.vue';
import BancosTable from '../../components/bancos/BancosTable.vue';

// Imports de composables
import { ref } from 'vue';
import { useBancos } from '../../composables/useBancos';

// Estados reactivos para los diálogos
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedBanco = ref(null);
const isEditing = ref(false);

// Composable
const { loading, formLoading, deleteLoading, bancosFiltrados, crearBanco, actualizarBanco, eliminarBanco, filtrarBancos, exportarBancos } = useBancos();

// Métodos
function handleNuevoBanco() {
    selectedBanco.value = null;
    isEditing.value = false;
    showFormDialog.value = true;
}

function handleEditarBanco(banco) {
    selectedBanco.value = banco;
    isEditing.value = true;
    showFormDialog.value = true;
}

function handleEliminarBanco(banco) {
    selectedBanco.value = banco;
    showDeleteDialog.value = true;
}

async function handleGuardarBanco(bancoData) {
    let success = false;

    if (isEditing.value) {
        success = await actualizarBanco(selectedBanco.value.id, bancoData);
    } else {
        success = await crearBanco(bancoData);
    }

    if (success) {
        showFormDialog.value = false;
        selectedBanco.value = null;
        isEditing.value = false;
    }
}

async function handleConfirmarEliminacion(banco) {
    const success = await eliminarBanco(banco.id);
    if (success) {
        showDeleteDialog.value = false;
        selectedBanco.value = null;
    }
}

function handleBuscar(termino) {
    filtrarBancos(termino);
}

function handleExportar() {
    exportarBancos();
}
</script>

<template>
    <div class="bancos-container">
        <!-- Header con filtros -->
        <BancosHeader @nuevo-banco="handleNuevoBanco" @exportar="handleExportar" @buscar="handleBuscar" />

        <!-- Tabla de bancos -->
        <BancosTable :bancos="bancosFiltrados" :loading="loading" @editar="handleEditarBanco" @eliminar="handleEliminarBanco" />

        <!-- Diálogo de formulario -->
        <BancoForm v-model:visible="showFormDialog" :banco="selectedBanco" :loading="formLoading" @guardar="handleGuardarBanco" />

        <!-- Diálogo de confirmación de eliminación -->
        <BancoDeleteConfirmationDialog v-model:visible="showDeleteDialog" :banco="selectedBanco" :loading="deleteLoading" @confirmar="handleConfirmarEliminacion" />
    </div>
</template>

<style scoped>
.bancos-container {
    @apply p-6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .bancos-container {
        @apply p-4;
    }
}
</style>
