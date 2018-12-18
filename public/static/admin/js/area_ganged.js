function createAjax(){
    var xmlHttp = false;
    if (window.XMLHttpRequest){
        xmlHttp = new XMLHttpRequest();
    }else if(window.ActiveXObject){
        try{
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }catch(e){
            try{
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }catch(e){
                xmlHttp = false;
            }
        }
    }
    return xmlHttp;
}

var ajax = null;
function getCity(province_id){
    ajax = createAjax();
    ajax.onreadystatechange=function(){
        if(ajax.readyState == 4){
            if(ajax.status == 200){
                var cities = ajax.responseXML.getElementsByTagName("city");
                $('city').length = 0;
                var myoption = document.createElement("option");
                myoption.value = "";
                myoption.innerText = "--请选择城市--";
                $('city').appendChild(myoption);
                for(var i=0;i<cities.length;i++){
                    var city_id = cities[i].childNodes[0].childNodes[0].nodeValue;
                    var city_name = cities[i].childNodes[1].childNodes[0].nodeValue;
                    var myoption = document.createElement("option");
                    myoption.value = city_id;
                    myoption.innerText = city_name;
                    $('city').appendChild(myoption);
                }
            }
        }
    }

    ajax.open("post","selectPro.php",true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("province_id="+province_id);

}

function getCounty(city_id){
    ajax = createAjax();
    ajax.onreadystatechange=function(){
        if(ajax.readyState == 4){
            if(ajax.status == 200){

                var cities = ajax.responseXML.getElementsByTagName("county");
                $('county').length = 0;
                var myoption = document.createElement("option");
                myoption.value = "";
                myoption.innerText = "--请选择县--";
                $('county').appendChild(myoption);
                for(var i=0;i<cities.length;i++){
                    var city_id = cities[i].childNodes[0].childNodes[0].nodeValue;
                    var city_name = cities[i].childNodes[1].childNodes[0].nodeValue;
                    var myoption = document.createElement("option");
                    myoption.value = city_id;
                    myoption.innerText = city_name;
                    $('county').appendChild(myoption);
                }
            }
        }
    }
    ajax.open("post","selectPro.php",true);
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send("city_id="+city_id);
}

function $(id){
    return document.getElementById(id);
}
 