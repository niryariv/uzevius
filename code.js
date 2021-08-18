const VERSION = "v18.08.1";

const STYLE = {
    'STREETS' : 'https://api.maptiler.com/maps/streets/style.json?key=cgzcpq242p8x5zNNGxpx',
    'SAT': 'mapbox://styles/niryariv/cjamccmte0z492so572ynsqt1'//https://api.maptiler.com/maps/hybrid/style.json?key=cgzcpq242p8x5zNNGxpx'
}

const DEFAULT_ACTIVATION_RADIUS = 10; //meters
const DEFAULT_CENTER    = [ 34.7633, 31.1182 ];
const DEFAULT_ZOOM      = 10;

const TRIGGER_GPS_ON_START       = false;
const FLY_TO_ON_START           = false;

const POI_FILE      = "./data/negev.geojson";
const ROUTE_FILE    = "./data/negev_route.geojson";
const PARKING_FILE  = "./data/parking.geojson";



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
        zoom: DEFAULT_ZOOM,
        center: DEFAULT_CENTER,
        attributionControl: false,
        maxBounds: [[34, 29], [36, 34]]
    });

    var POIS = [];

    map.addControl(
        new maplibregl.ScaleControl({
            maxWidth: 80,
            unit: 'metric'
        }),
        'bottom-right'
    );
    
    map.addControl(
        new maplibregl.AttributionControl({
            customAttribution: VERSION,
            compact: true
        })
    );
    
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
            trigger_nearby_marker(loc);
            _lastpos = loc;
        }
    });

    // get a point and a radius in meters, return any markers the point is within that radius from
    function trigger_nearby_marker(user_location){
        for (var i=0 ; i<POIS.length ; i++){
            var poi = POIS[i];

            // calculate distance between user and POI
            var distance = turf.distance(user_location, poi.getLngLat().toArray(), 'kilometers');
            distance = Math.round(distance * 1000); // convert to meters

            // if user within activation radius of a POI that didn't play already, play video
            var activation_radius = poi.properties.activation_radius || DEFAULT_ACTIVATION_RADIUS;
            console.log(poi, activation_radius);
            if (distance <= activation_radius && POIS[i].alreadyPlayed !== true) {
                poi.togglePopup();
                POIS[i].alreadyPlayed = true;
                break;
            }
        }
    }

    function set_navigation_to(poi) {
        console.log("set navigation to ", poi);
        if (typeof poi === "undefined") {
                $("#info").hide();
                return false;
        } 
        
        $("#info").show();
        $("#next_poi").html(poi.properties.title);

        if (poi.properties.hide_nav) {
            $("#navlink").hide();
        } else {
            if (typeof poi.properties.nav_to !== "undefined") {
                loc = { lng: poi.properties.nav_to[0], lat: poi.properties.nav_to[1] };
            } else {
                loc = poi.getLngLat();
            }
            console.log(loc);
            var nav_link = "https://www.waze.com/ul?ll=" + loc.lat + "%2C" + loc.lng + "&navigate=yes&zoom=15";
            // var navlink = "https://www.waze.com/ul?q="+poi.
            $("#navlink").attr("href", nav_link);
            $("#navlink").show();
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

        if (TRIGGER_GPS_ON_START) {
            geolocate.trigger();
        }


        // map.addSource('parking', {
        //     type: 'geojson',
        //     data: './data/parking.geojson'
        // })
        
        // map.addLayer({
        //     'id': 'parking',
        //     'type': 'symbol',
        //     'source': 'parking',
        //     'layout': {
        //         'icon-image': 'parking',
        //     }
        // })


        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });

        $.getJSON(POI_FILE, function(e) {
            console.log("loaded");
        }).fail(function (e) {
            console.log('FAILED TO LOAD: ' + POI_FILE, e);
        }).done(function(d){
            if (FLY_TO_ON_START) {
                map.flyTo({
                    center: d.features[0].geometry.coordinates,
                    zoom: DEFAULT_ZOOM
                })
            }

            var id = 0;
            d.features.forEach(function (f) {
                POIS[id] = render_point(f, id);
                POIS[id].properties = f.properties;
                id++;
            })
            
            set_navigation_to(POIS[0]);
        })


        // disable for now
        // geolocate.on('geolocate', (e) => {
        //     heading = e.coords.heading
        //     if (heading != null) {
        //         console.log("bearing:", heading)
        //         map.setBearing(heading);
        //     }
        // });


        function render_point(p, id){
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
            el.style.zIndex = 100-id;
            el.appendChild(document.createTextNode(id+1));

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
                        console.log("currentFeature", currentFeature);
                        map.flyTo({
                            center: currentFeature.target.getLngLat(),
                            zoom: 15
                        });
                        $.magnificPopup.open({
                            "items": { 
                                "src": video_src
                            }, 
                            "type": "iframe",
                            iframe: {
                                markup: '<div class="mfp-iframe-scaler">' +
                                    '<div class="mfp-close"></div>' +
                                    '<iframe class="mfp-iframe" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>' +
                                    '</div>',
                                patterns: {
                                    youtube: {
                                        index: 'youtube.com/',
                                        id: 'v=',
                                        src: 'https://www.youtube.com/embed/%id%?autoplay=1'
                                    }
                                }
                            }
                        });
                        set_navigation_to(POIS[id+1]);
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
                data: ROUTE_FILE
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

        // add parking icons
        map.loadImage('./assets/img/parking.png', function (error, image) {
            if (error) throw error;
            map.addImage('parking', image);
        });

        if (typeof map.getSource('parking') === 'undefined') {
            map.addSource('parking', {
                type: 'geojson',
                data: PARKING_FILE
            })
        }

        if (typeof map.getLayer('parking') === 'undefined') {
            map.addLayer({
                'id': 'parking',
                'type': 'symbol',
                'source': 'parking',
                'layout': {
                    'icon-image': 'parking',
                }
            })
        }

    })


    // simulate gps location change 
    map.on('click', function(e) {
        console.log('click at', e.lngLat);
        trigger_nearby_marker(e.lngLat.toArray());
    })
