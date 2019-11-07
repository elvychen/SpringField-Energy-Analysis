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
    ['power','temperature','price','pieChart'].forEach(function(con){
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
                    pieChart.series[0].setData(getPieData(point.x));
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
    }
})
var globalData = {};
let areaChart = {
        chart: {
            marginLeft: 40, 
            spacingTop: 20,
            spacingBottom: 20,
            type: 'area'
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
            enabled: false
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

function getXRange(interval, start, end){
    interval = interval.substring(0,interval.length-1)*60;
    var xval = [];
    for (k = start;k<end;k+=interval){
        xval.push(k*1000);
    }
    return xval
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
function rooftopData(xval,input,typeData){
    var data = [];
    var length = xval.length-2;
    for (j = 0; j<length;j++){
        data.push([xval[j],input[j]]);
        if (xval[j] in globalData == false){
            globalData[xval[j]] = [];
        }
        globalData[xval[j]].push([typeData,input[j]]);
    }
    return data;
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
        if (dataset.type == "power"){
            if (dataset.fuel_tech == 'rooftop_solar'){
                var start = new Date(dataset.forecast.start).getTime()/1000;
                var end = new Date(dataset.forecast.last).getTime()/1000; 
                var xval = getXRange(dataset.forecast.interval,start,end);
                data.push({name:dataset.fuel_tech,data:rooftopData(xval,dataset.forecast.data,'rooftop_solar')});
            }
            else{
                var xval = getXRange(dataset.history.interval,dataset.history.start, dataset.history.last);
                if (dataset.fuel_tech == 'exports'|| dataset.fuel_tech == 'pumps'){
                    data.unshift({name:dataset.fuel_tech,data:negativePower(xval,dataset.history.data,dataset.fuel_tech)});
                }
                else{
                    data.push({name:dataset.fuel_tech, data:positivePower(xval,dataset.history.data,dataset.fuel_tech)})
                }
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
        console.log(areaChart.series);

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


        console.log(globalData);
        pieChart = new Highcharts.chart('pieChart', {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: 'Power distribution'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            },
            plotOptions: {
                pie: {
                    size: '100%',
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }
                }
            },
            series: [{
                name: 'Average sales each day of the week',
                colorByPoint: true,
                data: getPieData(1571580000000),
            }]
        })
    }
});

