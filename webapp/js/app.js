
// =====================================================
// 1. CREAR EL MAPA
// =====================================================

const map = L.map('map').setView([4.5709, -74.2973], 6);


// =====================================================
// 2. CAPAS BASE
// =====================================================

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


// =====================================================
// 3. SERVICIO WMS DEL DANE
// =====================================================

const geoserverUrl =
    'https://geoportal.dane.gov.co/mparcgis/services/MGN2024/Serv_CapasMGN_2024/MapServer/WMSServer';

const departamentosWMS = L.tileLayer.wms(geoserverUrl, {
    layers: '8',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE'
});

const municipiosWMS = L.tileLayer.wms(geoserverUrl, {
    layers: '7',
    format: 'image/png',
    transparent: true,
    attribution: 'DANE'
});

departamentosWMS.addTo(map);


// =====================================================
// 4. CONTROL DE CAPAS
// =====================================================

const overlayMaps = {
    "Departamentos (WMS - DANE)": departamentosWMS,
    "Municipios (WMS - DANE)": municipiosWMS
};

const controlLayer = L.control.layers(
    baseMaps,
    overlayMaps,
    { collapsed: false }
).addTo(map);

    // 5. CARGAR DEPARTAMENTOS DESDE GEOSERVER WFS

const wfsUrl =
    'http://localhost:8080/geoserver/ne/ows?service=WFS&version=2.0.0&request=GetFeature&typeNames=ne:departamentos&outputFormat=application/json';

fetch(wfsUrl)

    .then(response => {
        if (!response.ok) {
            throw new Error(
                'Error HTTP al consultar WFS: ' + response.status
            );
        }
        return response.json();
    })
    .then(data => {

        console.log('Respuesta recibida desde GeoServer:', data);

        if (!data.features || data.features.length === 0) {
            throw new Error('El servicio WFS no contiene departamentos.');
        }

        const departamentosWFS = L.geoJSON(data, {

            // Estilo de los departamentos
            style: {
                color: '#232323',
                weight: 2,
                fillColor: '#e8f881',
                fillOpacity: 0.5
            },

            // Información y eventos
            onEachFeature: function(feature, layer) {

                const p = feature.properties || {};

                const nombre =
                    p.dpto_cnmbr ||
                    p.nombre ||
                    'Departamento';

                const codigo =
                    p.dpto_ccdgo ||
                    p.codigo ||
                    '';

                // Ventana emergente
                layer.bindPopup(`
                    <h3>${nombre}</h3>
                    <p><b>Código:</b> ${codigo}</p>
                `);

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
                    departamentosWFS.resetStyle(layer);
                });
            }
        });

        // Agregar departamentos al mapa
        departamentosWFS.addTo(map);

        // Agregar al control de capas
        controlLayer.addOverlay(
            departamentosWFS,
            "Departamentos (WFS - GeoServer)"
        );

        // Ajustar vista a Colombia
        map.fitBounds(departamentosWFS.getBounds());

        console.log(
            'Departamentos WFS cargados correctamente:',
            data.features.length
        );
    })
    .catch(error => {
        console.error(
            'Error cargando departamentos desde WFS:',
            error
        );
    });


// =====================================================
// 6. CONTROL DE ESCALA
// =====================================================

L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false
}).addTo(map);


// =====================================================
// 7. PANEL DE INFORMACIÓN
// =====================================================

const info = L.control({
    position: 'topleft'
});

info.onAdd = function() {

    const div = L.DomUtil.create('div', 'info');

    div.innerHTML = `
        <h4>Colombia - Servicios Geográficos</h4>
        <p>Visualización de departamentos y municipios</p>
        <p><small>Datos: DANE y GeoServer</small></p>
    `;

    return div;
};

info.addTo(map);


// =====================================================
// 8. MARCADOR DE BOGOTÁ
// =====================================================

L.marker([4.7110, -74.0721])
    .addTo(map)
    .bindPopup(
        '<b>Bogotá D.C.</b><br>Capital de Colombia'
    );


// =====================================================
// 9. LEYENDA
// =====================================================

const leyenda = L.control({
    position: 'bottomright'
});

leyenda.onAdd = function() {

    const div = L.DomUtil.create('div', 'info legend');

    div.innerHTML = `
        <h4>Leyenda</h4>

        <p>
            <span style="
                background:#e8f881;
                border:1px solid #232323;
                display:inline-block;
                width:15px;
                height:15px;">
            </span>
            Departamentos (WFS)
        </p>

        <p>
            <span style="
                background:#ff6600;
                display:inline-block;
                width:15px;
                height:15px;">
            </span>
            Resaltado
        </p>

        <p>Capas de referencia: DANE</p>
    `;

    return div;
};

leyenda.addTo(map);
