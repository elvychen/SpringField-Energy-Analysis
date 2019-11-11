/*
The purpose of this demo is to demonstrate how multiple charts on the same page
can be linked through DOM and Highcharts events and API methods. It takes a
standard Highcharts config with a small variation for each data set, and a
mouse/touch event handler to bind the charts together.
*/


/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */
['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    ['power','temperature','price','pieChart','barChart'].forEach(function(con){
        document.getElementById(con).addEventListener(
        eventType,
        function (e) {
            var chart,
                point,
                i,
                event;
            
            

            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                
                if (chart.renderTo.id=='power'&& con==='power'){
                        continue;
                }

                if (chart.renderTo.id != 'power'&&chart.renderTo.id != 'temperature'&&chart.renderTo.id == 'price'){
                    chart.tooltip.hide(point);
                    chart.xAxis[0].hideCrosshair(); 
                }
                renderID = chart.renderTo.id;
                // Find coordinates within the chart
                event = chart.pointer.normalize(e);
                // Get the hovered point
                point = chart.series[0].searchPoint(event, true);

                if (point) {
                    point.onMouseOver();
                    chart.tooltip.refresh(point); // Show the tooltip
                    chart.xAxis[0].drawCrosshair(event, point);
                    point.highlight(e);
                    if (i != 0) {
                        var pieData = getPieData(point.x);
                        pieChart.options.colors = getPieColor();
                        var barData = computeToBarData(pieData);
                        pieChart.series[0].setData(pieData);
                        pieChart.setTitle({'text':getCurrentTotal(pieData)+'MW'});
                        barChart.series[0].setData(barData);
                        barChart.xAxis[0].update({'categories':getLabel()});
                        var structure = document.getElementById('inputTable');
                        var totalData = getTotalData(point.x);
                        fillTable(totalData,structure,1,'','',[]);
                        var percentage = getPercentageTotal(totalData);
                        fillTable(percentage,structure,2,'','%',[1,7,10]);
                        fillTable([globalPrice[point.index][1],0,0,0,0,0,0,0,0,0],structure,3,'$','',[7,10]);
                        structure.rows[11].cells[2].innerText = Number(Math.round(percentage[1]+percentage[2]+'e1')+'e-1')+'%';
                        structure.rows[0].cells[1].innerHTML = "<b>Power</b><br>MW"
                        var time = document.getElementById('time');
                        time.innerText = current[0];
                    }
                }
            }
            
        })
        }
    );
});


['mouseleave'].forEach(function (eventType) {
    ['power','temperature','price','pieChart','barChart'].forEach(function(con){
        document.getElementById(con).addEventListener(
        eventType,
        function (e) {
            var chart,
                point,
                i,
                event;
            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                if (chart){
                    chart.pointer.reset();
                    var pieData = getAveragePower();
                    pieChart.options.colors = getPieColor();
                    var barData = computeToBarData(pieData);
                    pieChart.series[0].setData(pieData);
                    pieChart.setTitle({'text':"Average</br>"+getCurrentTotal(getAveragePower())+'MW'});
                    barChart.series[0].setData(barData);
                    barChart.xAxis[0].update({'categories':getLabel()});
                    var structure = document.getElementById('inputTable');
                    fillTable(getAVValue(),structure,3,'$','',[7,10]);
                    var sumMV = getContribution();
                    fillTable(sumMV,structure,1,'','',[]);
                    var percentage = getPercentageTotal(sumMV);
                    fillTable(percentage,structure,2,'','%',[0,7,10]);
                    structure.rows[0].cells[1].innerHTML = "<b>Power</b><br>GWh"
                    var time = document.getElementById('time');
                    structure.rows[11].cells[2].innerText = Number(Math.round(percentage[1]+percentage[2]+'e1')+'e-1')+'%';
                    time.innerText = '20 Oct, 7:00AM - 27 Oct, 6:30 AM';
                }
            }
        }
    )}
)});

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function (event) {
    event = this.series.chart.pointer.normalize(event);
    this.series.chart.tooltip.refresh(this); // Show the tooltip
    this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};
