function make_table(table_data,float_param,bottle_param,selected_wmo){
  cruise_data = table_data.data.map(row => row["CRUISE"]);
  wmo_data = table_data.data.map(row => row["WMO"]);
  depth_data = table_data.data.map(row => row["CTDPRS"])
  float_data = table_data.data.map(row => row[float_param]);
  bottle_data = table_data.data.map(row => row[bottle_param]);

  table_data = prep_table_data(cruise_data,wmo_data,depth_data,float_data,bottle_data,selected_wmo);

  var layout = {
    margin: {t: 30, b: 30, l: 30, r: 10},    
    width: 450,
    height: 300,
    // title: {text: selected_wmo,
    //   font: {size: 12, family:"Menlo,Consolas,monaco,monospace"}
    // }
  }
  

  var data = [{
    type: 'table',
    header: {
      values: [[`<b>Cruise</b>`],[`<b>WMO</b>`],[`<b>Depth</b>`],[`<b>Bottle</b>`], ["<b>Float</b>"],
              ["<b>Bottle - Float</b>"],[`<b>Z Score</b>`]],
      align: ["left", "center"],
      line: {width: 0.5, color: 'black'},
      fill: {color: '#4D9DE0'},
      font: {family: "Menlo,Consolas,monaco,monospace", size: 12, color: "white"}
    },
    cells: {
      values: table_data,
      align: ["left", "center"],
      line: {color: "black", width: 0.5},
      fill: {color: ['white']},
      font: {family: "Menlo,Consolas,monaco,monospace", size: 11, color: ["#506784"]}
    }
  }]
  return{data,layout};
}

function plot_wrapper(input_data,selected_wmo,selected_float_param,selected_bottle_param){
  display_plot = make_plot(input_data,selected_float_param,selected_bottle_param,plot_title,selected_wmo);
  display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo);

  Plotly.newPlot('plot_content',
    display_plot.traces,
    display_plot.layout,
    { displayModeBar: false }
  );

  Plotly.newPlot('table_content',
    display_table.data,
    display_table.layout,
    { displayModeBar: false }
  );

}

function make_plot(plot_data,float_param,bottle_param,plot_title,selected_wmo){
  cruise_data = plot_data.data.map(row => row["CRUISE"]);
  wmo_data = plot_data.data.map(row => row["WMO"]);
  depth_data = plot_data.data.map(row => row["CTDPRS"]);
  float_data = plot_data.data.map(row => row[float_param]);
  bottle_data = plot_data.data.map(row => row[bottle_param]);

  wmo_rows = find_matching_wmo(wmo_data,selected_wmo);
  wmo_filt = filter_values(wmo_data,wmo_rows);
  depth_filt = filter_values(depth_data,wmo_rows);
  float_filt = filter_values(float_data,wmo_rows);
  bottle_filt = filter_values(bottle_data,wmo_rows)
  // complete_rows = find_complete_rows(float_var,bottle_var);
  // wmo_filt = filter_values(wmo_data,complete_rows);
  // float_filt = filter_values(float_var,complete_rows);
  // bottle_filt = filter_values(bottle_var,complete_rows);
  // diff_data = float_filt.map((value,i)=>value-bottle_filt[i])

  var traces = [];
  var layout = {
    // grid: { rows: 1, columns: 3, pattern: 'independent',
    //   xgap: 0.2},
    autoexpand: true,
    yaxis: {autorange: "reversed",
      title: {text: "Depth (m)",
      font: {size: 12},standoff: 3}
    },
    xaxis: {title: {text: plot_title,
      font: {size: 12},standoff: 3}
    },
    //margin controls the margin of the entire plotting area,
    //not individual subplots. Note that plotly's default
    //margins are relatively large, so removing the margin
    //line results in more comptessed plots. Also, The plot title
    //appears within the margin, so too small of a margin will push the
    //title into the axis
    margin: {t: 30, b: 30, l: 50, r: 10},    
    width: 400,
    height: 300,
    hovermode: 'closest',
    showlegend: false,
    // title: {text: plot_title,
    //     font: {size: 12}, standoff: 7},
    font: {family:  "Menlo,Consolas,monaco,monospace", size: 14},
    plot_bgcolor: 'white',
  };
  var bottle_trace = {
      x: bottle_filt,
      y: depth_filt,
      type: 'scatter',
      mode: 'markers',
      name: "Bottle Data",
      opacity: 0.7,
      marker: {line: {width: 1},size: 4, opacity: 0.7, color: '#0397A8'},
      xaxis: "x1",
      yaxis: "y1"
    }

    var float_trace = {
      x: float_filt,
      y: depth_filt,
      // text: wmo_plot_data,
      //hovertemplate: '<b>WMO: </b>%{text} <br><b>Cruise:</b><extra></extra>',
      type: 'scatter',
      mode: 'markers',
      name: 'Float Data',
      opacity: 0.7,
      marker: {line: {width: 1},size: 4, opacity: 0.7, color: '#F89D28'},
      xaxis: "x1",
      yaxis: "y1"
    }

    traces.push(bottle_trace);
    traces.push(float_trace);
    return {traces, layout}
}

