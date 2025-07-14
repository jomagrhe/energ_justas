document.addEventListener('DOMContentLoaded', function() {
    const canvasElement = document.getElementById('BarChart');

    if (!canvasElement) {
        console.error("Error: No se encontró el elemento canvas con ID 'BarChart'.");
        return;
    }

    // Funciones de limpieza de datos (LAS MISMAS QUE ANTES)
    function wordToNumber(word) {
        word = word.toLowerCase().trim();
        const numberMap = {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
            'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
            'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
            'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
            'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
            'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
            'eighty': 80, 'ninety': 90
        };

        const largeNumberMap = {
            'hundred': 100, 'thousand': 1000, 'million': 1000000, 'billion': 1000000000
        };

        if (word.includes('point')) {
            const parts = word.split('point');
            const integerPart = numberMap[parts[0]];
            const decimalPart = numberMap[parts[1]];
            if (integerPart !== undefined && decimalPart !== undefined) {
                return parseFloat(`${integerPart}.${decimalPart}`);
            }
        } else if (word.includes('-')) {
            const parts = word.split('-');
            const tens = numberMap[parts[0]];
            const units = numberMap[parts[1]];
            if (tens !== undefined && units !== undefined) {
                return tens + units;
            }
        }

        if (word.includes('thousand')) {
            const parts = word.split('thousand').map(p => p.trim());
            const thousands = numberMap[parts[0]];
            if (thousands !== undefined) {
                return thousands * largeNumberMap['thousand'];
            }
        }
        if (word.includes('hundred')) {
             const parts = word.split('hundred').map(p => p.trim());
             const hundreds = numberMap[parts[0]];
             if (hundreds !== undefined) {
                 return hundreds * largeNumberMap['hundred'];
             }
         }

        return numberMap[word];
    }

    function parseNumericValue(value, key) {
        if (value === null || typeof value === 'undefined') {
            return null;
        }
        if (typeof value === 'number') {
            if (value < 0 && (key === 'Renewable_Energy_GWh' || key === 'Investment_USD_m')) {
                return null;
            }
            return value;
        }
        if (typeof value === 'string') {
            let cleanedValue = value.trim().replace(/,/g, '').replace('%', '');

            const wordNum = wordToNumber(cleanedValue);
            if (wordNum !== undefined && wordNum !== null) {
                if (wordNum < 0 && (key === 'Renewable_Energy_GWh' || key === 'Investment_USD_m')) {
                    return null;
                }
                return wordNum;
            }

            const parsed = parseFloat(cleanedValue);
            if (!isNaN(parsed) && parsed < 0 && (key === 'Renewable_Energy_GWh' || key === 'Investment_USD_m')) {
                return null;
            }
            return isNaN(parsed) ? null : parsed;
        }
        return null;
    }

    function parseYear(yearValue) {
        if (typeof yearValue === 'string') {
            const parsedWordYear = wordToNumber(yearValue.replace(/-/g, ' '));
            if (parsedWordYear !== undefined && parsedWordYear !== null && parsedWordYear > 1900 && parsedWordYear < 2100) {
                return parsedWordYear;
            }
            if (yearValue.includes('-')) {
                return parseInt(yearValue.substring(0, 4), 10);
            }
            return parseInt(yearValue, 10);
        }
        return yearValue;
    }


    // === PASO 1: Cargar el archivo JSON ===
    fetch('energy_transition_dirty.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(jsonData => {
            // === PASO 2: Procesar y limpiar los datos JSON ===
            const cleanData = jsonData.map(item => {
                const cleanedItem = {
                    Country: item.Country ? item.Country.trim() : null,
                    Year: parseYear(item.Year),
                    Total_Energy_GWh: parseNumericValue(item.Total_Energy_GWh, 'Total_Energy_GWh'),
                    Renewable_Energy_GWh: parseNumericValue(item.Renewable_Energy_GWh, 'Renewable_Energy_GWh'),
                    Renewable_Share_percent: parseNumericValue(item.Renewable_Share_percent, 'Renewable_Share_percent'),
                    CO2_Emissions_kT: parseNumericValue(item.CO2_Emissions_kT, 'CO2_Emissions_kT'),
                    Investment_USD_m: parseNumericValue(item.Investment_USD_m, 'Investment_USD_m')
                };

                if (cleanedItem.Country === null || isNaN(cleanedItem.Year) || cleanedItem.Year === null) {
                    return null;
                }
                return cleanedItem;
            }).filter(item => item !== null);

            // === PASO 3: Filtrar y preparar datos para gráfico de líneas ===

            // Define los años que quieres comparar
            const yearsToCompare = [2018, 2019, 2020, 2021, 2022, 2023]; // O puedes elegir los últimos 3: [2021, 2022, 2023]

            // Filtra los datos para incluir solo los años deseados y los países relevantes
            const filteredData = cleanData.filter(item =>
                yearsToCompare.includes(item.Year) &&
                item.CO2_Emissions_kT !== null && item.CO2_Emissions_kT >= 0 // Asegúrate de tener datos válidos para trazar
            );

            // Obtener todos los años únicos presentes en los datos filtrados para usar como etiquetas del eje X
            const uniqueYears = [...new Set(filteredData.map(item => item.Year))].sort((a, b) => a - b);

            // Obtener todos los países únicos presentes en los datos filtrados
            const uniqueCountries = [...new Set(filteredData.map(item => item.Country))];

            // Preparar los datasets para el gráfico de líneas
            const datasets = uniqueCountries.map((country, index) => {
                const countryData = uniqueYears.map(year => {
                    const record = filteredData.find(d => d.Country === country && d.Year === year);
                    return record ? record.CO2_Emissions_kT : null; // Usa null para años sin datos
                });

                // Generar un color único para cada línea
                const hue = (index * 60) % 360; // 60 grados de diferencia por color
                return {
                    label: country,
                    data: countryData,
                    borderColor: `hsl(${hue}, 70%, 50%)`, // Color de la línea
                    backgroundColor: `hsl(${hue}, 70%, 60%, 0.2)`, // Color de fondo del área bajo la línea (opcional)
                    fill: false, // No rellenar el área bajo la línea
                    tension: 0.3, // Suavizar la línea (opcional)
                    pointRadius: 5,
                    pointHoverRadius: 8
                };
            });

            // === PASO 4: Configurar y dibujar el gráfico ===
            const chartData = {
                labels: uniqueYears, // Los años como etiquetas del eje X
                datasets: datasets // Cada país es un dataset
            };

            const config = {
                type: 'line', // Cambiamos el tipo a 'line'
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'category', // El eje X es categórico (años)
                            title: {
                                display: true,
                                text: 'Año',
                                color: '#d1d5db'
                            },
                            ticks: {
                                color: '#d1d5db'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Emisiones de CO2 (kT)',
                                color: '#d1d5db'
                            },
                            ticks: {
                                // Ajustar el callback para un rango de CO2, por ejemplo cada 50,000 kT
                                callback: function(value, index, values) {
                                    if (value % 50000 === 0) { // Muestra cada 50,000 kT
                                        return value.toLocaleString(); // Formato con comas
                                    }
                                    return null;
                                },
                                color: '#d1d5db',
                            },
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Emisiones de CO2 por País (Comparativa Anual)',
                            font: {
                                size: 20
                            },
                            color: '#4caf50'
                        },
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#d1d5db'
                            }
                        },
                        tooltip: { // Mejora la visualización del tooltip
                            mode: 'index',
                            intersect: false
                        }
                    }
                }
            };

            new Chart(canvasElement, config);
        })
        .catch(error => {
            console.error('Error al cargar o procesar los datos JSON:', error);
            canvasElement.parentNode.innerHTML = '<p style="color: red; text-align: center;">No se pudieron cargar los datos del gráfico. Verifique el archivo JSON y la consola para errores.</p>';
        });
});