/**
 * Created by admin on 2015/12/25.
 */
$(document).ready(function(){
    $('#container').css({'width': '100%','min-height': '450px','overflow':'hidden','height':($(window).height() - 40)});
    if($(window).height()-(400+35) > 0){
        $('#container').css({'height':($(window).height() - 40)+'px'});
    }
    $(window).resize(function () {
        if($(window).height()-(400+35) > 0){
            $('#container').css({'height': ($(window).height() - 40)});
        }
    });
    initLocationList();
    var search = new Array(),locationList = new Object();
    search.push("search1");
    search.push("search2");
    setup(search);
    $("#search1").change(function () {
        change(1,search);
        fillMapData();
        deviceAlarmInfo();
        //var autoOrmanual = $("#showIndicator option:selected").val();
        //if(autoOrmanual == "auto"){
        //    fillMapData();
        //}else{
        //    showManualData();
        //}
    });
    $("#search2").change(function () {
        fillMapData();
        deviceAlarmInfo();
    });
    $("#startday").click(function(){
        laydate(setLaydate("YYYY/MM/DD",false));
        //var autoOrmanual = $("#showIndicator option:selected").val();
        //if(autoOrmanual == "auto"){
        //
        //}else{
        //    laydate(setLaydate("YYYY/MM/DD hh:mm:ss",true));
        //}
        $("#laydate_clear").click(function(){
            selectDate = null;
        });
        addLaydateListener();
    });
    $("#searchpng").click(function () {
        fillMapData();
        deviceAlarmInfo();
    });
    $("#showIndicator").change(function () {
        var autoOrmanual = $("#showIndicator option:selected").val();
        if(autoOrmanual == "auto"){
            fillMapData();
        }else{
            showManualData();
        }
    });
    initInfoWindow();
    deviceAlarmInfo();
    var map = new BMap.Map("container");
    map.enableScrollWheelZoom();    //启用滚轮放大缩小，默认禁用
    map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
    map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
    map.addControl(new BMap.OverviewMapControl()); //添加默认缩略地图控件
    map.centerAndZoom("北京", 6);
    var factoryObject = null, //存放每个工厂信息及对应的指标信息 全局变量
        familyTotal = null; //存放每个指标在不同站点值
    fillMapData();
    /**
     * 给地图添加自动指标数据源
     */
    function fillMapData(){
        map.clearOverlays();//清空原来的标注
        var provinceSelectedObject = document.getElementById("search1");
        var cityprovinceSelectedObject = document.getElementById("search2");
        var province = provinceSelectedObject.options[provinceSelectedObject.selectedIndex].value;
        var city = cityprovinceSelectedObject.options[cityprovinceSelectedObject.selectedIndex].value;
        var location = new Object();
        if(province != "省份"){
            location.province = province;
            map.centerAndZoom(province, 6);
            if(city != "地级市"){
                location.city = city;
            }
        }else{
            location = null;
        }
        var findParm = new Object();
        if(location != null){
            findParm.location = location;
        }
        var filter = new Object();
        //filter.include="max|min|family|devId|factory|lvalue|dvalue|svalue|lower|higher|location|values|uid|name";
        var page_object = new Object(),other_object = new Object();
        page_object.max="2000";
        page_object.start="0";
        other_object.filter = filter;
        var datanowresponse = null;
        if(selectDate != null){
            var startdate = new Date(selectDate);
            var time = new Object();
            time.scale = "day";
            time.start = startdate.getTime();
            time.end = startdate.getTime() + (24*60*60*1000-1);
            findParm.time = time;
            findParm.all = "yes";
            datanowresponse = JSON.parse(datahistory(findParm,page_object,other_object));
        }else{
            datanowresponse = JSON.parse(datanow(findParm,page_object,other_object));
        }
        if(datanowresponse.errCode == "success"){
            var poluList = null;
            factoryObject = new Object(),familyTotal = new Object();
            if(datanowresponse.poluList == undefined){
                poluList = datanowresponse.resultList;
                //统计工厂对应的指标信息
                for(var i in poluList){
                    var dayResult = poluList[i]["dayResult"];
                    for(var j in dayResult){
                        dayResult[j]["selectedDate"] = selectDate;
                        dayResult[j]["id"] = dayResult[j]["uid"];
                        var dataJsonStr = JSON.stringify(dayResult[j]);
                        var factoryName = dayResult[j]["factory"]["name"] == undefined?"":dayResult[j]["factory"]["name"];
                        if(factoryObject[factoryName] == undefined || factoryObject[factoryName] == null){
                            factoryObject[factoryName] =new Array();
                        }

                        factoryObject[factoryName].push(dataJsonStr);
                    }
                }
            }else{
                poluList = datanowresponse.poluList;
                //统计工厂对应的指标信息
                for(var i in poluList){
                    var dataJsonStr = JSON.stringify(poluList[i]);
                    var factoryName = poluList[i]["factory"]["name"] == undefined?"":poluList[i]["factory"]["name"];
                    if(factoryObject[factoryName] == undefined || factoryObject[factoryName] == null){
                        factoryObject[factoryName] =new Array();
                    }
                    factoryObject[factoryName].push(dataJsonStr);
                }
            }
            //循环工厂信息
            for(var i in factoryObject){
                var factoryName = i, // 获取的是工厂名称
                    lnt = null,//站点经度，用于地图定位
                    lat = null,//站点纬度，用于地图定位
                    province = null,//站点所在省，用于地图定位
                    city = null,//站点所在市，用于地图定位
                    district = null,//站点所在区，用于地图定位
                    address = null, //站点地址，用于地图定位
                    isOver = 0, //指标是否超标
                    arrayList = factoryObject[i], //一个工厂所有指标对象
                    familySiteValue = new Object(); //某一个指标在站点里的总值，key是指标
                //统计工厂下面指标信息
                for(var j in arrayList){
                    var poluObject = JSON.parse(arrayList[j]);
                    if(j == "0"){ //只取第一次的值
                        lnt = poluObject["location"]["lnt"] == undefined?"":poluObject["location"]["lnt"];
                        lat = poluObject["location"]["lat"] == undefined?"":poluObject["location"]["lat"];

                        province = poluObject["location"]["province"] == undefined?"":poluObject["location"]["province"];
                        city = poluObject["location"]["city"] == undefined?"":poluObject["location"]["city"];
                        district = poluObject["location"]["district"] == undefined?"":poluObject["location"]["district"];
                        address = poluObject["location"]["address"] == undefined?"":poluObject["location"]["address"];
                    }
                    var higher = poluObject["higher"] == undefined?"":poluObject["higher"];
                    var lower = poluObject["lower"] == undefined?"":poluObject["lower"];

                    if(higher == "yes" || lower == "yes"){
                        isOver++;
                    }
                    var name = poluObject.family,
                        value = poluObject.value;
                    if(value == undefined){
                        var values = poluObject.values;
                        for(var v in values){
                            value = Number(values[v]["avg"]);
                        }
                    }
                    if(familySiteValue[name] == null){
                        familySiteValue[name] = new Object();
                        familySiteValue[name]["value"] = 0;
                        familySiteValue[name]["count"] = 0;
                        familySiteValue[name]["max"] = 0;
                    }
                    if(value > familySiteValue[name]["max"]){
                        familySiteValue[name]["max"] = value;
                    }
                    familySiteValue[name]["value"] +=value;
                    familySiteValue[name]["count"]++;
                }
                for(var k in familySiteValue){
                    if(familyTotal[k] == null){
                        familyTotal[k] = new Array();
                    }
                    var siteFamilyValue = new Object(); //一个站点里面指标的总值，key是站点
                    siteFamilyValue.name = factoryName;
                    siteFamilyValue.value = familySiteValue[k]["value"];
                    siteFamilyValue.max = familySiteValue[k]["max"];
                    siteFamilyValue.count = familySiteValue[k]["count"];
                    familyTotal[k].push(siteFamilyValue);
                }
                if(lnt !="" && lat !=""){
                    addMaker(lnt,lat,factoryName,isOver,true);
                }else{
                    var localSearch = new BMap.LocalSearch(map);
                    localSearch.enableAutoViewport(); //允许自动调节窗体大小
                    localSearch.setSearchCompleteCallback(function (searchResult) {
                        var poi = searchResult.getPoi(0);
                        lnt = poi.point.lng;
                        lat = poi.point.lat;
                        addMaker(lnt,lat,factoryName,isOver,true);
                    });
                    localSearch.search(province+city+district+address);
                }
            }
        }else{
            familyTotal = null;
        }
        initIndicatorCompare();
        $("#usual ul").idTabs();
    }
    /**给地图添加标签
     * @param lnt  经度
     * @param lat  维度
     * @param factory 工厂名称
     * @param isOver 是否有超标
     * @param isAuto 是否是自动指标
     */
    function addMaker(lnt,lat,factory,isOver,isAuto){
        var factoryName = "";
        if(isAuto){
            factoryName = factory;
        }else{
            factoryName = factory.name;
        }
        var myIcon = null;
        var label = new BMap.Label(factoryName,{offset:new BMap.Size(20,-10)});
        label.setStyle({
            display:"none"
        });
        if(isOver != 0){
            myIcon = new BMap.Icon("../images/redMarker.png", new BMap.Size(25, 25));
            label.setStyle({
                color : "red",
                fontSize : "18px",
                height : "30px",
                lineHeight : "30px",
                border:"red",
                fontFamily:"微软雅黑"
            });
        }else{
            myIcon = new BMap.Icon("../images/greenMarker.png", new BMap.Size(25, 25));
            label.setStyle({
                color : "green",
                fontSize : "12px",
                height : "20px",
                lineHeight : "20px",
                border:"green",
//                background-color: "red",
                fontFamily:"微软雅黑"
            });
        }
        var marker = new BMap.Marker(new BMap.Point(lnt,lat),{icon:myIcon});  // 创建标注，为要查询的地方对应的经纬度
        marker.addEventListener("click", function(){
            var info = indicatorInfoWindow(factory,isOver);
            this.openInfoWindow(info.infoWindow);
            setTimeout(function(){
                //this.openInfoWindow(info.infoWindow);
                //sortOp(info.tableId,info.currentPageId,info.pageListId,4);
                $("#"+info.alarmId).on("click",function(){
                    leftmenuclick();
                });
                $("#"+info.siteId).on("click",function(){
                    var poluList = factoryObject[factory];
                    var poluObject = JSON.parse(poluList[0]);
                    var siteObject = new Object();
                    if(selectDate != null){
                        var startdate = new Date(selectDate);
                        var endDate = startdate.getTime() - (24*60*60*1000);
                        siteObject.startTime = dataFormate(endDate, "yyyy/MM/dd");
                        siteObject.endTime = selectDate;
                        //siteObject.endTime = dataFormate(endDate, "yyyy/MM/dd HH:mm:ss");
                    }
                    siteObject.name = poluObject["factory"]["name"];
                    siteObject.id = poluObject["factory"]["id"];
                    setCookie("siteDetail",JSON.stringify(siteObject));
                });
            },10);
        });
        marker.addEventListener("mouseover", function(){
            label.setStyle({    //给label设置样式，任意的CSS都是可以的
                display:"block"
            });
        });
        marker.addEventListener("mouseout", function(){
            label.setStyle({    //给label设置样式，任意的CSS都是可以的
                display:"none"
            });
        });
        marker.setLabel(label);
        map.addOverlay(marker);
    }

    /**
     * 点击工厂名称弹出窗口信息,分自动指标和德图指标
     * @param factory 当前工厂信息
     * @returns {Object}
     */
    function indicatorInfoWindow(factory,overCount){
        var factoryName = "";
        var num = Math.floor(Math.random()*100000),
            tableId = "manualIndicatorT"+num,
            currentPageId = "currentPage"+num,
            pageListId = "pageList"+num,
            alarmId = "alarm" +num,
            siteId = "site" +num;
        var content = "<div class='siteContentWindow borderRadius'>" +
            "<div style='float: left;  border-right: 1px solid lightgrey;width: 50%;min-height: 120px'>";
        factoryName = factory;
        var poluList = factoryObject[factory];
        for(var i in poluList){
            var dataJsonStr = poluList[i],
                poluObject = JSON.parse(poluList[i]),
                length = parseInt(i)+ 1,
                family = poluObject["family"],
                name = poluObject["name"],
                detailId = "detail"+length,
                unit = poluObject["unit"],
                higher = poluObject["higher"] == undefined?"":poluObject["higher"],
                lower = poluObject["lower"] == undefined?"":poluObject["lower"],
                value = null;
            if(poluObject["value"] == undefined){
                var values = poluObject["values"][0];
                value = values["avg"] == undefined? values["min"]:values["avg"];
            }else{
                value = poluObject["value"];
            }
            var htmlA = "";
            if(higher == "yes" || lower == "yes"){
                htmlA += "<a href='../environmental/indicatorDetail.html' style='color: red' onclick='javascript:detailClick("+detailId+","+dataJsonStr+");' id="+detailId+">"+value.toString().substring(0,5)+unit+"</a>";
            }else{
                htmlA += "<a href='../environmental/indicatorDetail.html' style='color: green' onclick='javascript:detailClick("+detailId+","+dataJsonStr+");' id="+detailId+">"+value.toString().substring(0,5)+unit+"</a>";
            }
            content +="<span class='siteInfoWindow'>"+name+"浓度："+ htmlA +"</span>"
        }
        content +="</div><div style='float: right;width: 46%;'>" +
            "<div class='siteInfoWindow'><span class='on-duty'></span> 值班人：XXX；</div>" +
            "<div class='siteInfoWindow'><span class='alarmNum'></span><a href='../environmental/alarm.html' style='color: red' class='tablelink' id='"+alarmId+"'>告警："+overCount+"次</a>；</div>" +
            "<div class='siteInfoWindow'><span class='alarmNum'></span>药剂余量：0吨</div></div></div>";
        var titleContent = "<div style='font-weight: bolder;margin-right: 5px;display: inline;'>"+factoryName+
            "</div>  [<a href='../comprehensiveMonitor/siteDetail.html' id='"+siteId+"' style='text-decoration: underline;'>进入站点</a>]";
        var infoWindow = new BMap.InfoWindow(content,{width:300,height:175,title:titleContent});
        var info = new Object();
        info.infoWindow = infoWindow;
        info.tableId = tableId;
        info.currentPageId = currentPageId;
        info.pageListId=pageListId;
        info.alarmId = alarmId;
        info.siteId = siteId;
        return info;
    }

    /**
     * 统计设备告警信息
     */
    function deviceAlarmInfo(){
        $("#alarmWindow").html("");
        var param = new Object();
        var typearray=new Array();
        var devcount=0;
        var deviceArray = new Object();
        param.all = "";
        var responseObj = JSON.parse(listdevice(param));
        if(responseObj.errCode == "success" && responseObj.total != 0){
            var deviceList = responseObj.deviceList,
                multiFind = new Array(),
                timeParam = new Object(),
                count = 0,
                startdate = new Date();

            if(selectDate != null){
                startdate = new Date(selectDate);
                timeParam.start = startdate.getTime();
            }else{
                timeParam.start = startdate.getTime();
            }
            timeParam.end = startdate.getTime() + (24*60*60*1000-1);
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
            var mutiResult = response.multiResult,alarmList = "";

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
                    alarmList += "<div class='alarmList borderRadius'>"+count+"、<a href='../devices/deviceAlarm.html' class='tablelink'>"+deviceObj.name+"：最后一次下线时间： "
                        +dataFormate(lastTime,"yyyy/MM/dd HH:mm:ss")+"</a></div>";
                }
            }
            //$("#alarmWindow").append("<div style='color:red;font-size: large'>报警信息总："+count+"条</div>");
            $("#alarmWindow").dialog({title:"报警信息总("+count+")条"});
            $("#alarmWindow").append(alarmList);
        }
    }
    /**
     * 显示德图指标的数据
     */
    function showManualData(){
        map.clearOverlays();//清空原来的标注
        var provinceSelectedObject = document.getElementById("search1");
        var cityprovinceSelectedObject = document.getElementById("search2");
        //var districtSelectedObject = document.getElementById("search3");
        var province = provinceSelectedObject.options[provinceSelectedObject.selectedIndex].value;
        var city = cityprovinceSelectedObject.options[cityprovinceSelectedObject.selectedIndex].value;
        var location = new Object();
        if(province != "省份"){
            location.province = province;
            map.centerAndZoom(province, 6);
            if(city != "地级市"){
                location.city = city;
            }
        }else{
            location = null;
        }
        var findParm = new Object();
        if(location != null){
            findParm.location = location;
        }
        findParm.type = "factory";
        var responseObj = JSON.parse(listorg(findParm));
        if(responseObj.errCode == "success" && responseObj.total !=0){
            var factoryList = responseObj.orgList;
            for(var i in factoryList){
                var factoryObj = factoryList[i],isOver = false,
                    id = factoryObj.id,
                    factoryName = factoryObj.name,
                    location = factoryObj["location"]== undefined?"":factoryObj["location"],
                    province = location == ""?"":location["province"]==undefined?"":location["province"],
                    city = location == ""?"":location["city"]== undefined?"":location["city"],
                    district = location == ""?"":location["district"]== undefined?"":location["district"],
                    address = location == ""?"":location["address"]== undefined?"":location["address"],
                    lnt = location == ""?"":location["lnt"]== undefined?"":location["lnt"],
                    lat = location == ""?"":location["lat"]== undefined?"":location["lat"];
                var filter = new Object(),sort = new Object(),page = new Object(),
                    other = new Object(),find = new Object(),factory = new Object();
                filter.include="family|devId|factory|lvalue|dvalue|svalue|lower|higher|location|values|uid|name";
                other.filter = filter;
                sort.asc = "time";
                page.max = 50;
                page.start = 0;
                factory.name = factoryObj.name;
                factory.uId = factoryObj.id;
                find.factory = factory;
                find.hilo ="higher|lower";
                other.sort = sort;
                var response;
                if(selectDate != null){
                    var time = new Object(),date = new Date(selectDate);
                    time.scale = "day";
                    time.start = date.getTime();
                    time.end = date.getTime() + (24*60*60*1000-1);
                    find.time = time;
                    response = JSON.parse(manvListhist(find,page,other));
                }else{
                    response = JSON.parse(manvListNow(find,page,other));
                }
                if(response.errCode == "success" && response.total != 0){
                    isOver = true;
                }
                addMaker(lnt,lat,factoryObj,isOver,false);
            }
        }
    }

    /**设置日期
     * @param format 显示日期格式
     * @param istime 是否显示时分秒
     * @returns {{elem: string, istime: *, isclear: boolean, istoday: boolean, format: *, issure: boolean, start: *, max: *, choose: Function}}
     */
    function setLaydate(format,istime){
        var startdayoption = {
            elem: '#startday',
            istime: istime,
            isclear:true,
            istoday:false,
            format: format,//'YYYY/MM/DD',
            issure:false, //是否显示确认
            start:laydate.now(0),//设置起始日期
            //min: laydate.now(), //设定最小日期为当前日期
            max: laydate.now(0), //最大日期
            choose: function(datas){ //选择日期完毕的回调
                selectDate = datas;
            }
        };
        return startdayoption;
    }
    var responseFactory;

    /**
     * 只列出工厂信息
     */
    function initLocationList(){
        var factoryList=new Object();
        responseFactory = JSON.parse(polusourcedistkey("factory"));
        if(responseFactory.errCode == "success" && responseFactory.total != 0){
            var List = responseFactory.resultList;
            for(var i in List){
                var factory = List[i]["factory"]["name"] == undefined?"":List[i]["factory"]["name"];
                var province = List[i]["location"]["province"];
                var city = List[i]["location"]["city"];
                if(factoryList[province]==undefined) {
                    factoryList[province]=new Array();
                    factoryList[province].push(city);
                }
            }
            var object = factoryList;
            var provincess=new Array();
            var province_count=0;
            for(var i in object) {
                provincess.push(i);
                dsy.add("0_"+province_count, object[i]);
                province_count++;
            }
            dsy.add("0", provincess);
        }
    }
    /**
     * 指标对比赋值
     */
    function initIndicatorCompare(){
        $("#usual").html("<div class='itab'><ul></ul></div>");
        var responseObj = JSON.parse(polusourcedistkey("family"));
        if(responseObj.errCode == "success" && responseObj.total !=0){
            var familyList = responseObj.resultList;
            for(var j in familyList){
                var family = familyList[j]["family"],content="",tabclass="";
                if(familyTotal != null){
                    var siteArray = familyTotal[family] == null? new Array():familyTotal[family]; //获取该指标在不同站点下面的总值
                    siteArray.sort(function(a, b){
                        return b.value - a.value;
                    });

                    for(var l in siteArray){
                        var siteValue = siteArray[l],
                            count = l,
                            avg = (siteValue.value/siteValue.count).toFixed(3),
                            width = Number((avg/siteArray[0]["value"]).toFixed(3))*100,
                            compareClass = "compareNum",
                            processClass = "green";
                        count++;
                        if(count < 4){
                            compareClass = "compareNum top3";
                            processClass = "red";
                        }
                        content +="<div style='margin: 0px 0px 5px 0px;'><span class='"+compareClass+"'>"+count+"</span>"+siteValue.name+"浓度值:<br/><div class='progress'> " +
                            "<span class='"+processClass+"' style='width: "+width+"%;'><span>"+avg+"</span></span></div></div>";
                    }
                }
                if(j ==0 ){
                    tabclass="class = 'selected'";
                }
                $("#usual ul").append("<li><a href='#tab"+j+"' "+tabclass+" id='"+family+"'>"+family+"</a></li>");
                //大于
                if(familyList.length <= 4){
                    $("#usual").append("<div id='tab"+j+"' class='tabson'>"+content+"</div>");
                }else{
                    $("#usual").append("<div id='tab"+j+"' class='tabson' style='margin-top:40px'>"+content+"</div>");
                }
            }
        }
    }

    /**
     * 初始化弹出窗口信息
     */
    function initInfoWindow(){
        var compareWindow = $("#compareWindow").dialog({
            position:{ my: "left bottom", at: "right bottom", of: window},
            autoOpen: true,
            height: 300,
            width: 430,
            minHeight:30,
            modal: false,
            closeText: "最小化",
            close:function(){
                var classArray = $('.ui-dialog-titlebar-close').attr('class');
                if(classArray.indexOf("ui-dialog-titlebar-min")>= 0){
                    $(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-max");
                    $(".ui-dialog-titlebar-close").removeClass("ui-dialog-titlebar-min");
                    $(this).dialog({
                        height: 300,
                        width: 430,
                        closeText: "最小化"});
                    $("#usual1").css("display","block");
                }else{
                    $(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-min");
                    $(".ui-dialog-titlebar-close").removeClass("ui-dialog-titlebar-max");
                    $(this).dialog({ height: 30,
                        width: 100,
                        closeText: "最大化"});

                    $("#usual1").css("display","none");
                }
            },
            open:function(){
                $(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-max");
                $(".ui-dialog-buttonpane").hide();
            }
        });
        var alarmWindow = $("#alarmWindow").dialog({
            position:{ my: "center", at: "left bottom", of: window},
            autoOpen: true,
            height: 200,
            width: 200,
            modal: false,
            open:function(){
                //$(".ui-dialog-titlebar-close").addClass("ui-dialog-titlebar-alarm");
                $("#alarmWindow").prev().find("button").hide();//先找到上一个同级兄弟，再找元素，然后隐藏
                $(".ui-dialog-buttonpane").hide();
            }
        });
    }
});
var selectDate = null;
/**点击详情信息
 * @param detailId 详情元素Id
 * @param isAuto 是否自动指标
 */
function detailClick(detailId,data){
    //var id = detailId.getAttribute("id");
    setCookie("indicatordata",JSON.stringify(data));
}
//var sorter = new TINY.table.sorter("sorter");