function find_matching_wmo(wmo_data,selected_wmo){
  wmo_row_matches = wmo_data.map((value,i) => value == selected_wmo)
  return(wmo_row_matches);
}

clean_subtract = function(x,y){
  if(x == null || y == null){
    return(null)
  } 
  return Number((x-y).toFixed(2));
}

clean_z = function(x,mean,sd){
  if(x == null){
    return(null)
  } 
  return ((x-mean)/sd).toFixed(2)
}

function prep_table_data(cruise_data,wmo_data,depth_data,float_data,bottle_data,selected_wmo){
  //Calculate differences for all data to get z-scores
  diff_values = float_data.map((value,i)=>clean_subtract(value,bottle_data[i]))
  keep = diff_values.map((value,i) => Number.isFinite(value));

  diff_no_nulls = diff_values.filter((value,i)=>keep[i]);
  // console.log(diff_no_nulls)
  diff_mean = ss.mean(diff_no_nulls);
  diff_sd = ss.standardDeviation(diff_no_nulls)

  wmo_rows = find_matching_wmo(wmo_data,selected_wmo);
  cruise_filt = filter_values(cruise_data,wmo_rows);
  wmo_filt = filter_values(wmo_data,wmo_rows);
  depth_filt = filter_values(depth_data,wmo_rows);
  float_filt = filter_values(float_data,wmo_rows);
  bottle_filt = filter_values(bottle_data,wmo_rows);

  diff_values = float_filt.map((value,i)=>clean_subtract(value,bottle_filt[i]))
  z_scores = diff_values.map(value => clean_z(value,diff_mean,diff_sd))

  //Use absolute value here to make sure that negative
  //values more than three standard deviations from mean
  //are included as well
  //outlier_row = z_scores.map(value => Math.abs(value) > 0);
  
  // diff_table_data = filter_values(diff_values,outlier_row);
  // diff_abs = diff_table_data.map(value => Math.abs(value));
  // bottle_table_data = filter_values(bottle_filt,outlier_row);
  // float_table_data = filter_values(float_filt,outlier_row);
  // wmo_table_data = filter_values(wmo_filt, outlier_row);
  // z_table_data = filter_values(z_scores,outlier_row);
  // cruise_table_data =filter_values(cruise_filt,outlier_row);

  sorted_indices = depth_filt
    .map((value,index) => ({value,index}))
    .sort((a,b) => a.value - b.value)
    .map(item => item.index)

  cruise_sorted = sorted_indices.map((value,i) => cruise_filt[value])
  wmo_sorted = sorted_indices.map((value,i) => wmo_filt[value])
  depth_sorted = sorted_indices.map((value,i) => depth_filt[value])
  bottle_sorted = sorted_indices.map((value,i) => bottle_filt[value])
  float_sorted = sorted_indices.map((value,i) => float_filt[value])
  diff_sorted = sorted_indices.map((value,i) => diff_values[value])
  z_sorted = sorted_indices.map((value,i) => z_scores[value])
  // diff_table_data = sorted_indices.map((value,i) => diff_table_data[value].toFixed(2))
  // cruise_table_data = sorted_indices.map((value,i) => cruise_table_data[value])
  // wmo_table_data = sorted_indices.map((value,i) => wmo_table_data[value])
  // bottle_table_data = sorted_indices.map((value,i) => bottle_table_data[value].toFixed(2))
  // float_table_data = sorted_indices.map((value,i) => float_table_data[value].toFixed(2))
  // z_table_data = sorted_indices.map((value,i) => z_table_data[value].toFixed(2))
  // table_data = [cruise_table_data,wmo_table_data,float_table_data,bottle_table_data,diff_table_data,z_table_data]
  table_data = [cruise_sorted,wmo_sorted,depth_sorted,bottle_sorted,float_sorted,diff_sorted,z_sorted]
  return table_data;
}

