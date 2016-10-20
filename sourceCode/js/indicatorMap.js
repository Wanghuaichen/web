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
//    search.push("search3");
    setup(search);
    $("#search1").change(function () {
        change(1,search);
        var autoOrmanual = $("#showIndicator option:selected").val();
        if(autoOrmanual == "auto"){
            fillMapData();
        }else{
            showManualData();
        }
    });
    $("#search2").change(function () {
        var autoOrmanual = $("#showIndicator option:selected").val();
        if(autoOrmanual == "auto"){
            fillMapData();
        }else{
            showManualData();
        }
    });
    var selectDate = null;
    $("#startday").click(function(){
        var autoOrmanual = $("#showIndicator option:selected").val();
        if(autoOrmanual == "auto"){
            laydate(setLaydate("YYYY/MM/DD",false));
        }else{
            laydate(setLaydate("YYYY/MM/DD hh:mm:ss",true));
        }
        $("#laydate_clear").click(function(){
            selectDate = null;
        });
        addLaydateListener();
    });
    $("#searchpng").click(function () {
        var autoOrmanual = $("#showIndicator option:selected").val();
        if(autoOrmanual == "auto"){
            fillMapData();
        }else{
            showManualData();
        }
    });
    $("#showIndicator").change(function () {
        var autoOrmanual = $("#showIndicator option:selected").val();
        if(autoOrmanual == "auto"){
            fillMapData();
        }else{
            showManualData();
        }
    });
    var map = new BMap.Map("container");
    map.enableScrollWheelZoom();    //启用滚轮放大缩小，默认禁用
    map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用

    map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
    map.addControl(new BMap.OverviewMapControl()); //添加默认缩略地图控件
//    map.addControl(new BMap.OverviewMapControl({ isOpen: true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));   //右下角，打开
    map.centerAndZoom("北京", 6);
    var factoryObject = null; //存放每个工厂信息及对应的指标信息 全局变量
    fillMapData();
//给地图添加数据源
    function fillMapData(){
        map.clearOverlays();//清空原来的标注
        var provinceSelectedObject = document.getElementById("search1");
        var cityprovinceSelectedObject = document.getElementById("search2");
        //var districtSelectedObject = document.getElementById("search3");
        var province = provinceSelectedObject.options[provinceSelectedObject.selectedIndex].value;
        var city = cityprovinceSelectedObject.options[cityprovinceSelectedObject.selectedIndex].value;
        //var district = districtSelectedObject.options[districtSelectedObject.selectedIndex].value;

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
        filter.include="family|devId|factory|lvalue|dvalue|svalue|lower|higher|location|values|uid|name|unit|dmax|id|dmin|max|min";
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
            //if(autoOrmanual == "auto"){}
            //else {datanowresponse = JSON.parse(manvListhist(findParm,page_object,other_object));}
        }else{
            datanowresponse = JSON.parse(datanow(findParm,page_object,other_object));
            //if(autoOrmanual == "auto"){}
            //else{datanowresponse = JSON.parse(manvListNow(findParm,page_object,other_object));}
        }

        if(datanowresponse.errCode == "success"){
            var poluList = null;
            factoryObject = new Object();
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

            for(var i in factoryObject){
                var factoryName = i, // 获取的是工厂名称
                    lnt = null,
                    lat = null,
                    province = null,
                    city = null,
                    district = null,
                    address = null,
                    isOver = false,
                    arrayList = factoryObject[i];
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
                        isOver = true;
                    }
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
        }
    }
