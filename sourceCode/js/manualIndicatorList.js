$(function () {
    //初始化窗口变量
    var tipdialog, //提示信息对话框
        selectTime, // 当前选择的时间
        updateDataDialog,//修改数据对话框
        manualObject, //数据库返回手动添加数据对象
        factorySelected = getCookie("indicatorFactory");
    updateDataDialog = $("#update-data").dialog({
        autoOpen: false,
        height: 280,
        width: 480,
        modal: true,
        buttons: [{
            text: "确定",
            click: function () {
                var response = updateDataToDatabase();
                if(response != false){
                    updateDataDialog.dialog("close");
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                updateDataDialog.dialog("close");
            },
            class: "cancel",
        }],
        close: function () {
            recoveryUI();
        }
    });

    tipdialog = $("#tip").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text: "确定",
            click: function (_button) {
                tipdialog.dialog("close");
                //只有删除操作才处理
                var del = $(this).dialog("option","_button");
                if(del != null){
                    if(del == "del"){
                        $("input[type=checkbox][name=checkbox]:checked").each(function () {
                            var attrId = $(this).attr("id");
                            if(attrId == "checkAll"){
                                return true;
                            }
                            var manualData = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                            var param = new Object();
                            param.id = manualData.id;
                            if(manualData.value != undefined){
                                param.which = "now";
                            }else{
                                param.which = "hist";
                                var time = new Object();
                                time.scale = "all";
                                time.start = manualData.time;
                                time.end = manualData.time;
                                param.time = time;
                            }
                            var response  = JSON.parse(manvdelete(param));
                            if(response.errCode == "success"){
                                $(this).parent().parent().remove();
                            }else{
                                alert("删除指标数据"+manualData.family+"失败！");
                            }
                        });
                    }else{
                        var manualData = JSON.parse(del.parent().parent().children("td").eq(0).text());
                        var param = new Object();
                        param.id = manualData.id;
                        if(manualData.value != undefined){
                            param.which = "now";
                        }else{
                            param.which = "hist";
                            var time = new Object();
                            time.scale = "all";
                            time.start = manualData.time;
                            time.end = manualData.time;
                            param.time = time;
                        }
                        var response  = JSON.parse(manvdelete(param));
                        if(response.errCode == "success"){
                            del.parent().parent().remove();
                        }else{
                            alert("删除指标数据"+manualData.family+"失败！");
                        }
                    }
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                tipdialog.dialog("close");
            },
            class: "cancel",
        }]
    });
    $("#starthour").click(function(){
        laydate(setLaydate("starthour",false,laydate.now(0),laydate.now(0),"YYYY/MM/DD"));
    });
    $("#checkAll").click(function () {
        if ($(this).is(':checked')) {
            $("input[name=checkbox][type=checkbox]").each(function () {
                $(this).prop("checked", true);
            });
        } else {
            $("input[type=checkbox][name=checkbox]").each(function () {
                $(this).prop("checked", false);
            });
        }
    });
    $(".update").click(function () {
        tipdialog.dialog("option","title","修改提示信息");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 1){
            $("#tip .tipright p").html(" 请选择一条且只需要选择一条数据进行修改操作！");
            tipdialog.dialog("open");
        }else {
            var object = $("input[type=checkbox][name=checkbox]:checked");
            updateIndicatorUI(object);
            updateDataDialog.dialog("open");
        }
        //var parm = new Object(),sort = new Object(),page = new Object(),find = new Object();
        //sort.asc = "time";
        //page.max = 50;
        //page.min = 0;
        //parm.sort = sort;
        //parm.page = page;
        //parm.find = find;
        //manvListNow(parm);
    });
    $(".del").click(function () {
        tipdialog.dialog("option","title","删除提示信息");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length == 0){
            $("#tip .tipright p").html(" 请选择一条或多数据进行删除操作！");
        }else {
            $("#tip .tipright p").html("确定要删除这些数据！");
            tipdialog.dialog("option","_button","del");
        }
        tipdialog.dialog("open");
    });
    //del a data
    $(document).on("click",".delManual",function () {
        tipdialog.dialog("option","title","删除提示信息");
        $("#tip .tipright p").html("确定删除数据信息！！");
        tipdialog.dialog("option","_button",$(this));
        tipdialog.dialog("open");
    });
    //search
    $("#searchpng").click(function(){
        var startTime = $("#timeList option:selected").val();
        if(startTime == null){
            alert("当前时间没有添加数据记录！");
            return;
        }
        $(".orgTable tbody").empty();
        $(".orgTable tbody").html("");
        var page_object = new Object(),findBy = new Object(),other_object = new Object(),time = new Object(),sort = new Object();
        page_object.max="50";
        page_object.start="0";
        findBy.factory = factory;

        time.scale = "all";
        time.start = startTime;
        time.end = startTime;
        findBy.time = time;

        sort.asc = "time";
        other_object.sort = sort;
        var historyDataObj = JSON.parse(manvListhist(findBy,page_object,other_object));
        if(historyDataObj.errCode == "success"){
            var resultList = historyDataObj.resultList;
            var temp=/^-?\d+(\.\d+)?$/,length = 0;
            //获取所有结果数据
            for(var i in resultList) {
                //for (var j in resultList[i]) {
                    var dayResult = resultList[i]["dayResult"];
                //        day = resultList[i]["day"] == undefined ? "" : resultList[i]["day"],
                //        substrTime = day.substring(0,4)+"/"+day.substring(4,6)+"/"+day.substring(6,8);
                    for (var k in dayResult) {
                        var unit = dayResult[k]["unit"],
                            family = dayResult[k]["family"] == undefined ? "" : dayResult[k]["family"],
                            dvalue = dayResult[k]["dvalue"] == undefined ? "" : dayResult[k]["dvalue"],
                            dmin = dayResult[k]["dmin"] == undefined ? 0 : dayResult[k]["dmin"],
                            dmax = dayResult[k]["dmax"] == undefined ? 0 : dayResult[k]["dmax"],
                            time = dayResult[k]["time"] == undefined ? "" : dayResult[k]["time"];
                        length = (Number(k)+1);
                        var chartId = "chart"+ length;
                        $(".orgTable tbody").append("<tr id='org_" + length + "'>" +
                            "<td style='display: none'>" + JSON.stringify(dayResult[k]) + "</td>" +//id
                            "<td><input name='checkbox' class='nosort' type='checkbox' id='checkbox_" + length + "'/></td>" +
                            "<td>" + length + "</td>" +
                            "<td>" + family + "</td>" +//name
                            "<td>" + dvalue + "</td>" +
                            "<td>"+dmin+"-"+dmax+"</td>" +
                            "<td>" + unit + "</td>" +
                            "<td>" + format(time, 'yyyy/MM/dd HH:mm:ss') + "</td>" +//location
                            "<td><a href='../environmental/manualIndicatorDetail.html' target='rightFrame' class='tablelink' id='"+chartId+"'> 查看历史图</a>" +
                            "<a href='#' class='delManual tablelink'> 删除</a></td>" +
                            "</tr>");
                        $(document).on("click","#"+chartId,function(){
                            var maunalJsonStr = $(this).parent().parent().children("td").eq(0).text();
                            setCookie("manualIndicator",maunalJsonStr);
                            setCookie("currentPage","1");
                        });
                            //values = dayResult[k]["values"] == undefined ? "" : dayResult[k]["values"];
                        //for (var h in values) {
                        //    var value = values[h]["avg"] == undefined ? "" : values[h]["avg"],
                        //        time = values[h]["time"] == undefined ? "" : values[h]["time"];
                        //    var date = new Date(substrTime+" "+ time);
                        //
                        //    if(selectTime.getHours() == date.getHours()){
                        //        length++;
                        //
                        //        break;
                        //    }else{
                        //        firstTime = date;
                        //    }
                        //}
                    }
                //}
            }
            sorter.init("orgTable",2);
            //$("#starthour").val("");
            selectTime = null;
        }
    });
    var format = function(time, format){
        var t = new Date(time);
        var tf = function(i){return (i < 10 ? '0' : '') + i};
        return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
            switch(a){
                case 'yyyy':
                    return tf(t.getFullYear());
                    break;
                case 'MM':
                    return tf(t.getMonth() + 1);
                    break;
                case 'mm':
                    return tf(t.getMinutes());
                    break;
                case 'dd':
                    return tf(t.getDate());
                    break;
                case 'HH':
                    return tf(t.getHours());
                    break;
                case 'ss':
                    return tf(t.getSeconds());
                    break;
            }
        })
    }
    var runTimeObject = new Object(),O2Object = new Object(), COObject = new Object(),CO2Object = new Object(),
        NOObject = new Object(), NO2Object = new Object(),yanwenObject = new Object(),NOxObject = new Object(),SO2Object = new Object(),
        jingxiaolvObject = new Object(),maoxiaolvObject = new Object(),huanwenObject = new Object(),bengliuliangObject = new Object(),
        xishibeishuObject = new Object();
    runTimeObject["runTime"] = "运行时间";O2Object["O2"] = "O2";COObject["CO"]="CO";CO2Object["CO2"] ="CO2";
    NOObject["NO"]="NO"; NO2Object["NO2"]="NO2";yanwenObject["yanwen"]="烟温";NOxObject["NOx"]="NOx";SO2Object["SO2"]="SO2";
    jingxiaolvObject["jingxiaolv"]="净效率";maoxiaolvObject["maoxiaolv"]="毛效率";huanwenObject["huanwen"]="环温";
    bengliuliangObject["bengliuliang"]="泵流量";xishibeishuObject["xishibeishu"]="稀释倍数";

    runTimeObject["runTimeUnit"] = "ms";O2Object["O2Unit"] = "%25";COObject["COUnit"]="ppm";CO2Object["CO2Unit"] ="%25";
    NOObject["NOUnit"]="ppm"; NO2Object["NO2Unit"]="ppm";yanwenObject["yanwenUnit"]="℃";NOxObject["NOxUnit"]="ppm";SO2Object["SO2Unit"]="ppm";
    jingxiaolvObject["jingxiaolvUnit"]="%25";maoxiaolvObject["maoxiaolvUnit"]="%25";huanwenObject["huanwenUnit"]="℃";
    bengliuliangObject["bengliuliangUnit"]="l/min";xishibeishuObject["xishibeishuUnit"]="倍";
    var familyArray = [runTimeObject,O2Object, COObject,CO2Object,NOObject, NO2Object,yanwenObject,NOxObject,SO2Object,
        jingxiaolvObject,huanwenObject,maoxiaolvObject,bengliuliangObject,xishibeishuObject];

    if(factorySelected != null){
        var other = new Object(),sort = new Object(),page = new Object(),find = new Object(),
            factory = new Object(),factorySelectedObject = JSON.parse(factorySelected);
        sort.asc = "time";
        page.max = 50;
        page.start = 0;
        factory.name = factorySelectedObject.name;
        factory.uId = factorySelectedObject.id;
        find.factory = factory;
        other.sort = sort;
        var responseObject  = JSON.parse(manvListNow(find,page,other));
        fillRow(responseObject);
    }
    //手动添加数据录入到数据库
    function updateDataToDatabase(){
        var attrId = $("#updateManualData li:first input").attr("id");
        for(var i in familyArray){
            var familyAttrObj = familyArray[i];
            for(var j in familyAttrObj){
                if(attrId == j){
                    var value = $("#"+attrId).val().trim(),
                        indicator = new Object(),
                        items = new Array(),
                        re = /^[0-9]+.?[0-9]*$/;   //判断字符串是否为数字;
                    if(value != "" && !re.test(value)){
                        $(".confirmMsg").html(familyAttrObj[j]+"只能输入数字！");
                        return false ;
                    }else if(value != ""){
                        indicator.family = familyAttrObj[j];
                        indicator.unit = familyAttrObj[attrId+"Unit"];
                        indicator.value = Number(value);
                        indicator.vtype = "Double";
                        items.push(indicator);

                        var maunalObject = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
                        var updateParm = new Object();
                        updateParm.id = maunalObject.uid ==undefined?maunalObject.id:maunalObject.uid;
                        updateParm.time = selectTime.getTime();
                        updateParm.value = Number(value);
                        updateParm.vtype = "Double";
                        //updateParm.items = items;
                        var createResponse = JSON.parse(manvUpdate(updateParm));
                        if(createResponse.errCode != "success"){
                            alert("修改失败!");
                        }else{
                            maunalObject.items = items;
                            $("input[type=checkbox][name=checkbox]:checked").each(function(){
                                var id = $(this).parent().parent().attr("id");
                                $("tr[id='"+id+"']").children("td").eq(0).text(JSON.stringify(maunalObject));
                                $("tr[id='"+id+"']").children("td").eq(3).text(familyAttrObj[j]);
                                $("tr[id='"+id+"']").children("td").eq(4).text(value);
                            });
                        }
                    }
                }
            }

        }
    }
    //填充表数据
    function fillRow(responsedata) {
        //清空表数据
        $(".orgTable tbody").empty();
        $(".orgTable tbody").html("");
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            manualObject = responsedata.poluList;
            for (var i = 0; i < manualObject.length; i++) {
                var id = manualObject[i]["id"],
                    unit = manualObject[i]["unit"] == undefined?"":manualObject[i]["unit"],
                    time = manualObject[i]["time"]== undefined?"":manualObject[i]["time"],
                    family = manualObject[i]["family"]== undefined?"":manualObject[i]["family"],
                    value = manualObject[i]["value"]== undefined?"":manualObject[i]["value"],
                    min = manualObject[i]["min"]== undefined?0:manualObject[i]["min"],
                    max = manualObject[i]["max"]== undefined?0:manualObject[i]["max"],
                    vtype = manualObject[i]["vtype"]== undefined?"":manualObject[i]["vtype"];
                var chartId = "chart"+(i+1);
                $(".orgTable tbody").append("<tr id='org_" + (i + 1) + "'>" +
                    "<td style='display: none'>" + JSON.stringify(manualObject[i]) + "</td>" +//id
                    "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_" + (i + 1) + "'/></td>" +
                    "<td style='width: 6%'>" + (i + 1) + "</td>" +
                    "<td>" + family + "</td>" +//name
                    "<td>" + value + "</td>" +
                    "<td>"+min+"-"+max+"</td>" +
                    "<td>" + unit + "</td>" +
                    "<td>" + format(time*1000, 'yyyy/MM/dd HH:mm:ss') + "</td>" +//location
                    "<td><a href='../environmental/manualIndicatorDetail.html' target='rightFrame' class='tablelink' id='"+chartId+"'> 查看历史图</a>" +
                    "<a href='#' class='delManual tablelink'> 删除</a></td>" +
                    "</tr>");
                $(document).on("click","#"+chartId,function(){
                    var maunalJsonStr = $(this).parent().parent().children("td").eq(0).text();
                    setCookie("manualIndicator",maunalJsonStr);
                    setCookie("currentPage",1);
                });
            }
            sorter.init("orgTable",2);

        }
    }
    //更新界面
    function updateIndicatorUI(obj){
        obj.each(function(){
            var manualObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                var id = manualObject.id,
                    unit = manualObject.unit,
                    time = manualObject.time,
                    family = manualObject.family ,
                    value = manualObject.value == undefined ?(manualObject.dvalue==undefined?"":manualObject.dvalue):manualObject.value,
                    vtype = manualObject.vtype;
            for(var i in familyArray){
                var familyAttrObj = familyArray[i];
                for(var j in familyAttrObj){
                    if (family == familyAttrObj[j]) setFamilyValue(j,family,value,time);
                }
            }
        });
    }
    //设置修改界面值
    function setFamilyValue(id,family,value,time){
        $("#updateManualData li:first").html("<label>"+family+"</label>"+
            "<input type='text' class='dfinput' placeholder='"+family+"' value = '"+value+"'id='"+id+"'/>");
        var timeStr = format(time,"yyyy/MM/dd HH:mm:ss");
        selectTime = new Date(time);
        $("#recordTime").click(function(){
            laydate(setLaydate("recordTime",true,timeStr,laydate.now(0),"YYYY/MM/DD hh:mm:ss"));
        });
        $("#recordTime").val(timeStr);
        $("#recordTime").css("display","none");
    }
    //设置日期时间
    //start:laydate.now(0)/2099-06-16 23:59:59
    function setLaydate(id,istime,start,max,format){
        var recordTimeoption = {
            elem: '#'+id,
            istime: istime,
            isclear:false,
            istoday:false,
            format: format,
            issure:false, //是否显示确认
            start:start,//设置起始日期
            //min: laydate.now(), //设定最小日期为当前日期
            max: max, //最大日期
            choose: function(datas){ //选择日期完毕的回调
                selectTime = new Date(datas);
                $("#timeList").empty();
                if(!istime){
                    $("#timeList").css("display","inline");
                    var page_object = new Object(),findBy = new Object(),other_object = new Object();
                    page_object.max="50";
                    page_object.start="0";
                    findBy.factory = factory;

                    var time = new Object();
                    time.scale = "all";
                    time.start = selectTime.getTime();
                    time.end = selectTime.getTime()+ 24*60*60*1000-1;
                    findBy.time = time;
                    findBy.distKey = "time";
                    var responseObj = JSON.parse(manvListdist(findBy,page_object,other_object));
                    if(responseObj.errCode == "success"){
                        var resultList = responseObj.resultList;
                        for(var i in resultList){
                            var dayObj = resultList[i],
                                dayResult = dayObj.dayResult;
                            dayResult = dayResult.sort(function(a,b){
                                return a-b;
                            });
                            for(var j in dayResult){
                                var date = new Date(dayResult[j]);
                                var value = (date.getHours()< 10?"0"+date.getHours():date.getHours())
                                    +":"+(date.getMinutes()< 10?"0"+date.getMinutes():date.getMinutes())
                                    +":"+(date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds());
                                $("<option value="+dayResult[j]+">"+value+"</option>").appendTo($("#timeList"));
                            }
                        }
                    }
                }
            }
        };
        return recordTimeoption;
    }
    function recoveryUI(){
        selectTime = null;
        $("#O2").val("");
        $("#CO").val("");
        $("#CO2").val("");
        $("#NO").val("");
        $("#NO2").val("");
        $("#yanwen").val("");
        $("#NOx").val("");
        $("#SO2").val("");
        $("#jingxiaolv").val("");
        $("#maoxiaolv").val("");
        $("#bengliuliang").val("");
        $("#recordTime").val("");
    }
});

