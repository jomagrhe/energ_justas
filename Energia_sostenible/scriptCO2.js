document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("./energy_transition_dirty.json");
  const data = await response.json();

  const rentabilidadPorPais = {};

  data.forEach((d) => {
    const pais = d.Country;
    const energia = parseFloat(d.Total_Energy_GWh);
    const inversion = parseFloat(d.Investment_USD_m);

    if (!isNaN(energia) && !isNaN(inversion) && inversion > 0) {
      if (!rentabilidadPorPais[pais]) {
        rentabilidadPorPais[pais] = { energia: 0, inversion: 0 };
      }
      rentabilidadPorPais[pais].energia += energia;
      rentabilidadPorPais[pais].inversion += inversion;
    }
  });

  // Calcular rentabilidad y crear lista
  const listaRentabilidad = Object.entries(rentabilidadPorPais).map(
    ([pais, val]) => ({
      pais,
      rentabilidad: val.energia / val.inversion,
    })
  );

  // Ordenar y tomar los 5 más rentables
  const top5 = listaRentabilidad
    .sort((a, b) => b.rentabilidad - a.rentabilidad)
    .slice(0, 5);

  const ctx = document.getElementById("graficoCo2").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: top5.map((d) => d.pais),
      datasets: [
        {
          label: "GWh por millón USD",
          data: top5.map((d) => d.rentabilidad.toFixed(2)),
          backgroundColor: [
            "#4CAF50",
            "#2196F3",
            "#FF9800",
            "#E91E63",
            "#9C27B0",
          ],
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Top 5 países más rentables en energía",
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "GWh por millón USD",
          },
        },
        x: {
          title: {
            display: true,
            text: "País",
          },
        },
      },
    },
  });
});