var current = [];

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
    var thisChart = this.chart;
    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        { trigger: 'syncExtremes' }
                    );
                }
            }
        });
    }
}
const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var colors = ['#437607','#4582B4','#FDB462','#F35020','#121212','#88AFD0','#977AB1']
Highcharts.setOptions({
    global:{
        useUTC: false,
    },
})
var globalData = {};
var globalPrice = [];
var overalArea = [];
var renderID = [];
let areaChart = {
    colors: colors,
        chart: {
            marginLeft: 40, 
            spacingTop: 20,
            spacingBottom: 20,
            type: 'area',
            backgroundColor: "#ece9e6",
        },
        title: {
            text: '<b>Generation</b> MW',
            align: 'left',
            margin: 0,
            x: 30,
            style:{
                fontSize: '16px',
                fontFamily:"Times New Roman",
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false,
        },
        xAxis: {
            crosshair: {
                color: '#CA5131',
                width: 1,
                zIndex: 100,
            },
            type:'datetime',
            tickmarkPlacement:'on',
            tickInterval: 3600*24*1000,
            labels: {
                format: '{value: %a <br>%b-%e}'
            },
            events: {
                setExtremes: syncExtremes
            },
            gridLineDashStyle: 'longdash',
            gridLineColor: "#DBDBDB",
            gridLineWidth: 1,
        },
        yAxis: {
            startOnTick: true,
            endOnTick: true,
            tickInterval:1000,
            max: 9000,
            min:-1000,
            title: {
                text: null
            },
            gridLineDashStyle: 'longdash',
            gridLineColor: "#DBDBDB",
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                },
                fillOpacity:1
            },
            series:{
                states:{
                    hoever:{
                        enabled: false,
                    },
                    inactive:{
                        opacity: 1
                    }
                },               
            }
        },
        tooltip: {
            enabled: true,
            shared :false,
            useHTML: true,
            split: false,
            positioner: function () {
                return {
                    // right aligned
                    x: this.chart.chartWidth - this.label.width,
                    y: 10 // align to title
                };
            },
            formatter: function(){
                if (renderID!=="power"){
                    var time = Highcharts.dateFormat('%e %b, %l:%M %p',this.x);
                    current = [time];
                    return '<span style=\"background-color:rgb(199, 69, 35,0.3);">'+time+'</span> '+'<div style=\"display:inline-block;width:15px;height:15px;background:'+this.color+';\"></div> '+this.series.name+' <b>'+this.y+' MW </b>'+'&nbsp&nbsp Total '+'<b>'+this.total+'</b>'+'MW';
                }
                else{
                    var time = Highcharts.dateFormat('%e %b, %l:%M %p',this.x);
                    current = [time];
                    return '<span style=\"background-color:rgb(199, 69, 35,0.3);">'+time+'</span> '+' Total '+'<b>'+this.total+'</b>'+'MW';
                }
            },
            borderWidth: 0,
            pointFormat: 'Total '+'{point.total}'+'MW',
            shadow: false,
            style: {
                fontSize: '14px',
            },
        },
        series: []
    };

