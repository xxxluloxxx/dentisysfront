import { FilterMatchMode } from '@primevue/core/api';
import { computed, ref } from 'vue';

export function useFilters(initialFilters = {}) {
    // Estado de filtros
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ...initialFilters
    });

    // Estado de ordenamiento
    const sortOrder = ref('asc');
    const sortField = ref('');

    // Computed para verificar si hay filtros activos
    const hasActiveFilters = computed(() => {
        return Object.values(filters.value).some(filter =>
            filter.value !== null && filter.value !== ''
        );
    });

    // Computed para obtener el término de búsqueda global
    const searchTerm = computed(() => filters.value.global?.value || '');

    // Funciones de filtrado
    function setGlobalFilter(value) {
        filters.value.global.value = value;
    }

    function clearGlobalFilter() {
        filters.value.global.value = null;
    }

    function setFilter(field, value, matchMode = FilterMatchMode.CONTAINS) {
        filters.value[field] = { value, matchMode };
    }

    function clearFilter(field) {
        if (filters.value[field]) {
            filters.value[field].value = null;
        }
    }

    function clearAllFilters() {
        Object.keys(filters.value).forEach(key => {
            filters.value[key].value = null;
        });
    }

    // Funciones de ordenamiento
    function toggleSort(field = '') {
        if (sortField.value === field) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortField.value = field;
            sortOrder.value = 'asc';
        }
    }

    function setSort(field, order = 'asc') {
        sortField.value = field;
        sortOrder.value = order;
    }

    function clearSort() {
        sortField.value = '';
        sortOrder.value = 'asc';
    }

    // Función genérica para filtrar datos
    function filterData(data, searchFields = []) {
        if (!data || !Array.isArray(data)) return [];

        let filteredData = [...data];

        // Aplicar filtro global
        if (searchTerm.value) {
            const term = searchTerm.value.toLowerCase();
            filteredData = filteredData.filter(item => {
                return searchFields.some(field => {
                    const value = item[field];
                    return value && value.toString().toLowerCase().includes(term);
                });
            });
        }

        // Aplicar filtros específicos
        Object.entries(filters.value).forEach(([key, filter]) => {
            if (key !== 'global' && filter.value !== null && filter.value !== '') {
                const term = filter.value.toString().toLowerCase();
                filteredData = filteredData.filter(item => {
                    const value = item[key];
                    if (!value) return false;

                    switch (filter.matchMode) {
                        case FilterMatchMode.CONTAINS:
                            return value.toString().toLowerCase().includes(term);
                        case FilterMatchMode.STARTS_WITH:
                            return value.toString().toLowerCase().startsWith(term);
                        case FilterMatchMode.ENDS_WITH:
                            return value.toString().toLowerCase().endsWith(term);
                        case FilterMatchMode.EQUALS:
                            return value.toString().toLowerCase() === term;
                        case FilterMatchMode.NOT_EQUALS:
                            return value.toString().toLowerCase() !== term;
                        default:
                            return value.toString().toLowerCase().includes(term);
                    }
                });
            }
        });

        // Aplicar ordenamiento
        if (sortField.value) {
            filteredData.sort((a, b) => {
                const aValue = a[sortField.value] || '';
                const bValue = b[sortField.value] || '';

                const comparison = aValue.toString().localeCompare(bValue.toString());
                return sortOrder.value === 'asc' ? comparison : -comparison;
            });
        }

        return filteredData;
    }

    // Función para obtener el estado actual de los filtros
    function getFilterState() {
        return {
            filters: filters.value,
            sortField: sortField.value,
            sortOrder: sortOrder.value,
            hasActiveFilters: hasActiveFilters.value,
            searchTerm: searchTerm.value
        };
    }

    // Función para restaurar el estado de los filtros
    function restoreFilterState(state) {
        if (state.filters) {
            filters.value = { ...state.filters };
        }
        if (state.sortField) {
            sortField.value = state.sortField;
        }
        if (state.sortOrder) {
            sortOrder.value = state.sortOrder;
        }
    }

    return {
        // Estados
        filters,
        sortOrder,
        sortField,

        // Computed
        hasActiveFilters,
        searchTerm,

        // Funciones de filtrado
        setGlobalFilter,
        clearGlobalFilter,
        setFilter,
        clearFilter,
        clearAllFilters,

        // Funciones de ordenamiento
        toggleSort,
        setSort,
        clearSort,

        // Funciones de utilidad
        filterData,
        getFilterState,
        restoreFilterState
    };
}
