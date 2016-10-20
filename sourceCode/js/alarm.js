$(function () {
    $("#checkAll").click(function(){
        if($(this).is(':checked')){//全选
            $("input[name='checkbox']").each(function(){
                var checkbox = $(this);
                checkbox.prop('checked', true);
            });
        } else {//全不选
            $("input[name='checkbox']").each(function(){
                $(this).prop('checked', false);
            });
        }
    });
    //录入数据类型
    $("#enrollmentType").change(function(){
        indicatorlist();
        datanowParam();
    });
    //工厂列表
    $("#factoryList").change(function(){
        //indicatorlist();
        datanowParam();
    });
    $("#searchpng").click(function(){
        var factoryStr = $("#factoryList option:selected").val().trim()
        if(factoryStr == null && factoryStr == "工厂列表"){
            alert("先选择工厂信息！");
        }
        datanowParam();
    });
    //指标类型选择
    $("#indicatorselect").change(function(){
        datanowParam();
    });
    $("#starthour").click(function(){
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
    //给表填充最新数据
    function datanowParam(){
        var indicatorName = $("#indicatorselect option:selected").text().trim(),
        factoryName = $("#factoryList option:selected").val().trim(),
        enrollmentType = $("#enrollmentType option:selected").val();
        var multiFind = new Array(),page_object = new Object(),other_object = new Object(),findBy = new Object(),sort = new Object(),factoryObj;
        page_object.max="1";page_object.start="0";
        sort.asc = "time";
        var sdate = new Date(startTime),edate = new Date(endTime),time = new Object();
        time.scale = "all";time.start = sdate.getTime();time.end = edate.getTime();
        findBy.time = time;
        findBy.hilo ="higher|lower";
        //如果选择了某个工厂信息
        if(factoryName != null && factoryName != "工厂列表" && responseFactory.errCode == "success" && responseFactory.total != 0){
            var List = responseFactory.resultList;
            for (var i in List) {
                if (List[i]["factory"]["name"] == factoryName) {
                    factoryObj = List[i]["factory"];
                    break;
                }
            }
            var factory = new Object();
            factory.name = factoryObj.name;
            factory.uId = factoryObj.id;
            if(indicatorName == "All"){
                $("#indicatorselect option").each(function () {
                    var text = this.text;
                    if(text == "All"){
                        return true; //相当于continute
                    }else{
                        var multiObj = new Object(),findParam = new Object();
                        findParam.time = findBy.time;
                        findParam.family = text;
                        findParam.hilo = findBy.hilo;
                        findParam.factory = factory;
                        multiObj.find = findParam;
                        multiObj.page = page_object;
                        multiObj.sort = sort;
                        multiFind.push(multiObj);
                    }
                });
            }else{
                var multiObj = new Object();
                findBy.family = indicatorName;
                findBy.factory = factory;
                multiObj.find = findBy;
                multiObj.page = page_object;
                multiObj.sort = sort;
                multiFind.push(multiObj);
            }
        }
        //else{
        //    //如果当前没有选择工厂
        //    var param = new Object();
        //    param.type = "factory";
        //    var responseFactory = JSON.parse(listorg(param));
        //    if(responseFactory.errCode == "success" && responseFactory.total != 0){
        //        var factoryList = responseFactory.orgList;
        //        for(var i in factoryList){
        //            var factoryObj = factoryList[i];
        //            var factory = new Object();
        //            factory.name = factoryObj.name;
        //            factory.uId = factoryObj.id;
        //            if(indicatorName == "All"){
        //                $("#indicatorselect option").each(function () {
        //                    var text = this.text;
        //                    if(text == "All"){
        //                        return true; //相当于continute
        //                    }else{
        //                        var multiObj = new Object(),findParam = new Object();
        //                        findParam.time = findBy.time;
        //                        findParam.family = text;
        //                        findParam.hilo = findBy.hilo;
        //                        findParam.factory = factory;
        //                        multiObj.find = findParam;
        //                        multiObj.page = page_object;
        //                        multiObj.sort = sort;
        //                        multiFind.push(multiObj);
        //                    }
        //                });
        //            }else{
        //                var multiObj = new Object();
        //                findBy.family = indicatorName;
        //                multiObj.page = page_object;
        //                multiObj.sort = sort;
        //                findBy.factory = factory;
        //                multiObj.find = findBy;
        //                multiObj.page = page_object;
        //                multiObj.sort = sort;
        //                multiFind.push(multiObj);
        //            }
        //        }
        //    }
        //}
        var response;
        other_object.multiFind = multiFind;
        if(enrollmentType == "auto"){
            response = datahistory(findBy,page_object,other_object,true);
            fillAutoListRow(response,true);
        }else{
            response = manvListhist(findBy,page_object,other_object,true);
            fillAutoListRow(response);
        }

    }
    //给表填充自动指标数据
    function fillAutoListRow(response,isAuto) {
        //清空表数据
        $("#indicatorTable tbody").empty();
        $("#indicatorTable tbody").html("");
        var responsedata = JSON.parse(response);
        var multiResult = responsedata.multiResult,length = 0;
        for(var i in multiResult){
            if(multiResult[i]["errCode"] == "success"){
                var datas  = multiResult[i].resultList;
                //统计工厂对应的指标信息
                for(var i in datas){
                    var dayResult = datas[i]["dayResult"];
                    var day = datas[i]["day"] == undefined?"":datas[i]["day"];
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
                            state = "",date = "";
                        if(higher == "yes"){
                            state = "超上限";
                        }else if(lower == "yes"){
                            state = "超下限";
                        }else{
                            state = "正常";
                        }
                        //var values = dayResult[j]["values"] == undefined?"":dayResult[j]["values"];
                        //for(var h in values) {
                        //    value = values[h]["avg"] == undefined ? "" : Number(values[h]["avg"]).toFixed(3);
                        //    var time = values[h]["time"]==undefined?"":(values[h]["time"]);
                        //    var substrTime = day.substring(0, 4) + "/" + day.substring(4, 6) + "/" + day.substring(6, 8);
                        //    var date = substrTime + " " + time,showfamily= name==""?family:family+"/"+name;
                        //    length++;
                        //
                        if(isAuto){
                            date = dataFormate(time*1000,"yyyy/MM/dd HH:mm:ss");
                        }else{
                            date = dataFormate(time,"yyyy/MM/dd HH:mm:ss");
                        }
                        length++;
                        addIndicatorListTable(length,dataJsonStr,family,value,min,max,unit,date,factoryname,state,isAuto);
                        //}
                    }
                }
            }
        }
        if(length != 0){
            $("#showNoData").css("display","none");
            sorter.init("indicatorTable",2);//表分页
        }else{
            $("#showNoData").css("display","block");
        }
    }
    //给表添加指标列表
    function addIndicatorListTable(length,indicatorJsonStr,family,value,min,max,unit,time,factoryname,state,isAuto) {
        var detailId = "detail"+length;
        var valueTd = "<td>"+value+"</td>",
            stateTd = "<td>"+state+"</td>",
            detailTd = "<td><a href='indicatorDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>";
        if(state == "超下限" || state == "超上限"){
            stateTd = "<td style='color: red; font-weight: 800;'>"+state+"</td>" ;
        }
        if(state == "无状态"){
            stateTd = "<td style='color: #eabc14;font-weight: 800;'>"+state+"</td>" ;
        }
        if(!isAuto){
            detailTd = "<td><a href='../environmental/manualIndicatorDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>";
        }

        $("#indicatorTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+indicatorJsonStr+"</td>" +
            "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
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
            if(isAuto){
                setCookie("indicatordata",indicatorJsonStr);
            }else{
                setCookie("manualIndicator",indicatorJsonStr);
            }
            setCookie("alarmInfo",JSON.stringify(alarmObj));
        });
    }
    //给指标下来框赋值
    function indicatorlist(){
        var enrollmentType = $("#enrollmentType option:selected").val(),responseObj;
        $("#indicatorselect").empty();
        $("<option>All</option>").appendTo($("#indicatorselect"));
        if(enrollmentType == "auto"){
            //var other = new Object(),sort = new Object(),page = new Object(),find = new Object(),filter = new Object(),
            //    factory = new Object();
            //sort.asc = "time";
            //filter.include = "family";
            //page.max = 50;
            //page.start = 0;
            //find.all = "all";
            //other.sort = sort;
            //other.filter = filter;
            //var datatypeobject  = JSON.parse(datanow(find,page,other));
            //if(datatypeobject.errCode == "success"){
            //    var datalist = datatypeobject.poluList,familyArray = [];
            //    for(var i in datalist){
            //    var indicatorStr = JSON.stringify(datalist[i]),
            //        family = datalist[i]["family"] == undefined ? "" : datalist[i]["family"];
            //    //    var indicatorStr = JSON.stringify(datalist[i]);
            //    //    var name = datalist[i].name;
            //        if($.inArray(family,familyArray) == -1){
            //            familyArray.push(family);
            //            $("<option value="+indicatorStr.replace(/\s/g, "")+">"+family+"</option>").appendTo($("#indicatorselect"));
            //        }
            //
            //    }
            //}
            responseObj = JSON.parse(polusourcedistkey("family"));
        }else{
            responseObj = JSON.parse(manvdistkey("family"));

        }
        if(responseObj.errCode == "success" && responseObj.total !=0){
            var resultList = responseObj.resultList;
            for(var i in resultList){
                var obj = resultList[i];
                var family = obj.family;
                $("<option value="+family+">"+family+"</option>").appendTo($("#indicatorselect"));
            }

        }
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
                $("#timeList").empty();
                if(!isTime){
                    var page_object = new Object(),findBy = new Object(),other_object = new Object();
                    page_object.max="50";
                    page_object.start="0";
                    var factoryStr = $("#factoryList option:selected").val();
                    if(factoryStr != null && factoryStr !="工厂列表"){
                        var factoryObj = JSON.parse(factoryStr),factory = new Object(), startDate = new Date(startTime);
                        factory.name = factoryObj.name;
                        factory.Uid = factoryObj.id;
                        findBy.factory = factory;
                        var time = new Object();
                        time.scale = "all";
                        time.start = startDate.getTime();
                        time.end = startDate.getTime()+ 24*60*60*1000-1;
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
                                    $("<option value="+value+">"+value+"</option>").appendTo($("#timeList"));
                                }
                            }
                        }
                    }
                }
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
            }
        };
        return endTimeLayDate;
    }

    initLocationList();
    indicatorlist();
    var search = new Array(),locationList = Object();
    search.push("search1");
    search.push("search2");
    search.push("search3");
    search.push("factoryList");
    setup(search);
    if($("#search1 option").length >1) {
        $("#search1 option").eq(1).attr("selected", true);
        change(1, search);
    }
    if($("#search2 option").length >1) {
        $("#search2 option").eq(1).attr("selected", true);
        change(2, search);
    }
    if($("#search3 option").length >1) {
        $("#search3 option").eq(1).attr("selected", true);
        change(3, search);
    }
    if($("#factoryList option").length >1) {
        $("#factoryList option").eq(1).attr("selected",true);

    }
    datanowParam();
    var responseFactory;
    function initLocationList(){
        var factoryList=new Object();
        responseFactory = JSON.parse(polusourcedistkey("factory"));
        if(responseFactory.errCode == "success" && responseFactory.total != 0){
            var List = responseFactory.resultList;
            for(var i in List){
                var factory = List[i]["factory"]["name"] == undefined?"":List[i]["factory"]["name"];
                var province = List[i]["location"]["province"];
                var city = List[i]["location"]["city"];
                var district = List[i]["location"]["district"];
                if(factoryList[province]==undefined) {
                    factoryList[province]=new Object();
                    factoryList[province][city]=new Object();
                    factoryList[province][city][district] = new Array();
                    factoryList[province][city][district].push(factory);
                }
                else if(factoryList[province][city]==undefined) {
                    factoryList[province][city]=new Object();
                    factoryList[province][city][district] = new Array();
                    factoryList[province][city][district].push(factory);
                }
                else if(factoryList[province][city][district]==undefined) {
                    factoryList[province][city][district] = new Array();
                    factoryList[province][city][district].push(factory);
                }
                else
                    factoryList[province][city][district].push(factory);
            }

            var object = factoryList;
            var provincess=new Array();
            var province_count=0;
            for(var i in object) {
                provincess.push(i);
                var city_count=0;
                for(var j in object[i])
                {
                    var cities=new Array;
                    cities.push(j);
                    var district_count=0;
                    for(var k in object[i][j])
                    {
                        var districts=new Array();
                        districts.push(k);
                        var factories= object[i][j][k];
                        dsy.add("0_"+province_count+"_"+city_count+"_"+district_count, factories);
                        district_count++;
                    }
                    dsy.add("0_"+province_count+"_"+city_count, districts);
                    city_count++;
                }
                dsy.add("0_"+province_count, cities);
                province_count++;
            }
            dsy.add("0", provincess);
            //provinces=provincess;
            //console.log(JSON.stringify(dsy));
            //console.log(JSON.stringify(provinces));
        }
    }
    //给省列表赋值
    //function addprovinceList(){
    //    $("#search1").empty();
    //    $("<option value='省份'>省份</option>").appendTo($("#search1"));
    //    for(var j in locationList){
    //        $("<option value="+j+">"+j+"</option>").appendTo($("#search1"));
    //    }
    //    if($("#search1 option").length >1){
    //        $("#search1 option").eq(1).attr("selected",true);
    //        change(1,search);
    //        addCityList($("#search1 option").eq(1).val());
    //    }
    //}
    //添加市列表
    //function addCityList(province){
    //    $("#search2 option").each(function(){
    //        var value = $(this).val();
    //        if(value != "地级市"){
    //            var cityList = locationList[province];
    //            if($.inArray(value,cityList)< 0){
    //                $(this).remove();
    //            }
    //        }
    //    });
    //}
    $("#search1").change(function(){
        change(1,search);
    });
    $("#search2").change(function(){
        change(2,search);
    });
    $("#search3").change(function(){
        change(3,search);
    });
});