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
        filldate(family);
    });
    $("#history").click(function(){
        clearInterval(realDataId);
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
            window.location.href="indicatorList.html";
        }else if(alarmInfo != null){
            window.location.href="alarm.html";
        }else{
            window.location.href="indicatorMap.html";
        }
    });
    realTimeChart();
    //获取当前选中的指标
    var indicatorJsonStr = getCookie("indicatordata"),
        currentPage = getCookie("indicatorCurrentPage"),
        alarmInfo = getCookie("alarmInfo"),
        family = "", //指标类型
        unitType = "", //指标单位
        maxValue = "", //最大标准
        minValue = "", //最小标准
        indicatorName = "", //指标名称
        indicatorId="", //指标ID
        devId = "", //设备id
        selectedDate = null, //选择日期
        chartType ="line";
    delCookie("indicatorCurrentPage");
    delCookie("alarmInfo");
    if(currentPage != null){
        setCookie("backCurrentPage",currentPage);
    }
    if(indicatorJsonStr != undefined && indicatorJsonStr != ""){
        var indicatordata = JSON.parse(indicatorJsonStr);
        devId = indicatordata["devId"]==undefined?"":indicatordata["devId"];
        family = indicatordata["family"]==undefined?"":indicatordata["family"];
        unitType = indicatordata["unit"]==undefined?"":indicatordata["unit"];
        indicatorName = indicatordata["name"]==undefined?"":indicatordata["name"];
        if(alarmInfo != null){
            indicatorId = indicatordata["uid"]==undefined?"":indicatordata["uid"];
            maxValue = indicatordata["dmax"]==undefined?"":indicatordata["dmax"];
            minValue = indicatordata["dmin"]==undefined?"":indicatordata["dmin"];
        }else {
            indicatorId = indicatordata["id"]==undefined?"":indicatordata["id"];
            maxValue = indicatordata["max"]==undefined?"":indicatordata["max"];
            minValue = indicatordata["min"]==undefined?"":indicatordata["min"];
        }
        selectedDate = indicatordata["selectedDate"]==undefined?"":indicatordata["selectedDate"];
        var   factoryname = indicatordata["factory"] == undefined ? "" : indicatordata["factory"]["name"]
        //get device provider by deviceId
        var deviceParm = new Object();
        deviceParm.devId = devId;
        var deviceObject = JSON.parse(listdevice(deviceParm));
        if(deviceObject.errCode == "success" && deviceObject.total != 0){
            var userId = deviceObject.deviceList[0]["account"]["uid"];
            var userParm = new Object();
            userParm.userId = userId;
            var userResponse = JSON.parse(listuser(userParm));
            if(userResponse.errCode == "success"){
                $("#deviceProvider").text(userResponse.accountList[0]["org"]);
            }
            $("#factoryName").text(factoryname);
        }
        //如果有历史日期参数先选中历史图
        if(selectedDate != null && selectedDate != ""){
            firstdate = selectedDate;
            var first = new Date(selectedDate);
            enddate = dataFormate((first.getTime() + 24*60*60*1000), "yyyy/MM/dd");
            $("#starthour").val(selectedDate);
            $("#endhour").val(enddate);
            $("#history").click();
        }else{
            filldate(family);
        }
    }
    if(alarmInfo != null){
        var alarmInfoObj = JSON.parse(alarmInfo)
        firstdate = alarmInfoObj.startTime;
        enddate = alarmInfoObj.endTime;
        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);
        $("#history").click();
    }
    //给实时图添加数据
    function filldate(family,interval){
        var nowchart = $('#nowcontainer').highcharts();
        //update chart prototype
        nowchart.series[0].name = family;
        nowchart.setTitle({ useHTML: true,
            text: family +"("+unitType+")"+"<br>"+"<label style='font-size: x-small;color: red'>(阈值："+minValue+"-"+maxValue+")</label>"}) ;
        //get Real time data
        var factoryParm = new Object();
        factoryParm.name = factoryname;
        var findBy = new Object();
        findBy.family = family;
        findBy.devId = devId;
        findBy.name = indicatorName;
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
                    value = datas[i]["value"] == undefined ? "" : datas[i]["value"],
                    family = datas[i]["family"] == undefined ? "" : datas[i]["family"],
                //vtype = datas[i]["vtype"] == undefined ? "" : datas[i]["vtype"],
                    time = datas[i]["time"] == undefined ? "" : datas[i]["time"];
                var intervalTime = lookTime-time; //查询时间与上报数据时间差

                var temp=/^-?\d+(\.\d+)?$/;
                //指标值是数字且
                //第一次查询或者
                // 间隔30秒查询且查数据时间与plc上报数据的时间不能超过60秒
                if(temp.test(value) == true && (interval != 30000 ||(interval == 30000 && intervalTime <= 60000))){
                    var pointArray = new Array();
                    //pointArray.push(new Date(time*1000));
                    pointArray.push(time);
                    pointArray.push(value);
                    nowchart.series[0].addPoint(pointArray);
                }
            }
        }
    }
    //给历史图添加数据
    function fillHistoryData(){
        var page_object = new Object(),findBy = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        findBy.family = family;
        findBy.uid = indicatorId;
        findBy.devId = devId;

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
        findBy.uid = indicatorId;
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
        initHistoryStockChart(chartType,valuePointArray,rangArray);
        //initHistoryChart(chartType,valuePointArray,maxPointArray,minPointArray,rangArray);
    }

    /**实时图初始化
     */
    function realTimeChart(){
        //实时数据显示
        $('#nowcontainer').highcharts("StockChart",{
            chart: {
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
            yAxis: {
                title: {
                    text: '',
                    rotation:0,
                    margin:20
                },
                minPadding: 0.2,
                maxPadding: 0.2,
                //maxZoom: 60,
                plotLines: [{
                    value: minValue,
                    width: 1,
                    color: 'red',
                    zIndex:5,
                    label: {
                        text: '下限标准: '+minValue,
                        align: 'center',
                        style: {
                            color: 'red'
                        }
                    }
                },{
                    value: maxValue,
                    color: 'red',
                    width: 1,
                    zIndex:5,
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
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S'
            },
            rangeSelector:{
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
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
            }]
        });
    }
    function initHistoryStockChart(type,valuePointArray,rangPointArray){
        $('#historycontainer').highcharts('StockChart', {
            rangeSelector : {
                selected : 1
            },
            title : {
                useHTML: true,
                text: family +"("+unitType+")"+"<br>"+"<label style='font-size: x-small;color: red'>(阈值："+minValue+"-"+maxValue+")</label>"
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
            rangeSelector:{
                inputDateFormat: "%Y/%m/%d",
                buttons:[{
                    type: 'all',
                    text: 'All'
                }]
            },
            series: [{
                name: family + '值',
                type:type,
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
        });
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
                //formatter:function(){
                //    var s = '<b>{point.key}</b>';
                //
                //    $.each(this.points, function () {
                //        s += '<br/>' + this.series.name + ': ' +
                //            this.y;
                //    });
                //
                //    return s;
                //}
                //valueSuffix: unitType,
                //headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                //pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                //'<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
                //footerFormat: '</table>'

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
                    filldate(family,30000);
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

});

if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    window.applicationCache.update();
}