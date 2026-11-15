# Aplicación Web SIG - Colombia

## 1. Descripción del proyecto

Desarrollo de una aplicación web geográfica utilizando Leaflet y servicios geográficos, orientada a la visualización de los departamentos y municipios de Colombia.

La aplicación integra información cartográfica del DANE y permite la exploración interactiva de las capas geográficas.

## 2. Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Leaflet
- Servicios WMS del DANE
- Datos geográficos en formato GeoJSON
- Python HTTP Server

## 3. Estructura del proyecto

```text
webapp/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── datos/
    └── departamentos.geojson
```

## 4. Funcionalidades implementadas

- Visualización cartográfica mediante OpenStreetMap.
- Alternancia entre mapa base OpenStreetMap y Satellite.
- Integración de capas WMS de departamentos y municipios del DANE.
- Carga de departamentos desde un archivo GeoJSON local.
- Control interactivo de capas.
- Ventanas emergentes con el nombre y código DIVIPOLA de los departamentos.
- Resaltado de entidades geográficas al pasar el cursor.
- Panel informativo.
- Control de escala cartográfica.
- Leyenda temática.
- Marcador de ubicación de Bogotá D.C.

## 5. Ejecución de la aplicación

La aplicación se ejecuta localmente mediante Python HTTP Server.

Desde la carpeta `webapp`, ejecutar:

```bash
python -m http.server 8000
```

Posteriormente, ingresar desde el navegador a:

```text
http://localhost:8000
```

## 6. Consideraciones técnicas

Los departamentos se cargan desde un archivo GeoJSON local. Las capas de departamentos y municipios se visualizan mediante servicios WMS del DANE.

La consulta de atributos municipales mediante REST presentó restricciones de acceso CORS y respuestas sin geometría. Por esta razón, la consulta no se incorporó a la versión funcional de la aplicación.

La conexión WFS con GeoServer no se implementó, debido a que no se dispone de una instancia local de dicho servidor.

## 7. Resultado

Se obtuvo una aplicación web SIG funcional que permite visualizar información geográfica de Colombia, alternar capas cartográficas, consultar atributos de los departamentos y explorar su distribución espacial mediante herramientas interactivas.