let tempChart = {
    colors: ['red'],
    chart: {
        marginLeft: 40, 
        spacingTop: 20,
        spacingBottom: 20,
        backgroundColor: "#ece9e6",
    },
    title: {
        text: "",
        align: 'left',
        margin: 0,
        x: 30,
        style:{
            fontSize: '16px',
        }
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: false
    },
    xAxis: {
        crosshair: {
            color: '#CA5131',
            width: 1,
        },
        type:'datetime',
        tickInterval: 3600*24*1000,
        tickLength: 0,
        labels: {
            enabled:false,
        },
        events: {
            setExtremes: syncExtremes
        },
        gridLineDashStyle: 'longdash',
        gridLineColor: "#DBDBDB",
        gridLineWidth: 1,
    },
    yAxis: {
        min: 0,
        max:90,
        title: {
            text: null
        },
        tickAmount: 6,
        gridLineDashStyle: 'longdash',
        gridLineColor: "#DBDBDB",
    },
    tooltip: {
        positioner: function () {
            return {
                x: this.chart.chartWidth - this.label.width,
                y: 0,
            };
        },
        formatter: function(){
            var time = Highcharts.dateFormat('%e %b, %l:%M %p',this.x);
            return '<span style=\"background-color:rgb(199, 69, 35,0.3);">'+time+'</span>'+
            '<span style=\"background-color:white;">'+' $'+this.y+'</span>';
        },
        borderWidth: 0,
        useHTML: true,
        shadow: false,
        headerFormat: '',
        style: {
            fontSize: '14px'
        }
    },
    series: [],
    };

let priceChart = {
    colors: ['red'],
    chart: {
        marginLeft: 40, 
        spacingTop: 20,
        spacingBottom: 20,
        backgroundColor: "#ece9e6",
    },
    title: {
        text: "",
        align: 'left',
        margin: 0,
        x: 30,
        style:{
            fontSize: '16px',
        }
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: false
    },
    xAxis: {
        crosshair: {
            color: '#CA5131',
            width: 1,
        },
        tickInterval: 3600*24*1000,
        tickLength: 0,
        type:'datetime',
        labels: {
            enabled:false,
        },
        tickmarkPlacement:'on',
        events: {
            setExtremes: syncExtremes
        },
        gridLineDashStyle: 'longdash',
        gridLineColor: "#DBDBDB",
        gridLineWidth: 1,
    },
    yAxis: {
        min:-100,
        max:300,
        title: {
            text: null
        },
        gridLineDashStyle: 'longdash',
        gridLineColor: "#DBDBDB",
    },
    tooltip: {
        positioner: function () {
            return {
                x: this.chart.chartWidth - this.label.width,
                y: 0,
            };
        },
        formatter: function(){
            var time = Highcharts.dateFormat('%e %b, %l:%M %p',this.x);
            return '<span style=\"background-color:rgb(199, 69, 35,0.3);">'+time+'</span>'+
            '<span style=\"background-color:white;">'+' $'+this.y+'</span>';
        },
        borderWidth: 0,
        useHTML: true,
        shadow: false,
        style: {
            fontSize: '14px'
        }
    },
    series: [],
    };

function changeGraph(element){
    if (clicked[element][0]===0){
        area.get(element).remove();
        clicked[element][0] = 1;
        if (clicked[element][1]<=4){
            toRemove.push(clicked[element][1]);
        }
        
    }
    else{
        for (i = 0; i<overalArea.length;i++){
            if (overalArea[i]['id']==element){
                var curr = overalArea[i];
                curr['index'] = clicked[element][1];
                curr['color'] = colors[i];
                area.addSeries(overalArea[i]);
            }

        }
        output = [];
        for (j = 0;j<toRemove.length;j++){
            if (toRemove[j]!==clicked[element][1]){
                output.push(toRemove[j]);
            }
        }
        toRemove = output;
        clicked[element][0] = 0;
        
    }
    
}
var toRemove = [];
var clicked = {"wind":[0,0],"hydro":[0,1],"gas_ccgt":[0,2],"distillate":[0,3],"black_coal":[0,4],"exports":[0,6],"pumps":[0,5]};
function fillTable(data,structure,cellIndex,startSign, endSign,skippList){
    var des = 0;
    if (cellIndex == 2){
        des = 1;
    }
    for (i = 1;i<data.length+1;i++){
        if (skippList.includes(i)){
            continue;
        }
        if (data[i-1]>0.1|| data[i-1]<-0.1){
            structure.rows[i].cells[cellIndex].innerText = startSign +Number(Math.round(data[i-1]+'e'+des)+'e-'+des)+endSign;
        }
        else if (data[i-1]===0){
            structure.rows[i].cells[cellIndex].innerText = '-';
        }
        else{
            structure.rows[i].cells[cellIndex].innerText = startSign+ Number(Math.round(data[i-1]+'e4')+'e-4')+endSign;
        }
    }
}

