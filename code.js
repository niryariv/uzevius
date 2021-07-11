var Markers = {};

$(document).ready(function () {

    // Sentry.init({
    //     dsn: "https://eec507480d9449bd8a33698b709dcb35@o914112.ingest.sentry.io/5852590",
    //     integrations: [new Integrations.BrowserTracing()],
    //     tracesSampleRate: 1.0,
    // });

    // Sentry.captureMessage("Sentry On");



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
        // center: [34.102, 30.935],
        customAttribution: "v11.7.0"
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


        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });

        $.getJSON("./data/negev.geojson", function(e) {
            console.log("loaded");
        }).fail(function (e) {
            console.log(e);
        }).done(function(d){
            console.log(d);
            debugger;
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
                    })
                ).addTo(map);
        }
    });
})