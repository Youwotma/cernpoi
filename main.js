
var map = new L.Map("map1");
var attrib="Map data copyright OpenStreetMap contributors, Open Database Licence";
var layerOSM = new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{ attribution: attrib } );
map.addLayer(layerOSM);

map.setView(new L.LatLng(46.235153167101906,6.05022668838501), 16);
updatePoints();

var markers = {};
var geojsonLayer = new L.GeoJSON(null, {
	onEachFeature: function(feature, layer){
		markers[feature.properties.id] = layer;
		layer.on("click", function(){
			openPOI(feature.properties);
		});
	}
});

L.Icon.Red = L.Icon.Default.extend({
    options: {
		iconUrl: "marker-icon.png"
	}
});

var redIcon = new L.Icon.Red();
var blueIcon = new L.Icon.Default();

var oldpos = null;
var selicon = null;
function centerPOI(poi){
	if(!poi.geometry.coordinates[1]){
		return;
	}
	if(oldpos == null){
		oldpos = map.getCenter();
	}
	map.setView(new L.LatLng(poi.geometry.coordinates[1], poi.geometry.coordinates[0]), map.getZoom());
	if(selicon){
		selicon.setIcon(blueIcon);
	}
	selicon = markers[poi.properties.id]
	selicon.setIcon(redIcon);
}
function uncenterPOI(poi){
	if(oldpos){
		map.setView(oldpos, map.getZoom());
		oldpos = null;
	}
	if(selicon){
		selicon.setIcon(blueIcon);
		selicon = null;
	}
}

function updatePoints() {
	ajax("GET", "pois.json", {}, function(response){
		var $t = $("#poilist-target").empty();
		$.each(response.features, function(i,o){
			if(o.geometry.coordinates[1]){
				geojsonLayer.addData(o);
			}

			$t.append(
				$("<div/>").addClass("poi-list-item").append(
					$("<img/>").attr("src", o.properties.img)
				).append(
					$("<h4/>").text(o.properties.name)
				).hover(function(){
					centerPOI(o);
				}, function(){
					uncenterPOI(o);
				}).click(function(){
					openPOI(o.properties);
				})
			)
		});
	})
}


map.addLayer(geojsonLayer);

if(!localStorage.getItem("uid")){
	localStorage.setItem("uid", Math.round(Math.random()*999999999));
}