function getContribution(){
    var dataset = overalArea;
    var ovalSum = 0;
    var averageData = [];
    for (i = 0;i<dataset.length;i++){
        var currentPower = dataset[i]['data'];
        if (toRemove.includes(i)==false){
            var sumPrice = 0;
            for(j = 0;j<currentPower.length;j++){
                    sumPrice += currentPower[j][1];
            }
            averageData.push(sumPrice/1000);
            ovalSum += sumPrice/1000;
        }  
        else{
            averageData.push(0);
        }
    }

    averageData.push(ovalSum);
    averageData.unshift(ovalSum-averageData[5]-averageData[6]);
    averageData.splice(6, 0, averageData[6]+averageData[7]);
    return averageData; 
}
function getPercentageTotal(data){
    var output = [0];
    for (i = 1;i<data.length;i++){
        if (i != 6 && i!=9){
            output.push(100*data[i]/data[9]);
        }
        else{
            output.push(0)
        }
    }
    return output;
}
function getTotalData(timeseries){
    var output = []
    var sumPositive = 0;
    var sumNegative = 0;
    var data = globalData[timeseries];
    for(i =0;i<data.length;i++){           
        if (data[i][0]==='exports'||data[i][0]==='pumps'){
            output.unshift(data[i][1]);
            sumNegative+=data[i][1];
        }
        else{
            output.push(data[i][1]);
            sumPositive+=data[i][1];
        }
    }
    // output.push(sumPositive);
    // output.unshift(sumNegative+sumPositive);
    // output.splice(3,0,sumNegative);
    output = output.reverse();
    var final = [];
    for (i = 0;i<output.length;i++){
        if (toRemove.includes(i)){
            final.push(0);
        }
        else{
            final.push(output[i]);
        }
    }
    final.unshift(sumPositive);
    final.push(sumNegative+sumPositive);
    final.splice(6,0,sumNegative);
    return final;
}
function changeGraphPie() {
    var x = document.getElementById('pieChart');
    var y = document.getElementById('barChart')
    x.style.visibility = 'visible';
    y.style.visibility = 'hidden';
    x.style.display = "block";
    y.style.display = "none";
    var piebutton = document.getElementById('piebutton');
    var barbutton = document.getElementById('barbutton');
    piebutton.style.backgroundColor = "#C74523";
    barbutton.style.backgroundColor = "#ffffff";
}
function changeGraphBar() {
    var x = document.getElementById('pieChart');
    var y = document.getElementById('barChart')
    y.style.visibility = 'visible';
    y.style.display = "block";
    x.style.visibility = 'hidden';
    x.style.display = "none";
    var piebutton = document.getElementById('piebutton');
    var barbutton = document.getElementById('barbutton');
    piebutton.style.backgroundColor = "#ffffff";
    barbutton.style.backgroundColor = "#C74523";
  }
function openPrice(){
    var chart = document.getElementById("price");
    var arrow = document.getElementById("arrowP");
    if (chart.style.display == "none"){
        chart.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    }
    else{
        chart.style.display = "none";
        arrow.style.transform = "rotate(90deg)";

    }
}
function openTemp(){
    var chart = document.getElementById("temperature");
    var arrow = document.getElementById("arrowT");
    if (chart.style.display == "none"){
        chart.style.display = "block";
        arrow.style.transform = "rotate(180deg)";
    }
    else{
        chart.style.display = "none";
        arrow.style.transform = "rotate(90deg)";

    }
}

function getXRange(interval, start, end){
    interval = interval.substring(0,interval.length-1)*60;
    var xval = [];
    for (k = start;k<end;k+=interval){
        xval.push(k*1000);
    }
    return xval
}

