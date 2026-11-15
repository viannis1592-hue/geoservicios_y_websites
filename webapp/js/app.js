
// 1. Crear el mapa
const map = L.map('map').setView([4.5709, -74.2973], 6);

// 2. Capas base
const baseMaps = {
    "OpenStreetMap": L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '&copy; OpenStreetMap contributors'
        }
    ),

    "Satellite": L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: 'Tiles &copy; Esri'
        }
    )
};

baseMaps["OpenStreetMap"].addTo(map);

// 3. Servicio WMS del DANE
const geoserverUrl =
    'https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer';

// Departamentos WMS
const departamentosWMS = L.tileLayer.wms(geoserverUrl, {
    layers: '8',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE'
}).addTo(map);

// Municipios WMS
const municipiosWMS = L.tileLayer.wms(geoserverUrl, {
    layers: '7',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE'
}).addTo(map);

// 4. Control de capas
const overlayMaps = {
    "Departamentos (WMS)": departamentosWMS,
    "Municipios (WMS)": municipiosWMS
};

const controlLayer = L.control.layers(
    baseMaps,
    overlayMaps,
    { collapsed: false }
).addTo(map);

// 5. Cargar departamentos desde GeoJSON local
fetch('datos/departamentos.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo cargar el GeoJSON');
        }
        return response.json();
    })
    .then(data => {

        const departamentosGeoJSON = L.geoJSON(data, {

            // Estilo de los departamentos
            style: {
                color: '#232323',
                weight: 2,
                fillColor: '#e8f881',
                fillOpacity: 0.5
            },

            // Información y resaltado
            onEachFeature: function(feature, layer) {

                const p = feature.properties || {};
                const nombre = p.dpto_cnmbr || 'Departamento';
                const codigo = p.dpto_ccdgo || '';

                // Ventana emergente
                layer.bindPopup(
                    `<h3>${nombre}</h3>
                     <p><b>Código:</b> ${codigo}</p>`
                );

                // Resaltar al pasar el cursor
                layer.on('mouseover', function() {
                    layer.setStyle({
                        weight: 4,
                        color: '#ff6600',
                        fillOpacity: 0.7
                    });
                });

                // Restaurar estilo original
                layer.on('mouseout', function() {
                    departamentosGeoJSON.resetStyle(layer);
                });
            }
        });

        departamentosGeoJSON.addTo(map);

        // Incorporar GeoJSON al control de capas
        controlLayer.addOverlay(
            departamentosGeoJSON,
            "Departamentos (GeoJSON)"
        );

        // Ajustar el mapa a Colombia
        map.fitBounds(departamentosGeoJSON.getBounds());

        console.log('Departamentos GeoJSON cargados correctamente');
    })
    .catch(error => {
        console.error('Error cargando departamentos:', error);
    });

// 6. Control de escala
L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false
}).addTo(map);

// 7. Panel de información
const info = L.control({
    position: 'topleft'
});

info.onAdd = function() {

    const div = L.DomUtil.create('div', 'info');

    div.innerHTML = `
        <h4>Colombia - Servicios Geográficos</h4>
        <p>Visualización de departamentos y municipios</p>
        <p><small>Datos: DANE</small></p>
    `;

    return div;
};

info.addTo(map);

// 8. Marcador de Bogotá
L.marker([4.7110, -74.0721])
    .addTo(map)
    .bindPopup(
        '<b>Bogotá D.C.</b><br>Capital de Colombia'
    );

// 9. Leyenda
const leyenda = L.control({
    position: 'bottomright'
});

leyenda.onAdd = function() {

    const div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = `
        <h4>Leyenda</h4>
        <p>
            <span style="background:#e8f881;
            border:1px solid #232323;
            display:inline-block;
            width:15px;
            height:15px;"></span>
            Departamentos (GeoJSON)
        </p>
        <p>
            <span style="background:#ff6600;
            display:inline-block;
            width:15px;
            height:15px;"></span>
            Resaltado
        </p>
        <p>Capas de referencia: DANE</p>
    `;

    return div;
};

leyenda.addTo(map);
