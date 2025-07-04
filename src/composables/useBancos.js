import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { BancoService } from '../service/BancoService';

export function useBancos() {
    // Estados reactivos
    const bancos = ref([]);
    const loading = ref(false);
    const formLoading = ref(false);
    const deleteLoading = ref(false);
    const searchTerm = ref('');

    // Toast
    const toast = useToast();

    // Métodos
    async function cargarBancos() {
        loading.value = true;
        try {
            const data = await BancoService.getAll();
            bancos.value = data;
            console.log('✅ Bancos cargados exitosamente:', data.length);
        } catch (error) {
            console.error('❌ Error al cargar bancos:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los bancos',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    async function crearBanco(bancoData) {
        formLoading.value = true;
        try {
            const nuevoBanco = await BancoService.create(bancoData);
            bancos.value.push(nuevoBanco);

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Banco creado exitosamente',
                life: 3000
            });

            return true;
        } catch (error) {
            console.error('❌ Error al crear banco:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'No se pudo crear el banco',
                life: 3000
            });
            return false;
        } finally {
            formLoading.value = false;
        }
    }

    async function actualizarBanco(id, bancoData) {
        formLoading.value = true;
        try {
            const bancoActualizado = await BancoService.update(id, bancoData);
            const index = bancos.value.findIndex(b => b.id === id);

            if (index !== -1) {
                bancos.value[index] = bancoActualizado;
            }

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Banco actualizado exitosamente',
                life: 3000
            });

            return true;
        } catch (error) {
            console.error('❌ Error al actualizar banco:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'No se pudo actualizar el banco',
                life: 3000
            });
            return false;
        } finally {
            formLoading.value = false;
        }
    }

    async function eliminarBanco(id) {
        deleteLoading.value = true;
        try {
            await BancoService.delete(id);
            bancos.value = bancos.value.filter(b => b.id !== id);

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Banco eliminado exitosamente',
                life: 3000
            });

            return true;
        } catch (error) {
            console.error('❌ Error al eliminar banco:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'No se pudo eliminar el banco',
                life: 3000
            });
            return false;
        } finally {
            deleteLoading.value = false;
        }
    }

    function filtrarBancos(termino) {
        searchTerm.value = termino;
        if (!termino) {
            return bancos.value;
        }

        const terminoLower = termino.toLowerCase();
        return bancos.value.filter(banco =>
            banco.nombreCuenta?.toLowerCase().includes(terminoLower) ||
            banco.banco?.toLowerCase().includes(terminoLower) ||
            banco.cuenta?.toLowerCase().includes(terminoLower)
        );
    }

    function exportarBancos() {
        try {
            if (bancos.value.length === 0) {
                toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No hay bancos para exportar',
                    life: 3000
                });
                return;
            }

            const datosExportar = bancos.value.map(banco => ({
                'Nombre de Cuenta': banco.nombreCuenta,
                'Banco': banco.banco,
                'Número de Cuenta': banco.cuenta,
                'Color': banco.color
            }));

            const csvContent = "data:text/csv;charset=utf-8,"
                + Object.keys(datosExportar[0]).join(",") + "\n"
                + datosExportar.map(row => Object.values(row).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `bancos_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Datos exportados exitosamente',
                life: 3000
            });
        } catch (error) {
            console.error('❌ Error al exportar:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron exportar los datos',
                life: 3000
            });
        }
    }

    // Computed
    const bancosFiltrados = computed(() => filtrarBancos(searchTerm.value));

    // Lifecycle
    onMounted(() => {
        cargarBancos();
    });

    return {
        // Estados
        bancos,
        loading,
        formLoading,
        deleteLoading,
        searchTerm,
        bancosFiltrados,

        // Métodos
        cargarBancos,
        crearBanco,
        actualizarBanco,
        eliminarBanco,
        filtrarBancos,
        exportarBancos
    };
}
