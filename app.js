/**************** FIREBASE CONFIG ****************/
const firebaseConfig = {

  apiKey: "test",

  authDomain:
  "controlesys-399b8.firebaseapp.com",

  databaseURL:
  "https://controlesys-399b8-default-rtdb.europe-west1.firebasedatabase.app/",

  projectId:
  "controlesys-399b8"

};

/**************** INIT FIREBASE ****************/
firebase.initializeApp(firebaseConfig);

const db = firebase.database();

/**************** SCREENS ****************/
function showScreen(screenId){

  let screens =
  document.querySelectorAll(".screen");

  screens.forEach((screen)=>{

    screen.classList.remove("active");

  });

  document.getElementById(screenId)
  .classList.add("active");
}

/**************** ARRAYS ****************/
let labels = [];

let phData = [];

let tdsData = [];

let flowData = [];

/**************** CHARTS ****************/
const phCtx =
document.getElementById("phChart");

const tdsCtx =
document.getElementById("tdsChart");

const flowCtx =
document.getElementById("flowChart");

/**************** PH CHART ****************/
const phChart = new Chart(phCtx, {

  type: "line",

  data: {

    labels: labels,

    datasets: [{

      label: "pH",

      data: phData,

      borderColor: "#00d9ff",

      backgroundColor:
      "rgba(0,217,255,0.1)",

      fill: true,

      tension: 0.4,

      borderWidth: 3

    }]
  },

  options: {

    responsive: true,

    maintainAspectRatio: false
  }
});

/**************** TDS CHART ****************/
const tdsChart = new Chart(tdsCtx, {

  type: "line",

  data: {

    labels: labels,

    datasets: [{

      label: "TDS",

      data: tdsData,

      borderColor: "#00ff88",

      backgroundColor:
      "rgba(0,255,136,0.1)",

      fill: true,

      tension: 0.4,

      borderWidth: 3

    }]
  },

  options: {

    responsive: true,

    maintainAspectRatio: false
  }
});

/**************** FLOW CHART ****************/
const flowChart = new Chart(flowCtx, {

  type: "line",

  data: {

    labels: labels,

    datasets: [{

      label: "Flow",

      data: flowData,

      borderColor: "#ffcc00",

      backgroundColor:
      "rgba(255,204,0,0.1)",

      fill: true,

      tension: 0.4,

      borderWidth: 3

    }]
  },

  options: {

    responsive: true,

    maintainAspectRatio: false
  }
});

