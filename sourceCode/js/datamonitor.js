$(function () {
    $("#searchType").change(function () {
        $("#searchByName").val("");
    });
    $("#searchpng").click(function(){
        var content = $("#searchByName").val();
        if(content != ""){
            fuzzyQuery(content);
        }
    });
    $("#starthour").click(function(){
        laydate(setStartLayDate("#starthour",true,"YYYY/MM/DD"));
        addLaydateListener();
    });
    $("#endhour").click(function(){
        laydate(setEndLayDate("#endhour",startTime));
        $("#laydate_ms span").click(function(){
            addLaydateListener();
        });
        $("#laydate_ys li").click(function(){
            addLaydateListener();
        });
        addLaydateListener();
    });
    $("#alarmstarthour").click(function(){
        laydate(setStartLayDate("#alarmstarthour",true,"YYYY/MM/DD"));
        addLaydateListener();
    });
    $("#alarmendhour").click(function(){
        laydate(setEndLayDate("#alarmendhour",startTime));
        $("#laydate_ms span").click(function(){
            addLaydateListener();
        });
        $("#laydate_ys li").click(function(){
            addLaydateListener();
        });
        addLaydateListener();
    });
    $("#realtime").click(function(){
        sortOp("realTimeTable","realCurrentpage","realPagelimit");
        fillDataToTable("realTimeTable");
        $("#searchpng").click();
        initIndicatorCompare();
    });
    $("#history").click(function(){
        sortOp("historyTable","historyCurrentpage","historyPagelimit");
        fillDataToTable("historyTable");
        $("#searchpng").click();
        initIndicatorCompare();
    });
    $("#realWarm").click(function(){
        alarmTabInfo("realWarm",family);
    });
    $("#historyWarm").click(function(){
        sortOp("alarmHistoryTable","currentpage","pagelimit");
        alarmTabInfo("historyWarm",family);
        $("#searchpng").click();
        initIndicatorCompare();
    });
    $(".siteCompare").click(function(){
        compareWindow.dialog("open");
    });
    var compareWindow = $("#compareWindow").dialog({
        position:{ my: "center", at: "center", of: window},
        autoOpen: false,
        height: 380,
        width: 530,
        modal: true,
        closeText: "最小化"
    });
    var startTime = alarmStartTime = dataFormate((new Date()).getTime()-24*60*60*1000,"yyyy/MM/dd HH:mm:ss"),
        endTime = alarmEndTime = dataFormate((new Date()).getTime(),"yyyy/MM/dd HH:mm:ss");
    $("#starthour").val(startTime);
    $("#endhour").val(endTime);
    $("#alarmstarthour").val(alarmStartTime);
    $("#alarmendhour").val(alarmEndTime);
    sortOp("realTimeTable","realCurrentpage","realPagelimit");
    var family = getCookie("monitorMenu"),siteCompareValue,realDataArray,historyDataArray,historyAlarmArray;  //获取左边菜单选择的指标
    $("#currentPagetitle").text(family+"监测");
    fillDataToTable("realTimeTable");
    /**
     * 从服务器获取实时和历史数据
     * @param tabId 表元素Id
     */
    function fillDataToTable(tabId){
        var filter = new Object();
        siteCompareValue = new Array();
        //filter.include="family|devId|factory|lvalue|dvalue|svalue|lower|higher|location|values|uid|name";
        var page_object = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        //other_object.filter = filter;
        var datanowresponse = null,findBy = new Object();
        var startDate = $("#starthour").val(),endDate = $("#endhour").val();
        findBy.family = family;
        if(tabId == "historyTable" && startDate!= ""){
            historyDataArray = new Array();
            var start = new Date(startDate),end = new Date(endDate);
            var time = new Object();
            time.scale = "day";
            time.start = start.getTime();
            time.end = end.getTime();
            findBy.time = time;
            //findBy.all = "yes";
            datanowresponse = JSON.parse(datahistory(findBy,page_object,other_object));
        }else{
            realDataArray = new Array();
            datanowresponse = JSON.parse(datanow(findBy,page_object,other_object));
        }
        if(datanowresponse.errCode == "success") {
            var poluList = null;
            if (datanowresponse.poluList == undefined) {
                poluList = datanowresponse.resultList;
                getDataHistory(tabId,poluList);
            } else {
                poluList = datanowresponse.poluList;
                getDataNow(tabId,poluList);
            }
        }
    }
    /** 获取实时数据，并分析警告次数
     * @param tabId
     * @param poluList
     */
    function getDataNow(tabId,poluList){
        var factoryObject = new Object(),
            overStand = new Object();                         //工厂超标统计
        //统计工厂对应的指标信息和警告信息
        for(var i in poluList){
            var dataJsonStr = JSON.stringify(poluList[i]),
                indicatorInfo = poluList[i];
            var factoryId = indicatorInfo["factory"]["id"] == undefined ? "" : indicatorInfo["factory"]["id"],
                    higher = indicatorInfo.higher,
                    lower = indicatorInfo.lower;
                if(lower == "yes" || higher == "yes"){
                    //说明该指标已超标
                    if(overStand[factoryId] == undefined){
                        overStand[factoryId] = new Array();
                    }
                    overStand[factoryId].push(JSON.stringify(dataJsonStr));
                }
                if (factoryObject[factoryId] == undefined || factoryObject[factoryId] == null) {
                    factoryObject[factoryId] = new Array();
                }
                factoryObject[factoryId].push(dataJsonStr);
        }
        realAlarmInfo(overStand);
        analysisData(tabId,factoryObject,overStand);
    }
    /**获取历史数据，并分享警告次数
     * @param tabId
     * @param poluList
     */
    function getDataHistory(tabId,poluList){
        var factoryObject = new Object(),
            overStand = new Object();                         //工厂超标统计
        for(var i in poluList){
            var dayResult = poluList[i]["dayResult"],
                day = poluList[i]["day"];
            for(var j in dayResult){
                var indicatorInfo = dayResult[j];
                indicatorInfo.day = day;

                var factoryId = indicatorInfo["factory"]["id"] == undefined?"":indicatorInfo["factory"]["id"],
                    actMax = Number(indicatorInfo.actMax == undefined?"0":indicatorInfo.actMax),
                    actMin = Number(indicatorInfo.actMin == undefined?"0":indicatorInfo.actMin),
                    min = Number(indicatorInfo.min == undefined?"0":indicatorInfo.min),
                    max = Number(indicatorInfo.max == undefined?"0":indicatorInfo.max),
                    dataJsonStr = JSON.stringify(indicatorInfo);
                if(actMax > max || actMin < min){
                    //说明该指标已超标
                    if(overStand[factoryId] == undefined){
                        overStand[factoryId] = new Array();
                    }
                    overStand[factoryId].push(dataJsonStr);
                }
                if(factoryObject[factoryId] == undefined || factoryObject[factoryId] == null){
                    factoryObject[factoryId] =new Array();
                }
                factoryObject[factoryId].push(dataJsonStr);
            }
        }
        analysisData(tabId,factoryObject);
    }

    /**分析数据并将数据显示在界面上
     * @param tabId
     * @param factoryObject
     */
    function analysisData(tabId,factoryObject){
        $("#"+tabId+" tbody").empty();
        $("#"+tabId+" tbody").html("");
        var trNum = 0;
        //循环工厂信息
        for(var j in factoryObject){
            var factoryId = j,
                indicatorInfoList = factoryObject[j], //指标数组
                countFamily = new Object(),                       //统计相同指标的个数
                totalValue = new Object(),                        //统计相同指标的和
                maxValue = 0,
                minValue = 0,
                actMaxValue = 0,
                devId = "",
                unit = "",
                param = new Object();
            param.orgId = factoryId;
            //统计指标值
            for(var k in indicatorInfoList){
                var indicatorInfo = JSON.parse(indicatorInfoList[k]);
                var family = indicatorInfo.family,
                    value = indicatorInfo.value;
                if(value == undefined){
                    var values = indicatorInfo.values;
                    for(var v in values){
                        value = Number(values[v]["avg"]);
                    }
                }
                minValue = indicatorInfo.min == undefined?0:indicatorInfo.min;
                maxValue = indicatorInfo.max == undefined?0:indicatorInfo.max;
                devId = indicatorInfo.devId == undefined?0:indicatorInfo.devId;
                unit = indicatorInfo.unit == undefined?0:indicatorInfo.unit;

                if(countFamily[family] == undefined){
                    countFamily[family] = 0;
                    totalValue[family] = 0;
                }
                if(value > actMaxValue){
                    actMaxValue = value;
                }
                countFamily[family]++;
                totalValue[family] += value;
            }
            //获取站点详细信息，在界面上显示
            var factoryResponseData = JSON.parse(listorg(param));
            if(factoryResponseData.errCode == "success") {
                var factoryList = factoryResponseData.orgList;
                for (var h in factoryList) {
                    var factory = factoryList[h], //获取工厂对象
                        factoryStr = JSON.stringify(factory),
                        factoryName = factory["name"],
                        alarmInfo = "";
                    var avg = totalValue[family]/countFamily[family];
                    //当前指标对应每个工厂的值
                    var siteValue = new Array();
                    siteValue.push(factoryName);
                    //siteValue.max = actMaxValue;
                    siteValue.push(Number(avg.toFixed(3)));
                    siteCompareValue.push(siteValue);
                    trNum++;
                    var dataObj = new Object();
                    dataObj.str = factoryStr;
                    dataObj.factoryName = factoryName;
                    dataObj.value =avg.toFixed(3);
                    dataObj.range = minValue+"-"+maxValue;
                    dataObj.unit = unit;
                    dataObj.devId = devId;
                    if(tabId == "historyTable"){
                        historyDataArray.push(dataObj);
                    }else{
                        realDataArray.push(dataObj);
                    }
                    addTable(tabId,factoryStr,trNum,factoryName,avg.toFixed(3),minValue+"-"+maxValue,unit,devId);
                }
            }
        }
        //表分页
        sorter.init(tabId,1);
        initIndicatorCompare();
    }
    //添加每一行数据
    function addTable(tabId,factoryStr,length,factoryName,avgValue,max_min,unit,deviceId){
        var detailId = "detail"+length;
        $("#"+tabId+" tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+factoryStr+"</td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+factoryName+"</td>" +
            "<td>"+avgValue+"</td>" +
            "<td>"+max_min+"</td>" +
            "<td>"+unit+"</td>" +
            "<td>"+deviceId+"</td>" +
            "<td><a href='../comprehensiveMonitor/siteDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>"+
            "</tr>");
        $(document).on("click","#"+detailId, function () {
            var factoryObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var startDate = $("#starthour").val(),
                endDate = $("#endhour").val(),
                siteObject = new Object();
            siteObject.name = factoryObject["name"];
            siteObject.id = factoryObject["id"];
            //当起始时间不为空时说明当前查找的是历史数据
            if(startDate!= "" && endDate !=""){
                var start = new Date(startDate),end = new Date(endDate);
                siteObject.startTime = start.getTime();
                siteObject.endTime = end.getTime();
            }
            setCookie("siteDetail",JSON.stringify(siteObject));
        });
    }

    /**
     * 历史警告信息
     * @param tabId
     * @param family
     */
    function alarmTabInfo(tabId,family){
        historyAlarmArray = new Array();
        var filter = new Object();
        siteCompareValue = new Array();
        var page_object = new Object(),other_object = new Object(),multiFind = new Array(),sort = new Object();
        page_object.max="2000";
        page_object.start="0";
        sort.asc = "time";
        var datanowresponse = null,findBy = new Object();
        findBy.family = family;
        findBy.hilo ="higher|lower";
        if(tabId == "historyWarm" && alarmStartTime!= ""){
            var startDate = $("#alarmstarthour").val(),endDate = $("#alarmendhour").val();
            var start = new Date(startDate),end = new Date(endDate);
            var time = new Object();
            time.scale = "all";
            time.start = start.getTime();
            time.end = end.getTime();
            findBy.time = time;

            var multiObj = new Object();
            multiObj.find = findBy;
            multiObj.page = page_object;
            multiObj.sort = sort;
            multiFind.push(multiObj);
            other_object.multiFind = multiFind;
            datanowresponse = JSON.parse(datahistory(findBy,page_object,other_object,true));
        }else{
            //datanowresponse = JSON.parse(datanow(findBy,page_object,other_object));
        }
        $("#alarmHistoryTable tbody").empty();
        $("#alarmHistoryTable tbody").html("");
        if(datanowresponse !=null){
            var multiResult = datanowresponse.multiResult,length = 0;
            for(var i in multiResult){
                if(multiResult[i]["errCode"] == "success"){
                    var resultList = multiResult[i]["resultList"];
                    //统计工厂对应的指标信息
                    for(var i in resultList){
                        var dayResult = resultList[i]["dayResult"];
                        var day = resultList[i]["day"] == undefined?"":resultList[i]["day"];
                        for(var j in dayResult){
                            var dataJsonStr = JSON.stringify(dayResult[j]),
                                value = dayResult[j]["dvalue"]==undefined?"":dayResult[j]["dvalue"],
                                factoryname = dayResult[j]["factory"]==undefined?"":(dayResult[j]["factory"]["name"] == undefined?"":dayResult[j]["factory"]["name"]),
                                family = dayResult[j]["family"]==undefined?"":dayResult[j]["family"],
                                max = dayResult[j]["dmax"]==undefined?"":dayResult[j]["dmax"],
                                min = dayResult[j]["dmin"]==undefined?"":dayResult[j]["dmin"],
                                unit = dayResult[j]["unit"]==undefined?"":dayResult[j]["unit"],
                                higher = dayResult[j]["higher"]==undefined?"":dayResult[j]["higher"],
                                lower = dayResult[j]["lower"]==undefined?"":dayResult[j]["lower"],
                                time = dayResult[j]["time"]==undefined?"":dayResult[j]["time"],
                                devId = dayResult[j]["devId"]==undefined?"":dayResult[j]["devId"],
                                state = "",date = "";
                            if(higher == "yes"){
                                state = "超上限";
                            }else if(lower == "yes"){
                                state = "超下限";
                            }else{
                                state = "正常";
                            }
                            date = dataFormate(time*1000,"yyyy/MM/dd HH:mm:ss");
                            length++;
                            var historyAlarmObj = new Object();
                            historyAlarmObj.str = dataJsonStr;
                            historyAlarmObj.family = family;
                            historyAlarmObj.value = value;
                            historyAlarmObj.min = min;
                            historyAlarmObj.max = max;
                            historyAlarmObj.unit = unit;
                            historyAlarmObj.date = date;
                            historyAlarmObj.factoryname = factoryname;
                            historyAlarmObj.state = state;
                            historyAlarmObj.devId = devId;
                            historyAlarmArray.push(historyAlarmObj);
                            addIndicatorListTable(length,dataJsonStr,family,value,min,max,unit,date,factoryname,state);
                        }
                    }
                }
            }
            if(length != 0){
                $("#showNoData").css("display","none");
                sorter.init("alarmHistoryTable",1);//表分页
            }
        }else{
            $("#showNoData").css("display","block");
        }
    }
    //给表添加指标列表
    function addIndicatorListTable(length,indicatorJsonStr,family,value,min,max,unit,time,factoryname,state) {
        var detailId = "detail"+length;
        var valueTd = "<td>"+value+"</td>",
            stateTd = "<td>"+state+"</td>",
            detailTd = "<td><a href='../environmental/indicatorDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>";
        if(state == "超下限" || state == "超上限"){
            stateTd = "<td style='color: red; font-weight: 800;'>"+state+"</td>" ;
        }
        if(state == "无状态"){
            stateTd = "<td style='color: #eabc14;font-weight: 800;'>"+state+"</td>" ;
        }
        $("#alarmHistoryTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+indicatorJsonStr+"</td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+factoryname+"</td>" +
            "<td>"+family+"</td>" +
            valueTd +
            "<td>"+min+"-"+max+"</td>" +
            "<td>"+unit+"</td>" +
            "<td>"+time+"</td>" +
            stateTd +
            detailTd+
            "</tr>");
        $(document).on("click","#"+detailId,function(){
            var indicatorJsonStr = $(this).parent().parent().children("td").eq(0).text();
            var alarmObj = new Object();
            alarmObj.startTime = startTime;
            alarmObj.endTime = endTime;
            setCookie("indicatordata",indicatorJsonStr);
            setCookie("alarmInfo",JSON.stringify(alarmObj));
        });
    }

    function realAlarmInfo(overList){
        var alarmInfo = "",count = 0,state = "";
        $("#realAlarmList").html("");
        for(var i in overList){
            var factoryId = i,
                indicatorInfoList = JSON.parse(overList[i]);
            //统计指标值
            for(var k in indicatorInfoList){
                var indicatorInfo = JSON.parse(indicatorInfoList[k]);
                var family = indicatorInfo.family,
                    value = indicatorInfo.value,
                    time = indicatorInfo.firstT;
                if(value == undefined){
                    var values = indicatorInfo.values;
                    for(var v in values){
                        value = Number(values[v]["avg"]);
                    }
                }
                var minValue = indicatorInfo.min == undefined?0:indicatorInfo.min,
                maxValue = indicatorInfo.max == undefined?0:indicatorInfo.max,
                devId = indicatorInfo.devId == undefined?0:indicatorInfo.devId,
                unit = indicatorInfo.unit == undefined?0:indicatorInfo.unit;
                count++;
                if(value > maxValue){
                    state = "超上限";
                }else if(value < minValue){
                    state = "超下限";
                }
                alarmInfo +="<div>"+count+"、设备："+devId+"上的指标："+family+state+"!</div>";
            }
        }
        alarmInfo +="<div>1、设备：2015089880000上的指标：O2超上限!</div>";
        $("#realAlarmList").html(alarmInfo);
    }
    /**
     * 模糊查询
     * @param content
     */
    function fuzzyQuery(content){
        var realClass = $("#realtime").attr("class"),
            historyClass = $("#history").attr("class"),
            warmClass = $("#historyWarm").attr("class");
        //判断当前那个tab页被选中
        if(realClass == "selected" && realDataArray!= null){
            $("#realTimeTable tbody").empty();
            $("#realTimeTable tbody").html("");
            for(var i in realDataArray){
                var dataObj = realDataArray[i],
                    factoryStr = dataObj.str,
                    factoryName = dataObj.factoryName,
                    value = dataObj.value,
                    range = dataObj.range,
                    unit = dataObj.unit,
                    devId = dataObj.devId;
                if(!(new RegExp(content).test(devId))&&!(new RegExp(content).test(factoryName))){
                    continue;
                }else {
                    addTable("realTimeTable", factoryStr, (++i), factoryName, value, range, unit, devId);
                }
            }
        }else if(historyClass == "selected" && historyDataArray!= null){
            $("#historyTable tbody").empty();
            $("#historyTable tbody").html("");
            for(var i in historyDataArray){
                var dataObj = realDataArray[i],
                    factoryStr = dataObj.str,
                    factoryName = dataObj.factoryName,
                    value = dataObj.value,
                    range = dataObj.range,
                    unit = dataObj.unit,
                    devId = dataObj.devId;
                if(!(new RegExp(content).test(devId))&&!(new RegExp(content).test(factoryName))){
                    continue;
                }else {
                    addTable("realTimeTable", factoryStr, (++i), factoryName, value, range, unit, devId);
                }
            }
        }else if(warmClass == "selected" && historyAlarmArray!= null){
            $("#alarmHistoryTable tbody").empty();
            $("#alarmHistoryTable tbody").html("");
            for(var i in historyAlarmArray){
                var historyAlarmObj = historyAlarmArray[i],
                    dataJsonStr = historyAlarmObj.str,
                    family = historyAlarmObj.family,
                    value = historyAlarmObj.value,
                    min = historyAlarmObj.min,
                    max = historyAlarmObj.max,
                    unit = historyAlarmObj.unit,
                    date = historyAlarmObj.date,
                    factoryname = historyAlarmObj.factoryname,
                    devId = historyAlarmObj.devId,
                    state = historyAlarmObj.state;
                if(!(new RegExp(content).test(devId))&&!(new RegExp(content).test(factoryname))){
                    continue;
                }else{
                    addIndicatorListTable((++i),dataJsonStr,family,value,min,max,unit,date,factoryname,state);
                }
            }
        }
    }
    /**
     * 指标对比赋值
     */
    function initIndicatorCompare(){
        var content = "",seriesArray = new Array(),item = new Object(),pointArray= new Array();
        var sortArray = siteCompareValue.sort(function(a, b){
            return b[1] - a[1];
        });
        for(var l in sortArray){
            var siteValue = sortArray[l],
                count = l,
                width = Number((siteValue[1]/sortArray[0][1]).toFixed(3))*100,
                compareClass = "compareNum",
                processClass = "green";
            count++;
            if(count < 4){
                compareClass = "compareNum top3";
                processClass = "red";
            }
            content +="<div style='margin: 0px 0px 5px 0px;'><span class='"+compareClass+"'>"+count+"</span>"+siteValue[0]+"浓度值:<br/><div class='progress'> " +
                "<span class='"+processClass+"' style='width: "+width+"%;'><span>"+siteValue[1]+"</span></span></div></div>";
            var  point= new Object();
            point.name = siteValue[0];
            point.y = siteValue[1];
            pointArray.push(point);
        }
        item.colorByPoint = true;
        item.data = pointArray;
        seriesArray.push(item);
        initHistoryChart("",seriesArray,"");
    }
    //初始化历史图
    function initHistoryChart(type,seriesArray,rangPointArray){
        var options ={
            chart: {
                renderTo: 'dataMonitorContainer',
                type: "column"
            },
            title: {
                useHTML: true,
                text: family +"站点对比图"
            },
            xAxis: {
                type: 'category',
                //crosshair: true,
                endOnTick:true,
                labels: {
                    //rotation: 95,
                    //align: 'left'
                }
            },
            yAxis: {
                //min: 0,
                title: {
                    text: ''
                },
                plotLines: []
            },
            legend: {
                enabled: false
            },
            tooltip: {
                crosshairs: [true,true],
                shared: true,
                useHTML: true,
                headerFormat: '<span style="font-size:11px"></span>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}</b><br/>'
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.2f}'
                    }
                }
            },
            series: seriesArray
        };
        var chart = new Highcharts.Chart(options);
    }
    /**设置开始日期格式
     * @param isTime 是否显示时分秒
     * @param format 显示日期的格式
     * @returns {{elem: string, istime: *, isclear: boolean, istoday: boolean, format: *, issure: boolean, start: *, max: *, choose: Function}}
     */
    function setStartLayDate(elemId,isTime ,format){
        var startTimeLayDate = {
            elem: elemId,
            istime: isTime,
            isclear:false,
            istoday:false,
            format: format,
            issure:false, //是否显示确认
            start:laydate.now(0),//设置起始日期
            max: laydate.now(0), //最大日期
            choose: function(datas){ //选择日期完毕的回调
                startTime = datas;
                alarmStartTime = datas;
            }
        };
        return startTimeLayDate;
    }

    /**设置结束日期格式
     * @param min 日期的最小值
     * @returns {{elem: string, istime: boolean, isclear: boolean, istoday: boolean, format: string, issure: boolean, start: *, min: *, max: *, choose: Function}}
     */
    function setEndLayDate(elemId,min){
        var endTimeLayDate = {
            elem: elemId,
            istime: true,
            isclear:false,
            istoday:false,
            format: 'YYYY/MM/DD',
            issure:false, //是否显示确认
            start:laydate.now(0),//设置起始日期
            min:min,
            max: laydate.now(0), //最大日期
            choose: function(datas){ //选择日期完毕的回调
                endTime = datas;
                alarmEndTime = datas;
                if(elemId == "#endhour"){
                    fillDataToTable("historyTable");
                }else{
                    alarmTabInfo("historyWarm",family);
                }
            }
        };
        return endTimeLayDate;
    }
});

/**分页设置
 * @param tableId 表id
 * @param currentPageId  当前页id
 * @param pageListId 总页数id
 */
function sortOp(tableId,currentPageId,pageListId){
    sorter.head = "head";
    sorter.asc = "asc";
    sorter.desc = "desc";
    sorter.even = "evenrow";
    sorter.odd = "oddrow";
    sorter.evensel = "evenselected";
    sorter.oddsel = "oddselected";
    sorter.paginate = true;
    sorter.currentid = currentPageId;
    sorter.limitid = pageListId;
    sorter.init(tableId,2);
    sorter.size(10);
}

var sorter = new TINY.table.sorter("sorter");