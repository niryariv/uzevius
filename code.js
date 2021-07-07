var Markers = {};

$(document).ready(function () {

    // Sentry.init({
    //     dsn: "https://eec507480d9449bd8a33698b709dcb35@o914112.ingest.sentry.io/5852590",
    //     integrations: [new Integrations.BrowserTracing()],
    //     tracesSampleRate: 1.0,
    // });

    // Sentry.captureMessage("Sentry On");

    // video_modal = new bootstrap.Modal(document.getElementById('video_modal'))
    // stop video when the modal is closed
    // $('#video_modal').on('hide.bs.modal', function (e) {
    //     // a poor man's stop video
    //     $("#video").attr('src', '');
    // });


    maplibregl.setRTLTextPlugin(
        'https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.2/mapbox-gl-rtl-text.js',
        null,
        true
    );

    var map = new maplibregl.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/topo/style.json?key=cgzcpq242p8x5zNNGxpx',
        // center: [0,0],
        zoom: 7,
        center: [34.102, 30.935],
        customAttribution: "v7.7"
        // maxBounds: [[35.33, 31.3], [35.38, 31.34]],
    });

    var geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    });

    geolocate.on('error', function (e) {
        console.log('geolocate error', e);
        $('#info').html(e.message).show();
    });

    map.addControl(geolocate);

    
    // var nav = new maplibregl.NavigationControl();
    // map.addControl(nav, 'top-left');

    map.on('load', function(e){

        geolocate.trigger();


        $.getJSON("./data/negev.geojson", function() {
            console.log("loaded");
        }).done(function(d){
            console.log(d);
            map.flyTo({
                center: d.features[0].geometry.coordinates,
                zoom: 15
            });
            d.features.forEach(function (f) {
                render_point(f);
            });        
        })

        function render_point(p){
            console.log(p);
            var lnglat = p.geometry.coordinates;
            var rotation = 0; // ignore rotation for images p.properties.rotation || 0;
            var color = p.properties.color || '#bbdaf9';
            var title = p.properties.title;
            var video_src = p.properties.youtube;
                // 'https://player.vimeo.com/video/'+ p.properties.vimeo +'?autoplay=1&title=0&byline=0&portrait=0'; //'https://player.vimeo.com/video/5922384?title=0&byline=0&portrait=0';

            el = document.createElement('div');
            el.className = 'image_marker';
            el.style.backgroundImage = 'url('+ p.properties.image +')';

            var marker = new maplibregl.Marker({ element: el, color: color, rotation: rotation })
                .setLngLat(lnglat)
                .setPopup(
                    new maplibregl.Popup({ 
                        offset: 25, 
                        closeButton: false
                    })
                    .setMaxWidth('fit-content')
                    .setHTML(title)
                    .on('open', function(currentFeature){
                        console.log(currentFeature)
                        map.flyTo({
                            center: currentFeature.target.getLngLat(),
                            zoom: 15
                        });
                        $.magnificPopup.open({
                            "items": { 
                                "src": video_src 
                            }, 
                            "type": "iframe"
                        });
                        // $('#video').attr('src', video_src);
                        // $("#video_title").html(title)
                        // video_modal.show()
                    })
                ).addTo(map);
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

    // map.on('click', function (e) {
    //     document.getElementById('info').innerHTML =
    //         // e.point is the x, y coordinates of the mousemove event relative
    //         // to the top-left corner of the map
    //         JSON.stringify(e.point) +
    //         '<br />' +
    //         // e.lngLat is the longitude, latitude geographical position of the event
    //         JSON.stringify(e.lngLat.wrap());
    //         console.log(e.lngLat);
    // });

    // map.flyTo({
    //     center: [35.358, 31.316],
    //     zoom: 15
    // })
})