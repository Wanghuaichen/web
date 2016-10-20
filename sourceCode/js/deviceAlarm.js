$(function () {
    $("#searchType").change(function () {
        $("#searchByName").val("");
    });
    $("#searchpng").click(function(){
        var type = $("#searchType option:selected").val();
        var content = $("#searchByName").val();
        if(content != ""){
            if(type == "factoryName"){
                fillDataToTable(null,content);
            }else{
                fillDataToTable(content,null);
            }
        }
    });
    $("#starthour").click(function(){
        var enrollmentType = $("#enrollmentType option:selected").val();
        laydate(setStartLayDate(true,"YYYY/MM/DD hh:mm:ss"));
        addLaydateListener();
    });
    $("#endhour").click(function(){
        laydate(setEndLayDate(startTime));
        $("#laydate_ms span").click(function(){
            addLaydateListener();
        });
        $("#laydate_ys li").click(function(){
            addLaydateListener();
        });
        addLaydateListener();
    });
    var startTime = dataFormate((new Date()).getTime()-24*60*60*1000,"yyyy/MM/dd HH:mm:ss"),
        endTime = dataFormate((new Date()).getTime(),"yyyy/MM/dd HH:mm:ss");
    $("#starthour").val(startTime);
    $("#endhour").val(endTime);
    //indicatorlist();
    //datanowParam();
    var deviceArray;
    fillDataToTable();
    //给表填充最新数据
    function fillDataToTable(deviceId,deviceName){
        $("#indicatorTable tbody").empty();
        $("#indicatorTable tbody").html("");
        if(deviceArray != undefined &&(deviceId !=null || deviceName !=null)){
            var length = 0;
            for(var i in deviceArray){
                var deviceObj = JSON.parse(deviceArray[i]);
                if(deviceObj.lastTime != undefined){
                    var subs = deviceObj.subs;
                    for(var j in subs){
                        var pid = subs[j]["pid"];
                        var deviceType = subs[j]["type"];
                        if(deviceName != null &&(new RegExp(deviceName).test(deviceObj.name))
                            || (deviceId != null &&(new RegExp(deviceId).test(pid)))){
                            length++;
                            addTable(length,deviceArray[i],deviceObj.name,dataFormate(deviceObj.lastTime,"yyyy/MM/dd HH:mm:ss"),pid,deviceType,deviceObj.org);
                        }
                    }
                }
            }
            if(length != 0)sorter.init("indicatorTable",1);
        }else{
            var param = new Object();
            var typearray=new Array();
            var devcount=0;
            param.all = "";
            var responseObj = JSON.parse(listdevice(param));
            if(responseObj.errCode == "success" && responseObj.total != 0){
                deviceArray = new Object();
                var deviceList = responseObj.deviceList,multiFind = new Array(),timeParam = new Object(),count = 0;
                timeParam.start = (new Date(startTime)).getTime();
                timeParam.end = (new Date(endTime)).getTime();
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
                    sorter.init("indicatorTable",1);
                    if(getCookie("deviceAlarmBackCurrentPage") != null){
                        sorter.transferToPage(Number(getCookie("deviceAlarmBackCurrentPage")));
                        delCookie("deviceAlarmBackCurrentPage");
                    }
                }
            }
        }
    }
    //添加每一行数据
    function addTable(length,str,deviceName,lastTime,deviceId,deviceType,factoryName){
        var detailId = "detail"+length;
        $("#indicatorTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+str+"</td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+deviceName+"</td>" +
            "<td>"+deviceId+"</td>" +
            "<td>"+deviceType+"</td>" +
            "<td>"+dataFormate(lastTime,"yyyy/MM/dd HH:mm:ss")+"</td>" +
            "<td>"+factoryName+"</td>" +
            "<td><a href='deviceAlarmDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>"+
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
    //设置开始日期格式
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
                fillDataToTable();
            }
        };
        return startTimeLayDate;
    }
    //设置结束日期格式
    function setEndLayDate(min){
        var endTimeLayDate = {
            elem: '#endhour',
            istime: true,
            isclear:false,
            istoday:false,
            format: 'YYYY/MM/DD hh:mm:ss',
            issure:false, //是否显示确认
            start:laydate.now(0),//设置起始日期
            min:min,
            max: laydate.now(0), //最大日期
            choose: function(datas){ //选择日期完毕的回调
                endTime = datas;
                fillDataToTable();
            }
        };
        return endTimeLayDate;
    }
});