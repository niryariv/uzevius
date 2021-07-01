$(document).ready(function () {

    maplibregl.setRTLTextPlugin(
        'https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.2/mapbox-gl-rtl-text.js',
        null,
        true
    );

    var map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/topo/style.json?key=cgzcpq242p8x5zNNGxpx',
        // center: [0,0],
        // zoom: 0
        center: [35.358, 31.316],
        maxBounds: [[35.33, 31.3], [35.38, 31.34]],
        zoom: 15

    });

    map.on('load', function(e){
        // map.addSource('points', {
        //     'type': 'geojson',
        //     'data': './data/points.geojson'
        // });

        map.loadImage(
            'https://maplibre.org/maplibre-gl-js-docs/assets/custom_marker.png',
            function (error, image) {
                if (error) throw error;
                map.addImage('custom-marker', image);
            }
        ); 

        $.getJSON("./data/points.geojson", function() {
            console.log("loaded");
        }).done(function(d){
            console.log(d);
            d.features.forEach(function (f) {
                render_point(f);
            });        
        })

        function render_point(p){
            lnglat = p.geometry.coordinates;
            rotation = p.properties.rotation || 0;
            color = p.properties.color || '#bbdaf9';
            title = p.properties.title;

            console.log()

            var marker = new maplibregl.Marker({ color: color, rotation: rotation })
                .setLngLat(lnglat)
                .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false }).setText(title))
                .addTo(map);
        }


        // map.addLayer({
        //     'id': 'points',
        //     'type': 'symbol',
        //     'source': 'points',
        //     'layout': {
        //         'icon-image': 'custom-marker',
        //         // get the title name from the source's "title" property
        //         'text-field': ['get', 'title'],
        //         'text-font': [
        //             'Open Sans Semibold',
        //             'Arial Unicode MS Bold'
        //         ],
        //         'text-offset': [0, 1.25],
        //         'text-anchor': 'top'
        //     }
        // });

    });

    map.on('click', function (e) {
        document.getElementById('info').innerHTML =
            // e.point is the x, y coordinates of the mousemove event relative
            // to the top-left corner of the map
            JSON.stringify(e.point) +
            '<br />' +
            // e.lngLat is the longitude, latitude geographical position of the event
            JSON.stringify(e.lngLat.wrap());
            console.log(e.lngLat);
    });

    // map.flyTo({
    //     center: [35.358, 31.316],
    //     zoom: 15
    // })
})