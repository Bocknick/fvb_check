const container = document.getElementById('app-container');
container.innerHTML =
    `<div class = "app-container">
        <div class = "ui">
          <label for="file_input" class="custom-file-label">Upload File</label>
          <input type="file" id="file_input" class="hidden-file-input">
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
                <a>Temperature</a>
                <a>Salinity</a>
                <a>Distance (space)</a>
                <a>Distance (time)</a>
              </div>
          </div>
          <form id = 'dist_form' autocomplete="off" style = "width:250px; display:flex; gap: 4px;">
            <div class="autocomplete" style="flex: 2;">
                <input id="dist_input" type="text" placeholder="Dist. (km)" style = "width: 175px; font-size: 14px;">
            </div>
            <input id = "dist_submit" type="submit" value = "Filter" style = "flex: 1; width: 75px; margin-bottom: 5px; width: 100px; font-size: 14px; padding: 12px;">
          </form>
          <form id = 'wmo_form' autocomplete="off" style = "width:250px; display:flex; gap: 4px;">
            <div class="autocomplete" style="flex: 2;">
                <input id="wmo_input" type="text" placeholder="WMO" style = "width: 175px; font-size: 14px;">
            </div>
            <input id = wmo_submit type="submit" value = "Filter" style = "flex: 1; width: 75px; margin-bottom: 5px; font-size: 14px; padding: 12px;">
          </form>
          <div id = "reset">
            <button>Reset Selections</button>
          </div>
          <div id = "open_file">
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
let file_path;
let max_dist = 5000;
let wmo_list;
let selected_units = "\u03BCmol/kg";
//Run metadata retriever; generate initial wmo_list and 
//run wrapper with all wmos

const file_input = document.getElementById('file_input');
const param_content = document.getElementById('param_content');
const reset_clicked = document.getElementById('reset');
const map_content = document.getElementById('map_content');
const slider_click = document.getElementById('slider_container')
const wmo_form = document.getElementById('wmo_form')
const wmo_submit = document.getElementById('wmo_submit')
const dist_form = document.getElementById('dist_form')
const dist_submit = document.getElementById('dist_submit')

file_input.addEventListener('change', handleFileSelect);

reset_clicked.addEventListener('click', function(event){
  refresh();
  let selected_float_param = "Float Nitrate";
  let selected_bottle_param = "NITRAT";
  let plot_title = "Nitrate"
  let selected_units = "\u03BCmol/kg";
  selected_wmo = ""
  max_dist = 5000;

  display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist,selected_wmo)
  display_plot = make_summary_plot(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist);
  display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo,max_dist);

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

dist_submit.addEventListener("click",function(event){
  refresh()
  event.preventDefault();
  max_dist = Number(document.getElementById('dist_input').value);

  display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist,selected_wmo)
  display_plot = make_summary_plot(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist);
  display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo,max_dist);

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

wmo_submit.addEventListener('click', function(event) {
  refresh()
    //The browser will reload the page by default when a form is submitted. 
    //preventDefault() prevents this behavior.
    event.preventDefault();
    selected_wmo = Number(document.getElementById('wmo_input').value);
    if(Number(document.getElementById('wmo_input').value)==0){
      selected_wmo = "";
    }
    
    //Filter copy of plot data
    display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist,selected_wmo)
    display_plot = make_plot(input_data,selected_float_param,selected_bottle_param,plot_title,selected_wmo,selected_units);
    display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo,max_dist);

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
});

function handleFileSelect(event) {
  document.getElementById("map_content").style.border = "1px solid black";
  document.getElementById("map_content").style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)"
  
  file_path = event.target.files[0];
  console.log(file_path.name)
  //const open_file = document.getElementById('app-open_file');
  //open_file.innerHTML
  document.getElementById("open_file").style.fontFamily = "Menlo,Consolas,monaco,monospace";
  document.getElementById("open_file").style.fontSize = "14px";
  document.getElementById("open_file").innerHTML=`<a><b>${file_path.name.slice(0,-4)}</b></a>`;

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
      console.log(results)
      input_data = results
      wmo_list = input_data.data.map(row => row['WMO'])
      float_nitrate = input_data.data.map(row => row[selected_float_param])
      bottle_nitrate = input_data.data.map(row => row[selected_bottle_param])
      complete_rows = float_nitrate.map((value,i)=>value !== null & bottle_nitrate[i] !== null);
      wmo_list = wmo_list.filter((value,i)=>complete_rows[i]);
      wmo_list = [...new Set(wmo_list)];

      autocomplete(document.getElementById("wmo_input"), wmo_list);
      dist_data = input_data.data.map(row => row['dDist (km)'])
      dist_keep = dist_data.map((value,i)=>isFinite(value))
      dist_filt = dist_data.filter((value,i)=>dist_keep[i])
      max_dist = Math.max(...dist_filt);
      dist_filt_sort = dist_filt.sort((a, b) => a - b);

      dist_20 = dist_filt_sort[Math.floor(dist_filt_sort.length * 0.2)-1]
      dist_40 = dist_filt_sort[Math.floor(dist_filt_sort.length * 0.4)-1]
      dist_60 = dist_filt_sort[Math.floor(dist_filt_sort.length * 0.6)-1]
      dist_80 = dist_filt_sort[Math.floor(dist_filt_sort.length * 0.8)-1]
      
      document.getElementById("dist_input").placeholder = `Dist. (0 - ${max_dist.toFixed(0)} km)`

      display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist,"")
      display_plot = make_summary_plot(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist);
      display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo="",max_dist);
      
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

      document.getElementById("plot_content").style.border = "1px solid black";
      document.getElementById("plot_content").style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)"
  
      document.getElementById("table_content").style.border = "1px solid black";
      document.getElementById("table_content").style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)"
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
    if(plot_title === "Temperature"){
      selected_units ="\u00B0C"
      selected_float_param = "Float Temperature"
      selected_bottle_param = "CTDTMP"
    }
    if(plot_title === "Salinity"){
      selected_units = "psu"
      selected_float_param = "Float Salinity"
      selected_bottle_param = "CTDSAL"
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

    if(plot_title === "Distance (space)"){
      selected_units = "km"
      selected_float_param = "dDist (km)"
      selected_bottle_param = ""
    }

    if(plot_title === "Distance (time)"){
      selected_units = "hours"
      selected_float_param = "Bottle - Float Date (hours)"
      selected_bottle_param = ""
    }

    display_plot = make_summary_plot(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist);
    display_table = make_table(input_data,selected_float_param,selected_bottle_param,selected_wmo="",max_dist);

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

  display_map = make_map(input_data,selected_float_param,selected_bottle_param,plot_title,max_dist,"")
  }
})