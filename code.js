const STYLE = {
    'STREETS' : 'https://api.maptiler.com/maps/streets/style.json?key=cgzcpq242p8x5zNNGxpx',
    'SAT': 'mapbox://styles/niryariv/cjamccmte0z492so572ynsqt1'//https://api.maptiler.com/maps/hybrid/style.json?key=cgzcpq242p8x5zNNGxpx'
}


// $(document).ready(function () {

    // setup map
    maplibregl.accessToken = 'pk.eyJ1IjoibmlyeWFyaXYiLCJhIjoiY2tyZG9wdGdqNWRzZTJwcXB0bDhwMDI0MSJ9._9l-xyh11DZVRuQCAwtcZg'
    maplibregl.setRTLTextPlugin(
        'https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.2/mapbox-gl-rtl-text.js',
        null,
        true
    );

    var map = new maplibregl.Map({
        container: 'map',
        style: STYLE.STREETS,
        zoom: 10,
        center: [34.102, 30.935],
        customAttribution: "v25.07.3",
        maxBounds: [[34, 29], [36, 34]]
    });

    var POIS = [];

    
    // setup geolocation UI
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

    var _lastpos=[];
    geolocate.on('geolocate', function (l) {
        loc = [l.coords.longitude, l.coords.latitude]
        if ((JSON.stringify(loc) == JSON.stringify(_lastpos))) {
            // user didn't move
            // console.log("same place");
        } else {
            // user moved to a new location
            // console.log('the user is at', loc);
            trigger_nearby_marker(loc, 5);
            _lastpos = loc;
        }
    });

    // get a point and a radius in meters, return any markers the point is within that radius from
    function trigger_nearby_marker(user_location, within){
        for (var i=0 ; i<POIS.length ; i++){
            // calculate distance between user and POI
            // if < distance toggle popup and quit
            var poi = POIS[i];
            var distance = turf.distance(user_location, poi.getLngLat().toArray(), 'kilometers');
            distance = Math.round(distance * 1000); // convert to meters
            // console.log('distance', distance, ' meters');
            if (distance <= within && POIS[i].alreadyPlayed !== true) {
                poi.togglePopup();
                POIS[i].alreadyPlayed = true;
                break;
            }
        }
    }

    map.addControl(geolocate);


    // setup Basemap switching
    class BaseMapControl {
        onAdd(map) {
            this._map = map;
            this._container = document.createElement('div');
            this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group style-switcher style-switcher-satellite';
            this._container.addEventListener('click', function (e) {
                var curstyle = map.getStyle().name;
                if (curstyle == 'Streets') {
                    e.target.classList.remove('style-switcher-satellite');
                    e.target.classList.add('style-switcher-streets');
                    map.setStyle(STYLE.SAT);
                } else {
                    e.target.classList.remove('style-switcher-streets');
                    e.target.classList.add('style-switcher-satellite');
                    map.setStyle(STYLE.STREETS);
                }
            });
            return this._container;
        }


        onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }

    map.addControl(new BaseMapControl(), 'bottom-left');


    // UI logic
    map.on('load', function(e){

        // don't fly to user location on load
        // geolocate.trigger();

        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });

        $.getJSON("./data/negev.geojson", function(e) {
            console.log("loaded");
        }).fail(function (e) {
            console.log(e);
        }).done(function(d){
            // POIS = d.features;
            console.log(d);
            map.flyTo({
                center: d.features[0].geometry.coordinates,
                zoom: 8
            });
            d.features.forEach(function (f) {
                POIS.push(render_point(f));
            });        
        })


        // disable for now
        // geolocate.on('geolocate', (e) => {
        //     heading = e.coords.heading
        //     if (heading != null) {
        //         console.log("bearing:", heading)
        //         map.setBearing(heading);
        //     }
        // });


        function render_point(p){
            // console.log(p);
            var lnglat = p.geometry.coordinates;
            var rotation = 0; // ignore rotation for images p.properties.rotation || 0;
            var color = p.properties.color || '#bbdaf9';
            var title = p.properties.title;
            var video_src = p.properties.youtube;
            // 'https://player.vimeo.com/video/'+ p.properties.vimeo +'?autoplay=1&title=0&byline=0&portrait=0'; //'https://player.vimeo.com/video/5922384?title=0&byline=0&portrait=0';

            var el = document.createElement('div');
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
            return(marker);
        }

    });


    // Redraw layers when changing basemap
    map.on('styledata', function(e){
        if (typeof map.getSource('route') === 'undefined') {
            map.addSource('route', {
                type: "geojson",
                data: "./data/negev_route.geojson"
            })
        }
        
        if (typeof map.getLayer('route') === 'undefined') {
            map.addLayer({
                id: "route",
                source: "route",
                type: "line",
                paint: {
                    "line-color": "#2080ff",
                    "line-width": 3,
                    "line-gap-width": 1
                },
                layout: {
                    "line-cap": "round",
                    "line-join": "round"
                }
            })
        }

    })


    // simulate gps location change 
    map.on('click', function(e) {
        console.log('click at', e.lngLat);
        trigger_nearby_marker(e.lngLat.toArray(), 1000);
    })
