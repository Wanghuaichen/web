/**
 * Created by admin on 2015/11/17.
 */
$(function(){
    InitTimeUI("hour",true);
    $("#history").click(function(){
        chartType ="line";
        $("#searchType option[value='hour']").attr("selected", true);
        fillHistoryData();
    });
    //历史数据显示
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").val();
        if(selectType == "minute" || selectType == "minute10"){
            InitTimeUI("minute");
        }else {
            InitTimeUI("hour");
        }
    });
    var enddate,firstdate;
    $("#starthour").click(function(){
        var selectType = $("#searchType option:selected").val();
        if(selectType == "minute" || selectType == "minute10"){
            InitTimeUI("minute",false,true);
        }else {
            InitTimeUI("hour",false,true);
        }
        addLaydateListener();
    });
    $("#endhour").click(function(){
        var selectType = $("#searchType option:selected").val();
        if(selectType == "minute" || selectType == "minute10"){
            InitTimeUI("minute",false,false,true);
        }else {
            InitTimeUI("hour",false,false,true);
        }
        $("#laydate_ms span").click(function(){
            addLaydateListener();
        });
        $("#laydate_ys li").click(function(){
            addLaydateListener();
        });
        addLaydateListener();
    });
    $("#searchpng").click(function(){
        if(enddate == "" || enddate == undefined){
            alert("请先选择日期范围！");
            return false;
        }
        fillHistoryData();
    });
    $("#linechart").click(function(){
        chartType ="line";
        fillHistoryData();
    });
    $("#columnchart").click(function(){
        chartType ="column";
        fillHistoryData();
    });
    var family = getCookie("monitorMenu"),
        chartType ="line",
        unitType = "",
        maxValue = 0,
        minValue = 0;
    $("#currentPageTitle").text(family+"减排分析");
    fillHistoryData();
    //给历史图添加数据
    function fillHistoryData(){
        var page_object = new Object(),findBy = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        findBy.family = family;
        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;

        var time = new Object(),selectType = $("#searchType option:selected").val();
        var startdate = new Date(firstdate),endTime = new Date(enddate);
        time.end = endTime.getTime()+(24*60*60*1000-1);
        if(selectType == "hour"){
            time.scale = "hour";
            time.end -= 24*60*60*1000-1;
        }if(selectType == "day"){
            time.scale = "day";
        }else if(selectType == "month"){
            time.scale = "month";
        }else if(selectType == "year"){
            time.scale = "year";
        }else if(selectType == "minute"){
            time.scale = "minute";
            time.end -= 24*60*60*1000-1;
        }else if(selectType == "minute10"){
            time.scale = "minute10";
            time.end -= 24*60*60*1000-1;
        }else if(selectType == "all"){
            time.scale = "all";
        }
        startdate = new Date(startdate.getTime());
        time.start = startdate.getTime();
        findBy.time = time;
        var historyDataJsonStr = datahistory(findBy,page_object,other_object);
        var historyDatasObject = JSON.parse(historyDataJsonStr);
        var valuePointArray = new Array(),maxPointArray = [],minPointArray = [],rangArray = [];
        var dminValue = 0,dmaxValue = 0,avgValue = 0,totalCount = 0;
        if(historyDatasObject.errCode == "success" && historyDatasObject.total != 0){
            var resultList = historyDatasObject.resultList;
            var temp=/^-?\d+(\.\d+)?$/;
            //获取所有结果数据
            for(var i in resultList){
                for(var j in resultList[i]){
                    var dayResult = resultList[i]["dayResult"];
                    var day = resultList[i]["day"] == undefined?"":resultList[i]["day"];
                    for(var k in dayResult) {
                        maxValue = dayResult[k]["max"];
                        minValue = dayResult[k]["min"];
                        unitType = dayResult[k]["unit"];
                        if(dayResult[k]["dvalue"] == undefined){
                            var values = dayResult[k]["values"] == undefined ? "" : dayResult[k]["values"];
                            for (var h in values) {
                                var valuePoint = new Array(),
                                    maxPoint = [], minPoint = [], rangePoint = [],
                                    min = values[h]["min"] == undefined ? "" : Number(values[h]["min"]).toFixed(3), //最小值
                                    max = values[h]["max"] == undefined ? "" : Number(values[h]["max"]).toFixed(3), //最大值
                                    value = values[h]["avg"] == undefined ? "" : Number(values[h]["avg"]).toFixed(3),
                                    time = values[h]["time"] == undefined ? "" : values[h]["time"],
                                    min = Number(min),
                                    max = Number(max);
                                var substrTime = day.substring(0, 4) + "/" + day.substring(4, 6) + "/" + day.substring(6, 8);
                                var date = new Date(substrTime + " " + time);
                                if (temp.test(value) == true && temp.test(min) == true && temp.test(max) == true) {
                                    if (totalCount == 0) {
                                        dmaxValue = max;
                                        dminValue = min;
                                    }
                                    totalCount++;
                                    avgValue += Number(value);
                                    if (max > dmaxValue) {
                                        dmaxValue = max;
                                    }
                                    if (min < dminValue) {
                                        dminValue = min;
                                    }
                                    valuePoint.push(date.getTime());
                                    valuePoint.push(Number(value));
                                    valuePointArray.push(valuePoint);

                                    maxPoint.push(date.getTime());
                                    maxPoint.push(Number(max))
                                    maxPointArray.push(maxPoint);

                                    minPoint.push(date.getTime());
                                    minPoint.push(Number(min))
                                    minPointArray.push(minPoint);

                                    rangePoint.push(date.getTime());
                                    rangePoint.push(Number(min));
                                    rangePoint.push(Number(max));
                                    rangArray.push(rangePoint);
                                }
                            }
                        }else{
                                var value = dayResult[k]["dvalue"] == undefined?"":Number(dayResult[k]["dvalue"]).toFixed(3);
                                if(temp.test(value) == true){
                                    var time = dayResult[k]["time"] == undefined?"":dayResult[k]["time"];
                                    if(totalCount == 0){
                                        dmaxValue = value;
                                        dminValue = value;
                                    }
                                    totalCount++;
                                    avgValue+=Number(value);
                                    if(value > dmaxValue){
                                        dmaxValue = value;
                                    }
                                    if(value < dminValue){
                                        dminValue = value;
                                    }
                                    var valuePoint = new Array();
                                    valuePoint.push(time*1000);
                                    valuePoint.push(Number(value));
                                    valuePointArray.push(valuePoint);
                                }
                            }
                        }
                }
            }
        }
        $("#indicatorMax").text(Number(dmaxValue).toFixed(2) +";");
        $("#indicatorMin").text(Number(dminValue).toFixed(2) +";");
        if(totalCount == 0){
            $("#indicatorAvg").text(avgValue);
        }else{
            $("#indicatorAvg").text((avgValue/totalCount).toFixed(2));
        }
        valuePointArray.sort(function(a, b){
            return a[0]-b[0];     //return a.value.localeCompare(b.value);
        });
        rangArray.sort(function(a, b){
            return a[0]-b[0];     //return a.value.localeCompare(b.value);
        });
        initHistoryChart(chartType,valuePointArray,rangArray);
    }
    //初始化历史图
    function initHistoryChart(type,valuePointArray,rangPointArray){
        var options ={
            chart: {
                renderTo: 'historycontainer',
                type: type
            },
            title: {
                useHTML: true,
                text: family +"("+unitType+")"+"<br>"+"<label style='font-size: x-small;color: red'>(阈值："+minValue+"-"+maxValue+")</label>"
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                //crosshair: true,
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%Y/%m/%d %H:%M:%S}',
                    rotation: 25,
                    align: 'left'
                }
            },
            yAxis: {
                //min: 0,
                title: {
                    text: ''
                },
                plotLines: [{
                    value: minValue,
                    width: 1,
                    color:'red',
                    zIndex: 5,
                    label: {
                        text: '下限标准: '+minValue,
                        align: 'center',
                        style: {
                            color: 'red'
                        }
                    }
                },{
                    value: maxValue,
                    width: 1,
                    color:'red',
                    zIndex: 5,
                    label: {
                        text: '上限标准: '+maxValue,
                        align: 'center',
                        style: {
                            color: 'red'
                        }
                    }
                }]
            },
            tooltip: {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S',
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: family + '值',
                //color:'#1aadce',
                zIndex: 1,
                data: valuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }
            },{
                    name: '范围',
                    data: rangPointArray,
                    type: 'arearange',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    color: Highcharts.getOptions().colors[0],
                    fillOpacity: 0.2,
                    zIndex: 0
            }]
        };
        if(type == "column"){
            options.series = new Array();
            options.series[0] = new Object();
            options.series[0].name = family;
            options.series[0].color = "#1aadce";
            options.series[0].data = valuePointArray;
        }
        var chart = new Highcharts.Chart(options);
    }
    //设置开始日期时间
    //start:laydate.now(0)/2099-06-16 23:59:59
    function setFirstLaydate(istime,start,max,format){
        var firstTimeoption = {
            elem: '#starthour',
            istime: istime,
            isclear:false,
            istoday:false,
            format: format,
            issure:false, //是否显示确认
            start:start,//设置起始日期
            //min: laydate.now(), //设定最小日期为当前日期
            max: max, //最大日期
            choose: function(datas){ //选择日期完毕的回调
                firstdate= datas;
            }
        };
        firstdate = firstTimeoption.start;
        return firstTimeoption;
    }
    //设置结束日期时间
    function setLastLaydate(istime,start,min,max,format){
        var lastTimeoption = {
            elem: '#endhour',
            istime: istime,
            isclear:false,
            istoday:false,
            format: format,
            issure:false, //是否显示确认
            start:start,//设置起始日期
            min: min, //设定最小日期为当前日期
            max: max, //最大日期
            choose: function(datas){ //选择日期完毕的回调
                enddate = datas;
            }
        };
        enddate = lastTimeoption.start;
        return lastTimeoption;
    }
    //初始化时间值
    function InitTimeUI(type,isInite,firstTimeClick,lastTimeClick){
        var formate = "YYYY/MM/DD",isTime = false;
        if(type == "minute" || type == "minute10"|| type == "hour"){
            formate = "YYYY/MM/DD hh:mm:ss";
            isTime = true;
        }
        if(isInite){
            setFirstLaydate(isTime,laydate.now(-2),laydate.now(0),formate);
            setLastLaydate(isTime,laydate.now(0),firstdate,laydate.now(0),formate);
        }
        if(firstTimeClick){
            laydate(setFirstLaydate(isTime,firstdate,laydate.now(0),formate));
        }
        if(lastTimeClick){
            laydate(setLastLaydate(isTime,enddate,firstdate,laydate.now(0),formate));
        }
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
    }
});
if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    window.applicationCache.update();
}