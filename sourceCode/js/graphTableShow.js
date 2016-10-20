$(function () {
    $("#searchType").change(function () {
        $("#searchByName").val("");
    });
    $("#searchpng").click(function(){
        var type = $("#searchType option:selected").val();
        var content = $("#searchByName").val();
        $("#indicatorTable tbody").empty();
        $("#indicatorTable tbody").html("");
        for(var i in tableListArray){
            var tableListObj = tableListArray[i];
            var factoryStr = tableListObj.str,
                factoryName = tableListObj.factorName,
                runState = tableListObj.runState,
                dutyOfficer = tableListObj.dutyOfficer,
                indicatorListTd = tableListObj.indicatorListTd,
                alarmInfo = tableListObj.alarmInfo;
            if(content == ""){
                addTable(factoryStr,(++i),factoryName,runState,dutyOfficer,indicatorListTd,alarmInfo);
            }else if(new RegExp(content).test(factoryName)){
                addTable(factoryStr,(++i),factoryName,runState,dutyOfficer,indicatorListTd,alarmInfo);
            }
        }
        sorter.init("indicatorTable",1);
    });
    $("#starthour").click(function(){
        var enrollmentType = $("#enrollmentType option:selected").val();
        laydate(setStartLayDate(true,"YYYY/MM/DD hh:mm:ss"));
        addLaydateListener();
    });
    //$("#endhour").click(function(){
    //    laydate(setEndLayDate(startTime));
    //});
    var startTime = dataFormate((new Date()).getTime()-24*60*60*1000,"yyyy/MM/dd HH:mm:ss"),
        endTime = dataFormate((new Date()).getTime(),"yyyy/MM/dd HH:mm:ss");
    //$("#starthour").val(startTime);

    var familyArray = new Array(),tableListArray = new Array();
    dynamicallyAddTableHead();//添加表头
    fillDataToGraphTable(true);
    //服务器获取数据
    function fillDataToGraphTable(isNow){
        var filter = new Object();
        //filter.include="family|devId|factory|lvalue|dvalue|svalue|lower|higher|location|values|uid|name";
        var page_object = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        //other_object.filter = filter;
        var datanowresponse = null,findBy = new Object();
        var startDate = $("#starthour").val();
        if(!isNow || startDate!= ""){
            var start = new Date(startDate);
            var time = new Object();
            time.scale = "day";
            time.start = start.getTime();
            time.end = start.getTime() + 24*60*60*1000-1;
            findBy.time = time;
            findBy.all = "yes";
            datanowresponse = JSON.parse(datahistory(findBy,page_object,other_object));
        }else{
            datanowresponse = JSON.parse(datanow(findBy,page_object,other_object));
        }
        if(datanowresponse.errCode == "success") {
            var poluList = null;
            if (datanowresponse.poluList == undefined) {
                poluList = datanowresponse.resultList;
                getDataHistory(poluList);
            } else {
                poluList = datanowresponse.poluList;
                getDataNow(poluList);
            }
        }
    }
    // 获取当前数据，并分析警告次数
    function getDataNow(poluList){
        var factoryObject = new Object(),
            overStand = new Object()                         //工厂超标统计
            ;
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
            //}
        }
        analysisData(factoryObject,overStand)
    }
    //获取历史数据，并分享警告次数
    function getDataHistory(poluList){
        var factoryObject = new Object(),
            overStand = new Object()                         //工厂超标统计
            ;
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
        analysisData(factoryObject,overStand);
    }

    //分析数据并将数据显示在界面上
    function analysisData(factoryObject,overStand){
        $("#indicatorTable tbody").empty();
        $("#indicatorTable tbody").html("");
        tableListArray.length = 0;
        var trNum = 0;
        //循环工厂信息
        for(var j in factoryObject){
            var factoryId = j,
                indicatorInfoList = factoryObject[j], //指标数组
                countFamily = new Object(),                       //统计相同指标的个数
                totalValue = new Object(),                        //统计相同指标的和
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
                if(countFamily[family] == undefined){
                    countFamily[family] = 0;
                    totalValue[family] = 0;
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
                        runState = "暂未存",
                        dutyOfficer = "暂未存",
                        indicatorListTd = "",
                        alarmInfo = "";
                    for(var l in familyArray){
                        var family = familyArray[l];
                        if(totalValue[family] == undefined){
                            indicatorListTd += "<td></td>";
                        }else{
                            var avg = totalValue[family]/countFamily[family];
                            indicatorListTd +="<td>"+ avg.toFixed(3)+"</td>";
                        }
                    }
                    if(overStand[factory["id"]] != undefined){
                        for(var f in overStand[factory["id"]]){
                            var overFamily = JSON.parse(overStand[factory["id"]][f]);
                            var devId = overFamily.devId,
                                overfamily = overFamily.family,
                                day = overFamily.day == undefined?overFamily.firstT:overFamily.day;

                            alarmInfo +="<div style='color: red;font-size: 1px'>"+day+"设备："+devId+"上"
                                +"<a href='#' class='tablelink'>"+overfamily
                                +"超标</a>;</div>";
                        }
                    }
                    trNum++;
                    var tableListObj = new Object();
                    tableListObj.str = factoryStr;
                    tableListObj.factorName = factoryName;
                    tableListObj.runState = runState;
                    tableListObj.dutyOfficer = dutyOfficer;
                    tableListObj.indicatorListTd = indicatorListTd;
                    tableListObj.alarmInfo = alarmInfo;
                    tableListArray.push(tableListObj);
                    addTable(factoryStr,trNum,factoryName,runState,dutyOfficer,indicatorListTd,alarmInfo);
                }
            }
        }
        //表分页
        sorter.init("indicatorTable",1);
    }
    //添加每一行数据
    function addTable(factoryStr,length,factoryName,runState,dutyOfficer,indicatorList,alarmInfo){
        var detailId = "detail"+length;
        $("#indicatorTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+factoryStr+"</td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+factoryName+"</td>" +
            "<td>"+runState+"</td>" +
            "<td>"+dutyOfficer+"</td>" +
            indicatorList +
           "<td>"+ alarmInfo+"</td>"+
            "<td><a href='siteDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>"+
            "</tr>");
        $(document).on("click","#"+detailId, function () {
            var factoryObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var startDate = $("#starthour").val(),
                siteObject = new Object();
            siteObject.name = factoryObject["name"];
            siteObject.id = factoryObject["id"];
            //当起始时间不为空时说明当前查找的是历史数据
            if(startDate!= ""){
                var startdate = new Date(startDate);
                var endDate = startdate.getTime() - (24*60*60*1000);
                siteObject.startTime = dataFormate(endDate, "yyyy/MM/dd HH:mm:ss");
                siteObject.endTime = startDate;
            }
            setCookie("siteDetail",JSON.stringify(siteObject));
            //var alarmObj = new Object();
            //alarmObj.startTime = startTime;
            //alarmObj.endTime = endTime;
            //setCookie("alarmInfo",JSON.stringify(alarmObj));
            //setCookie("deviceAlarmCurrentPage",$("#currentpage").text());
        });
    }

    /**
     * 动态添加表数据
     */
    function dynamicallyAddTableHead(){
        var responseObj = JSON.parse(polusourcedistkey("family"));
        if(responseObj.errCode == "success" && responseObj.total !=0){
            var familyList = responseObj.resultList;
            for(var j in familyList){
                var family = familyList[j]["family"];
                familyArray.push(family);
                $("#indicatorTable thead th:eq(5)").after("<th><h3>"+family+"</h3></th>");
            }
            familyArray.reverse();
        }
    }

    /**设置开始日期格式
     * @param isTime 是否显示时分秒
     * @param format 显示日期的格式
     * @returns {{elem: string, istime: *, isclear: boolean, istoday: boolean, format: *, issure: boolean, start: *, max: *, choose: Function}}
     */
    function setStartLayDate(isTime ,format){
        var startTimeLayDate = {
            elem: '#starthour',
            istime: isTime,
            isclear:false,
            istoday:false,
            format: format,
            issure:false, //是否显示确认
            start:laydate.now(0),//设置起始日期
            max: laydate.now(0), //最大日期
            choose: function(datas){ //选择日期完毕的回调
                startTime = datas;
                fillDataToGraphTable();
            }
        };
        return startTimeLayDate;
    }

    /**设置结束日期格式
     * @param min 日期的最小值
     * @returns {{elem: string, istime: boolean, isclear: boolean, istoday: boolean, format: string, issure: boolean, start: *, min: *, max: *, choose: Function}}
     */
    //function setEndLayDate(min){
    //    var endTimeLayDate = {
    //        elem: '#endhour',
    //        istime: true,
    //        isclear:false,
    //        istoday:false,
    //        format: 'YYYY/MM/DD hh:mm:ss',
    //        issure:false, //是否显示确认
    //        start:laydate.now(0),//设置起始日期
    //        min:min,
    //        max: laydate.now(0), //最大日期
    //        choose: function(datas){ //选择日期完毕的回调
    //            endTime = datas;
    //            fillDataToGraphTable();
    //        }
    //    };
    //    return endTimeLayDate;
    //}
});