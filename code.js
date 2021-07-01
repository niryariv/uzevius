maplibregl.setRTLTextPlugin('https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.2/mapbox-gl-rtl-text.js');

var map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/topo/style.json?key=cgzcpq242p8x5zNNGxpx',
    // center: [0,0],
    // zoom: 0
    center: [35.358, 31.316],
    maxBounds: [[35.3334, 31.3029], [35.3729, 31.3317]],
    zoom: 15

});

// map.LngLatBounds();

map.on('click', function (e) {
    document.getElementById('info').innerHTML =
        // e.point is the x, y coordinates of the mousemove event relative
        // to the top-left corner of the map
        JSON.stringify(e.point) +
        '<br />' +
        // e.lngLat is the longitude, latitude geographical position of the event
        JSON.stringify(e.lngLat.wrap());
        console.log(e.lngLat)
    });

// map.flyTo({
//     center: [35.358, 31.316],
//     zoom: 15
// })
