
function openPanel(selector){
	$(selector).removeClass("hidden-phone");
    $("#phone-controls").addClass("hidden");
    $("#title").addClass("hidden-phone");
    return false;
}

$(".add-button").click(function(){
    openPanel("");
	$("#add-poi-helptext").show();
    $("#tools").addClass("hidden");
    map.on("click", newPoi);
    return false;
});

var newPOIMarker = null;
function newPoi(event){
    uiReturn();
    newPOIMarker = new L.Marker(event.latlng);
    map.addLayer(newPOIMarker);

    $("#dialog-new-poi")
        .find("input,textarea")
            .val("")
        .end()
        .modal();
}

$("#dialog-new-poi") .bind("hide", function(){
    map.removeLayer(newPOIMarker);
    newPOIMarker = null;
});

/**
 * Return to the UI default state
 */
function uiReturn(){
    $("#phone-controls").removeClass("hidden");
    $("#tools").removeClass("hidden");
    $("#title").removeClass("hidden-phone");
    $("#add-poi-helptext").hide();
    map.off("click", newPoi);
    return false;
}

$(".btn-close").click(uiReturn);

$("#poi-save").click(function(){
    var validation = {
		"name" : /\S+/,
		"req" : /\S+/,
		"img" : /^http:\/\//,
		"description" : /\S+/
    };

    var clean = {
        lat : newPOIMarker.getLatLng().lat,
        lon : newPOIMarker.getLatLng().lng
    };
    var form_clean = true;

    $.each(validation, function(name, regexp){
        var $input = $("#input-poi-" + name);
        var val = $input.val();
        var $group = $input.parents(".control-group");
        if(regexp.test(val)){
            $group.removeClass("error");
            clean[name] = val;
        }else{
            $group.addClass("error");
            form_clean = false;
        }
    });

	console.log(clean);
    if(form_clean){
        ajax("POST", "poi_add.php", clean, function(){
            $("#dialog-new-poi").modal("hide");
			alert("The point of interest has been saved correctly.\n\nYou can not see it yet, because I need to approve it, I'll review it and approve it ASAP.");
        });
    }
});

$("#btn-add-review").click(function(){
    var review = $("#review-text").val();
    if(!/\S+/.test(review)) return false;

    ajax("POST", "review_add.php", {
		poi: currentPOI,
		review: review,
		uid: localStorage.getItem("uid")
	}, function(resp){
        $("#review-text").val("");
		$("#poi-reviews").empty();
		ajax("GET", "reviews.php", {poi: currentPOI}, addReviews);
    });
    return false;
});

function addReviews(reviews){
    var $reviews = $("#poi-reviews");
    $.each(reviews, function(i, review){
		$("#no-comments").hide();
        $("<div/>").addClass("review").text(review.text).prepend(
            $('<img class="media-object" src="' + review.img + '/"/>')
        )        .appendTo($reviews);
    });
}

function rich_text(text){

}

var currentPOI = null;
function openPOI(poi){
    currentPOI = poi.id;

	$("#poi-reviews").empty();
	$("#no-comments").show();
    ajax("GET", "reviews.php", {poi: poi.id}, addReviews);

    $.each(["name","req","description"], function(i, field){
        $("#poi-" + field).text(poi[field]);
    });

	$("#poi-img").attr("src", poi.img);
	$("#poi-img-a").attr("href", poi.img);

    $("#dialog-poi").modal();
}