//给地图添加标签
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
        if(isOver){
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
            var info = indicatorInfoWindow(factory,isAuto);
            this.openInfoWindow(info.infoWindow);
            this.setZIndex(1000);
            setTimeout(function(){
                //this.openInfoWindow(info.infoWindow);
                sortOp(info.tableId,info.currentPageId,info.pageListId);
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
     * @param isAuto  是德图指标还是自动指标
     * @returns {Object}
     */
    function indicatorInfoWindow(factory,isAuto){
        var factoryName = "";
        var num = Math.floor(Math.random()*100000),tableId = "manualIndicatorT"+num,
            currentPageId = "currentPage"+num,
            pageListId = "pageList"+num;
        if(isAuto){
            var content = "<table class='tablelist sortable' id='"+tableId+"'><thead><tr>"
                + "<th class='nosort' style='display: none'></th>"
                +"<th><h3>序号</h3></th>"
                +"<th><h3>指标名称</h3></th>"
                +"<th><h3>指标值</h3></th>"
                +"<th><h3>设备名称</h3></th>"
                +"<th><h3>操作</h3></th>"
                + "</tr></thead><tbody>";
            factoryName = factory;
            var poluList = factoryObject[factory];
            for(var i in poluList){
                var dataJsonStr = poluList[i],
                    poluObject = JSON.parse(poluList[i]),
                    length = parseInt(i)+ 1,
                    family = poluObject["family"],
                    name = poluObject["name"],
                    deviceId = poluObject["devId"],
                    detailId = "detail"+length,
                    value = null;
                if(poluObject["value"] == undefined){
                    var values = poluObject["values"][0];
                    value = values["avg"] == undefined? values["min"]:values["avg"];
                }else{
                    value = poluObject["value"];
                }
                var deviceParm = new Object();
                deviceParm.devId = deviceId;
                content += "<tr>"
                    + "<td style='display: none'>"+dataJsonStr+"</td>"
                    +"<td>"+ length +"</td>"
                    +"<td>"+ family + "/" + name +"</td>"
                    +"<td>"+ value.toString().substring(0,5) +"</td>";
                var responseObject = JSON.parse(listdevice(deviceParm)); // 获取指标所在设备信息
                if(responseObject.errCode == "success" && responseObject.total == 1){
                    var deviceListObject = responseObject.deviceList;
                    content += "<td>"+ deviceListObject[0]["name"] +"</td>"; //向表中添加设备名称
                }else{
                    content += "<td></td>"; //向表中添加设备名称
                }
                content += "<td><a href='indicatorDetail.html' class='tablelink'target='rightFrame' onclick='javascript:detailClick("+detailId+","+isAuto+");' id="+detailId+">查看详情</a></td>"
                    +"</tr>";
            }
            //content += "</tbody></table>";
        }else{
            var content = "<div><table class='tablelist sortable' id='"+tableId+"'><thead><tr>"
                + "<th class='nosort' style='display: none'></th>"
                +"<th><h3>序号</h3></th>"
                +"<th><h3>指标名称</h3></th>"
                +"<th><h3>指标值</h3></th>"
                +"<th><h3>操作</h3></th>"
                + "</tr></thead><tbody>";
            factoryName = factory.name;
            var other = new Object(),sort = new Object(),page = new Object(),find = new Object(),
                factoryobj = new Object();
            sort.asc = "time";
            page.max = 50;
            page.start = 0;
            factoryobj.name = factory.name;
            factoryobj.uId = factory.id;
            find.factory = factoryobj;
            other.sort = sort;
            var responseObject;
            if(selectDate != null){
                var time = new Object(),date = new Date(selectDate);
                time.scale = "day";
                time.start = date.getTime();
                time.end = date.getTime() + (24*60*60*1000-1);
                find.time = time;
                responseObject = JSON.parse(manvListhist(find,page,other));
            }else{
                responseObject  = JSON.parse(manvListNow(find,page,other));
            }
            if(responseObject.errCode == "success"){
                var manualObject = responseObject.poluList;
                for(var i in manualObject){
                    var length = parseInt(i)+ 1,
                        detailId = "detail"+length,
                        dataJsonStr = JSON.stringify(manualObject[i]),
                        id = manualObject[i]["id"],
                        unit = manualObject[i]["unit"] == undefined?"":manualObject[i]["unit"],
                        time = manualObject[i]["time"]== undefined?"":manualObject[i]["time"],
                        family = manualObject[i]["family"]== undefined?"":manualObject[i]["family"],
                        value = manualObject[i]["value"]== undefined?"":manualObject[i]["value"],
                        vtype = manualObject[i]["vtype"]== undefined?"":manualObject[i]["vtype"];
                    content += "<tr>"
                        + "<td style='display: none'>"+dataJsonStr+"</td>"
                        +"<td>"+ length +"</td>"
                        +"<td>"+ family +"</td>"
                        +"<td>"+ value.toString().substring(0,5) +"</td>";
                    content += "<td><a href='manualIndicatorDetail.html' class='tablelink'target='rightFrame' onclick='javascript:detailClick("+detailId+","+isAuto+");' id="+detailId+">查看详情</a></td>"
                        +"</tr>";
                }
            }
        }
        content += "</tbody></table>"
            +"<div id='controls'>"
            +"<div id='perpage'>"
            +"<span>每页显示4项</span>"
            //+"<select onchange='javascript:sorter.size(4)' >"
            //+"<option value='4' selected='selected'>4</option>"
            //+"</select>"
            //+"<span>项</span>"
            +"</div>"
            +"<div id='navigation'>"
            +"<img src='../images/first.gif' width='16' height='16' alt='首页' onclick='javascript:sorter.move(-1,true)' />"
            +"<img src='../images/previous.gif' width='16' height='16' alt='上一页' onclick='javascript:sorter.move(-1)' />"
            +"<img src='../images/next.gif' width='16' height='16' alt='下一页' onclick='javascript:sorter.move(1)' />"
            +"<img src='../images/last.gif' width='16' height='16' alt='末页' onclick='javascript:sorter.move(1,true)' />"
            +"</div>"
            +"<div id='text'>第<span id='"+currentPageId+"'></span> 页/共<span id='"+pageListId+"'></span>页</div>"
            +"</div></div>";
        var infoWindow = new BMap.InfoWindow(content,{width:450,height:280,title:factoryName});
        var info = new Object();
        info.infoWindow = infoWindow;
        info.tableId = tableId;
        info.currentPageId = currentPageId;
        info.pageListId=pageListId;
        return info;
    }

    //显示德图指标的数据
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
    //设置日期
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
    //统计工厂信息
    //function countFactory(){
    //    var param = new Object();
    //    param.type = "factory";
    //    var responseFactory = JSON.parse(listorg(param));
    //    if(responseFactory.errCode == "success" && responseFactory.total != 0){
    //        var factoryList = responseFactory.orgList,provinceList = new Array();
    //        for(var i in factoryList){
    //            var province = factoryList[i]["location"]["province"];
    //            var city = factoryList[i]["location"]["city"];
    //            if(locationList[province] == undefined){
    //                locationList[province] = new Array();
    //                locationList[province].push(city);
    //            }else{
    //                var cityList = locationList[province];
    //                if($.inArray(city,cityList) < 0){
    //                    cityList.push(city);
    //                }
    //            }
    //        }
    //        $("#search1").empty();
    //        $("<option value='省份'>省份</option>").appendTo($("#search1"));
    //        for(var i in locationList){
    //            $("<option value="+i+">"+i+"</option>").appendTo($("#search1"));
    //        }
    //    }
    //}
    ////添加市列表
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
});
//点击详情信息
function detailClick(detailId,isAuto){
    var id = detailId.getAttribute("id");
    var dataJsonStr = document.getElementById(id).parentNode.parentNode.firstChild.textContent;
    if(isAuto){
        setCookie("indicatordata",dataJsonStr);
    }else{
        setCookie("manualIndicator",dataJsonStr);
    }
}
//分页设置
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
    sorter.init(tableId,1);
    sorter.size(4);
}

var sorter = new TINY.table.sorter("sorter");






