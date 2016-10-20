/**
 * Created by admin on 2015/11/17.
 */
$(function(){
    var tipdialog = $("#tip").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text: "是",
            click: function (_button) {
                //this.dialog("option","_button");
                setInterval10(false);
                tipdialog.dialog("close");
            },
            class: "sure",
        }, {
            text: "否",
            click: function () {
                clearInterval(realDataId);
                tipdialog.dialog("close");
            },
            class: "cancel",
        }]
    });
    var realDataId,intervalStartTime = 0,intervalEndTime = 0; //间隔时间
    setInterval10(true);
    InitTimeUI("hour",true);
    $("#realtime").click(function(){
        clearInterval(realDataId);
        setInterval10(true);
        filldate();
    });
    $("#history").click(function(){
        clearInterval(realDataId);
        chartType ="line";
        $("#searchType option[value='hour']").attr("selected", true);
        fillHistoryData();
    });
    $("#deviceAlarm").click(function(){
        clearInterval(realDataId);
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
        if(enddate == "" || enddate == undefined){
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
            //window.location.href="indicatorList.html";
        }else if(alarmInfo != null){
            //window.location.href="alarm.html";
        }else{
            //window.location.href="indicatorMap.html";
        }
    });
    //实时图指标改变事件
    $("#indicatorselect").change(function(){
        realTimeChart();
        filldate();
    });
    var familyListObject = new Object(),familyListStr = "";
    familyList();
    //获取当前选中的指标
    var siteDetail = JSON.parse(getCookie("siteDetail")),
        currentPage = getCookie("indicatorCurrentPage"),
        maxValue = "", //最大标准
        minValue = "", //最小标准
        familySelected = "", //实时图选中的指标
        unitType = "", //实时图选中的指标
        chartType ="line";
    if(siteDetail != undefined && siteDetail != ""){
        var selectedStartDate = siteDetail["startTime"]==undefined?"":siteDetail["startTime"],
            selectedEndDate = siteDetail["endTime"]==undefined?"":siteDetail["endTime"],
            factoryname = siteDetail["name"] == undefined ? "" : siteDetail["name"],
            factoryId = siteDetail["id"] == undefined ? "" : siteDetail["id"];
        //如果有历史日期参数先选中历史图
        if(selectedStartDate != "" && selectedEndDate != ""){
            firstdate = selectedStartDate;
            enddate =selectedEndDate;
            $("#starthour").val(firstdate);
            $("#endhour").val(enddate);
            $("#history").click();
        }else{
            realTimeChart();
            filldate();
        }
        $("#factoryName").text(factoryname);
        sortOp("deviceAlarmTable","currentpage","pagelimit",5);
        fillDataToTable(factoryname,factoryId);
    }
    /**给实时图添加数据
     * @param family 当前选中的指标
     * @param interval  间隔多久更新一次
     */
    function filldate(interval){
        familySelected = $("#indicatorselect option:selected").text();
        //update chart prototype
        var nowchart = $('#nowcontainer').highcharts();
        nowchart.series[0].name = familySelected;
        nowchart.setTitle({ useHTML: true,
            text: familySelected }) ;
        //get Real time data
        var factoryParm = new Object();
        factoryParm.name = factoryname;
        var findBy = new Object();
        findBy.family = familySelected;
        var page_object = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;
        var datanowresponse = datanow(findBy,page_object,other_object);
        var responsedata = JSON.parse(datanowresponse);
        var lookTime = responsedata.time;
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.poluList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var indicatorJsonStr = JSON.stringify(datas[i]),
                    max = datas[i]["max"] == undefined ? "" : datas[i]["max"],
                    min = datas[i]["min"] == undefined ? "" : datas[i]["min"],
                    unit = datas[i]["unit"] == undefined ? "" : datas[i]["unit"],
                    value = datas[i]["value"] == undefined ? "" : datas[i]["value"],
                    family = datas[i]["family"] == undefined ? "" : datas[i]["family"],
                //vtype = datas[i]["vtype"] == undefined ? "" : datas[i]["vtype"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"];
                var intervalTime = lookTime-time; //查询时间与上报数据时间差
                var temp=/^-?\d+(\.\d+)?$/;
                minValue = min;maxValue = max;unitType = unit;
                //指标值是数字且第一次查询或者
                // 间隔30秒查询且查数据时间与plc上报数据的时间不能超过60秒
                if(temp.test(value) == true && (interval != 30000 ||(interval == 30000 && intervalTime <= 60000))){
                    var pointArray = new Array();
                    pointArray.push(time);
                    pointArray.push(value);
                    nowchart.series[0].addPoint(pointArray);
                }
            }
            if(maxValue != "" && maxValue != undefined){
                nowchart.setTitle({ useHTML: true,
                    text: familySelected +"("+unitType+")"+"<br>"+"<label style='font-size: x-small;color: red'>(阈值："+minValue+"-"+maxValue+")</label>"}) ;
            }
        }
    }
    //给历史图添加数据
    function fillHistoryData(){
        var page_object = new Object(),findBy = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        findBy.factory = factoryId;
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
        findBy.all = "yes";
        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;
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
                    var dayResult = resultList[i][j];
                    var day = resultList[i]["day"] == undefined?"":resultList[i]["day"];
                    for(var k in dayResult) {
                        if (dayResult[k]["dvalue"] == undefined) {
                            var values = dayResult[k]["values"] == undefined ? "" : dayResult[k]["values"],
                                family = dayResult[k]["family"] == undefined ? "" : dayResult[k]["family"];
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
                                    if(familyListObject[family] == null){
                                        familyListObject[family] = new Array();
                                    }
                                    familyListObject[family].push(valuePoint);

                                    //maxPoint.push(date.getTime());
                                    //maxPoint.push(Number(max))
                                    //maxPointArray.push(maxPoint);
                                    //
                                    //minPoint.push(date.getTime());
                                    //minPoint.push(Number(min))
                                    //minPointArray.push(minPoint);
                                    //
                                    //rangePoint.push(date.getTime());
                                    //rangePoint.push(Number(min));
                                    //rangePoint.push(Number(max));
                                    //rangArray.push(rangePoint);
                                }
                            }
                        }
                    }
                }
            }
        }
        //$("#indicatorMax").text(Number(dmaxValue).toFixed(2) +";");
        //$("#indicatorMin").text(Number(dminValue).toFixed(2) +";");
        //if(totalCount == 0){
        //    $("#indicatorAvg").text(avgValue);
        //}else{
        //    $("#indicatorAvg").text((avgValue/totalCount).toFixed(2));
        //}
        var series = new Array();
        for(var j in familyListObject){
            var point = new Object(),
                valueArray = familyListObject[j];
            valueArray.sort(function(a, b){
                return a[0]-b[0];     //return a.value.localeCompare(b.value);
            });
            point.name = j;
            point.data = valueArray;
            series.push(point);
        }
        initHistoryStockChart(series);
        //initHistoryChart(chartType,valuePointArray,maxPointArray,minPointArray,rangArray,series);
    }
    //实时图初始化
    function realTimeChart(){
        $('#nowcontainer').highcharts("StockChart",{
            chart: {
                renderTo: 'nowcontainer',
                type: 'scatter',
                //margin: [70, 50, 60, 80],
                events: {
                    click: function (e) {
                        // find the clicked values and the series
                        var x = e.xAxis[0].value,
                            y = e.yAxis[0].value,
                            series = this.series[0];
                    }
                }
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                //gridLineWidth: 1,
                minPadding: 0.2,
                maxPadding: 0.2,
                //maxZoom: 60,
                type: 'datetime',
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%m/%d %H:%M:%S}',
                    //formatter: function () {
                    //    return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.value);
                    //},
                    rotation: 25,
                    align: 'left'
                }
            },
            dataZoom : {
                show : true,
                realtime: true,
                start : 50,
                end : 100
            },
            yAxis: {
                title: {
                    text: '',
                    rotation:0,
                    margin:20
                },
                minPadding: 0.2,
                maxPadding: 0.2,
                //maxZoom: 60,
                plotLines: [
                //    {
                //    value: minValue,
                //    width: 1,
                //    color: 'red',
                //    zIndex:5,
                //    label: {
                //        text: '下限标准: '+minValue,
                //        align: 'center',
                //        style: {
                //            color: 'red'
                //        }
                //    }
                //},{
                //    value: maxValue,
                //    color: 'red',
                //    width: 1,
                //    zIndex:5,
                //    label: {
                //        text: '上限标准: '+maxValue,
                //        align: 'center',
                //        style: {
                //            color: 'red'
                //        }
                //    }
                //}
                ]
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S'
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            rangeSelector:{
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    point: {
                        events: {
                            'click': function () {
                                //if (this.series.data.length > 1) {
                                //    this.remove();
                                //}
                            }
                        }
                    }
                }
            },
            series: [{
                name:"",
                data: []
            }],
        });
    }
    function initHistoryStockChart(series){
        $('#historycontainer').highcharts('StockChart', {
            rangeSelector : {
                selected : 1
            },
            title : {
                useHTML: true,
                text: familyListStr
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
            tooltip: {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S',
            },
            rangeSelector:{
                //inputEditDateFormat:"%Y/%m/%d %H:%M:%S",
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            series : series
        });
    }
    //初始化历史图
    function initHistoryChart(type,valuePointArray,maxPointArray,minPointArray,rangPointArray,series){
        var options ={
            chart: {
                renderTo: 'historycontainer',
                type: type
            },
            title: {
                useHTML: true,
                text: familyListStr
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
            series: series
        };
        if(type == "column"){
            options.series = series;
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
    //设置10秒执行一次
    function setInterval10(isFirst){
        intervalStartTime= (new Date()).getTime();
        if(isFirst){
            realDataId = setInterval(function(){
                intervalEndTime =  (new Date()).getTime();
                if((intervalEndTime-intervalStartTime)>= 10*60*1000){
                    tipdialog.dialog("option","title","提示信息");
                    $("#tip .tipright p").html("是否继续监控实时数据！");
                    tipdialog.dialog("option","_button","overtime");
                    tipdialog.dialog("open");
                }else{
                    filldate(30000);
                }
            },10000);
            $(document).mousemove(function(){
                setInterval10(false);
            });
            $(document).click(function(){
                setInterval10(false);
            });
        }
    }
    /**
     * 动态添加表数据
     */
    function familyList(){
        var responseObj = JSON.parse(polusourcedistkey("family"));
        if(responseObj.errCode == "success" && responseObj.total !=0){
            var familyList = responseObj.resultList;
            for(var j in familyList){
                var family = familyList[j]["family"];
                familyListObject[family] = new Array();
                familyListStr += family+"/";
                $("<option>"+family+"</option>").appendTo($("#indicatorselect"));
            }
            familyListStr = familyListStr.substr(0,familyListStr.length-1);
        }
    }

    /**
     * 设备告警信息
     * @param factoryName
     * @param factoryId
     */
    function fillDataToTable(factoryName,factoryId){
        $("#deviceAlarmTable tbody").empty();
        $("#deviceAlarmTable tbody").html("");
        var param = new Object();
        var typearray=new Array();
        var devcount=0;
        param.org = factoryName;
        param.orgId = factoryId;
        var responseObj = JSON.parse(listdevice(param));
        if(responseObj.errCode == "success" && responseObj.total != 0){
            var deviceArray = new Object();
            var deviceList = responseObj.deviceList,multiFind = new Array(),timeParam = new Object(),count = 0;
            if(selectedStartDate != ""){
                timeParam.start = selectedStartDate;
                timeParam.end = selectedEndDate;
            }else{
                timeParam.start = (new Date()).getTime() - 24*60*60*1000;
                timeParam.end = (new Date()).getTime();
            }
            timeParam.space = 180000;
            for(var i in deviceList){
                var deviceStr = JSON.stringify(deviceList[i]),
                    id = deviceList[i]["id"],
                    devType = deviceList[i]["type"]== undefined?"":deviceList[i]["type"],
                    subs = deviceList[i]["subs"] == undefined?"":deviceList[i]["subs"];
                deviceArray[id] = deviceStr;
                var find = new Object(),mutiObj = new Object();
                find.id = id;
                find.time=timeParam;
                find.devType = devType;
                typearray[devcount]=devType;
                devcount++;
                mutiObj.find = find;
                multiFind.push(mutiObj);
                for(var j in subs){
                    var find = new Object(),mutiObj = new Object(),
                        pid = subs[j]["pid"],
                        subType = subs[j]["type"]== undefined?devType:subs[j]["type"];
                    find.id = id;
                    find.subId = pid;
                    find.time=timeParam;
                    find.devType = subType;
                    typearray[devcount]=subType;
                    devcount++;
                    mutiObj.find = find;
                    multiFind.push(mutiObj);
                }
            }
            var heartParam = new Object();
            heartParam.multiFind = multiFind;
            var response =JSON.parse(listhiststate(heartParam));
            var mutiResult = response.multiResult;
            for(var k in mutiResult){
                var resultObj = mutiResult[k];
                if(resultObj.errCode == "success"){
                    count++;
                    var resultList = resultObj.resultList,
                        idArray = (resultObj.id).split("|"),
                        lastTimeObj = resultList[resultList.length-1];
                    var lastTime = lastTimeObj.A,
                        deviceObj = JSON.parse(deviceArray[idArray[0]]);
                    deviceObj.lastTime = lastTime;
                    deviceObj.subId = idArray[1];
                    deviceArray[idArray[0]] = JSON.stringify(deviceObj);
                    addTable(count,deviceArray[idArray[0]],deviceObj.name,dataFormate(lastTime,"yyyy/MM/dd HH:mm:ss"),idArray[1],typearray[k],deviceObj.org);
                }
            }
            if(count != 0){
                sorter.init("deviceAlarmTable",1);
                if(getCookie("deviceAlarmBackCurrentPage") != null){
                    sorter.transferToPage(Number(getCookie("deviceAlarmBackCurrentPage")));
                    delCookie("deviceAlarmBackCurrentPage");
                }
            }
        }
    }
    //添加每一行数据
    function addTable(length,str,deviceName,lastTime,deviceId,deviceType,factoryName){
        var detailId = "detail"+length;
        $("#deviceAlarmTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+str+"</td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+deviceName+"</td>" +
            "<td>"+deviceId+"</td>" +
            "<td>"+deviceType+"</td>" +
            "<td>"+dataFormate(lastTime,"yyyy/MM/dd HH:mm:ss")+"</td>" +
            "<td>"+factoryName+"</td>" +
            "<td><a href='../devices/deviceAlarmDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>"+
            "</tr>");
        $(document).on("click","#"+detailId, function () {
            var deviceJsonStr = $(this).parent().parent().children("td").eq(0).text();
            setCookie("deviceAlarm",deviceJsonStr);
            var alarmObj = new Object();
            alarmObj.startTime = startTime;
            alarmObj.endTime = endTime;
            setCookie("alarmInfo",JSON.stringify(alarmObj));
            setCookie("deviceAlarmCurrentPage",$("#currentpage").text());
        });
    }
});
var sorter = new TINY.table.sorter("sorter");
if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    window.applicationCache.update();
}