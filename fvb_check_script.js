const container = document.getElementById('app-container');
container.innerHTML =
    `<div class = "app-container">
        <div class = "controls">
          <input type="file" id="fileInput">
          <div class = "dropdown" id = "params">
              <button>Parameters</button>
              <div class = "content" id = "param_content">
                <a>Nitrate</a>
                <a>pH</a>
                <a>Oxygen</a>
                <a>DIC</a>
                <a>pCO2</a>
                <a>Alkalinity</a>
                <a>Chlorophyll</a>
                <a>Location</a>
              </div>
          </div>
          <div class = "dropdown" id = "plot_type">
              <button>Plot Type</button>
              <div class = "content">
                  <a>Histogram</a>
                  <a>Profiles</a>
                  <a>Anomaly Profiles</a>
                  <a>Map</a>
              </div>
          </div>
        </div>
        <div id="plot_content" style="width:300px;height:300px;"></div>
        <div id="table_content" style="width:600px;height:500px;"></div>
    </div>`


    
const dropdown_options = document.getElementById('param_content')
let input_data;
//let input_param = "Nitrate";
let selected_float_param = "Float Nitrate";
let selected_bottle_param = "NITRAT";
let plot_title = "Nitrate"
//Run metadata retriever; generate initial wmo_list and 
//run wrapper with all wmos

const fileInput = document.getElementById('fileInput');
const param_content = document.getElementById('param_content');
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
  file_path = event.target.files[0];
  Papa.parse(file_path, {
    header: true,
    dynamicTyping: true,
    transformHeader: h => h.replace(/[^\x20-\x7E]/g, ''),
    transformHeader: h => h.replace(/\[.+\]/g,''),
    //transformHeader: h => h.replace(' ','_'),
    complete: function(results) {
      input_data = results
      console.log(input_data.data[0]);
      //console.log(results.data[1])
      //wmo_list = results.data.map(data => data["Float Nitrate[mol/kg]"])
      //console.log(wmo_list)
      display_plot = make_plot(results,selected_float_param,selected_bottle_param,plot_title);
      display_table = make_table(results,selected_float_param,selected_bottle_param,plot_title);
      console.log(display_table);
      Plotly.newPlot('plot_content',
        [display_plot.trace],
        display_plot.layout,
        { displayModeBar: false }
      );
      Plotly.newPlot('table_content',
        display_table.data,
        display_table.layout,
        { displayModeBar: false }
      );
    }
  });
}

param_content.addEventListener("click",function(event){
  if(event.target.tagName == "A"){
    plot_title = event.target.textContent
    if(plot_title === "Nitrate"){
      selected_float_param = "Float Nitrate"
      selected_bottle_param = "NITRAT"
    }
    if(plot_title === "pH"){
      selected_float_param = "Float pHinsitu"
      selected_bottle_param = "PH_TOT_INSITU"
    }
    if(plot_title === "Oxygen"){
      selected_float_param = "Float Oxygen"
      selected_bottle_param = "OXYGEN"
    }
    if(plot_title === "DIC"){
      selected_float_param = "Float DIC_LIAR"
      selected_bottle_param = "TCARBN"
    }
    if(plot_title === "pCO2"){
      selected_float_param = "Float pCO2_LIAR"
      selected_bottle_param = "NITRAT"
    }
    if(plot_title === "Alkalinity"){
      selected_float_param = "Float TALK_LIAR"
      selected_bottle_param = "ALKALI"
    }

    display_plot = make_plot(input_data,selected_float_param,selected_bottle_param,plot_title);
    display_table = make_table(input_data,selected_float_param,selected_bottle_param,plot_title);

    Plotly.newPlot('plot_content',
        [display_plot.trace],
        display_plot.layout,
        { displayModeBar: false }
    );
    Plotly.newPlot('table_content',
        display_table.data,
        display_table.layout
    );
  }
})

