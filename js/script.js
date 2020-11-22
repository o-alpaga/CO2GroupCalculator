//Factors in kg CO2eq
var storageFactor = 0.240;
var mailFactor = 0.010;
var visioFactor = 0;
var laptopFactor = 500;
var desktopFactor = 650;
var thinclientFactor = 50;
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

//60w x 4 hours charge per day for laptop
var wattHourChargeYearlaptop = 60*4;
//70w x 8 hours charge per day for desktop
var wattHourChargeYeardesktop = 70*8;
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
var joursAnnuel = 365;

var mixEnergyFR = 0.06;
var mixEnergyEU = 0.429;
var mixEnergyCN = 0.766;
var mixEnergyES = 0.238;
var mixEnergyIT = 0.406;
var mixEnergyUS = 0.522;
var mixEnergyBR = 0.087;
var mixEnergyAS = 0.087;
var mixEnergyAU = 0.841;
var mixEnergyDE = 0.461;
var mixEnergyIN = 1.009;
//Medium mix United
var mixEnergyWO = 0.540;
var mixEnergy = mixEnergyEU;
//Mix Energy Renewable Energy - Medium mix United
var mixEnergyRE =0.08;

//sharing
var totalGHG = 0;
var CO2ProductionAbsolute =0;
var CO2ProductionPerYearAll =0;
var CO2EnergyPerYearAll =0;
var CO2WebBased = 0;

//Equivalent (120g CO2 / km)
var CO2kmEquivalent = 0.120;
var DiametreTerre = 12742;

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
    calculateWebBasedScore();
    calculateTotal();
    saveData();
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

    var mixEnergySave = mixEnergy;
    //220 days for lots of equipment but not for servers
    var joursAnnuelSave = joursOuvres;
    if (_this.hasClass("fullYear"))
    {
        joursOuvres = joursAnnuel;
    }
    
    if ($("#" + id + "_location").length)
    {
        mixEnergyLocation = $("#" + id + "_location").val();
        mixEnergy = eval("mixEnergy" + mixEnergyLocation);
    }
    if ($("#" + id + "_RE").is(":checked") )
    {
        mixEnergy = eval("mixEnergyRE");
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
    joursOuvres = joursAnnuelSave;

    //Sum Prod and Energy
    CO2GlobalYear = Number(CO2MaterialProdPerYear) + Number(CO2EnergyPerYear);

    //Consolidate Alle
    CO2EnergyPerYearAll += CO2EnergyPerYear;
    CO2ProductionPerYearAll += Number(CO2MaterialProdPerYear);
    
    //Save Local
    saveData();
    //result
    $("#" + id + "_result").html(numberWithCommas(CO2GlobalYear.toFixed(0)));
}

///
// Calculate Total of all emissions
//
function calculateTotal(){
    totalGHG = (Number(CO2ProductionPerYearAll) + Number(CO2EnergyPerYearAll) + Number(CO2WebBased)) / 1000;
    
    $("#resultGHG").html(numberWithCommas(totalGHG.toFixed(1)));
    $("#resultGHGProduction").html(numberWithCommas((CO2ProductionPerYearAll / 1000 ).toFixed(1)));
    $("#resultGHGEnergy").html(numberWithCommas(((Number(CO2EnergyPerYearAll) + Number(CO2WebBased)) / 1000).toFixed(1)));

    var percentProduction = ((CO2ProductionPerYearAll /1000 / (totalGHG) ) * 100).toFixed(0);
    $("#percentProduction").html(percentProduction);
    $("#percentEnergy").html(100 - percentProduction);

    var nb_user = Number($("#users").val());
    var resultPerUser = 0;
    var nb_store = Number($("#stores").val());
    var resultPerStore = 0;
    if (nb_user> 0)
        resultPerUser = (totalGHG * 1000 / nb_user).toFixed(0);
    else
        resultPerUser = "Please Fill in Number of Teammates";
    if (nb_store >0)
        resultPerStore= (totalGHG * 1000 / nb_store).toFixed(0);
    else
    resultPerStore = "Please Fill in Number of Stores";

    var equivalentCO2Km = (totalGHG * 1000 / CO2kmEquivalent).toFixed(0);
    var equivalentEarth = (equivalentCO2Km / DiametreTerre).toFixed(0);

    

    //Result per user
    $("#ResultPerUser").html(resultPerUser);
    $("#ResultPerStore").html(resultPerStore);

    //Equivalents
    $("#ResultPerEquivalent").html(numberWithCommas(equivalentCO2Km));
    $("#ResultEarth").html(numberWithCommas(equivalentEarth));

    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});
    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

}

