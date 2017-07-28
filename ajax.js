

function ajax(verb, object, data, callback){
    var getData = verb=="GET"?data:{};
    var postData = verb=="GET"?null:data;

    $.ajax({
        type: verb,
        url: object + "?" + $.param(getData),
        data: postData,
        dataType: "json",
        success: function(response){
            //console.log(arguments);
            if(response.status == "success"){
                callback(response.response);
            }else{
                alert("Error " + response.errorCode + ": " + response.errorMessage);
            }
        },
        error: function(xhr, status, error){
			var errorMessage = "";
			if(xhr.responseText){
				try{
					errorMessage = JSON.parse(xhr.responseText).errorMessage;
				}catch(e){}
			}
            alert(status + "_ " + error + "_ " + errorMessage);
        }
    });
}

