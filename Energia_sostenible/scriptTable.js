document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("./energy_transition_dirty.json");
  const data = await response.json();

  const tabla = document.querySelector("#tablaSostenibilidad tbody");

  // Crear un mapa de país -> registro más reciente con datos válidos
  const datosPorPais = {};

  data.forEach((entry) => {
    const pais = entry.Country;
    const anio = entry.Year;

    if (!datosPorPais[pais] || entry.Year > datosPorPais[pais].Year) {
      if (
        typeof entry.Renewable_Share_percent === "number" &&
        typeof entry.CO2_Emissions_kT === "number" &&
        typeof entry.Investment_USD_m === "number"
      ) {
        datosPorPais[pais] = entry;
      }
    }
  });

  // Insertar las filas en la tabla
  Object.values(datosPorPais).forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${entry.Country}</td>
            <td>${entry.Renewable_Share_percent.toFixed(1)}%</td>
            <td>${entry.CO2_Emissions_kT.toLocaleString()}</td>
            <td>${entry.Investment_USD_m.toLocaleString()}</td>
        `;
    tabla.appendChild(tr);
  });
});
