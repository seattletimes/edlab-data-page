// var paywall = require("./lib/paywall");
// setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
require("component-leaflet-map");
var ich = require("icanhaz");

const $ = require('jquery');

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

//get access to Leaflet and the map
var element = document.querySelector("#leaflet-map-one");
var L = element.leaflet;
var map = element.map;

var elementFour = document.querySelector("#leaflet-map");
var L = elementFour.leaflet;
var mapFour = elementFour.map;
var geojsonTwo;

function mapBoxStuff() {
// mapbox stuff //
var templateFile = require("./_popup.html");
ich.addTemplate("popup", templateFile);
var focused = false;

const dataJSON = require("./ESDEnroll.geo.json");

const colorBlocks = document.querySelectorAll('#graph1 .color');

var commafy = s => (s * 1).toLocaleString().replace(/\.0+$/, "");

dataJSON.features.forEach(function(f) {
["ESDStats_Total2019-20", "ESDStats_Total2020-21"].forEach(function(prop) {
  f.properties[prop] = commafy(f.properties[prop]);
});
["ESDStats_Per_Diff"].forEach(function(prop) {
  f.properties[prop] = parseFloat(f.properties[prop]);
});
});

var onEachFeature = function(feature, layer) {
layer.bindPopup(ich.popup(feature.properties))
layer.on({
  mouseover: function(e) {
    layer.setStyle({ weight: 2, fillOpacity: 0.9 });
  },
  mouseout: function(e) {
    if (focused && focused == layer) { return }
    layer.setStyle({ weight: 1, fillOpacity: 0.7 });
  }
});
};


var geojson = L.geoJson(dataJSON, {
onEachFeature: onEachFeature
}).addTo(map);



const chosenColorArray = ['#00354d', '#27637d', '#5495b0', '#8ac8e5', '#feaa93'];
const colorArray = [-6,-4,-2,0];

var getColor = function(d, array) {
var value = d;
var thisArray = colorArray;

for (let h = 0; h < colorBlocks.length; h++) {
  colorBlocks[h].style.backgroundColor = chosenColorArray[h];
}


if (typeof value == "string") {
  value = Number(value.replace(/,/, ""));
}
if (typeof value != "undefined") {
  return value >= thisArray[3] ? chosenColorArray[4] :
         value >= thisArray[2] ? chosenColorArray[3] :
         value >= thisArray[1] ? chosenColorArray[2] :
         value >= thisArray[0]  ? chosenColorArray[1] :
         chosenColorArray[0] ;
} else {
  return "gray"
}
};

function restyleLayer(propertyName) {

geojson.eachLayer(function(featureInstanceLayer) {
    var propertyValue = featureInstanceLayer.feature.properties[propertyName];
    // Your function that determines a fill color for a particular
    // property name and value.
    var myFillColor = getColor(propertyValue, colorArray);

    featureInstanceLayer.setStyle({
        fillColor: myFillColor,
        opacity: .25,
        color: '#000',
        fillOpacity: 0.7,
        weight: 1
    });
});
}
restyleLayer("ESDStats_Per_Diff");
var zoom = document.getElementById("data-page").offsetWidth > 500 ? 7 : 6;
map.setView(new L.LatLng(47.28765010669967, -120.5538310357337), zoom);
map.scrollWheelZoom.disable();


////// POLITICS MAP ////////
var templateFilePolitics = require("./_popupPolitics.html");
ich.addTemplate("popupPoli", templateFilePolitics);

// var onEachFeature = function(feature, layer) {
// layer.bindPopup(ich.popupPoli(feature.properties))
// };

var data = require("./data2.geo.json");

var focusedPoli = false;

function getKeyByValue(object, value) {
return Object.keys(object).find(key => object[key] === value);
}


var arrayLegend = {
  Trump_array: [50, 101],
  White_array: [50, 101],
  Rural_array: [50, 101],
  inPerson_array: [25, 50, 75],
  inPerson: "data2_in_person",
  White: "data2_white",
  Trump: "data2_trump",
  Rural: "data2_rural",

};

data.features.forEach(function(f) {
  ["data2_white", "data2_trump", "data2_rural", "data2_in_person", "data2_pct_of_total_state_students"].forEach(function(prop) {
    // f.properties[prop] = commafy ((f.properties[prop]));
      var number = f.properties[prop] * 100;
      var rounded = Math.round(number * 10) / 10;
      f.properties[prop] = rounded.toFixed(1);
  });
});


var onEachFeaturePoli = function(feature, layer) {
  layer.bindPopup(ich.popupPoli(feature.properties))
  layer.on({
    mouseover: function(e) {
      layer.setStyle({ weight: 2, fillOpacity: 0.9 });
    },
    mouseout: function(e) {
      if (focusedPoli && focusedPoli == layer) { return }
      layer.setStyle({ weight: 1, fillOpacity: 0.7 });
    }
  });
};

var getOpacity = function(d, array) {
  var value = d;
  var thisArray = arrayLegend[array];

  if (typeof value == "string") {
    value = Number(value.replace(/,/, ""));
  }
  if (typeof value != null) {
    // condition ? if-true : if-false;
   return value >= thisArray[1] ? 'red' :
          value >= thisArray[0] ? 1 : 0.25 ;
  } else {
    return "gray"
  }
};

var getColor2 = function(d, array) {
  var value = d;
  var thisArray = arrayLegend[array];
  if (typeof value == "string") {
    value = Number(value.replace(/,/, ""));
  }
  if (typeof value != null) {
    // condition ? if-true : if-false;
   return value >= thisArray[2] ? '#2171b5' :
          value >= thisArray[1] ? '#6baed6' :
          value >= thisArray[0] ? '#bdd7e7' : '#eff3ff' ;
  } else {
    return "gray"
  }
};







geojsonTwo = L.geoJson(data, {
  onEachFeature: onEachFeaturePoli
}).addTo(mapFour);



function restyleLayerPoli(propertyName) {
  geojsonTwo.eachLayer(function(featureInstanceLayer) {
      var propertyValue = featureInstanceLayer.feature.properties[propertyName];
      var opacityValue = featureInstanceLayer.feature.properties["data2_in_person"];
      var key = getKeyByValue(arrayLegend,propertyName);
      var colorArray = key + "_array";

      // Your function that determines a fill color for a particular
      // property name and value.
      var myWeight = ((propertyValue > 50) && (key != "inPerson")) ? 2 : 1;
      var myStroke = ((propertyValue > 50) && (key != "inPerson")) ? 0.8 : 0.2;
      var myFillColor = getColor2(opacityValue, "inPerson_array");

      featureInstanceLayer.setStyle({
          fillColor: myFillColor,
          opacity: myStroke,
          color: '#000',
          fillOpacity: 0.7,
          // fillPattern: stripes,
          weight: myWeight
      });
  });
}


mapFour.scrollWheelZoom.disable();



var imageUrl = './assets/white50thickCROP.png',
imageBounds = [[45.5435409994994, -124.83082024227], [49.00243599854, -116.916071000268]];
var whiteOverlay = L.imageOverlay(imageUrl, imageBounds).addTo(mapFour);
whiteOverlay.getElement().style.opacity = 0;

var imageUrl2 = './assets/trump50thickCROP.png',
imageBounds2 = [[45.5435409994994, -124.83082024227], [49.00243599854, -116.916071000268]];
var trumpOverlay = L.imageOverlay(imageUrl2, imageBounds2).addTo(mapFour);
trumpOverlay.getElement().style.opacity = 0;

var imageUrl3 = './assets/rural50thickCROP.png',
imageBounds3 = [[45.5435409994994, -124.83082024227], [49.00243599854, -116.916071000268]];
var ruralOverlay = L.imageOverlay(imageUrl3, imageBounds3).addTo(mapFour);
ruralOverlay.getElement().style.opacity = 0;

restyleLayerPoli(arrayLegend["inPerson"]);

var buttons = document.querySelectorAll('.title');

buttons.forEach(el => el.addEventListener('click', () => {
var className = el.classList[1];
buttons.forEach(el => el.classList.remove("selected") );
el.classList.add("selected");

restyleLayerPoli(arrayLegend[`${className}`]);

if (className === "inPerson") {
  whiteOverlay.getElement().style.opacity = 0;
  trumpOverlay.getElement().style.opacity = 0;
  ruralOverlay.getElement().style.opacity = 0;
} else if ( className === "Rural" ) {
  whiteOverlay.getElement().style.opacity = 0;
  trumpOverlay.getElement().style.opacity = 0;
  ruralOverlay.getElement().style.opacity = 1;
} else if (className === "White") {
  whiteOverlay.getElement().style.opacity = 1;
  trumpOverlay.getElement().style.opacity = 0;
  ruralOverlay.getElement().style.opacity = 0;
} else {
  whiteOverlay.getElement().style.opacity = 0;
  trumpOverlay.getElement().style.opacity = 1;
  ruralOverlay.getElement().style.opacity = 0;
};


}));
// end of mapbox stuff

}

