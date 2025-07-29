const container = document.getElementById('app-container');
container.innerHTML =
    `<div class = "app-container">
        <div class = "ui">
          <label for="fileInput" class="custom-file-label">Upload File</label>
          <input type="file" id="fileInput" class="hidden-file-input">
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
                <a>Space</a>
                <a>Time</a>
              </div>
          </div>
          <div id = "reset">
            <button>Reset Selections</button>
          </div>
        </div>
        <div id="map_content"></div>
        <div id="plot_content"></div>
        <div id="table_content"></div>
    </div>`


    
const dropdown_options = document.getElementById('param_content')
let input_data;
//let input_param = "Nitrate";
let selected_float_param = "Float Nitrate";
let selected_bottle_param = "NITRAT";
let plot_title = "Nitrate"
let selected_wmo;
let selected_units = "\u03BCmol/kg";
//Run metadata retriever; generate initial wmo_list and 
//run wrapper with all wmos

const fileInput = document.getElementById('fileInput');
const param_content = document.getElementById('param_content');
const reset_clicked = document.getElementById('reset');
const map_content = document.getElementById('map_content');

fileInput.addEventListener('change', handleFileSelect);
reset_clicked.addEventListener('click', function(event){
  refresh();
  let selected_float_param = "Float Nitrate";
  let selected_bottle_param = "NITRAT";
  let plot_title = "Nitrate"
  let selected_units = "\u03BCmol/kg";

  display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title,selected_units)
  display_plot = make_summary_plot(input_data,selected_float_param,selected_bottle_param,plot_title,selected_units);
  display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo="",sort_column="z-scores");

  Plotly.newPlot('plot_content',
    display_plot.hist_trace,
    display_plot.layout,
    { displayModeBar: false }
  );

  Plotly.newPlot('table_content',
    display_table.data,
    display_table.layout,
    { displayModeBar: false }
  );
});


function handleFileSelect(event) {
  file_path = event.target.files[0];
  Papa.parse(file_path, {
    //Beforefirstline approach for skipping first two lines
    //courtesy of Chat GPT.
    beforeFirstChunk: function(chunk) {
      // Split by newline, remove first two lines, and rejoin
      const lines = chunk.split(/\r\n|\r|\n/);
      const trimmedChunk = lines.slice(2).join("\n");
      return trimmedChunk;
    },
    header: true,
    dynamicTyping: true,
    //transformHeader 
    transformHeader: h => h.replace(/[^\x20-\x7E]/g, ''),
    transformHeader: h => h.replace(/\[.+\]/g,''),
    //transformHeader: h => h.replace(' ','_'),
    complete: function(results) {
      input_data = results
      display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title,selected_units)
      display_plot = make_summary_plot(input_data,selected_float_param,selected_bottle_param,plot_title,selected_units);
      display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo="",sort_column="z-scores");

      Plotly.newPlot('plot_content',
        display_plot.hist_trace,
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
  refresh();
  if(event.target.tagName == "A"){
    plot_title = event.target.textContent
    if(plot_title === "Nitrate"){
      selected_units = "\u03BCmol/kg"
      selected_float_param = "Float Nitrate"
      selected_bottle_param = "NITRAT"
    }
    if(plot_title === "pH"){
      selected_units = "Total"
      selected_float_param = "Float pHinsitu"
      selected_bottle_param = "PH_TOT_INSITU"
    }
    if(plot_title === "Oxygen"){
      selected_units = "\u03BCmol/kg"
      selected_float_param = "Float Oxygen"
      selected_bottle_param = "OXYGEN"
    }
    if(plot_title === "DIC"){
      selected_units = "\u03BCmol/kg"
      selected_float_param = "Float DIC_LIAR"
      selected_bottle_param = "TCARBN"
    }
    if(plot_title === "pCO2"){
      selected_units ="\u03BCatm"
      selected_float_param = "Float pCO2_LIAR"
      selected_bottle_param = "PCO2_INSITU"
    }
    if(plot_title === "Alkalinity"){
      selected_units ="\u03BCmol/kg"
      selected_float_param = "Float TALK_LIAR"
      selected_bottle_param = "ALKALI"
    }
    if(plot_title === "Chlorophyll"){
      selected_units = "mg/m^3"
      selected_float_param = "Float Chl_a"
      selected_bottle_param = "CHLA_SeaBASS"
    }

    if(plot_title === "Space"){
      selected_units = "km"
      selected_float_param = "dDist (km)"
      selected_bottle_param = ""
    }

    if(plot_title === "Time"){
      selected_units = "hours"
      selected_float_param = "Bottle - Float Date (hours)"
      selected_bottle_param = ""
    }
    display_plot = make_summary_plot(input_data,selected_float_param,selected_bottle_param,plot_title,selected_units);
    display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo="",sort_column="z-scores");

    Plotly.newPlot('plot_content',
      display_plot.hist_trace,
      display_plot.layout,
      { displayModeBar: false }
    );

    Plotly.newPlot('table_content',
      display_table.data,
      display_table.layout,
      { displayModeBar: false }
    );

    display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title)
  }
})

function calculate_diff(float,bottle,aux){
  //Create keep as array of booleans indicating whether numeric values are available
  //for both x and y at the given index
  const keep = float.map((val,i) => Number.isFinite(val) && Number.isFinite(bottle[i]));

  let aux_filter = null;
  if(aux != null){
    //.filter() iterates through an array and only keeps elements that pass a 
    //conditional test. In the following, the test is just whether the corresponding
    //value of keep is true/false.
    aux_filter = aux.filter((_,i)=>keep[i]);
  }

  //x.filter only retains values from x where keep == TRUE
  const float_filter = float.filter((_,i)=>keep[i]);
  //y.filter only retains values from y where keep == TRUE
  const bottle_filter = bottle.filter((_,i)=>keep[i]);
  //x_filter.map calculates the difference between x_filter and y_filter
  //for each element in x_filter.
  const diff = float_filter.map((val,i) => val-bottle_filter[i]);
  return {diff,aux_filter,float_filter,bottle_filter};
}