$(".lifespan").change(function(){
    var id = $(this).attr("id").replace("_lifespan","");
    recalculateAll();
});

$(".score").change(function(){
    recalculateAll();
});

$("#users").change(function(){
    recalculateAll();
});

$("#stores").change(function(){
    recalculateAll();
});

$(".location").change(function(){
    recalculateAll();
});

$(".RE").change(function(){
    recalculateAll();
});

function calculateWebBasedScore(){
    var ecomVisits = Number($("#ecom").val());
    //In Gram
    var pageScore = Number($("#viewPage").val());
    CO2WebBased =  0;
    if (ecomVisits >0 && pageScore >0)
        CO2WebBased = Number(ecomVisits * pageScore / 1000).toFixed(0);


    $("#viewPage_result").html(CO2WebBased);
}

$("#ecom").change(function(){
    recalculateAll();
});

$("#viewPage").change(function(){
    recalculateAll();
});

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
        $(this).val("");
    });
}

//Get Data from Local Storage
function getData(){
    
    var jsonvar = localStorage.getItem("InputCO2Data");
    if (jsonvar != null)
    {
        var json = JSON.parse(jsonvar);
        $(".localStore").each(function(){
            var id = $(this).attr("id");
            var value = json[id];
            if (value != "" && value != null)
                $(this).val(value);
            if ($(this).is(":checkbox") && $(this).val() == "checked")
            {
                $(this).prop('checked', true)
            }
        });
    }
    var mixEnergyValue = eval("mixEnergy" + $("#country").val());
    mixEnergy = mixEnergyValue;
    recalculateAll();
    
}

//Save Json Data to Local Storage
function saveData(){
    var jsonVar = "{";
    $(".localStore").each(function(){
        var val = $(this).val();
        if ($(this).is(":checkbox"))
        {
            if ($(this).is(":checked"))
                val = "checked";
            else
                val = "";
        }
            
      jsonVar = jsonVar + "\"" + $(this).attr("ID") + "\":\"" + val + "\",";
    });
    jsonVar = jsonVar.slice(0, -1)
    jsonVar += "}";
  console.log(jsonVar);
  localStorage.setItem("InputCO2Data", jsonVar);
}


//Draw Chart function
function drawChart() {

    //Draw First chart
    var totalGHGton = (totalGHG).toFixed(0);

    // Create the data table.
    var data = new google.visualization.DataTable();
        data.addColumn('string', 'Production');
        data.addColumn('number', 'Energy');
        data.addRows([
          ['Energy', CO2EnergyPerYearAll],
          ['Production', CO2ProductionPerYearAll],
          ['Ecommerce', Number(CO2WebBased)]
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

    //Draw Second Chart
    var TotalCloud = TotalClass("cloud");
    var TotalDevices = TotalClass("devices");
    var TotalCMobileDevices = TotalClass("mobile_devices");
    var TotalStoreDevices = TotalClass("store_devices");
    var TotalStoreServers = TotalClass("store_servers");
    var TotalCloudServers = TotalClass("cloud_servers");
    var TotalCloudStorage= TotalClass("cloud_storage");
    var TotalEcommerce= TotalClass("ecommerce");

    var data = google.visualization.arrayToDataTable([
            ['Element', 'kg CO2'],
          ['Cloud', TotalCloud,],
          ['Devices', TotalDevices],
          ['Mobile Devices', TotalCMobileDevices],
          ['Store Devices', TotalStoreDevices,],
          ['Store Servers', TotalStoreServers],
          ['Cloud Servers', TotalCloudServers],
          ['Cloud Storage', TotalCloudStorage],
          ['Ecommerce', TotalEcommerce],
        ]);

        // Set chart options
    var options = {'title': 'Global Impact: per source',
        'width':900,
        'height':300,
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ColumnChart(document.getElementById('footerGraphs'));
    chart.draw(data, options);
    
    
  }

  //calculate total of a class
  function TotalClass(type)
  {
    var a = 0;
    $("." + type).each(function() {
        a += parseInt($(this).html().replace(",",""));
    });
    return a;
  }
  

});