//Factors in kg CO2eq
var storageFactor = 0.240;
var mailFactor = 0.010;
var visioFactor = 0;
var laptopFactor = 500;
var desktopFactor = 650;
var thinclientFactor = 200;
var smallScreenFactor = 400;
var bigScreenFactor = 617;
var smartphoneFactor = 60;
var tabletFactor = 80;
var barcodeFactor = 50;
var cashFactor = 650;
var kioskFactor = 617+80;
var printersFactor = 2935;
var paperFactor = 2.29;
var physicalServerFactor = 1500;
var hostingBayFactor = 500;
var networkEquipmentFactor = 200;
var awsServerFactor = 1500;
var gcpServerFactor = 1500;
var azureServerFactor = 1500;
var otherServerFactor = 1500;
var databaseStorageFactor = 0.240;
var fileStorageFactor = 0.240;
var serverStorageFactor = 0.240;
var viewPageFactor = 0.002;

//70w x 4 hours charge per day for laptop
var wattHourChargeYearlaptop = 70*4;
//80w x 8 hours charge per day for desktop
var wattHourChargeYeardesktop = 80*8;
//20w x 8 hours charge per day for thinclient
var wattHourChargeYearthinclient = 20*8;
//40w x 6 hours charge per day for screen
var wattHourChargeYearsmallScreen = 40*6;
//100w x 6 hours charge per day for screen
var wattHourChargeYearbigScreen = 100*6;
//15w x 3 hours charge per day for smartphone
var wattHourChargeYearsmartphone = 15*3;
//20w x 3 hours charge per day for tablet
var wattHourChargeYeartablet = 20*3;
//80w x 10 hours charge per day for cachmachine
var wattHourChargeYearcash = 80*10;
//40w x 10 hours charge per day for kiosk
var wattHourChargeYearkiosk = 40*10;
//800w x 2 hours charge per day for printers
var wattHourChargeYearprinters= 800*2;
//800w x 24 hours charge per day for Servers
var wattHourChargeYearphysicalServer= 500*24;
//50w x 24 hours charge per day for Hosting Bay
var wattHourChargeYearhostingBay= 50*24;
//50w x 24 hours charge per day for etworkEquipment
var wattHourChargeYearetworkEquipment= 50*24;
//800w x 24 hours charge per day for Servers
var wattHourChargeYearawsServer= 500*24;
//800w x 24 hours charge per day for Servers
var wattHourChargeYeargcpServer= 500*24;
//800w x 24 hours charge per day for Servers
var wattHourChargeYearazureServer= 500*24;
//800w x 24 hours charge per day for Servers
var wattHourChargeYearotherServer= 500*24;

var joursOuvres = 220;

var mixEnergyFR = 0.06;
var mixEnergyEU = 0.429;
var mixEnergyCN = 0.766;
var mixEnergyES = 0.238;
var mixEnergyUS = 0.522;
var mixEnergyBR = 0.087;
var mixEnergyAS = 0.087;
var mixEnergy = mixEnergyEU;

//sharing
var totalGHG = 0;
var CO2ProductionAbsolute =0;
var CO2ProductionPerYearAll =0;
var CO2EnergyPerYearAll =0;

$(document).ready(function(){
init();

function init(){
    getData()
    recalculateAll();
}


$("#DisplayFactors").click(function(){
    $("#FactorTabs").toggle();
});

//Function to calculate CO2 emission and sharing
function recalculateAll(){
    CO2ProductionAbsolute =0;
    CO2ProductionPerYearAll =0;
    CO2EnergyPerYearAll =0;
    CO2EnergyAbsolute =0;
    $(".score").each(function(){
        calculateScore($(this));
    });
    calculateTotal();
    //Save Global Data
    localStorage.setItem("country", $("#country").val());
    localStorage.setItem("users", $("#users").val());
}

///
//Main Function to calculate Impact per Source
///
function calculateScore(_this){
    var id = _this.attr("id");
    var inputNumber = _this.val();
    var CO2MaterialProd = eval(id + "Factor");
    var CO2EnergyPerYear = 0;
    //Absolute CO2 Production
    CO2ProductionAbsolute += CO2MaterialProd;

    mixEnergySave = mixEnergy;
    if ($("#" + id + "_location").length)
    {
        mixEnergy = $("#" + id + "_location").val();
    }

    /*Lifespan -> default 1 */
    var lifespan = 1;
    if ($("#" + id + "_lifespan").length)
    {
        lifespan = $("#" + id + "_lifespan").val();
    }
    //Yearly CO2 Production
    var CO2MaterialProdPerYear = Number(CO2MaterialProd * inputNumber / lifespan).toFixed(0);

    /* Use */
    if (eval("typeof wattHourChargeYear" + id) !== 'undefined')
    {
        var wattCharge = eval("wattHourChargeYear" + id);
        //Watt per year * Factor CO2 energy * lifespan
        CO2EnergyPerYear = Number(inputNumber * wattCharge * joursOuvres* (mixEnergy/1000));
    }

    //Restore Mix Energy
    mixEnergy = mixEnergySave;

    //Sum Prod and Energy
    CO2GlobalYear = Number(CO2MaterialProdPerYear) + Number(CO2EnergyPerYear);

    //Consolidate Alle
    CO2EnergyPerYearAll += CO2EnergyPerYear;
    CO2ProductionPerYearAll += Number(CO2MaterialProdPerYear);
    
    //Save Local
    localStorage.setItem(id, inputNumber);
    localStorage.setItem(id + "_lifespan", lifespan);
    //result
    $("#" + id + "_result").html(numberWithCommas(CO2GlobalYear.toFixed(0)));
}

$(".lifespan").change(function(){
    var id = $(this).attr("id").replace("_lifespan","");
    recalculateAll();
});

$(".score").change(function(){
    recalculateAll();
})

$(".location").change(function(){
    recalculateAll();
})

$("#country").change(function(){
    var mixEnergyValue = eval("mixEnergy" + $(this).val());
    mixEnergy = mixEnergyValue;
    recalculateAll();
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function resetForm(){
    $(".score").each(function(){

    });
}

function getData(){
    $(".localStore").each(function(){
        var id = $(this).attr("id");
        var value = localStorage.getItem(id);
        if (value != "" && value != null)
            $(this).val(value);
    });
    
    recalculateAll();
}

function calculateTotal(){
    totalGHG = 0;
    $(".totalGHG").each(function(){
        totalGHG += Number($(this).html().replace(",",""));
    });
    $("#resultGHG").html(totalGHG.toFixed(0));
    $("#resultGHGProduction").html(CO2ProductionPerYearAll.toFixed(0));
    $("#resultGHGEnergy").html(CO2EnergyPerYearAll.toFixed(0));

    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});
    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

}

function drawChart() {
    var totalGHGton = (totalGHG /1000).toFixed(0);

    // Create the data table.
    var data = new google.visualization.DataTable();
        data.addColumn('string', 'Production');
        data.addColumn('number', 'Energy');
        data.addRows([
          ['Production', CO2ProductionPerYearAll],
          ['Energy', CO2EnergyPerYearAll]
        ]);

    // Set chart options
    var options = {'title': 'Global Impact: ' + totalGHGton + ' ton CO2eq / year',
                   'width':400,
                   'height':150,
                   pieHole: 0.2,
                   slices: { 0:{color: "#02BE8A"},  1: {color: "#007DBC", offset: 0.2}
                }};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }

});