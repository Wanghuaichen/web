/**
 * Created by admin on 2015/11/17.
 */
$(function(){
    setInputNone("inline","inline","none","none","none","none","none","none","none","none","none","none");
    //Highcharts 中默认开启了UTC（世界标准时间）
    //    Highcharts.setOptions({
    //        global: {
    //            useUTC: false
    //        }
    //    });

    $("#realtime").click(function(){
        filldate(family);
    });
    $("#history").click(function(){
        chartType ="line";
        $("#searchType option[value='hour']").attr("selected", true);
        if(selectedDate != ""){
            $("#starthour").val(selectedDate);
            $("#endhour").val(selectedDate);
            endhouroption.min = selectedDate;
            enddate = selectedDate;
        }else{
            $("#starthour").val("");
            $("#endhour").val("");
        }
        $("#startday").val("");
        $("#endday").val("");

        $("#startmonth").val("");
        $("#endmonth").val("");

        $("#startyear").val("");
        $("#endyear").val("");
        fillHistoryData();
    });
    //var idInt = setInterval(function(){
    //    filldate(family,10);
    //},10000);
    //历史数据显示
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").text();
        if(selectType == "小时"){
            setInputNone("inline","inline","none","none","none","none","none","none","none","none","none","none");
            starthouroption.start = firstdate;endhouroption.start = enddate;endhouroption.min = firstdate;
        }else if(selectType == "天"){
            setInputNone("none","none","inline","inline","none","none","none","none","none","none","none","none");
            startdayoption.start = firstdate;enddayoption.start = enddate;enddayoption.min = firstdate;
        }else if(selectType == "月"){
            setInputNone("none","none","none","none","inline","inline","none","none","none","none","none","none");
            startmonthoption.start = firstdate;endmonthoption.start = enddate;endmonthoption.min = firstdate;
        }else if(selectType == "年"){
            setInputNone("none","none","none","none","none","none","inline","inline","none","none","none","none");
            startyearoption.start = firstdate;endyearoption.start = enddate;endyearoption.min = firstdate;
        }else if(selectType == "一分钟"){
            setInputNone("none","none","none","none","none","none","none","none","inline","inline","none","none");
            startminuteoption.start = firstdate;endminuteoption.start = enddate;endminuteoption.min = firstdate;
        }else if(selectType == "十分钟"){
            setInputNone("none","none","none","none","none","none","none","none","none","none","inline","inline");
            start10minuteoption.start = firstdate;end10minuteoption.start = enddate;end10minuteoption.min = firstdate;
        }else if(selectType == "all"){
            setInputNone("inline","inline","none","none","none","none","none","none","none","none","none","none");
            starthouroption.start = firstdate;endhouroption.start = enddate;endhouroption.min = firstdate;
        }
    });
    var enddate;
    var startminuteoption = {
        elem: '#startminute',
        istime: true,
        isclear:false,
        istoday:false,
        format: 'YYYY/MM/DD hh:mm:ss',
        issure:false, //是否显示确认
        start:laydate.now(-2),//设置起始日期
        //min: laydate.now(), //设定最小日期为当前日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            endminuteoption.min = datas;
            firstdate =endminuteoption.start = datas;
        }
    };
    var endminuteoption = {
        elem: '#endminute',
        istime: true,
        isclear:false,
        istoday:false,
        issure:false, //是否显示确认
        format: 'YYYY/MM/DD hh:mm:ss',
        start:laydate.now(0),//设置起始日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            enddate = datas;
        }
    };
    var start10minuteoption = {
        elem: '#start10minute',
        istime: false,
        isclear:false,
        istoday:false,
        format: 'YYYY/MM/DD hh:mm:ss',
        issure:false, //是否显示确认
        start:laydate.now(-2),//设置起始日期
        //min: laydate.now(), //设定最小日期为当前日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            end10minuteoption.min = datas;
            firstdate =end10minuteoption.start = datas;
        }
    };
    var end10minuteoption = {
        elem: '#end10minute',
        istime: false,
        isclear:false,
        istoday:false,
        issure:false, //是否显示确认
        format: 'YYYY/MM/DD hh:mm:ss',
        start:laydate.now(0),//设置起始日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            enddate = datas;
        }
    };
    var starthouroption = {
        elem: '#starthour',
        istime: false,
        isclear:false,
        istoday:false,
        format: 'YYYY/MM/DD',
        issure:false, //是否显示确认
        start:laydate.now(-2),//设置起始日期
        //min: laydate.now(), //设定最小日期为当前日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            endhouroption.min = datas;
            firstdate =endhouroption.start = datas;
        }
    },firstdate = starthouroption.start;
    var endhouroption = {
        elem: '#endhour',
        istime: false,
        isclear:false,
        istoday:false,
        issure:false, //是否显示确认
        format: 'YYYY/MM/DD',
        start:laydate.now(0),//设置起始日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            enddate = datas;
        }
    };
    var startdayoption = {
        elem: '#startday',
        istime: true,
        isclear:false,
        istoday:false,
        format: 'YYYY/MM/DD',
        issure:false, //是否显示确认
        start:laydate.now(0),//设置起始日期
        //min: laydate.now(), //设定最小日期为当前日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            enddayoption.min = datas;
            firstdate =enddayoption.start = datas;
        }
    };
    var enddayoption = {
        elem: '#endday',
        istime: false,
        isclear:false,
        istoday:false,
        issure:false, //是否显示确认
        format: 'YYYY/MM/DD',
        start:laydate.now(0),//设置起始日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            enddate = datas;
        }
    };
    var startmonthoption = {
        elem: '#startmonth',
        istime: false,
        isclear:false,
        istoday:false,
        format: 'YYYY/MM',
        issure:false, //是否显示确认
        start:laydate.now(0),//设置起始日期
        //min: laydate.now(), //设定最小日期为当前日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            endmonthoption.min = datas;
            firstdate =endmonthoption.start = datas;
        }
    };
    var endmonthoption = {
        elem: '#endmonth',
        istime: false,
        isclear:false,
        istoday:false,
        issure:false, //是否显示确认
        format: 'YYYY/MM',
        start:laydate.now(0),//设置起始日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            enddate = datas;
        }
    };
    var startyearoption = {
        elem: '#startyear',
        istime: false,
        isclear:false,
        istoday:false,
        format: 'YYYY',
        issure:false, //是否显示确认
        start:laydate.now(0),//设置起始日期
        //min: laydate.now(), //设定最小日期为当前日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            endyearoption.min = datas;
            firstdate =endyearoption.start = datas;
        }
    };
    var endyearoption = {
        elem: '#endyear',
        istime: false,
        isclear:false,
        istoday:false,
        issure:false, //是否显示确认
        format: 'YYYY',
        start:laydate.now(0),//设置起始日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            enddate = datas;
        }
    };

    $("#startminute").click(function(){
        laydate(startminuteoption);
    });
    $("#endminute").click(function(){
        laydate(endminuteoption);
    });
    $("#start10minute").click(function(){
        laydate(start10minuteoption);
    });
    $("#end10minute").click(function(){
        laydate(end10minuteoption);
    });
    $("#starthour").click(function(){
        laydate(starthouroption);
    });
    $("#endhour").click(function(){
        laydate(endhouroption);
    });
    $("#startday").click(function(){
        laydate(startdayoption);
    });
    $("#endday").click(function(){
        laydate(enddayoption);
    });
    $("#startmonth").click(function(){
        laydate(startmonthoption);
    });
    $("#endmonth").click(function(){
        laydate(endmonthoption);
    });
    $("#startyear").click(function(){
        laydate(startyearoption);
    });
    $("#endyear").click(function(){
        laydate(endyearoption);
    });

    $("#searchpng").click(function(){
        if(enddate == null || enddate == undefined){
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
        window.location.href="manualIndicatorList.html";
    });
    //realTimeChart();
    //获取当前选中的指标
    var manualIndicatorJsonStr = getCookie("manualIndicator"),
        family = "", //指标类型
        unitType = "", //指标单位
        indicatorName = "", //指标名称
        manualIndicatorId="", //指标ID
        devId = "", //设备id
        selectedDate = null, //选择日期
        chartType ="line";

    if(manualIndicatorJsonStr != undefined && manualIndicatorJsonStr != ""){
        var manualIndicatordata = JSON.parse(manualIndicatorJsonStr);
        //devId = manualIndicatordata["devId"]==undefined?"":manualIndicatordata["devId"];
        family = manualIndicatordata["family"]==undefined?"":manualIndicatordata["family"];
        unitType = manualIndicatordata["unit"]==undefined?"":manualIndicatordata["unit"];
        //indicatorName = manualIndicatordata["name"]==undefined?"":manualIndicatordata["name"];
        manualIndicatorId = manualIndicatordata["id"]==undefined?"":manualIndicatordata["id"];
        selectedDate = manualIndicatordata["selectedDate"]==undefined?"":manualIndicatordata["selectedDate"];
        var   factoryname = manualIndicatordata["factory"] == undefined ? "" : manualIndicatordata["factory"]["name"]
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
        //if(selectedDate != null && selectedDate != ""){
        //    $("#history").click();
        //}else{
        //    //filldate(family);
        //}
    }
    //selectTime = new Date(time);
    //$("#recordTime").val(timeStr);
    $("#starthour").val(starthouroption.start);
    $("#endhour").val(endhouroption.start);
    endhouroption.min = starthouroption.start;
    enddate = endhouroption.start;
    fillHistoryData();
    //给实时图添加数据
    function filldate(family,interval){
        var nowchart = $('#nowcontainer').highcharts();
        //update chart prototype
        nowchart.series[0].name = family;
        nowchart.setTitle({ text: '指标 ' + family }) ;
        //get Real time data
        var factoryParm = new Object();
        factoryParm.name = factoryname;
        var findBy = new Object();
        findBy.family = family;
        findBy.devId = devId;
        findBy.name = indicatorName;
        var page_object = new Object(),other_object = new Object();
        page_object.max="50";
        page_object.start="0";

        var sort = new Object();
        sort.asc = "time";
        other_object.sort = sort;

        var datanowresponse = datanow(findBy,page_object,other_object);
        var responsedata = JSON.parse(datanowresponse);
        var lookTime = responsedata.time/1000;
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
                // 间隔10秒查询且查数据时间与plc上报数据的时间不能超过20秒
                if(temp.test(value) == true && (interval != 10 ||(interval == 10 && intervalTime <= 20))){
                    var pointArray = new Array();
                    //pointArray.push(new Date(time*1000));
                    pointArray.push(time*1000);
                    pointArray.push(value);
                    nowchart.series[0].addPoint(pointArray);
                }
            }
        }
    }
    //给历史图添加数据
    function fillHistoryData(){
        var page_object = new Object(),findBy = new Object(),other_object = new Object(),sort = new Object();
        page_object.max="50";
        page_object.start="0";
        findBy.family = family;
        findBy.uid = manualIndicatorId;

        var time = new Object();
        var selectType = $("#searchType option:selected").text();
        var startdate;
        if(selectType == "小时"){
            time.scale = "hour";
            startdate = new Date(endhouroption.min);
        }else {
            if(selectType == "天"){
                time.scale = "day";
                startdate = new Date(enddayoption.min);
            }else if(selectType == "月"){
                time.scale = "month";
                startdate = new Date(endmonthoption.min);
            }else if(selectType == "年"){
                time.scale = "year";
                startdate = new Date(endmonthoption.min);
            }else if(selectType == "一分钟"){
                time.scale = "minute";
                startdate = new Date(endminuteoption.min);
            }else if(selectType == "十分钟"){
                time.scale = "minute10";
                startdate = new Date(end10minuteoption.min);
            }if(selectType == "all"){
                time.scale = "all";
                startdate = new Date(endhouroption.min);
            }
            startdate = new Date(startdate.getTime());
        }
        var endTime = new Date(enddate);
        time.start = startdate.getTime();
        time.end = endTime.getTime()+(24*60*60*1000-1);
        findBy.time = time;
        findBy.uid = manualIndicatorId;
        sort.asc = "time";
        other_object.sort = sort;
        var historyDataJsonStr = manvListhist(findBy,page_object,other_object);
        var historyDatasObject = JSON.parse(historyDataJsonStr);
        var valuePointArray = new Array(),maxPointArray = [],minPointArray = [],rangArray = [];
        var minValue = 0,maxValue = 0,avgValue = 0,totalCount = 0;
        if(historyDatasObject.errCode == "success" && historyDatasObject.total != 0){
            var resultList = historyDatasObject.resultList;
            var temp=/^-?\d+(\.\d+)?$/;
            //获取所有结果数据
            for(var i in resultList){
                for(var j in resultList[i]){
                    var dayResult = resultList[i][j];
                    var day = resultList[i]["day"] == undefined?"":resultList[i]["day"];
                    for(var k in dayResult){
                        if(dayResult[k]["dvalue"] == undefined){
                            var values = dayResult[k]["values"] == undefined?"":dayResult[k]["values"];
                            for(var h in values){
                                var valuePoint = new Array(),
                                    maxPoint = [],minPoint = [],rangePoint = [],
                                    min = values[h]["min"] == undefined?"":Number(values[h]["min"]).toFixed(3), //最小值
                                    max = values[h]["max"] == undefined?"":Number(values[h]["max"]).toFixed(3), //最大值
                                    value = values[h]["avg"] == undefined?"":Number(values[h]["avg"]).toFixed(3),
                                    time = values[h]["time"] == undefined?"":values[h]["time"];
                                var substrTime = day.substring(0,4)+"/"+day.substring(4,6)+"/"+day.substring(6,8);
                                var date = new Date(substrTime+" "+ time);
                                if(temp.test(value) == true && temp.test(min) == true && temp.test(max) == true){
                                    if(totalCount == 0){
                                        maxValue = max;
                                        minValue = min;
                                    }
                                    totalCount++;
                                    avgValue+=Number(value);
                                    if(max > maxValue){
                                        maxValue = max;
                                    }
                                    if(min < minValue){
                                        minValue = min;
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
                            var value = dayResult[k]["dvalue"] == undefined?"":dayResult[k]["dvalue"];
                            if(temp.test(value) == true){
                                var time = dayResult[k]["time"] == undefined?"":dayResult[k]["time"];
                                if(totalCount == 0){
                                    maxValue = value;
                                    minValue = value;
                                }
                                totalCount++;
                                avgValue+=Number(value);
                                if(value > maxValue){
                                    maxValue = value;
                                }
                                if(value < minValue){
                                    minValue = value;
                                }
                                var valuePoint = new Array();
                                valuePoint.push(time);
                                valuePoint.push(Number(value));
                                valuePointArray.push(valuePoint);
                            }
                        }
                    }
                }
            }

            //historyChart.series[0].addPoint(pointArray);
            //historyChart.redraw();

        }
        $("#indicatorMax").text(Number(maxValue).toFixed(2) +";");
        $("#indicatorMin").text(Number(minValue).toFixed(2) +";");
        if(totalCount == 0){
            $("#indicatorAvg").text(avgValue);
        }else{
            $("#indicatorAvg").text((avgValue/totalCount).toFixed(2));
        }
        initHistoryChart(chartType,valuePointArray,maxPointArray,minPointArray,rangArray);
    }
    //实时图初始化
    function realTimeChart(){
        //实时数据显示
        $('#nowcontainer').highcharts({
            chart: {
                type: 'scatter',
                //margin: [70, 50, 60, 80],
                events: {
                    click: function (e) {
                        // find the clicked values and the series
                        var x = e.xAxis[0].value,
                            y = e.yAxis[0].value,
                            series = this.series[0];

                        // Add it
                        //series.addPoint([x, y]);
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
                    format: '{value:%Y/%m/%d %H:%M:%S}',
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
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                //headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                //pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                //'<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
                //footerFormat: '</table>',
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
    //初始化历史图
    function initHistoryChart(type,valuePointArray,maxPointArray,minPointArray,rangPointArray){
        var options ={
            chart: {
                renderTo: 'historycontainer',
                type: type
            },
            title: {
                text: family + "("+unitType+")"
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                crosshair: true,
                endOnTick:true,
                showLastLabel:false,
                labels: {
                    format: '{value:%Y/%m/%d %H:%M:%S}',
                    //autoRotation: [25],
                    rotation: 25,
                    //tickInterval:0.5,
                    //autoRotation:25,
                    align: 'left',
                }
            },
            yAxis: {
                //min: 0,
                title: {
                    text: ''
                }
            },
            tooltip: {
                //headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                //pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                //'<td style="padding:0"><b>{point.y:.3f}</b></td></tr>',
                //footerFormat: '</table>',
                shared: true,
                useHTML: true,
                xDateFormat:'%Y/%m/%d %H:%M:%S'
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: family + '指标值',
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
    //设置查询input状态 display：none
    function setInputNone(starthour,endhour,startday,endday,startmonth,endmonth,startyear,endyear,startminute,endminute,start10minute,end10minute){
        $("#startminute").css("display",startminute);
        $("#endminute").css("display",endminute);
        $("#start10minute").css("display",start10minute);
        $("#end10minute").css("display",end10minute);
        $("#starthour").css("display",starthour);
        $("#endhour").css("display",endhour);
        $("#startday").css("display",startday);
        $("#endday").css("display",endday);
        $("#startmonth").css("display",startmonth);
        $("#endmonth").css("display",endmonth);
        $("#startyear").css("display",startyear);
        $("#endyear").css("display",endyear);

        $("#startminute").val(firstdate);
        $("#endminute").val(enddate);

        $("#start10minute").val(firstdate);
        $("#end10minute").val(enddate);

        $("#starthour").val(firstdate);
        $("#endhour").val(enddate);

        $("#startday").val(firstdate);
        $("#endday").val(enddate);

        $("#startmonth").val(firstdate);
        $("#endmonth").val(enddate);

        $("#startyear").val(firstdate);
        $("#endyear").val(enddate);
    }
});