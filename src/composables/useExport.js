import { readonly, ref } from 'vue';

export function useExport() {
    const isExporting = ref(false);

    // Función para exportar a CSV
    function exportToCSV(data, filename = 'export.csv', headers = []) {
        try {
            isExporting.value = true;

            // Si no hay datos, mostrar mensaje
            if (!data || data.length === 0) {
                throw new Error('No hay datos para exportar');
            }

            // Determinar headers automáticamente si no se proporcionan
            const csvHeaders = headers.length > 0 ? headers : Object.keys(data[0]);

            // Crear contenido CSV
            const csvContent = [
                csvHeaders.join(','),
                ...data.map(row =>
                    csvHeaders.map(header => {
                        const value = row[header];
                        // Escapar comillas y envolver en comillas si contiene coma o comilla
                        const escapedValue = String(value || '').replace(/"/g, '""');
                        return escapedValue.includes(',') || escapedValue.includes('"')
                            ? `"${escapedValue}"`
                            : escapedValue;
                    }).join(',')
                )
            ].join('\n');

            // Crear y descargar archivo
            downloadFile(csvContent, filename, 'text/csv');

            return true;
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            throw error;
        } finally {
            isExporting.value = false;
        }
    }

    // Función para exportar a JSON
    function exportToJSON(data, filename = 'export.json') {
        try {
            isExporting.value = true;

            if (!data || data.length === 0) {
                throw new Error('No hay datos para exportar');
            }

            const jsonContent = JSON.stringify(data, null, 2);
            downloadFile(jsonContent, filename, 'application/json');

            return true;
        } catch (error) {
            console.error('Error al exportar JSON:', error);
            throw error;
        } finally {
            isExporting.value = false;
        }
    }

    // Función para exportar a Excel (XLSX) usando una librería externa
    async function exportToExcel(data, filename = 'export.xlsx', sheetName = 'Datos') {
        try {
            isExporting.value = true;

            if (!data || data.length === 0) {
                throw new Error('No hay datos para exportar');
            }

            // Nota: Para usar esta función, necesitarías instalar una librería como 'xlsx'
            // import * as XLSX from 'xlsx';

            // const workbook = XLSX.utils.book_new();
            // const worksheet = XLSX.utils.json_to_sheet(data);
            // XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            // XLSX.writeFile(workbook, filename);

            console.warn('Exportación a Excel requiere la librería xlsx. Usando CSV como alternativa.');
            return exportToCSV(data, filename.replace('.xlsx', '.csv'));
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            throw error;
        } finally {
            isExporting.value = false;
        }
    }

    // Función para exportar datos de médicos específicamente
    function exportMedicos(medicos, format = 'csv') {
        if (!medicos || medicos.length === 0) {
            throw new Error('No hay médicos para exportar');
        }

        // Preparar datos para exportación
        const exportData = medicos.map(medico => ({
            'Número de Documento': medico.numeroDocumento || '',
            'Nombre': medico.nombre || '',
            'Apellido': medico.apellido || '',
            'Nombre Completo': `${medico.nombre || ''} ${medico.apellido || ''}`.trim(),
            'Email': medico.email || '',
            'Teléfono': medico.telefono || '',
            'Especialidad': medico.especialidad || '',
            'Dirección': medico.direccion || '',
            'ID': medico.id || ''
        }));

        const headers = [
            'Número de Documento',
            'Nombre',
            'Apellido',
            'Nombre Completo',
            'Email',
            'Teléfono',
            'Especialidad',
            'Dirección',
            'ID'
        ];

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `medicos_${timestamp}.${format}`;

        switch (format.toLowerCase()) {
            case 'csv':
                return exportToCSV(exportData, filename, headers);
            case 'json':
                return exportToJSON(exportData, filename);
            case 'xlsx':
            case 'excel':
                return exportToExcel(exportData, filename, 'Médicos');
            default:
                throw new Error(`Formato de exportación no soportado: ${format}`);
        }
    }

    // Función para exportar datos de pacientes
    function exportPacientes(pacientes, format = 'csv') {
        if (!pacientes || pacientes.length === 0) {
            throw new Error('No hay pacientes para exportar');
        }

        const exportData = pacientes.map(paciente => ({
            'Número de Documento': paciente.numeroDocumento || '',
            'Nombre': paciente.nombre || '',
            'Apellido': paciente.apellido || '',
            'Nombre Completo': `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim(),
            'Email': paciente.email || '',
            'Teléfono': paciente.telefono || '',
            'Fecha de Nacimiento': paciente.fechaNacimiento || '',
            'Dirección': paciente.direccion || '',
            'ID': paciente.id || ''
        }));

        const headers = [
            'Número de Documento',
            'Nombre',
            'Apellido',
            'Nombre Completo',
            'Email',
            'Teléfono',
            'Fecha de Nacimiento',
            'Dirección',
            'ID'
        ];

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `pacientes_${timestamp}.${format}`;

        switch (format.toLowerCase()) {
            case 'csv':
                return exportToCSV(exportData, filename, headers);
            case 'json':
                return exportToJSON(exportData, filename);
            case 'xlsx':
            case 'excel':
                return exportToExcel(exportData, filename, 'Pacientes');
            default:
                throw new Error(`Formato de exportación no soportado: ${format}`);
        }
    }

    // Función auxiliar para descargar archivos
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Función para obtener formatos soportados
    function getSupportedFormats() {
        return [
            { value: 'csv', label: 'CSV', description: 'Archivo de valores separados por comas' },
            { value: 'json', label: 'JSON', description: 'Archivo de datos estructurados' },
            { value: 'xlsx', label: 'Excel', description: 'Archivo de Microsoft Excel' }
        ];
    }

    return {
        // Estados
        isExporting: readonly(isExporting),

        // Funciones de exportación
        exportToCSV,
        exportToJSON,
        exportToExcel,

        // Funciones específicas por entidad
        exportMedicos,
        exportPacientes,

        // Funciones de utilidad
        getSupportedFormats
    };
}
