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
                // Find coordinates within the chart
                event = chart.pointer.normalize(e);
                // Get the hovered point
                point = chart.series[0].searchPoint(event, true);

                if (point) {
                    point.highlight(e);
                    if (i === 0) {
                        // renderPieChart(e.index);
                        pieChart.series[0].setData(getPieData(point.x));
                        pieChart.setTitle({'text':getCurrentTotal(getPieData(point.x))+'MW'});
                        barChart.series[0].setData(computeToBarData(getPieData(point.x)));
                    }
                }
            }
            
        })
        }
    );
});

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function (event) {
    event = this.series.chart.pointer.normalize(event);
    this.series.chart.tooltip.refresh(this); // Show the tooltip
    this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};


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
// function getData(x, dataset){
//     Highcharts.chart("pie", );
// }

Highcharts.setOptions({
    global:{
        useUTC: false,
    },
})
var globalData = {};
let areaChart = {
        chart: {
            
            marginLeft: 40, 
            spacingTop: 20,
            spacingBottom: 20,
            type: 'area',
            
        },
        title: {
            text: 'Generation MW',
            align: 'left',
            margin: 0,
            x: 30
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            floating: true,
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'middle',
        },
        xAxis: {
            crosshair: true,
            type:'datetime',
            tickmarkPlacement:'on',
            labels: {
                format: '{value:%b-%e}'
            },
            events: {
                setExtremes: syncExtremes
            },
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
            
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        tooltip: {
            shared :false,
            positioner: function () {
                return {
                    // right aligned
                    x: this.chart.chartWidth - this.label.width,
                    y: 10 // align to title
                };
            },
            borderWidth: 0,
            backgroundColor: 'none',
            pointFormat: '{point.x:%b-%e %l:%M %p}'+' Total '+'{point.total}'+'MW',
            headerFormat: '',
            shadow: false,
            style: {
                fontSize: '18px'
            },
        },
        series: []
    };

let tempChart = {
    exporting:{
        enabled:false,
    },
    chart: {
        marginLeft: 40, 
        spacingTop: 20,
        spacingBottom: 20
    },
    title: {
        text: "temperature",
        align: 'left',
        margin: 0,
        x: 30
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: false
    },
    xAxis: {
            crosshair: true,
            type:'datetime',
            labels: {
                format: '{value:%b-%e}'
            },
            tickmarkPlacement:'on',
            events: {
                setExtremes: syncExtremes
            },
    },
    yAxis: {
        title: {
            text: null
        }
    },
    tooltip: {
        positioner: function () {
            return {
                x: this.chart.chartWidth - this.label.width,
                y: 0,
            };
        },
        borderWidth: 0,
        backgroundColor: 'none',
        pointFormat: '{point.y}',
        valuePrefix: '', 
        valueSuffix: '°F',
        headerFormat: '',
        shadow: false,
        style: {
            fontSize: '18px'
        }
    },
    series: [],
    };

let priceChart = {
    exporting:{
        enabled:false,
    },
    chart: {
        marginLeft: 40, 
        spacingTop: 20,
        spacingBottom: 20
    },
    title: {
        text: "price",
        align: 'left',
        margin: 0,
        x: 30
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: false
    },
    xAxis: {
            crosshair: true,
            type:'datetime',
            labels: {
                format: '{value:%b-%e}'
            },
            tickmarkPlacement:'on',
            events: {
                setExtremes: syncExtremes
            },
    },
    yAxis: {
        title: {
            text: null
        }
    },
    tooltip: {
        positioner: function () {
            return {
                x: this.chart.chartWidth - this.label.width,
                y: 0,
            };
        },
        borderWidth: 0,
        backgroundColor: 'none',
        pointFormat: '{point.y}',
        valuePrefix: '$', 
        valueSuffix: '',
        headerFormat: '',
        shadow: false,
        style: {
            fontSize: '18px'
        }
    },
    series: [],
    };


function changeGraphPie() {
  var x = document.getElementById('pieChart');
  var y = document.getElementById('barChart')
    x.style.visibility = 'visible';
    y.style.visibility = 'hidden';
    x.style.display = "block";
    y.style.display = "none";
}
function changeGraphBar() {
    var x = document.getElementById('pieChart');
    var y = document.getElementById('barChart')
    y.style.visibility = 'visible';
    y.style.display = "block";
    x.style.visibility = 'hidden';
    x.style.display = "none";
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
    return output.reverse();
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
    for(i =0;i<pieData.length;i++){
        if (pieData[i][1] > 0){
            output.push(pieData[i]);
        }
    }
    return output;
}
function positivePower(xval,input,typeData){
    var data = [];
    for (j = 0; j<xval.length;j++){
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
    for (j = 0; j<xval.length;j++){
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
                    data.unshift({name:dataset.fuel_tech,data:negativePower(xval,dataset.history.data,dataset.fuel_tech)});
                }
                else{
                    data.push({name:dataset.fuel_tech, data:positivePower(xval,dataset.history.data,dataset.fuel_tech)})
                }
            
        } 
    })
    return data.reverse();
};
function computePriceData(activity){
    var dataset = activity[8];
    dataset.x_axis = getXRange(dataset.history.interval, dataset.history.start, dataset.history.last);
    var data = [];
    for (j = 0; j<dataset.x_axis.length;j++){
        data.push([dataset.x_axis[j],dataset.history.data[j]]);
    }
    return data;
}
function computeTemperatureData(activity){
    var dataset = activity[10];
    dataset.x_axis = getXRange(dataset.history.interval, dataset.history.start, dataset.history.last);
    var data = [];
    for (j = 0; j<dataset.x_axis.length;j++){
        data.push([dataset.x_axis[j],dataset.history.data[j]]);
    }
    return data;
}
function computeToBarData(dataset){
    var output = [];
    for (i = 0;i<dataset.length;i++){
        output.push(dataset[i][1]);
    }
    var total = output.reduce((a,b)=>a+b);
    var finaloutput = [];
    for (j = 0;j<dataset.length;j++){
        finaloutput.push(Math.round(100*output[j]/total*100)/100);
    }
    return finaloutput;
}
function getLabel(){
    var firstKey = globalData[Object.keys(globalData)[0]];
    var output = []
    for (i = 0; i<7;i++){
        if (firstKey[i][0]!=='exports'&&firstKey[i][0] !== 'pumps'){
            output.push(firstKey[i][0])
        }
    }
    return output;
}
Highcharts.ajax({
    url:'./springfield.json',
    dataType:'text',
    success: function(activity){   
        activity = JSON.parse(activity);

        var chartDiv = document.createElement('div');
        chartDiv.className = 'chart';
        document.getElementById('power').appendChild(chartDiv);
        areaChart.series = computePowerData(activity);
        Highcharts.chart(chartDiv, areaChart);

        var chartDiv = document.createElement('div');
        chartDiv.className = 'chart';
        document.getElementById('price').appendChild(chartDiv);
        priceChart.series = [{"data":computePriceData(activity)}];
        Highcharts.chart(chartDiv,priceChart);

        var chartDiv = document.createElement('div');
        chartDiv.className = 'chart';
        document.getElementById('temperature').appendChild(chartDiv);
        tempChart.series = [{"data":computeTemperatureData(activity)}];
        Highcharts.chart(chartDiv,tempChart);


        pieChart = new Highcharts.chart('pieChart', {
            chart: {
                type: 'pie',
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
                        enabled: true,
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

        barChart = new Highcharts.chart('barChart', {
            chart: {
                type: 'bar',
                animation: false,
            },
            title: {
                text: '',
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: getLabel(),
                title: {
                    text: null
                }
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
                            return this.y+'%'
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