function avg_by_group(groups,values){
  unique_groups = [...new Set(groups)]
  let output_groups = []
  let output_values = []
  for(let i = 0; i < unique_groups.length; i++){
    current_group = unique_groups[i]
    keepers = groups.map((value,i) => value == current_group)
    values_filt = values.filter((value,i)=>keepers[i])
    output_values.push(ss.mean(values_filt))
    output_groups.push(current_group)
  }
  return{output_groups,output_values}
}

function filter_values(values, booleans){
  output = values.filter((value,i) => booleans[i])
  return output
}

async function make_map(plot_data,selected_float_param,selected_bottle_param,plot_title){
  wmo_data = plot_data.data.map(row => row["WMO"]);
  lat_data = plot_data.data.map(row => row["LATITUDE"])
  lon_data = plot_data.data.map(row => row["LONGITUDE"])
  float_data = plot_data.data.map(row => row[selected_float_param]);
  bottle_data = plot_data.data.map(row => row[selected_bottle_param]);
  complete_rows = find_complete_rows(float_data,bottle_data);
  wmo_data_filt = filter_values(wmo_data,complete_rows)
  lat_data_filt = filter_values(lat_data,complete_rows)
  lon_data_filt = filter_values(lon_data,complete_rows)
  float_filt = filter_values(float_data,complete_rows);
  bottle_filt = filter_values(bottle_data,complete_rows);
  diff_filt = float_filt.map((value,i)=>value-bottle_filt[i]);

  wmo_data_unq = avg_by_group(wmo_data_filt,diff_filt).output_groups
  lat_data_avg = avg_by_group(wmo_data_filt,lat_data_filt).output_values;
  lon_data_avg = avg_by_group(wmo_data_filt,lon_data_filt).output_values;
  lat_data_avg = avg_by_group(wmo_data_filt,lat_data_filt).output_values;
  diff_data_avg = avg_by_group(wmo_data_filt,diff_filt).output_values;

  const {color_scale, min_value, mid_value, max_value } = make_palette(diff_data_avg);

  // var container = L.DomUtil.get('plot_content');

  // if(container != null){
  //   container._leaflet_id = null;
  // }

  var map = L.map('map_content', {
    center: [0,0],
    zoom: 1.5,
    maxBoundsViscosity: 1.0,
    zoomControl: false,
    attributionControl: false})
  
  map.fitBounds([[50,-180],[-70,180]])
  leafletMap = map; // Save the map so we can remove it later

  const ocean_res = await fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_ocean.json');
  const ocean = await ocean_res.json();
  L.geoJSON(ocean,{color:'#5BBCD6',weight: 0.5,color: 'black',fillColor: '#ADD8E6',fillOpacity: 1}).addTo(map);

  for(let i = 0; i < lon_data_avg.length; i++){
    let tooltip_string = `<b>WMO: </b> ${wmo_data_unq[i]}`
    L.circleMarker([lat_data_avg[i],lon_data_avg[i]],
      {fillColor: color_scale(diff_data_avg[i]).hex(),color: "black",weight: 0.5,fillOpacity: 1,radius: 2.5})
    .bindTooltip(tooltip_string, 
      {permanent: false, direction: 'top', offset: [0, -5], fillColor: '#0397A8'})
    .addTo(map)
    .on('click', function () {
      selected_wmo = wmo_data_unq[i];
      plot_wrapper(input_data,selected_wmo,selected_float_param,selected_bottle_param)
    })
  }

//Create legend, positioned on the bottomright
const legend = L.control({ position: 'bottomright' });

//legend.onAdd runs a specified function when the legend is added to the map
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');

  // Calculate mid value
  //const mid_value = (min_value + max_value) / 2;

  // Get colors for min, mid, max using chroma color_scale function 
  //(returned by the make_palette function)
  const minColor = color_scale(min_value).hex();
  const midColor = color_scale(0).hex();
  const maxColor = color_scale(max_value).hex();
  
  //Following code structure mostly from chat GPT with modifications
  //(e.g., grid layout) to improve appearance. Note that in grid-layout
  //grid-area definitions are non-inclusive. Format is
  //start_row/start_col/end_row/end_col
  div.innerHTML = `
    <div id = legend_container style="
        display: grid; 
        border: 1px solid;
        border-color: black;
        padding: 5px;
        align-items: center; 
        grid-template-rows: 70px 100px;
        grid-template-columns: 40px 40px;">
      <div id = title_text style="
        grid-area: 1/1/2/3;
        align-items: center;
        text-align: center;
        width: 100%;
        margin-bottom: 10px;">
        <b>Bottle-Float<br>
        ${plot_title}</b>
      </div>
      <div id colorbar style="
          grid-area: 2/1/2/1;
          margin-left: 5px;
          background: linear-gradient(
            to top,
            ${minColor} 0%,
            ${midColor} 50%,
            ${maxColor} 100%
          );
          height: 100%;
          width: 60%;">
      </div>
      <div id colorbar_text style="
        font-size: 12px; 
        display: flex;
        height: 100%;
        text-align: left;
        flex-direction: column;
        grid-area: 2/2/2/3;
        justify-content: space-between">
        <div>${max_value.toFixed(2)}</div>
        <div>${0}</div>
        <div>${min_value.toFixed(2)}</div>
      </div>
    </div>
  `;

  div.style.position = 'relative';
  div.style.border = "black"
  div.style.background = 'white';
  //div.style.padding = '8px';
  //div.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';
  div.style.display = 'grid';
  div.style.alignItems = 'center';

  return div;
};
  //Add legend to map; legend is styled based on legend.onAdd
  legend.addTo(map);
  
  return map
}

