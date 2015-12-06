function getColorForStatus(data) {
  var wasVerified = data[23];
  var wasActionTaken = data[25];
  var isUrgent = data[26];
  var wasClosed = data[27];
  if (wasClosed == 'YES')
    return Cesium.Color.GREY;
  else if (wasActionTaken == 'YES')
    return Cesium.Color.GREEN;
  else if (isUrgent == 'YES')
    if (wasVerified == 'YES')
      return Cesium.Color.RED;
    else
      return Cesium.Color.BLUE;
}

function displayData(output) {
  var viewer = new Cesium.Viewer('cesiumContainer');
  for (i = 1; i < output.length; ++i) {
    var point = {
      name : output[i][2],
      position : Cesium.Cartesian3.fromDegrees(output[i][8], output[i][7]),
      point : {
        color : getColorForStatus(output[i]).withAlpha(0.8),
        outline : true,
        outlineColor : Cesium.Color.BLACK,
        pixelSize: 10
      },
      description : '<h1><a href="' + String(output[i][i]) + '">' + String(output[i][2]) + '</a><h1>' +
                    '<p>' + String(output[i][5]).replace(/\n/g,"<br />") + '</p>'
    };
    viewer.entities.add(point);
  }
}

function setupToolbar() {
  var displayClosed = { dispClosedEnabled : true };
  Cesium.knockout.track(displayClosed);
  var toolbar = document.getElementById('toolbar');
  Cesium.knockout.applyBindings(displayClosed, toolbar);
  Cesium.knockout.getObservable(displayClosed, 'dispClosedEnabled').subscribe(function (newValue) {});
}

function extractCategories(output) {
  var categories = new Set();
  for (i = 1; i < output.length; ++i) {
    var subcategories = output[i][6].split(',');
    for (j = 0; j < subcategories.length; ++j) {
      if (subcategories[j] != "")
        categories.add(subcategories[j].trim());
    }
  }
  return categories;
}

function togglingCategories(state) {
  console.log(this.id + " " + state);
}

function addCheckboxesForCategories(categories) {
  var table = document.getElementById('checkboxesTable');
  var enabledCategories = {};

  for (i = 0; i < categories.length; ++i) {
    var row = table.insertRow(table.rows.length);

    var label = row.insertCell(0);
    label.innerHTML = categories[i];

    var checkbox = row.insertCell(1);
    var element = document.createElement("input");
    element.name = categories[i];
    element.type = "checkbox";
    element.checked = false;
    element.id = "category_" + String(i);
    element.onclick = togglingCategories;
    checkbox.appendChild(element);

    enabledCategories[element.name] = element.checked;
  }

  return enabledCategories;
}



var g_xhr = new XMLHttpRequest();
g_xhr.open( 'GET', 'quakemap.csv', true );
g_xhr.onreadystatechange = function() {
  if ( g_xhr.readyState === 4 && g_xhr.status === 200 ) {
    var parse = require('csv-parse');
    parse(g_xhr.responseText, function(err, output) {
      var categories = extractCategories(output);
      var enabledCategories = addCheckboxesForCategories(Array.from(categories));
      displayData(output, enabledCategories);
    });
    setupToolbar();
  }
}
g_xhr.send(null);
