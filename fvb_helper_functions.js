function make_table(table_data,float_param,bottle_param,selected_wmo,max_dist){
  cruise_data = table_data.data.map(row => row["CRUISE"]);
  wmo_data = table_data.data.map(row => row["WMO"]);
  depth_data = table_data.data.map(row => row["CTDPRS"])
  dist_data = table_data.data.map(row => row['dDist (km)']);
  float_data = table_data.data.map(row => row[float_param]);
  bottle_data = table_data.data.map(row => row[bottle_param]);

  //bottle_param == "" when selected parameter is distance. In this case, change the table headers and
  //return table_data that averages by cruise an wmo before calculating Z-scores
  if(bottle_param===""){
    diff_data = float_data
    //bottle_data = bottle_data.map((value,i)=>value=0)
    table_headers = [[`<b>Cruise</b>`],[`<b>WMO</b>`],
                    ["<b>Distance</b>"],[`<b>Z Score</b>`]];
    table_data = prep_distance_table(cruise_data,wmo_data,diff_data,selected_wmo,max_dist);
  } else{
    table_headers = [[`<b>Cruise</b>`],[`<b>WMO</b>`],[`<b>Depth</b>`],[`<b>Float</b>`], ["<b>Bottle</b>"],
            ["<b>Float - Bottle</b>"],[`<b>Z Score</b>`]];
            
    table_data = prep_difference_table(cruise_data,wmo_data,depth_data,float_data,bottle_data,dist_data,selected_wmo,max_dist);
  }

  var layout = {
    margin: {t: 30, b: 30, l: 30, r: 10},    
    width: 600,
    height: 290,
  }

  var data = [{
    type: 'table',
    header: {
      values: table_headers,
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
  display_plot = make_plot(input_data,selected_float_param,selected_bottle_param,plot_title,selected_wmo,selected_units);
  display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo,max_dist = 5000);

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

function make_plot(plot_data,float_param,bottle_param,plot_title,selected_wmo,selected_units){
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

  var traces = [];
  var layout = {
    autoexpand: true,
    yaxis: {autorange: "reversed",
      title: {text: "Depth (m)",
      font: {size: 14},standoff: 3}
    },
    xaxis: {title: {text: plot_title + " ("+selected_units+")",
      font: {size: 14},standoff: 3}
    },

    margin: {t: 20, b: 40, l: 50, r: 10},    
    width: 290,
    height: 290,
    hovermode: 'closest',
    showlegend: false,
    font: {family:  "Menlo,Consolas,monaco,monospace", size: 14},
    title: {text: `<b>${selected_wmo}</b>`,
            font: {family:  "Menlo,Consolas,monaco,monospace",size: 16},x:0.5, y: 0.97},
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

function make_summary_plot(plot_data,float_param,bottle_param,plot_title,max_dist){
  cruise_data = plot_data.data.map(row => row["CRUISE"]);
  wmo_data = plot_data.data.map(row => row["WMO"]);
  depth_data = plot_data.data.map(row => row["CTDPRS"]);
  float_data = plot_data.data.map(row => row[float_param]);
  dist_data = plot_data.data.map(row => row["dDist (km)"])
  bottle_data = plot_data.data.map(row => row[bottle_param]);
  // if(selected_bottle_param===""){
  //   bottle_data = bottle_data.map((value,i)=>value=0)
  // }
  complete_rows = find_keeper_rows(float_data,bottle_data,dist_data,max_dist,wmo_data,"");
  diff_data = float_data.map((value,i)=>value-bottle_data[i])
  diff_data = diff_data.filter((value,i)=>complete_rows[i])

  var layout = {
    autoexpand: true,
    xaxis: {title: {text: plot_title + " (Float - Bottle)",
      font: {size: 14},standoff: 4}
    },
    //margin controls the margin of the entire plotting area,
    //not individual subplots. Note that plotly's default
    //margins are relatively large, so removing the margin
    //line results in more comptessed plots. Also, The plot title
    //appears within the margin, so too small of a margin will push the
    //title into the axis
    margin: {t: 30, b: 40, l: 50, r: 10},    
    width: 290,
    height: 290,
    hovermode: 'closest',
    showlegend: false,
    font: {family:  "Menlo,Consolas,monaco,monospace", size: 14},
    plot_bgcolor: 'white',
  };

  var hist_trace = [{
      x: diff_data,
      type: 'histogram',
      name: "Bottle Data",
      opacity: 0.7,
      xaxis: "x1",
      yaxis: "y1"
    }]
    return {hist_trace, layout}
}

function find_matching_wmo(wmo_data,selected_wmo){
  //If no WMO is specified, return a vector of true values (prevents filtering in subsequent steps)
  if(selected_wmo === ""){
    wmo_row_matches = wmo_data.map((value,i) => value = true)
  }else{
    wmo_row_matches = wmo_data.map((value,i) => value === selected_wmo)
  }
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

function prep_distance_table(cruise_data,wmo_data,dist_data,selected_wmo,max_dist){
  //Calculate differences for all data to get z-scores
  cruise_avg = avg_by_group(wmo_data,cruise_data).output_values
  dist_avg = avg_by_group(wmo_data,dist_data).output_values
  wmo_avg = avg_by_group(wmo_data,cruise_data).output_groups
  
  keep = find_keeper_rows(dist_avg,dist_avg,dist_data,max_dist,wmo_data,selected_wmo);

  //keep = dist_avg.map((value,i) => Number.isFinite(value));
  dist_no_nulls = dist_avg.filter((value,i)=>keep[i]);
  dist_mean = ss.mean(dist_no_nulls);
  dist_sd = ss.standardDeviation(dist_no_nulls)

  cruise_filt = filter_values(cruise_avg,keep);
  wmo_filt = filter_values(wmo_avg,keep);
  dist_filt = filter_values(dist_avg,keep)
  dist_filt = dist_filt.map(value => value.toFixed(2))
  z_scores = dist_avg.map(value => clean_z(value,dist_mean,dist_sd))
  z_scores_filt = filter_values(z_scores,keep);

  sorted_indices = dist_filt
    .map((value,index) => ({value,index}))
    .sort((a,b) => b.value - a.value)
    .map(item => item.index)

  cruise_sorted = sorted_indices.map((value,i) => cruise_filt[value])
  wmo_sorted = sorted_indices.map((value,i) => wmo_filt[value])
  dist_sorted = sorted_indices.map((value,i) => dist_filt[value])
  z_sorted = sorted_indices.map((value,i) => z_scores_filt[value])

  table_data = [cruise_sorted,wmo_sorted,dist_sorted,z_sorted]

  return table_data;
}

function find_wmo_rows(wmo_data,selected_wmo){
  if(selected_wmo === ""){
    return(wmo_data.map((value,i)=>value = true))
  }
  let output_boolean = wmo_data.map((value,i) => value === selected_wmo);
  return(output_boolean);
}

function find_dist_rows(dist_data,max_depth,boolean_vector){
  output_boolean = boolean_vector.map((_,i) => boolean_vector[i] && dist_data[i] <= max_depth);
  return output_boolean;
}

function boolean_sum(boolean_vector){
  let output = boolean_vector.filter(value=>value)
  return output.length
}

function null_sum(vector){
  let output = vector.filter((value)=>value === null);
  return output.length;
}

function prep_difference_table(cruise_data,wmo_data,depth_data,float_data,bottle_data,dist_data,selected_wmo,max_dist){
  //Calculate differences for all data to get z-scores
  let diff_values = float_data.map((value,i)=>clean_subtract(value,bottle_data[i]))
  //Find rows with complete values
  let diff_keep = diff_values.map((value,i) => Number.isFinite(value));
  //Filter null values to caclulate statistics
  let diff_no_nulls = diff_values.filter((value,i)=>diff_keep[i]);
  let diff_mean = ss.mean(diff_no_nulls);
  let diff_sd = ss.standardDeviation(diff_no_nulls)
  let z_scores = diff_values.map(value => clean_z(value,diff_mean,diff_sd))

  let wmo_rows = find_wmo_rows(wmo_data,selected_wmo);
  //console.log(wmo_rows.length,"Rows in Boolean", boolean_sum(wmo_rows),"retained")
  //console.log("Retained rows after WMO filter ", boolean_sum(wmo_rows))
  final_rows = find_dist_rows(dist_data,max_dist,wmo_rows);
  //console.log("Retained rows after distance filter ", boolean_sum(final_rows))
  //console.log(keep_rows)
  // console.log(boolean_sum(keep_rows));
  // NOTE! Missing values should not be filtered out!!
  let cruise_filt = filter_values(cruise_data,final_rows);
  let wmo_filt = filter_values(wmo_data,final_rows);
  let depth_filt = filter_values(depth_data,final_rows);
  let float_filt = filter_values(float_data,final_rows);
  let bottle_filt = filter_values(bottle_data,final_rows);
  let diff_filt = filter_values(diff_values,final_rows);
  let z_filt = filter_values(z_scores,final_rows);

  // console.log("Nulls in final bottle vector", null_sum(bottle_filt));
  // console.log("Retained rows: ", boolean_sum(final_rows));

  // console.log("Selected WMO:",selected_wmo)
  // console.log("Float data:",float_filt.length)
  // console.log("Bottle data:",bottle_filt.length)
  // console.log("Depth data:",depth_filt.length)
  // console.log("Dist data:",diff_filt.length)
  // console.log("Max dist:",max_dist)

  sorted_indices = z_filt
    .map((value,index) => ({value,index}))
    .sort((a,b) => Math.abs(b.value) - Math.abs(a.value))
    .map(item => item.index)

  cruise_sorted = sorted_indices.map((value,i) => cruise_filt[value])
  wmo_sorted = sorted_indices.map((value,i) => wmo_filt[value])
  depth_sorted = sorted_indices.map((value,i) => depth_filt[value])
  bottle_sorted = sorted_indices.map((value,i) => bottle_filt[value])
  float_sorted = sorted_indices.map((value,i) => float_filt[value])
  diff_sorted = sorted_indices.map((value,i) => diff_filt[value])
  z_sorted = sorted_indices.map((value,i) => z_filt[value])

  table_data = [cruise_sorted,wmo_sorted,depth_sorted,float_sorted,bottle_sorted,diff_sorted,z_sorted]

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

 
    if(typeof values[1] === "number"){
      output_values.push(ss.mean(values_filt))
    }
    if(typeof values[1] === "string"){
      output_values.push(values_filt[0])
    }

    output_groups.push(current_group)
  }
  return{output_groups,output_values}
}

function filter_values(values, booleans){
  output = values.filter((value,i) => booleans[i])
  return output
}

function find_complete_rows(x,y,booleans){
  output = booleans.map((value,i)=>x[i] !== null & y[i] !== null & value)
  return output
}

async function make_map(plot_data,selected_float_param,selected_bottle_param,plot_title,max_dist,selected_wmo){

  wmo_data = plot_data.data.map(row => row["WMO"]);
  lat_data = plot_data.data.map(row => row["LATITUDE"])
  lon_data = plot_data.data.map(row => row["LONGITUDE"])
  dist_data = plot_data.data.map(row => row["dDist (km)"])

  float_data = plot_data.data.map(row => row[selected_float_param]);
  bottle_data = plot_data.data.map(row => row[selected_bottle_param]);
  
  //complete_rows = find_keeper_rows(float_data,bottle_data,dist_data,max_dist,wmo_data,selected_wmo);
  let wmo_rows = find_wmo_rows(wmo_data,selected_wmo);
  let dist_rows = find_dist_rows(dist_data,max_dist,wmo_rows);
  let complete_rows = find_complete_rows(float_data,bottle_data,dist_rows);

  console.log(max_dist)
  console.log(selected_wmo)
  wmo_data_filt = filter_values(wmo_data,complete_rows);
  lat_data_filt = filter_values(lat_data,complete_rows);
  lon_data_filt = filter_values(lon_data,complete_rows);
  dist_data_filt = filter_values(dist_data,complete_rows)
  float_filt = filter_values(float_data,complete_rows);
  bottle_filt = filter_values(bottle_data,complete_rows);
  diff_filt = float_filt.map((value,i)=>value-bottle_filt[i]);
  legend_title = plot_title + " ("+selected_units+")";
  wmo_data_unq = avg_by_group(wmo_data_filt,diff_filt).output_groups
  lat_data_avg = avg_by_group(wmo_data_filt,lat_data_filt).output_values;
  lon_data_avg = avg_by_group(wmo_data_filt,lon_data_filt).output_values;
  lat_data_avg = avg_by_group(wmo_data_filt,lat_data_filt).output_values;
  diff_data_avg = avg_by_group(wmo_data_filt,diff_filt).output_values;
  dist_data_avg = avg_by_group(wmo_data_filt,dist_data_filt).output_values;

  const {color_scale, min_value, mid_value, max_value } = make_palette(diff_data_avg);

  var map = L.map('map_content', {
    center: [0,0],
    zoom: 2,
    zoomSnap: 0.25,
    //dragging: false,
    maxBoundsViscosity: 1.0,
    zoomControl: false,
    attributionControl: false})
  
  leafletMap = map; // Save the map so we can remove it later

  const ocean_res = await fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_ocean.json');
  const ocean = await ocean_res.json();
  L.geoJSON(ocean,{color:'#5BBCD6',
    weight: 0.5,
    color: 'black',
    fillColor: '#ADD8E6',
    fillOpacity: 1,
    pane: "tilePane"}).addTo(map);

  for(let i = 0; i < lon_data_avg.length; i++){
    let tooltip_string = `<b>WMO: </b> ${wmo_data_unq[i]}<br>
                          <b>LAT: </b> ${lat_data_avg[i].toFixed(2)}<br>
                          <b>LON: </b> ${lon_data_avg[i].toFixed(2)}<br>
                          <b>Float/Bottle Distance</b> ${dist_data_avg[i].toFixed(2)}`
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
map.createPane("graticulePane");
map.getPane("graticulePane").style.zIndex = 650;  // Higher than polygons/circles

L.latlngGraticule({
    showLabel: true,
    color: "black",
    opacity: 0.6,
    zoomInterval: [
        {start: 2, end: 3, interval: 30},
        {start: 4, end: 4, interval: 10},
        {start: 5, end: 7, interval: 5},
        {start: 8, end: 10, interval: 1}
    ],
    pane: "graticulePane"
}).addTo(map);

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
        <b>Float-Bottle<br>
        ${legend_title}</b>
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

function find_keeper_rows(x,y,dist_data,filter_dist,wmo_data,selected_wmo){
  if(selected_wmo === ""){
    keep_rows = wmo_data.map((value,i)=>value=true)
    keep_rows = keep_rows.map((val,i) => Number.isFinite(x[i]) && Number.isFinite(y[i]) && dist_data[i] <= filter_dist);
  } else{
    keep_rows = keep.map((val,i) => Number.isFinite(x[i]) && Number.isFinite(y[i]) && dist_data[i] <= filter_dist && wmo_data[i] == selected_wmo);
  }
  return(keep_rows);
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