function getAveragePower(){
    var sum = {};
    var keys = Object.keys(globalData);
    for(i =0;i<keys.length;i++){
        for (j = 0; j<7;j++){
            if (globalData[keys[i]][j][0] in sum == false){
                sum[globalData[keys[i]][j][0]] = 0;
            }
            sum[globalData[keys[i]][j][0]] += globalData[keys[i]][j][1]
        }
    }
    var output = [];
    var outputKey = Object.keys(sum);
    for(i = 0;i<outputKey.length;i++){
        if (outputKey[i]!='exports' && outputKey[i]!='pumps'){
            output.push([outputKey[i],sum[outputKey[i]]/keys.length]);
        }
    }
    output = output.reverse()
    var final =[];
    for (j = 0;j<output.length;j++){
        if (toRemove.includes(j)==false){
            final.push(output[j]);
        }
    }

    return final;
}
function getAVValue(){
    var dataset = overalArea;
    var ovalSum = 0;
    var ovalQua = 0;
    var averageData = [];
    for (i = 0;i<dataset.length;i++){
        var currentPower = dataset[i]['data'];
        var sumPrice = 0;
        var sumQuality = 0;
        for(j = 0;j<currentPower.length;j++){
            sumPrice += currentPower[j][1]*globalPrice[j][1];
            sumQuality+=currentPower[j][1];
        }
        averageData.push(sumPrice/sumQuality);
        ovalSum += sumPrice;
        ovalQua += sumQuality;
    }

    averageData.unshift(ovalSum/ovalQua);
    averageData.splice(6, 0, 0);
    return averageData;
}

function getCurrentTotal(data){
    var sum = 0;
    for(i = 0;i<data.length;i++){
        sum += data[i][1];
    }
    return sum.toFixed(2);
}
function getPieData(timeseries){
    var output = []
    var pieData = globalData[timeseries];
    for(var i = 0;i<pieData.length;i++){
        if (pieData[i][0]!=='exports'&&pieData[i][0]!=='pumps'){
            output.push(pieData[i]);
        }
    }
    output = output.reverse();
    var finaloutput = [];
    for (j = 0;j<output.length;j++){
        if (toRemove.includes(j)==false){
            finaloutput.push(output[j]);
        }
    }
    return finaloutput;
}
function getPieColor(){
    
    output = [];
    for (i = 0;i<colors.length;i++){
        if (toRemove.includes(i)==false){
            output.push(colors[i]);
        }
    }
    return output;
}
function positivePower(xval,input,typeData){
    var data = [];
    for (j = 0; j<xval.length-5;j++){
        if ((xval[j])%180000==0 && j%2 == 1){
            data.push([xval[j],input[j]]);
            if (xval[j] in globalData == false){
                globalData[xval[j]] = [];
            }
            globalData[xval[j]].push([typeData,input[j]]);
        }
    }
    return data;
}
function negativePower(xval,input,typeData){
    input = input.map(function(element) {
        if (element!=0){
            return -1*element;
        }
        return element;
    })
    var data = [];
    for (j = 0; j<xval.length-5;j++){
        if ((xval[j])%180000==0 && j%2 == 1){
            data.push([xval[j],input[j]]);
            if (xval[j] in globalData == false){
                globalData[xval[j]] = [];
            }
            globalData[xval[j]].push([typeData,input[j]]);
        }
    }
    return data;
}

