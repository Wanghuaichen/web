/**
 * Created by admin on 2015/11/17.
 */
$(function(){
    InitTimeUI("hour",true);
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
    });
    $("#endhour").click(function(){
        var selectType = $("#searchType option:selected").val();
        if(selectType == "minute" || selectType == "minute10"){
            InitTimeUI("minute",false,false,true);
        }else {
            InitTimeUI("hour",false,false,true);
        }
    });
    $("#searchpng").click(function(){
        if(enddate == null || enddate == undefined){
            alert("请先选择日期范围！");
            return false;
        }
        fillHistoryData();
    });
    $("#linechart").click(function(){
        //line();
        chartType ="line";
        fillHistoryData();
    });
    $("#columnchart").click(function(){
        //column();
        chartType ="column";
        fillHistoryData();
    });
    $("#backIndicator").click(function(){
        if(currentPage != null){
            window.location.href="manualIndicatorList.html";
        }else if(alarmInfo != null){
            window.location.href="alarm.html";
        }else{
            window.location.href="indicatorMap.html";
        }
    });
    //realTimeChart();
    //获取当前选中的指标
    var manualIndicatorJsonStr = getCookie("manualIndicator"),
        currentPage = getCookie("currentPage"),
        alarmInfo = getCookie("alarmInfo"),
        family = "", //指标类型
        unitType = "", //指标单位
        indicatorName = "", //指标名称
        manualIndicatorId="", //指标ID
        devId = "", //设备id
        selectedDate = null, //选择日期
        chartType ="line";
    delCookie("currentPage");
    delCookie("alarmInfo");

    if(manualIndicatorJsonStr != undefined && manualIndicatorJsonStr != ""){
        var manualIndicatordata = JSON.parse(manualIndicatorJsonStr);
        //devId = manualIndicatordata["devId"]==undefined?"":manualIndicatordata["devId"];
        family = manualIndicatordata["family"]==undefined?"":manualIndicatordata["family"];
        unitType = manualIndicatordata["unit"]==undefined?"":manualIndicatordata["unit"];
        //indicatorName = manualIndicatordata["name"]==undefined?"":manualIndicatordata["name"];
        if(alarmInfo != null)manualIndicatorId = manualIndicatordata["uid"]==undefined?"":manualIndicatordata["uid"];
        else manualIndicatorId = manualIndicatordata["id"]==undefined?"":manualIndicatordata["id"];
        selectedDate = manualIndicatordata["selectedDate"]==undefined?"":manualIndicatordata["selectedDate"];
        var   factoryname = manualIndicatordata["factory"] == undefined ? "" : manualIndicatordata["factory"]["name"]
        //get device provider by deviceId
        //var deviceParm = new Object();
        //deviceParm.devId = devId;
        //var deviceObject = JSON.parse(listdevice(deviceParm));
        //if(deviceObject.errCode == "success" && deviceObject.total != 0){
        //    var userId = deviceObject.deviceList[0]["account"]["uid"];
        //    var userParm = new Object();
        //    userParm.userId = userId;
        //    var userResponse = JSON.parse(listuser(userParm));
        //    if(userResponse.errCode == "success"){
        //        $("#deviceProvider").text(userResponse.accountList[0]["org"]);
        //    }
        //    $("#factoryName").text(factoryname);
        //}
    }
    if(alarmInfo != null){
        var alarmInfoObj = JSON.parse(alarmInfo)
        firstdate = alarmInfoObj.startTime;
        enddate = alarmInfoObj.endTime;
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
    }
    fillHistoryData();
    //给历史图添加数据
    function fillHistoryData(){
        var page_object = new Object(),findBy = new Object(),other_object = new Object(),sort = new Object();
        page_object.max="2000";
        page_object.start="0";
        findBy.family = family;
        findBy.uid = manualIndicatorId;

        var time = new Object(),endTime = new Date(enddate),startdate = new Date(firstdate);
        var selectType = $("#searchType option:selected").text();
        time.end = endTime.getTime()+(24*60*60*1000-1);
        if(selectType == "小时"){
            time.scale = "hour";
        }else if(selectType == "天"){
            time.scale = "day";
        }else if(selectType == "月"){
            time.scale = "month";
        }else if(selectType == "年"){
            time.scale = "year";
        }else if(selectType == "一分钟"){
            time.scale = "minute";
            time.end -= 24*60*60*1000-1;
        }else if(selectType == "十分钟"){
            time.scale = "minute10";
            time.end -= 24*60*60*1000-1;
        }if(selectType == "all"){
            time.scale = "all";
        }
        time.start = startdate.getTime();
        findBy.time = time;
        findBy.uid = manualIndicatorId;
        sort.asc = "time";
        other_object.sort = sort;
        var historyDataJsonStr = manvListhist(findBy,page_object,other_object);
        var historyDatasObject = JSON.parse(historyDataJsonStr);
        var valuePointArray = new Array(),maxPointArray = [],minPointArray = [],rangArray = [];
        var minValue = 0,maxValue = 0,avgValue = 0,totalCount = 0;
        if(historyDatasObject.errCode == "success" && historyDatasObject.total != 0){
            var resultList = historyDatasObject.resultList;
            var temp=/^-?\d+(\.\d+)?$/;
            //获取所有结果数据
            for(var i in resultList){
                for(var j in resultList[i]){
                    var dayResult = resultList[i][j];
                    var day = resultList[i]["day"] == undefined?"":resultList[i]["day"];
                    for(var k in dayResult){
                        if(dayResult[k]["dvalue"] == undefined){
                            var values = dayResult[k]["values"] == undefined?"":dayResult[k]["values"];
                            for(var h in values){
                                var valuePoint = new Array(),
                                    maxPoint = [],minPoint = [],rangePoint = [],
                                    min = values[h]["min"] == undefined?"":Number(values[h]["min"]).toFixed(3), //最小值
                                    max = values[h]["max"] == undefined?"":Number(values[h]["max"]).toFixed(3), //最大值
                                    value = values[h]["avg"] == undefined?"":Number(values[h]["avg"]).toFixed(3),
                                    time = values[h]["time"] == undefined?"":values[h]["time"];
                                var substrTime = day.substring(0,4)+"/"+day.substring(4,6)+"/"+day.substring(6,8);
                                var date = new Date(substrTime+" "+ time);
                                if(temp.test(value) == true && temp.test(min) == true && temp.test(max) == true){
                                    if(totalCount == 0){
                                        maxValue = max;
                                        minValue = min;
                                    }
                                    totalCount++;
                                    avgValue+=Number(value);
                                    if(max > maxValue){
                                        maxValue = max;
                                    }
                                    if(min < minValue){
                                        minValue = min;
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
                                    maxValue = value;
                                    minValue = value;
                                }
                                totalCount++;
                                avgValue+=Number(value);
                                if(value > maxValue){
                                    maxValue = value;
                                }
                                if(value < minValue){
                                    minValue = value;
                                }
                                var valuePoint = new Array();
                                valuePoint.push(time);
                                valuePoint.push(Number(value));
                                valuePointArray.push(valuePoint);
                            }
                        }
                    }
                }
            }

            //historyChart.series[0].addPoint(pointArray);
            //historyChart.redraw();

        }
        $("#indicatorMax").text(Number(maxValue).toFixed(2) +";");
        $("#indicatorMin").text(Number(minValue).toFixed(2) +";");
        if(totalCount == 0){
            $("#indicatorAvg").text(avgValue);
        }else{
            $("#indicatorAvg").text((avgValue/totalCount).toFixed(2));
        }
        initHistoryChart(chartType,valuePointArray,maxPointArray,minPointArray,rangArray);
    }

    //初始化历史图
    function initHistoryChart(type,valuePointArray,maxPointArray,minPointArray,rangPointArray){
        var options ={
            chart: {
                renderTo: 'historycontainer',
                type: type
            },
            title: {
                text: family + "("+unitType+")"
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                crosshair: true,
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%Y/%m/%d %H:%M:%S}',
                    //autoRotation: [25],
                    rotation: 25,
                    //tickInterval:0.5,
                    //autoRotation:25,
                    align: 'left',
                }
            },
            yAxis: {
                //min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                //headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                //pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                //'<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
                //footerFormat: '</table>',
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S'
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

            //}, {
            //    name: family + '最大值',
            //    color:'#DD2200',
            //    data: maxPointArray
            //}, {
            //        name: family + '最小值',
            //        color:'#33AA11',
            //        data: minPointArray
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