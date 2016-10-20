$(function () {

    var upgradeJson = getCookie("upgradeselected"),
        currentPage = getCookie("upgradeCurrentPage");
    setCookie("backCurrentPage",currentPage);

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

    $(".update").click(function () {
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length>0)
            $("input[type=checkbox][name=checkbox]:checked").each(function(){
                var obj = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                var id= obj.id;
                console.log("save id to list " + id);
            });
        else
            console.log("clear id list");

    });

    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").val();
        if(selectType == "all"){
            $("#searchByName").css("display","none");
            //$("#searchByAddress").css("display","none");
            //$("#searchByType").css("display","none");
            $("#searchById").css("display","none");
        }else if(selectType == "deviceName"){
            $("#searchByName").css("display","inline");
            $("#searchByName").val("");
            $("#searchById").css("display","none");
            //$("#searchByAddress").css("display","none");
            //$("#searchByType").css("display","none");
        }else if(selectType == "deviceId"){
            $("#searchByName").css("display","none");
            $("#searchById").css("display","inline");
            $("#searchById").val("");
            //$("#searchByAddress").css("display","none");
            //$("#searchByType").css("display","none");
        }
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").val();
        if(selectType == "all"){
            parm.all="";
            fillRow(parm);
            return;
        }else if(selectType == "deviceName"){
            var deviceName = $("#searchByName").val().trim();
            if(deviceName == ""){
                alert("设备名称不能为空！");
                return false;
            }
            parm.name = deviceName;
        }else if(selectType == "deviceId"){
            var deviceId = $("#searchById").val().trim();
            if(deviceId == ""){
                alert("设备Id不能为空！");
                return false;
            }
            parm.devId = deviceId;
        }

        $("#deviceTable tbody").find("tr").each(function(){
            /*$(this).find("td").each(function()*/
            {
                var devicename = $(this).find("td").eq(3).text();
                var devId = $(this).find("td").eq(4).text();
                if(parm.name==devicename||parm.devId==devId) {
                    var deviceJsonstr=$(this).find("td").eq(0).text();
                    var check=$(this).find("td").eq(1).children("input").is(':checked');
                    var consumerName = $(this).find("td").eq(5).text();
                    var version = $(this).find("td").eq(6).text();
                    var state = $(this).find("td").eq(7).text();
                    $("#deviceTable tbody").empty();
                    $("#deviceTable tbody").html("");
                    addDeviceTableRow(1, deviceJsonstr,check, devicename, devId, "", consumerName, version, state);
                    //表分页
                    sorter.init("deviceTable",2);
                }
            }
        });
    });

    if(upgradeJson != undefined && upgradeJson != "" && upgradeJson!= null) {
        var upgradeObject = JSON.parse(upgradeJson);
        $("#name").text(upgradeObject.name);
        $("#version").text(upgradeObject.version);
        $("#dtype").text(upgradeObject.dtype);
        fillRow(upgradeObject.dtype);
    }
    else
        fillRow("");

    function fillRow(type) {
        //清空表数据
        $("#deviceTable tbody").empty();
        $("#deviceTable tbody").html("");
        var param=new Object();
        param.all = "";
        if(type!="")
            param.type=type;
        var jsonStr = listdevice(param);
        listDeviceResponsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (listDeviceResponsedata.errCode == "success") {
            var datas = listDeviceResponsedata.deviceList;
            var length = datas.length;

            for (var i = 0; i < length; i++) {
                var deviceJsonstr = JSON.stringify(datas[i]);
                var devtype = datas[i]["type"];
                var check=1;
                if(devtype==type) {
                    var devicename = datas[i]["name"],
                        devId = datas[i]["devId"],
                        orgname = datas[i]["org"] == undefined ? "" : datas[i]["org"],
                        consumerName = datas[i]["account"] == undefined ? "" : datas[i]["account"]["name"],
                        connState = datas[i]["connState"] == undefined ? "" : datas[i]["connState"],
                        state = connState.main == undefined ? "未知状态" : connState.main;
                        //version = datas[i]["version"] == undefined ? "" : datas[i]["version"];
                    var connectdetail= JSON.parse(findconnstate(datas[i]["id"]));
                    var version = connectdetail.boxState.version;
                    addDeviceTableRow((i + 1), deviceJsonstr,check, devicename, devId, orgname, consumerName, version, state);
                }
            }
            //表分页
            sorter.init("deviceTable",2);
            if(getCookie("backCurrentPage") != null){
                sorter.transferToPage(Number(getCookie("backCurrentPage")));
                delCookie("backCurrentPage");
            }
        }
    }
    //添加设备表行
    function addDeviceTableRow(length,deviceJsonstr,check,devicename,devId,orgname,consumerName,version,state){
        var detailId = "detail"+length;
        var checkstr;
        if(check==1)
            checkstr="<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"' checked='checked'"+" /></td>";
        else
            checkstr="<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>";

        $("#deviceTable tbody").append("<tr id='device_"+length+"'>" +
            "<td style='display: none'>"+deviceJsonstr+"</td>" +
            checkstr +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+devicename+"</td>" +
            "<td>"+devId+"</td>" +
            "<td>"+consumerName+"</td>" +
            "<td>"+version+"</td>" +
            "<td>"+state+"</td>" +
            "</tr>");
        $(document).on("click","#"+detailId, function () {
            var deviceJsonStr = $(this).parent().parent().children("td").eq(0).text();
            setCookie("deviceselected",deviceJsonStr);
            setCookie("deviceCurrentPage",$("#currentpage").text());
        });
    }

});