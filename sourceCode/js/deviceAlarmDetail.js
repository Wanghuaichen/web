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
        setCookie("deviceAlarmBackCurrentPage",currentPage);
        window.location.href="deviceAlarm.html";
    });
    //realTimeChart();
    //获取当前选中的指标
    var deviceAlarmJsonStr = getCookie("deviceAlarm"),
        currentPage = getCookie("deviceAlarmCurrentPage"),
        alarmInfo = getCookie("alarmInfo"),
        idSer = "", //id序列
        devId = "", //设备id
        subId = "", //子设备id
        devType = "", //设备id
        devName = "", //设备名称
        chartType ="line";
    delCookie("currentPage");
    delCookie("alarmInfo");

    if(deviceAlarmJsonStr != undefined && deviceAlarmJsonStr != ""){
        var deviceAlarmdata = JSON.parse(deviceAlarmJsonStr);
        idSer = deviceAlarmdata.id;
        devId = deviceAlarmdata.devId;
        subId = deviceAlarmdata.subId;

        devName = deviceAlarmdata.name;
        if(devId == subId){
            devType = deviceAlarmdata.type;
        }else{
            var subs = deviceAlarmdata.subs;
            for(var j in subs){
                var subPid = subs[j]["pid"],
                    subType = subs[j]["type"]== undefined?deviceAlarmdata.type:subs[j]["type"];
                if(subId == subPid) devType = subType;
            }
        }
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
        var param = new Object(),find = new Object(),timeParam = new Object();
        timeParam.start = (new Date(firstdate)).getTime();
        timeParam.end = (new Date(enddate)).getTime();
        timeParam.space = 180000;
        find.time = timeParam;
        find.id = idSer;
        find.subId = subId;
        find.devType = devType;
        param.find = find;
        var response  = JSON.parse(listhistreport(param));
        if(response.errCode == "success"){
            var resultList = response.resultList,valuePointArray = new Array();
            for(var i in resultList){
                var state = resultList[i]["state"],
                    time = resultList[i]["time"],
                    valuePoint = new Array();
                valuePoint.push(time);
                valuePoint.push((state == "on"?1:0));
                valuePointArray.push(valuePoint);
            }
            initHistoryChart(chartType,valuePointArray);
        }
        return;
    }

    //初始化历史图
    function initHistoryChart(type,valuePointArray,maxPointArray,minPointArray,rangPointArray){
        $("#historycontainer").highcharts('StockChart',{
            chart: {
                type: type
            },
            title: {
                text: devName
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
            yAxis:{
                tickPixelInterval:1
            },
            tooltip: {
                headerFormat: "<span style='font-size:10px'>{point.key}</span><table>",
                //pointFormat: "<tr><td style='color:{series.color};padding:0'>{series.name}: </td>" +
                //"<td style='padding:0'><b>{point.y}</b></td></tr>",
                pointFormatter: function(){
                    var color = this.series.color,
                        name = this.series.name,
                        value = Number(this.y)==1?"on":"off";
                    //value =Number(this.point.y)==1?"on":"off";
                    return "<tr><td style='color:"+color+";padding:0'>"+name+": </td>" +
                        "<td style='padding:0'>"+value+"</td></tr>";
                },
                footerFormat: '</table>',
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
            rangeSelector:{
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            series: [{
                name: '状态',
                step:true,
                //color:'#1aadce',
                zIndex: 1,
                data: valuePointArray,
                marker: {
                    fillColor: 'white',
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }

            }]
        });
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