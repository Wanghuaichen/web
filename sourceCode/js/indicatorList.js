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
    var statisticalDialog = $("#statisticalDialog").dialog({
        autoOpen: false,
        height: 350,
        width: 530,
        modal: true,
        buttons: [{
            text:"关闭",
            click:function(){
                statisticalDialog.dialog("close");
            },
            class:"sure",
        }],
    });
    var tipdialog = $("#tip").dialog({
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
                            var polu = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                            var response = JSON.parse(delPolusource(polu.id));
                            if(response.errCode != "success"){
                                alert("删除 "+polu.family+"/"+polu.name+" 失败！");
                            }else {
                                $(this).parent().parent().remove();
                            }
                        });
                    }else{
                        var polu = JSON.parse(del.parent().parent().children("td").eq(0).text());
                        var response = JSON.parse(delPolusource(polu.id));
                        if(response.errCode != "success"){
                            alert("删除 "+polu.family+"/"+polu.name+" 失败！");
                        }else {
                            del.parent().parent().remove();
                        }
                    }
                }
            },
            class: "sure"
        }, {
            text: "取消",
            click: function () {
                tipdialog.dialog("close");
            },
            class: "cancel"
        }]
    });
    //查看统计报表
    $("#checkDetail").click(function () {
        statisticalDialog.dialog("open");
        totalCount = totalCount == 0?1:totalCount;
        piechart();
    });
    //del
    $(".del").click(function () {
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if (length == 0) {
            tipdialog.dialog("option","title","删除提示信息");
            $("#tip .tipright p").html("当前没有选择任何数据进行删除！");
        } else {
            tipdialog.dialog("option","title","删除提示信息");
            $("#tip .tipright p").html("确定删除数据信息！");
            tipdialog.dialog("option","_button","del");
        }
        tipdialog.dialog("open");
    });
    //del a data
    $(document).on("click",".delIndicator",function () {
        tipdialog.dialog("option","title","删除提示信息");
        $("#tip .tipright p").html("确定删除数据信息！！");
        tipdialog.dialog("option","_button",$(this));
        tipdialog.dialog("open");
    });
    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").text();
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").text();
        if(selectType == "全部"){
            parm.all="";
        }else if(selectType == "名称"){
            var appName = $("#searchByName").val().trim();
            if(appName == ""){
                alert("应用名称不能为空！");
                return false;
            }
            parm.appName = appName;
        }else if(selectType == "类型"){
            var selectByType = $("#searchByType option:selected").val();
            parm.scope = selectByType;
        }
        //fillRow(parm);
    });
    $("#factoryList").change(function(){
        datanowParam();
    });
    $("#indicatorselect").change(function(){
        datanowParam();
    });
    $("#startDay").change(function () {
        datanowParam();
    });
    $("#startDay").click(function(){
        laydate({
            istime: false,
            isclear:false,
            istoday:false,
            format: 'YYYY/MM/DD',
            issure:false, //是否显示确认
            start:laydate.now(-1),//设置起始日期
            max: laydate.now(-1), //最大日期
            choose: function(datas){ //选择日期完毕的回调
                datanowParam();
            },
        })
        addLaydateListener();
    });
    var normalCount = 0, //统计正常状态的指标
        nostateCount = 0, //统计无状态的指标
        higherCount = 0, //统计超上标的指标
        lowerCount = 0, //统计超下标的指标
        totalCount = 0; //统计所有指标总和

    //  addFactoryList(null,null,null,true);
    initIndicatorList();
    initLocationList();
    var search = new Array();
    search.push("search1");
    search.push("search2");
    search.push("search3");
    search.push("factoryList");
    setup(search);

   if($("#search1 option").length >0) {
        $("#search1 option").eq(1).attr("selected", true);
        change(1, search);
    }
    if($("#search2 option").length >0) {
        $("#search2 option").eq(1).attr("selected", true);
        change(2, search);
    }
    if($("#search3 option").length >0) {
        $("#search3 option").eq(1).attr("selected", true);
        change(3, search);
    }
    if($("#factoryList option").length >0) {
        $("#factoryList option").eq(1).attr("selected",true);

    }
    datanowParam();
    //构造
    function datanowParam() {
        var findBy = new Object();
        var indicatorName = $("#indicatorselect option:selected").text().trim();
        var factoryName = $("#factoryList option:selected").val().trim();
        var factoryObj;
        if (factoryName != null && factoryName != "工厂列表" && responseFactory.errCode == "success" && responseFactory.total != 0) {
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
            findBy.factory = factory;
            if (indicatorName != "All") {
                findBy.family = indicatorName;
            }
            var page_object = new Object(), other_object = new Object();
            page_object.max = "50";
            page_object.start = "0";
            var response, startDate = $("#startDay").val();
            if (startDate != "") {
                var date = new Date(startDate);
                var time = new Object();
                time.scale = "day";
                time.start = date.getTime();
                time.end = date.getTime();
                findBy.time = time;
                response = datahistory(findBy, page_object, other_object);
            } else {
                var sort = new Object();
                sort.asc = "time";
                other_object.sort = sort;
                response = datanow(findBy, page_object, other_object);
            }
            fillRow(response);
        }
    }

    //给表填充数据
    function fillRow(response) {
        normalCount = 0, //统计正常状态的指标
            nostateCount = 0, //统计无状态的指标
            higherCount = 0, //统计超上标的指标
            lowerCount = 0; //统计超下标的指标
        totalCount = 0; //统计指标总和
        //清空表数据
        $("#indicatorTable tbody").empty();
        $("#indicatorTable tbody").html("");
        var responsedata = JSON.parse(response);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success" && responsedata.total != 0) {
            $("#showNoData").css("display","none");
            if(responsedata.poluList == undefined){ //说明查看的是历史数据
                var startDate = $("#startDay").val();
                var datas  = responsedata.resultList;
                //统计工厂对应的指标信息
                for(var i in datas){
                    var dayResult = datas[i]["dayResult"];
                    for(var j in dayResult){
                        var factoryname = dayResult[j]["factory"]["name"] == undefined?"":dayResult[j]["factory"]["name"],
                            family = dayResult[j]["family"]==undefined?"":dayResult[j]["family"],
                            name = dayResult[j]["name"]==undefined?"":dayResult[j]["name"],
                            max = dayResult[j]["max"]==undefined?"":dayResult[j]["max"],
                            min = dayResult[j]["min"]==undefined?"":dayResult[j]["min"],
                            unit = dayResult[j]["unit"]==undefined?"":dayResult[j]["unit"],
                            higher = dayResult[j]["higher"]==undefined?"":dayResult[j]["higher"],
                            lower = dayResult[j]["lower"]==undefined?"":dayResult[j]["lower"],
                            state = "",
                            value = null,
                            devId = dayResult[j]["devId"]==undefined?"":dayResult[j]["devId"];
                        dayResult[j]["id"] = dayResult[j]["uid"];
                        dayResult[j]["selectedDate"] = startDate;
                        var dataJsonStr = JSON.stringify(dayResult[j]);
                        if(higher == "yes"){
                            state = "超上限";
                            higherCount++;
                        }else if(lower == "yes"){
                            state = "超下限";
                            lowerCount++;
                        }else{
                            state = "正常";
                            normalCount++;
                        }
                        var values = dayResult[j]["values"] == undefined?"":dayResult[j]["values"];
                        for(var h in values) {
                            value = values[h]["avg"] == undefined ? "" : values[h]["avg"];
                        }
                        addIndicatorListTable((Number(j)+1),dataJsonStr,family+"/"+name,value,min,max,unit,devId,factoryname,state);
                        totalCount = normalCount + higherCount + lowerCount + nostateCount;
                    }
                }
            }else{
                var datas = responsedata.poluList;
                var lookTime = responsedata.time;
                var length = datas.length;
                for (var i = 0; i < length; i++) {
                    var indicatorJsonStr = JSON.stringify(datas[i]),
                        value = datas[i]["value"]==undefined?"":datas[i]["value"],
                        family = datas[i]["family"]==undefined?"":datas[i]["family"],
                        name = datas[i]["name"]==undefined?"":datas[i]["name"],
                        max = datas[i]["max"]==undefined?"":datas[i]["max"],
                        min = datas[i]["min"]==undefined?"":datas[i]["min"],
                        unit = datas[i]["unit"]==undefined?"":datas[i]["unit"],
                        higher = datas[i]["higher"]==undefined?"":datas[i]["higher"],
                        lower = datas[i]["lower"]==undefined?"":datas[i]["lower"],
                        state = "",
                        devId = datas[i]["devId"]==undefined?"":datas[i]["devId"],
                        time = datas[i]["time"] == undefined ? "" : datas[i]["time"],
                        factoryname = datas[i]["factory"]== undefined?"":datas[i]["factory"]["name"];
                    if(higher == "no" && lower == "no"){
                        state = "正常";
                        normalCount++;
                    }else if(higher == "yes" && lower == "no"){
                        state = "超上限";
                        higherCount++;
                    }else if(higher == "no" && lower == "yes"){
                        state = "超下限";
                        lowerCount++;
                    }else{
                        state = "无状态";
                        nostateCount++;
                    }
                    var intervalTime = lookTime-time; //查询时间与上报数据时间差
                    var temp=/^-?\d+(\.\d+)?$/;
                    //指标值是数字且
                    //第一次查询或者
                    // 间隔30秒查询且查数据时间与plc上报数据的时间不能超过60秒
                    if(!(temp.test(value) == true && (intervalTime <= 60000))){
                        value = "无更新";
                    }
                    addIndicatorListTable((i+1),indicatorJsonStr,family+"/"+name,value,min,max,unit,devId,factoryname,state);
                    totalCount = normalCount + higherCount + lowerCount + nostateCount;
                }
            }
            //表分页
            sorter.init("indicatorTable",2);
            if(getCookie("backCurrentPage")!= null){
                sorter.transferToPage(Number(getCookie("backCurrentPage")));
                delCookie("backCurrentPage");
            }
        }else{
            $("#showNoData").css("display","block");
        }
    }
    //给表添加指标列表
    function addIndicatorListTable(length,indicatorJsonStr,family,value,min,max,unit,devId,factoryname,state) {
        var detailId = "detail"+length;
        var valueTd = "<td>"+value+"</td>" ;
        var stateTd = "<td>"+state+"</td>" ;
        //state == "无状态";
        if(state == "超下限" || state == "超上限"){
            if(value != "无更新"){
                valueTd = "<td style='color: red; font-weight: 800;'>"+value+"</td>";
            }
            stateTd = "<td style='color: red; font-weight: 800;'>"+state+"</td>" ;
        }
        if(state == "无状态"){
            if(value != "无更新"){
                valueTd = "<td style='color: #eabc14;font-weight: 800;'>"+value+"</td>";
            }
            stateTd = "<td style='color: #eabc14;font-weight: 800;'>"+state+"</td>" ;
        }

        $("#indicatorTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+indicatorJsonStr+"</td>" +
            "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+family+"</td>" +
            valueTd +
            "<td>"+min+"-"+max+"</td>" +
            "<td>"+unit+"</td>" +
            "<td>"+devId+"</td>" +
            "<td>"+factoryname+"</td>" +
            stateTd +
            "<td><a href='indicatorDetail.html' class='tablelink'target='rightFrame' id='"+detailId+"'> 查看详情</a>" +
            "<a href='#'  class='delIndicator tablelink'> 删除</a></td>" +
            "</tr>");
        $(document).on("click","#"+detailId,function(){
            var indicatorJsonStr = $(this).parent().parent().children("td").eq(0).text();
            setCookie("indicatordata",indicatorJsonStr);
            setCookie("indicatorCurrentPage",$("#currentpage").text());
        });
    }
    //给指标下来框赋值
    function initIndicatorList(){
        var responseObj = JSON.parse(polusourcedistkey("family"));
        if(responseObj.errCode == "success" && responseObj.total !=0){
            var familyList = responseObj.resultList;
            for(var j in familyList){
                var family = familyList[j]["family"];
                $("<option value="+family+">"+family+"</option>").appendTo($("#indicatorselect"));
            }
        }
    }
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
            provinces=provincess;
            console.log(JSON.stringify(dsy));
            console.log(JSON.stringify(provinces));
        }
    }

    //画饼图
    function piechart(){
        $('#statisticalcontainer').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y:.1f}%'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
            },
            series: [{
                name: "Brands",
                colorByPoint: true,
                data: [{
                    name: "正常状态指标",
                    y: (normalCount/totalCount)*100,
                    drilldown: "正常状态指标"
                }, {
                    name: "无状态指标",
                    y: (nostateCount/totalCount)*100,
                    drilldown: "Chrome"
                }, {
                    name: "超上限指标",
                    y: (higherCount/totalCount)*100,
                    drilldown: "超上限指标"
                }, {
                    name: "超下限指标",
                    y: (lowerCount/totalCount)*100,
                    drilldown: "超下限指标"
                }]
            }]

        });
    }

    $("#search1").change(function(){
        change(1,search);
    });
    $("#search2").change(function(){
        change(2,search);
    });
    $("#search3").change(function(){
        change(3,search);
    });
    $("#factoryList").change(function(){
        change(4,search);
    });
});