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
        height: 300,
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


    //查看统计报表
    $(".checkDetail").click(function () {
        statisticalDialog.dialog("open");
        piechart();
    });
    //del a data
    $(document).on("click",".delApp",function () {
        deltipdialog.dialog("option","_button",$(this));
        deltipdialog.dialog("open");
    });
    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").text();
        if(selectType == "全部"){
            $("#searchByName").css("display","none");
            $("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "名称"){
            $("#searchByName").css("display","inline");
            $("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "类型"){
            $("#searchByType").css("display","inline");
            $("#searchByName").css("display","none");
            $("#searchByAddress").css("display","none");
        }
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
        fillRow(parm);
    });
    var parm = new Object();
    parm.all = "";
    //fillRow(parm);

    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#appTable tbody").empty();
        $("#appTable tbody").html("");
        var jsonStr = listapp(parm);
        console.log("parm="+JSON.stringify(parm)+"responsedata="+jsonStr);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.appList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var appJsonStr = JSON.stringify(datas[i]),
                    appName = datas[i]["appName"],
                    creator = datas[i]["creator"]== undefined?"":findOrgUserId(datas[i]["creator"]),
                    type = datas[i]["seen"]== undefined?"":(datas[i]["seen"]=="operation"?"运营":"应用"),
                    funcPerm = datas[i]["funcPerm"]== undefined?"":datas[i]["funcPerm"],
                    status = datas[i]["audit"] == "audited"?datas[i]["status"]:datas[i]["audited"],
                    moreId = "more"+(i+1);

                $("#appTable tbody").append("<tr id='app_"+(i+1)+"'>" +
                    "<td style='display: none'>"+appJsonStr+"</td>" +
                    "<td><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+(i+1)+"'/></td>" +
                    "<td>"+(i+1)+"</td>" +
                    "<td>"+appName+"</td>" +
                    "<td>"+creator+"</td>" +
                    "<td>"+type+"</td>" +
                    "<td>"+funcPerm+"<a href='../application/functionList.html' target='rightFrame' class='tablelink' id='"+moreId+"'>...更多</a> </td>" +
                    "<td><a href='#' class='delApp tablelink'> 删除</a></td>" +
                    "</tr>");
                $(document).on("click","#"+moreId,function(){
                    var appJsonStr = $(this).parent().parent().children("td").eq(0).text();
                    //operatedialog.dialog("open");
                    setCookie("functionlist",appJsonStr);

                });

            }
            //表分页
            sorter.init("appTable",1);
        }
    }
    //画饼图
    function piechart(){
        $('#statisticalcontainer').highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Browser market shares. January, 2015 to May, 2015'
            },
            subtitle: {
                text: 'Click the slices to view versions. Source: netmarketshare.com.'
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
                    name: "Microsoft Internet Explorer",
                    y: 56.33,
                    drilldown: "Microsoft Internet Explorer"
                }, {
                    name: "Chrome",
                    y: 24.03,
                    drilldown: "Chrome"
                }, {
                    name: "Firefox",
                    y: 10.38,
                    drilldown: "Firefox"
                }, {
                    name: "Safari",
                    y: 4.77,
                    drilldown: "Safari"
                }, {
                    name: "Opera",
                    y: 0.91,
                    drilldown: "Opera"
                }, {
                    name: "Proprietary or Undetectable",
                    y: 0.2,
                    drilldown: null
                }]
            }],
            drilldown: {
                series: [{
                    name: "Microsoft Internet Explorer",
                    id: "Microsoft Internet Explorer",
                    data: [
                        ["v11.0", 24.13],
                        ["v8.0", 17.2],
                        ["v9.0", 8.11],
                        ["v10.0", 5.33],
                        ["v6.0", 1.06],
                        ["v7.0", 0.5]
                    ]
                }, {
                    name: "Chrome",
                    id: "Chrome",
                    data: [
                        ["v40.0", 5],
                        ["v41.0", 4.32],
                        ["v42.0", 3.68],
                        ["v39.0", 2.96],
                        ["v36.0", 2.53],
                        ["v43.0", 1.45],
                        ["v31.0", 1.24],
                        ["v35.0", 0.85],
                        ["v38.0", 0.6],
                        ["v32.0", 0.55],
                        ["v37.0", 0.38],
                        ["v33.0", 0.19],
                        ["v34.0", 0.14],
                        ["v30.0", 0.14]
                    ]
                }, {
                    name: "Firefox",
                    id: "Firefox",
                    data: [
                        ["v35", 2.76],
                        ["v36", 2.32],
                        ["v37", 2.31],
                        ["v34", 1.27],
                        ["v38", 1.02],
                        ["v31", 0.33],
                        ["v33", 0.22],
                        ["v32", 0.15]
                    ]
                }, {
                    name: "Safari",
                    id: "Safari",
                    data: [
                        ["v8.0", 2.56],
                        ["v7.1", 0.77],
                        ["v5.1", 0.42],
                        ["v5.0", 0.3],
                        ["v6.1", 0.29],
                        ["v7.0", 0.26],
                        ["v6.2", 0.17]
                    ]
                }, {
                    name: "Opera",
                    id: "Opera",
                    data: [
                        ["v12.x", 0.34],
                        ["v28", 0.24],
                        ["v27", 0.17],
                        ["v29", 0.16]
                    ]
                }]
            }
        });
    }
    var search = new Array();
    search.push("search1");
    search.push("search2");
    search.push("search3");
    setup(search);
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