function make_palette(input_data){
  //Note use of spread operator (...) to unlist array
  const min_value = Math.min(...input_data)
  const mid_value = ss.median(input_data)
  const max_value = Math.max(...input_data)
  const color_scale =  chroma.scale(['5083BB','FFFFBF','DE3F2E']).domain([min_value,0, max_value]);
  //const color_values = input_data.map(val => color_scale(val).hex());

  //Create binned values depending on specified resolution
  //data_values_binned = input_data.map(row => Math.round(row/resolution) * resolution)
  //Create array of unique bin values
  //data_bins = [...new Set(data_values_binned)].sort()
  //palette = chroma.scale('Spectral').colors(data_bins.length)
  //color_values = data_values_binned.map(row => palette[data_bins.indexOf(row)])
  return { color_scale, min_value, mid_value, max_value};
}

function find_complete_rows(x,y){

  //Create keep as array of booleans indicating whether numeric values are available
  //for both x and y at the given index
  const keep = x.map((val,i) => Number.isFinite(val) && Number.isFinite(y[i]));
  return(keep)
}
//   let aux_filter = null;
//   if(aux != null){
//     //.filter() iterates through an array and only keeps elements that pass a 
//     //conditional test. In the following, the test is just whether the corresponding
//     //value of keep is true/false.
//     aux_filter = aux.filter((_,i)=>keep[i]);
//   }

//   //x.filter only retains values from x where keep == TRUE
//   const x_filter = x.filter((_,i)=>keep[i]);
//   //y.filter only retains values from y where keep == TRUE
//   const y_filter = y.filter((_,i)=>keep[i]);
//   //x_filter.map calculates the difference between x_filter and y_filter
//   //for each element in x_filter.
//   const diff = x_filter.map((val,i) => val-y_filter[i]);
//   return {diff,keep};
// }

