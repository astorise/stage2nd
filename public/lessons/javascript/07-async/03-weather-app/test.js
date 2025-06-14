function testWeatherApp() {
  return [
    { name: "Fonction obtenirMeteoComplete existe", pass: typeof obtenirMeteoComplete === 'function' },
    { name: "Application WeatherApp créée", pass: typeof app !== 'undefined' },
    { name: "Interface météo présente", pass: document.getElementById('weatherResult') !== null }
  ];
}
return testWeatherApp();