function computePowerData(activity){
    var data = []
    activity.forEach(function(dataset, i){
        if (dataset.type == "power" && dataset.fuel_tech !== 'rooftop_solar'){
                var xval = getXRange(dataset.history.interval,dataset.history.start, dataset.history.last);
                if (dataset.fuel_tech == 'exports'|| dataset.fuel_tech == 'pumps'){
                    data.unshift({id:dataset.fuel_tech,name:dataset.fuel_tech,data:negativePower(xval,dataset.history.data,dataset.fuel_tech)});
                }
                else{
                    data.push({id:dataset.fuel_tech,name:dataset.fuel_tech, data:positivePower(xval,dataset.history.data,dataset.fuel_tech)})
                }
            
        } 
    })
    return data.reverse();
};
function computePriceData(activity){
    var dataset = activity[8];
    dataset.x_axis = getXRange(dataset.history.interval, dataset.history.start, dataset.history.last);
    for (j = 1; j<dataset.x_axis.length;j++){
        globalPrice.push([dataset.x_axis[j],dataset.history.data[j]]);
    }
    return globalPrice;
}
function computeTemperatureData(activity){
    var dataset = activity[10];
    dataset.x_axis = getXRange(dataset.history.interval, dataset.history.start, dataset.history.last);
    var data = [];
    for (j = 1; j<dataset.x_axis.length;j++){
        data.push([dataset.x_axis[j],dataset.history.data[j]]);
    }
    return data;
}
function computeToBarData(dataset){
    var color = getPieColor();
    var output = [];
    for (i = 0;i<dataset.length;i++){
        output.push(dataset[i][1]);
    }
    var total = output.reduce((a,b)=>a+b);
    var finaloutput = [];
    for (j = 0;j<dataset.length;j++){
        finaloutput.push({y:100*output[j]/total, color:color[j]});
    }
    return finaloutput;
}
function getLabel(){
    var firstKey = globalData[Object.keys(globalData)[0]];
    var output = []
    for (i = 0; i<7;i++){
        if (firstKey[i][0]!=='exports'&&firstKey[i][0] !== 'pumps'){
            output.push(firstKey[i][0]);
        }
    }
    output = output.reverse();
    var finaloutput = [];
    for (i = 0;i<output.length;i++){
        if (toRemove.includes(i)==false){
            finaloutput.push(output[i])
        }
    }
    return finaloutput;
}
Highcharts.ajax({
    url:'./springfield_converted_json.js',
    dataType:'text',
    success: function(activity){   
        activity = JSON.parse(activity);
        priceChart.series = [{"data":computePriceData(activity)}];
        Highcharts.chart('price',priceChart);

        overalArea = computePowerData(activity);
        areaChart.series = overalArea;
        area = Highcharts.chart('power', areaChart);

        tempChart.series = [{"data":computeTemperatureData(activity)}];
        Highcharts.chart('temperature',tempChart);


        pieChart = new Highcharts.chart('pieChart', {
            colors: getPieColor(),
            chart: {
                type: 'pie',
                backgroundColor:"#ece9e6"
            },
            title: {
                text: 'Average <br/>' + getCurrentTotal(getAveragePower())+' MW',
                verticalAlign: 'middle',
                floating: true,
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    shadow: false,
                    size:'50%',
                    center: ['50%', '50%'],
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }, 
                },
                
            },
            series: [{
                name: 'none',
                colorByPoint: true,
                data: getAveragePower(),
                size: '80%',
                innerSize:'60%',
            }]
        })
        var piebutton = document.getElementById('piebutton');
        piebutton.style.backgroundColor = "#C74523";
        barbutton.style.backgroundColor = "#ffffff";
        barChart = new Highcharts.chart('barChart', {
            colors: getPieColor(),
            chart: {
                type: 'bar',
                animation: false,
                backgroundColor: "#ece9e6",
            },
            title: {
                text: '',
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: getLabel(),
            },
            legend:{
                enabled:false,
            },
            yAxis: {
                min: 0,
                visible: false,
            },
            plotOptions: {
                bar: {
                    shadow: false,
                    dataLabels: {
                        enabled: true,
                        formatter: function(){
                            if (this.y<0.1){
                                return Highcharts.numberFormat(this.y,4)+'%';
                            }
                            else{
                                return Highcharts.numberFormat(this.y,1)+'%'
                            }
                        }
                    }
                },
                series:{
                    states:{
                        hover: {
                            enabled: false,
                        },
                        inactive:{
                            opacity: 1
                        }
                    }
                }
            },
            series: [{colorByPoint: true, type: 'bar', data:computeToBarData(getAveragePower())}]
        })
            

    }
});