docReady(function() {




if ($(window).width() < 700) {
   $('.desktop').hide();
   $('.mobile').show();

   if (map != undefined) { map.off(); map.remove(); }
   if (mapFour != undefined) { mapFour.off(); mapFour.remove(); }

   document.querySelectorAll('.box').forEach(el => {
      var boxNumber = el.dataset.num;
      var conSet = el.parentNode.dataset.set;
      var findExpand = document.querySelector(`.expandContainer[data-set="${conSet}"]`);
      var theRightExpand = findExpand.querySelector(`.expand[data-num="${boxNumber}"]`);
      el.after(theRightExpand);
  });
  map = element.map;
  mapFour = elementFour.map;
} else {
  $('.desktop').show();
  $('.mobile').hide();
}

mapBoxStuff();





$( ".box" ).click(function() {
  var number = $(this).data("num");
  var set = $(this).closest('.container').data("set");

  var expandCon = ($(window).width() >= 700) ? $('#data-page').find(`.expandContainer[data-set="${set}"]`) : $(this).closest('.container');

  if ( $(this).hasClass("selected") ) {

    expandCon.find(`.expand[data-num="${number}"]`).hide();
    $(this).removeClass('selected');
    $(this).find('.chevs').removeClass('selected');

    if ($(window).width() >= 700) {
      $(this).closest('.container').find('.box').removeClass('highlightRow');
    }
  } else {
    if ($(window).width() >= 700) {
      expandCon.find('.expand').hide();
      $(this).closest('.container').find('.box').removeClass('selected');
      $(this).closest('.container').find('.chevs').removeClass('selected');
      $(this).closest('.container').find('.box').addClass('highlightRow');
    }

    $(this).addClass('selected');
    $(this).find('.chevs').addClass('selected');
    // expandCon.css("color","red");
    expandCon.find(`.expand[data-num="${number}"]`).show();

    if ( (number === 1) && (set === 1)){
      map.invalidateSize();
    }
    if ( (number === 3) && (set === 1)){
      mapFour.invalidateSize();
      mapFour.fitBounds(geojsonTwo.getBounds());
    }
  }
});

});