function make_table(table_data,float_param,bottle_param,plot_title){
  cruise_data = table_data.data.map(row => row["CRUISE"]);
  wmo_data = table_data.data.map(row => row["WMO"]);
  float_var = table_data.data.map(row => row[float_param]);
  bottle_var = table_data.data.map(row => row[bottle_param]);
  diff_data = calculate_diff(float_var,bottle_var,null);
  table_data = get_table_data(cruise_data,wmo_data,diff_data.diff,diff_data.x_filter,diff_data.y_filter);

  var layout = {
    margin: {t: 30, b: 50, l: 50, r: 50},    
    title: {text: "Potential Outliers (z-score > 3)",
      font: {size: 12, family:"Menlo,Consolas,monaco,monospace"}
    }
  }
  

  var data = [{
    type: 'table',
    header: {
      values: [[`<b>Cruise</b>`],[`<b>WMO</b>`],[`<b>Float</b>`], ["<b>Bottle</b>"],
              ["<b>Float - Bottle</b>"],["<b>Z Score</b>"]],
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

function make_plot(plot_data,float_param,bottle_param,plot_title){
  cruise_data = plot_data.data.map(row => row["CRUISE"]);
  wmo_data = plot_data.data.map(row => row["WMO"]);
  float_var = plot_data.data.map(row => row[float_param]);
  bottle_var = plot_data.data.map(row => row[bottle_param]);
  diff_data = calculate_diff(float_var,bottle_var,null).diff;

  var layout = {
    // grid: { rows: 1, columns: 3, pattern: 'independent',
    //   xgap: 0.2},
    autoexpand: true,
    //margin controls the margin of the entire plotting area,
    //not individual subplots. Note that plotly's default
    //margins are relatively large, so removing the margin
    //line results in more comptessed plots. Also, The plot title
    //appears within the margin, so too small of a margin will push the
    //title into the axis
    margin: {t: 30, b: 50, l: 50, r: 50},    
    width: 300,
    height: 300,
    hovermode: 'closest',
    showlegend: false,
    title: {text: plot_title,
        font: {size: 12}, standoff: 7},
    font: {family:  "Menlo,Consolas,monaco,monospace", size: 14},
    plot_bgcolor: 'white',
  };

  var trace = {
      x: diff_data,
      type: 'histogram',
      marker: {color: '#4D9DE0'}
  }

    return {trace, layout}

}

function get_table_data(input_cruise, input_wmo, diff_values,float_values,bottle_values){

  z_scores = diff_values.map(row => (row-ss.mean(diff_values))/ss.standardDeviation(diff_values))

  //Use absolute value here to make sure that negative
  //values more than three standard deviations from mean
  //are included as well
  keep = z_scores.map(value => Math.abs(value) > 3);

  diff_filt = diff_values.filter((_,i) => keep[i]);
  diff_abs = diff_filt.map(value => Math.abs(value));
  cruise_filt = input_cruise.filter((_,i) => keep[i]);
  wmo_filt = input_wmo.filter((_,i) => keep[i]);
  bottle_filt = bottle_values.filter((_,i) => keep[i]);
  float_filt = float_values.filter((_,i)=>keep[i]);
  z_score_filt = z_scores.filter((_,i)=>keep[i]);

  sorted_indices = diff_abs
    .map((value,index) => ({value,index}))
    .sort((a,b) => b.value - a.value)
    .map(item => item.index)

  diff_sort = sorted_indices.map((value,i) => diff_filt[value].toFixed(2))
  cruise_sort = sorted_indices.map((value,i) => cruise_filt[value])
  wmo_sort = sorted_indices.map((value,i) => wmo_filt[value])
  bottle_sort = sorted_indices.map((value,i) => bottle_filt[value].toFixed(2))
  float_sort = sorted_indices.map((value,i) => float_filt[value].toFixed(2))
  z_score_sort = sorted_indices.map((value,i) => z_score_filt[value].toFixed(2))
  table_data = [cruise_sort,wmo_sort,float_sort,bottle_sort,diff_sort,z_score_sort]
  return(table_data);
}

function calculate_diff(x,y,aux){

  //Create keep as array of booleans indicating whether numeric values are available
  //for both x and y at the given index
  const keep = x.map((val,i) => Number.isFinite(val) && Number.isFinite(y[i]));

  let aux_filter = null;
  if(aux != null){
    //.filter() iterates through an array and only keeps elements that pass a 
    //conditional test. In the following, the test is just whether the corresponding
    //value of keep is true/false.
    aux_filter = aux.filter((_,i)=>keep[i]);
  }

  //x.filter only retains values from x where keep == TRUE
  const x_filter = x.filter((_,i)=>keep[i]);
  //y.filter only retains values from y where keep == TRUE
  const y_filter = y.filter((_,i)=>keep[i]);
  //x_filter.map calculates the difference between x_filter and y_filter
  //for each element in x_filter.
  const diff = x_filter.map((val,i) => val-y_filter[i]);
  return {diff,aux_filter,x_filter,y_filter};
}