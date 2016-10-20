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
    //定义常量
    var dialog, //添加修改对话框
        deltipdialog, //删除提示信息对话框
        userInfo,  //登录用户信息
        errCode = new Object(), //存储错误提示信息
        tips = $(".validateTips");// 对话框提示内容
    errCode["devIdExisted"] = "设备Id已经存在";
    errCode["failed"] = "failed";
    errCode["paramErr"] = "paramErr";
    errCode["jsonErr"] = "jsonErr";
    errCode["optionJsonErr"] = "optionJsonErr";
    errCode["devNotExist"] = "devNotExist";
    errCode["updateNothing"] = "updateNothing";
    errCode["noListPerm"] = "noListPerm";
    errCode["noItem"] = "noItem";
    errCode["newDevIdSameWithOld"] = "newDevIdSameWithOld";

    dialog = $("#add-device").dialog({
        autoOpen: false,
        height: 400,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = addorUpdateDevice();
                if(response != false){
                    dialog.dialog("close");
                }
            },
            class:"sure"
        },{
            text:"取消",
            click:function(){
                dialog.dialog("close");
            },
            class:"cancel"
        }]
    });

    tipdialog = $("#tip").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                tipdialog.dialog("close");
            },
            class:"sure"
        }]
    });

    deltipdialog = $("#deltip").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text: "确定",
            click: function (_button) {
                var del = $(this).dialog("option","_button");
                deltipdialog.dialog("close");
                if(del == "del"){
                    $("input[type=checkbox][name=checkbox]:checked").each(function () {
                        var object = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                        var response = JSON.parse(upgradeDelete(object.id));
                        if(response.errCode == "success"){
                            $(this).parent().parent().remove();
                        }else{
                            alert("删除升级信息 "+ object.name +"失败！");
                        }

                    });
                }
                else{
                    var object = JSON.parse(del.parent().parent().children("td").eq(0).text());
                    var response = JSON.parse(upgradeDelete(object.id));
                    if(response.errCode == "success"){
                        del.parent().parent().remove();
                    }else{
                        alert("删除升级信息 "+ object.name +"失败！");
                    }
                }
            },
            class: "sure"
        }, {
            text: "取消",
            click: function () {
                deltipdialog.dialog("close");
            },
            class: "cancel"
        }]
    });
    /*添加设备信息*/
    $(".add").click(function () {
        $(".confirmMsg").html("");
        $("#name").val("");
        $("#fname").val("");
        $("#version").val("");
        $("#dtype").val("");
        $("#url").val("");
        getdeviceType();
        dialog.dialog("open");
        tips.text("添加升级版本信息");
    });

    $(".update").click(function () {
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 0 && length == 1){
            var object = $("input[type=checkbox][name=checkbox]:checked");
            updateUpgradeUi(object);
            dialog.dialog("open");
            dialog.dialog({title:"修改"});
            tips.text("修改升级信息")
        }else{
            tipdialog.dialog("open");
        }
    });

    //del one or more data
    $(".del").click(function () {
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length == 0){
            tipdialog.dialog("open");
        }else {
            deltipdialog.dialog("option","_button","del");
            deltipdialog.dialog("open");
        }
    });
    //del a data
    $(document).on("click",".delUser",function () {
        deltipdialog.dialog("option","_button",$(this));
        deltipdialog.dialog("open");
    });
    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").val();
        if(selectType == "all"){
            $("#searchByName").css("display","none");
        }else if(selectType == "fileName"){
            $("#searchByName").css("display","inline");
            $("#searchByName").val("");
        }
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").val();
        if(selectType == "all"){
            parm.all="";
            //fillRow(parm);
            return;
        }else if(selectType == "fileName"){
            var deviceName = $("#searchByName").val().trim();
            if(deviceName == ""){
                alert("文件名称不能为空！");
                return false;
            }
            parm.name = deviceName;
        }
    });
    //获取登录用户信息
    var jsonstr = getCookie("userInfo"),listDeviceResponsedata;
    console.log("cookie="+jsonstr);
    var responsedata = JSON.parse(jsonstr);
    userInfo = responsedata.account;
    var parm = new Object();
    if(userInfo.type == "root" || userInfo.type == "superr"){
        parm.all = "";
    }else{
        var account = new Object();
        account.name = userInfo.userName;
        parm.account = account;
    }
    fillRow(parm);
    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#deviceTable tbody").empty();
        $("#deviceTable tbody").html("");
        var jsonStr = upgradeList("all");
        listDeviceResponsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (listDeviceResponsedata.errCode == "success") {
            var datas = listDeviceResponsedata.upgradeList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var upgradeJsonstr = JSON.stringify(datas[i]);
                var name = datas[i]["name"],
                    dtype = datas[i]["dtype"],

                    fname = datas[i]["swInfo"]["fname"],
                    version = datas[i]["swInfo"]["version"],
                    url = datas[i]["swInfo"]["url"],
                    state = datas[i]["swInfo"]["state"];
                addUpgradeTableRow((i+1),upgradeJsonstr,name,fname,version,dtype,url,state);
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
    function addUpgradeTableRow(length,upgradeJsonstr,name,fname,version,dtype,url,state){
        var detailId = "detail"+length;
        $("#deviceTable tbody").append("<tr id='device_"+length+"'>" +
            "<td style='display: none'>"+upgradeJsonstr+"</td>" +
            "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td style='width: 6%'>"+length+"</td>"+
            "<td>"+name+"</td>" +
            "<td>"+fname+"</td>" +
            "<td>"+version+"</td>" +
            "<td>"+dtype+"</td>" +
            "<td>"+url+"</td>" +
            "<td>"+state+"</td>" +
            "<td><a href='../devices/UpgradeDeviceDetail.html' target='rightFrame' class='tablelink' id='"+detailId+"'>详情</a> <a href='javascript:void(0)' class='delUser tablelink'> 删除</a></td>" +
            "</tr>");
        $(document).on("click","#"+detailId, function () {
            var upgradeJsonstr = $(this).parent().parent().children("td").eq(0).text();
            setCookie("upgradeselected",upgradeJsonstr);
            setCookie("upgradeCurrentPage",$("#currentpage").text());
        });
    }

    //向数据库中添加或修改设备信息
    function addorUpdateDevice(){
        var title = $("#add-device").dialog("option","title");
        var name= $("#name").val().trim();
        var fname = $("#fname").val().trim();
        var version = $("#version").val().trim();
        var dtype = $("#dtype option:selected").text();
        var url = $("#url").val().trim();
        //是否启用
        var state = $("input[name=radio]:checked").val();

        if(name == ""){
            $(".confirmMsg").html("软件名称不能为空！");
            return false;
        }
        else if(fname == ""){
            $(".confirmMsg").html("文件名称不能为空！");
            return false;
        }else if(version == ""){
            $(".confirmMsg").html("版本信息不能为空！");
            return false;
        }else if(dtype == ""){
            $(".confirmMsg").html("设备类型不能为空！");
            return false;
        }else if(url == ""){
            $(".confirmMsg").html("存放位置不能为空！");
            return false;
        }

        var swInfo=new Object();
        swInfo.name=name;
        swInfo.version=version;
        swInfo.url=url;
        swInfo.fname=fname;
        swInfo.state=state;
        if(title == "添加"){
            var response = upgradeCreate(dtype,name,swInfo);
            var responseDeviceObject = JSON.parse(response);
            if(responseDeviceObject.errCode == "success"){
                var str=new Object();
                var swInfo=new Object();
                str.id=responseDeviceObject.id;
                str.name="name";
                str.dtype=dtype;
                str.swInfo=swInfo;
                var upgradeJsonstr = JSON.stringify(str);
                var length = $("#deviceTable tbody tr").length + 1;
                addUpgradeTableRow(length,upgradeJsonstr,name,fname,version,dtype,url,state);
            }else{
                $(".confirmMsg").html("创建升级信息失败，"+ responseDeviceObject.errCode+ "!");
                return false;
            }
        }else{
            var upgradestr = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
            var responseupdate = JSON.parse(upgradeUpdate(upgradestr.id, name,dtype,swInfo));
            if(responseupdate.errCode =="success"){
                $("input[type=checkbox][name=checkbox]:checked").each(function(){
                    var id = $(this).parent().parent().attr("id");
                    $("tr[id='"+id+"']").children("td").eq(3).text(name);
                    $("tr[id='"+id+"']").children("td").eq(4).text(fname);
                    $("tr[id='"+id+"']").children("td").eq(5).text(version);
                    $("tr[id='"+id+"']").children("td").eq(7).text(dtype);
                    $("tr[id='"+id+"']").children("td").eq(8).text(url);
                    $("tr[id='"+id+"']").children("td").eq(9).text(state);
                });
            }else{
                $(".confirmMsg").html("修改升级信息失败，"+ responseupdate.errCode + "!");
                return false;
            }
        }

    }

    function updateUpgradeUi(obj){
        obj.each(function(){
            var deviceObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var name = $(this).parent().parent().children("td").eq(3).text();
            var fname = $(this).parent().parent().children("td").eq(4).text();
            var version = $(this).parent().parent().children("td").eq(5).text();
            var dtype = $(this).parent().parent().children("td").eq(6).text();
            var url = $(this).parent().parent().children("td").eq(7).text();
            var state = $(this).parent().parent().children("td").eq(8).text();

            $("#name").val(name);
            $("#fname").val(fname);
            $("#version").val(version);
            $("#url").val(url);

            getdeviceType();
            $("#dtype option").each(function(){
                var type = $(this).text();
                if(dtype == type){
                    $(this).attr("selected",true);
                }
            });

            //是否启用
            $("input[name=radio][value="+state+"]").val();
        });
    }

    function getdeviceType() {
        var responsedata =  JSON.parse(getCookie("userInfo"));
        var devTypeParam = new Object();
        var userInfo = responsedata.account;
        devTypeParam.orgId = userInfo.orgId;
        var response = JSON.parse(devtypeList(devTypeParam));
        if (response.errCode == "success") {
            var devTypeList = response.resultList;
            $("#dtype").empty();
            for (var i in devTypeList) {
                var devTypeObj = JSON.stringify(devTypeList[i]);
                var type = devTypeList[i]["type"];
                $("<option value=" + devTypeObj.replace(/\s/g, "") + ">" + type + "</option>").appendTo($("#dtype"));
            }
        }
    }

});