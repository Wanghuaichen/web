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
    var addOrUpdate, //添加或修改对话框
        deltipdialog, //删除提示信息对话框
        tipdialog,//提示信息对话框
        tips = $(".validateTips"); //对话框提示信息

    addOrUpdate = $("#addDevType").dialog({
        autoOpen: false,
        height: 400,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = updateIndicatorInfo();
                if(response != false){
                    addOrUpdate.dialog("close");
                }
            },
            class:"sure"
        },
            {
                text:"关闭",
                click:function(){
                    addOrUpdate.dialog("close");
                },
                class:"cancel",
            }],
        close:function(){
            $("#devType").val("");
            $("#desInfo").val("");
            $(".confirmMsg").html("");
        }
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
            class:"sure",
        }],
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
                        var attrId = $(this).attr("id");
                        if(attrId == "checkAll"){
                            return true;
                        }
                        var devTypeObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                        var param = new Object();
                        param.id = devTypeObject.id;
                        var response = JSON.parse(devtypeDelete(param));
                        if(response.errCode == "success"){
                            $(this).parent().parent().remove();
                        }else{
                            alert("删除设备类型失败！");
                        }
                    });
                }else{
                    var devTypeObject = JSON.parse(del.parent().parent().children("td").eq(0).text());
                    var param = new Object();
                    param.id = devTypeObject.id;
                    var response = JSON.parse(devtypeDelete(param));
                    if(response.errCode == "success"){
                        del.parent().parent().remove();
                    }else{
                        alert("删除设备类型失败！");
                    }
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                deltipdialog.dialog("close");
            },
            class: "cancel",
        }]
    });
    //添加设备类型信息
    $(".add").click(function(){
        addOrUpdate.dialog("open");
        addOrUpdate.dialog("open");
        addOrUpdate.dialog({title:"添加设备类型"});
        tips.text("添加设备类型信息");
    });
    //修改设备类型信息
    $(".update").click(function(){
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 0 && length == 1){
            var obj = $("input[type=checkbox][name=checkbox]:checked");
            //给文本框赋值
            updateIndicatorDialog(obj);
        }else{
            tipdialog.dialog("open");
        }
    });
    //删除设备类型信息
    $(".del").click(function(){
        deltipdialog.dialog("option","_button","del");
        deltipdialog.dialog("open");
    });

    //del a data
    $(document).on("click",".delApp",function () {
        deltipdialog.dialog("option","_button",$(this));
        deltipdialog.dialog("open");
    });
    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").text();
        $("#searchByName").val("");
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").text();
        if(selectType == "全部"){
            parm.all="";
        }else if(selectType == "名称"){
            var name = $("#searchByName").val().trim();
            if(name == ""){
                alert("应用名称不能为空！");
                return false;
            }
            parm.name = name;
        }
        fillRow(parm);
    });
    var parm = new Object();
    parm.all = "";
    fillRow(parm);
    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#devTypeTable tbody").empty();
        $("#devTypeTable tbody").html("");
        var responsedata = JSON.parse(devtypeList(parm));
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.resultList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var devTypeJsonStr = JSON.stringify(datas[i]),
                    devType = datas[i]["type"],
                    desInfo = datas[i]["info"]== undefined?"":datas[i]["info"];
                addRow(devTypeJsonStr,(i+1),devType,desInfo);
            }
            //表分页
            sorter.init("devTypeTable",2);
        }
    }
    //向表中添加一行数据
    function addRow(devTypeJsonStr,length,devType,desInfo){
        $("#devTypeTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+devTypeJsonStr+"</td>" +
            "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+devType+"</td>" +
            "<td>"+desInfo+"</td>" +
            "<td><a href='#' class='delApp tablelink'> 删除</a></td>" +
            "</tr>");
    }
    //修改设备类型界面赋值
    function updateIndicatorDialog(obj){
        obj.each(function () {
            var devTypeObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var devType = devTypeObject.type;
            var desInfo = devTypeObject.info == undefined?"":devTypeObject.info;
            $("#devType").val(devType);
            $("#desInfo").val(desInfo);
            addOrUpdate.dialog("open");
            addOrUpdate.dialog({title:"修改设备类型"});
            tips.text("修改设备类型信息")
        });
    }
    //修改设备类型信息
    function updateIndicatorInfo(){
        var title = $("#addDevType").dialog("option","title"),
            devType = $("#devType").val().trim(),
            desInfo = $("#desInfo").val().trim();
        if(devType == ""){
            $(".confirmMsg").html("设备类型名称不能为空！");
            return false;
        }
        var userInfo = (JSON.parse(getCookie("userInfo"))).account;
        if(title == "添加设备类型"){
            var addParam = new Object();
            addParam.type = devType;
            addParam.orgId = userInfo.orgId;
            if(desInfo != "")addParam.info = desInfo;
            var responseObject = JSON.parse(devtypeCreate(addParam));
            if(responseObject.errCode != "success"){
                $(".confirmMsg").html("添加设备类型信息失败！");
                return false;
            }else{
                var devTypeObject = new Object();
                devTypeObject.id = responseObject.id;
                devTypeObject.type = devType;
                devTypeObject.info = desInfo;
                var devTypeJsonStr = JSON.stringify(devTypeObject);
                var length = $("#devTypeTable tbody tr").length + 1;
                addRow(devTypeJsonStr,length,devType,desInfo);
            }
        }else{
            var updateDevType = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
            var updateParam = new Object(),oldesInfo = updateDevType.info == undefined?"":updateDevType.info,paramLength = 0;
            if(updateDevType.type != devType){
                paramLength++;
                updateParam.type = devType;
            }
            if(oldesInfo != desInfo){
                paramLength++;
                updateParam.info = desInfo;
            }
            if(paramLength != 0) {
                updateParam.id = updateDevType.id;
                var responseObject = JSON.parse(devtypeUpdate(updateParam));
                if (responseObject.errCode != "success") {
                    $(".confirmMsg").html("修改设备类型信息失败！");
                    return false;
                }else{
                    updateDevType.type = devType;
                    updateDevType.info = desInfo;
                    $("input[type=checkbox][name=checkbox]:checked").each(function(){
                        var id = $(this).parent().parent().attr("id");
                        $("tr[id='"+id+"']").children("td").eq(0).text(JSON.stringify(updateDevType));
                        $("tr[id='"+id+"']").children("td").eq(3).text(devType);
                        $("tr[id='"+id+"']").children("td").eq(4).text(desInfo);
                    });
                }
            }else{
                $(".confirmMsg").html("信息没有做任何修改！");
                return false;
            }
        }
    }
});