/**************** REALTIME DATA ****************/
db.ref("data").on("value",(snapshot)=>{

  const data = snapshot.val();

  if(!data){

    console.log("No data");

    return;
  }

  /**************** VALUES ****************/
  document.getElementById("ph")
  .innerHTML = data.pH || 0;

  document.getElementById("tds")
  .innerHTML = data.TDS || 0;

  document.getElementById("cond")
  .innerHTML = data.Conductivity || 0;

  document.getElementById("flow")
  .innerHTML = data.Flow || 0;

  document.getElementById("volume")
  .innerHTML = data.Volume || 0;

  /**************** GAUGES ****************/
  document.getElementById("phGauge")
  .innerHTML = data.pH || 0;

  document.getElementById("tdsGauge")
  .innerHTML = data.TDS || 0;

  document.getElementById("flowGauge")
  .innerHTML = data.Flow || 0;

  document.getElementById("phBar")
  .style.width =
  (data.pH * 7) + "%";

  document.getElementById("tdsBar")
  .style.width =
  Math.min(data.TDS / 10,100)
  + "%";

  document.getElementById("flowBar")
  .style.width =
  Math.min(data.Flow * 10,100)
  + "%";

  /**************** QUALITY ****************/
  let quality = 100;

  if(data.pH < 6 || data.pH > 8){

    quality -= 30;
  }

  if(data.TDS > 500){

    quality -= 30;
  }

  if(data.Conductivity > 1000){

    quality -= 20;
  }

  if(quality < 0){

    quality = 0;
  }

  document.getElementById(
    "qualityScore"
  ).innerHTML = quality;

  /**************** QUALITY TEXT ****************/
  let qualityText = "Excellent";

  if(quality < 80){

    qualityText = "Medium";
  }

  if(quality < 50){

    qualityText = "Danger";
  }

  document.getElementById(
    "qualityText"
  ).innerHTML = qualityText;

  /**************** AI ASSISTANT ****************/
  let assistantText =
  "System Stable ✅";

  if(data.pH < 6){

    assistantText =
    "Acidic Water ⚠️";
  }

  if(data.pH > 8){

    assistantText =
    "Basic Water ⚠️";
  }

  if(data.TDS > 500){

    assistantText =
    "High TDS ⚠️";
  }

  if(data.Flow < 0.1){

    assistantText =
    "Low Flow ⚠️";
  }

  document.getElementById(
    "assistantMessage"
  ).innerHTML = assistantText;

  /**************** FILTER LIFE ****************/
  let filterLife =
  100 - (data.TDS / 10);

  if(filterLife < 5){

    filterLife = 5;
  }

  document.getElementById(
    "filterLife"
  ).style.width =
  filterLife + "%";

  document.getElementById(
    "filterText"
  ).innerHTML =
  "Filter Life: "
  +
  parseInt(filterLife)
  +
  "% | Replace in "
  +
  parseInt(filterLife / 3)
  +
  " Days";

  /**************** MEMBRANE LIFE ****************/
  let membraneLife =
  100 - (data.Conductivity / 20);

  if(membraneLife < 5){

    membraneLife = 5;
  }

  document.getElementById(
    "membraneLife"
  ).style.width =
  membraneLife + "%";

  document.getElementById(
    "membraneText"
  ).innerHTML =
  "Membrane Life: "
  +
  parseInt(membraneLife)
  +
  "% | Replace in "
  +
  parseInt(membraneLife / 2)
  +
  " Days";

});

/**************** HISTORY + GRAPHS ****************/
db.ref("history")
.limitToLast(20)
.on("value",(snapshot)=>{

  const history = snapshot.val();

  if(!history){

    return;
  }

  labels.length = 0;

  phData.length = 0;

  tdsData.length = 0;

  flowData.length = 0;

  let container =
  document.getElementById(
    "historyContainer"
  );

  container.innerHTML = "";

  const entries =
  Object.entries(history).reverse();

  entries.forEach(([key,val])=>{

    /**************** CARD ****************/
    let card =
    document.createElement("div");

    card.className =
    "historyCard";

    card.innerHTML =
    "<b>"+key+"</b><br>"+val;

    container.appendChild(card);

    /**************** EXTRACT VALUES ****************/
    let ph =
    val.match(/pH:(\d+(\.\d+)?)/);

    let tds =
    val.match(/TDS:(\d+(\.\d+)?)/);

    let flow =
    val.match(/F:(\d+(\.\d+)?)/);

    labels.push(key);

    phData.push(
      ph ? parseFloat(ph[1]) : 0
    );

    tdsData.push(
      tds ? parseFloat(tds[1]) : 0
    );

    flowData.push(
      flow ? parseFloat(flow[1]) : 0
    );

  });

  /**************** UPDATE ****************/
  phChart.update();

  tdsChart.update();

  flowChart.update();

});

/**************** ONLINE STATUS ****************/
window.addEventListener("online",()=>{

  document.getElementById(
    "statusBox"
  ).innerHTML = "ONLINE";
});

window.addEventListener("offline",()=>{

  document.getElementById(
    "statusBox"
  ).innerHTML = "OFFLINE";
});

/**************** SERVICE WORKER ****************/
if("serviceWorker" in navigator){

  navigator.serviceWorker.register(
    "sw.js"
  );
}