//Model II regression code adapted from MATLAB provided at...
//https://www.mbari.org/technology/matlab-scripts/linear-regressions/
const model_II_regress = (X,Y) => {
    n = X.length
    Sx = X.reduce((a,b) => a + b);
    Sy = Y.reduce((a,b) => a + b,0);
    xbar = Sx/n;
    ybar = Sy/n;

    U = X.map(row => row - xbar);
    V = Y.map(row => row - ybar);
    UV = U.map((row,i) => row * V[i])
    SUV = UV.reduce((a,b) => a + b)
    U2 = U.map(row => row**2);
    V2 = V.map(row => row**2);
    SU2 = U2.reduce((a,b) => a + b);
    SV2 = V2.reduce((a,b) => a+b)

    sigx = (SU2/(n-1))**(1/2)
    sigy = (SV2/(n-1))**(1/2)
    slope = ((SV2 - SU2 + Math.sqrt(((SV2 - SU2)**2)+(4 * SUV**2)))/(2*SUV))
    intercept = ybar - slope * xbar
    r = SUV/Math.sqrt(SU2 * SV2)
    r2 = r**2
    return {slope, intercept, r, r2};
}

//The HTML runs autocomplete via JS with inp = "myInput" and arr = countries
//"myInput" is the ID for the HTML input field
function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  //An event listener is added to inp; this is kind of crazy. The javascript
  //function can monitor the HTML element even within the context of the function?
  inp.addEventListener("input", function(e) {
      //'this' refers to the element the event listener is attached to.
      //'this.value' returns the value that 'this' contains.
      //a, b, and i are all undeclared in this case. Only val is assigned to this.value
      //The following formatting leaves a, b, i undeclared.
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      //This creates a container for the matching elements
      a = document.createElement("DIV");
      //This sets the css id for a to 'autocomplete-list,' which is defined in the CSS
      a.setAttribute("id", this.id + "autocomplete-list");
      //This sets the css class for 'a' to 'autocomplete-items.'
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      //This loops through each element in the input array
      for (i = 0; i < arr.length; i++) {
  
        //This takes element 'i' from array, creates a substring from the start of the element
        //to the current legnth of val (which corresponds to the input from the event listener),
        //and evaluates whether it matches the current value
        if (String(arr[i]).slice(0, val.length) == String(val)) {
          //In the event of a match, the following code creates a div container 'b' 
          b = document.createElement("DIV");
          //Sets the matching segment of arr[i] to bold face
          b.innerHTML = "<strong>" + String(arr[i]).slice(0, val.length) + "</strong>";
          //I think this part adds the current arr value to other matches?
          b.innerHTML += String(arr[i]).slice(val.length);
          //and does something else
          b.innerHTML += "<input type='hidden' value='" + String(arr[i]) + "'>";
          //The following adds a listener to b, and changes the value of inp to 
          b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  //This listener listens for a keypress
  inp.addEventListener("keydown", function(e) {
      //If a keypress occurs, the id of the selected item is stored as x
      var x = document.getElementById(this.id + "autocomplete-list");
      //Not sure what this line does
      if (x) x = x.getElementsByTagName("div");
      //If the DOWN key is pressed, currentFocus is increased (initialized as -1)
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        //Run addActive function
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
} 


function filter_by_wmo_cruise(input_data,input_wmos,selected_wmos){
  wmo_test = input_wmos.map(row => selected_wmos.includes(row));
  data_result = input_data.filter((_,i)=>wmo_test[i]);
  return(data_result);
}

function refresh(){
  //Lines to the next comment are very much Chat GPT, but are 
  //required to clear the plotting space after a Leaflet map is generated.
  //Leaflet seems to alter "plot_content," creating issues when displaying
  //scatterplots. It also addresses issues where the map cannot be drawn a 
  //second time after being initialized.  
  const oldContainer = document.getElementById("map_content");
  const parent = oldContainer.parentNode;

  oldContainer.remove();

  // Recreate the container
  const newContainer = document.createElement("div");
  newContainer.id = "map_content";
  newContainer.gridRow = "1/2";
  newContainer.gridColumn = "2/4"; 
  //newContainer.style.width = "800px";
  //newContainer.style.height = "300px";
  newContainer.backgroundColor = 'white';
  newContainer.overflow = 'hidden';
  parent.appendChild(newContainer);
}
