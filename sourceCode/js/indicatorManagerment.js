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

    addOrUpdate = $("#addIndicator").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = updateIndicatorInfo();
                if(!response){
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
                        var indicatorObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                        deletedatatype(indicatorObject.id);
                        $(this).parent().parent().remove();
                    });
                }else{
                    var indicatorObject = JSON.parse(del.parent().parent().children("td").eq(0).text());
                    deletedatatype(indicatorObject.id);
                    del.parent().parent().remove();
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                deltipdialog.dialog("close");
            },
            class: "cancel",
        }],
    });
    //添加指标信息
    $(".add").click(function(){
        addOrUpdate.dialog("open");
        $("#indicatorName").val("");
        $("#type").val("");
        $(".confirmMsg").html("");
        addOrUpdate.dialog("open");
        addOrUpdate.dialog({title:"添加指标"});
        tips.text("添加指标信息");
    });
    //修改指标信息
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
    //删除指标信息
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
    parm.all = "yes";
    fillRow(parm);
    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#indicatorTable tbody").empty();
        $("#indicatorTable tbody").html("");
        var jsonStr = listdatatype(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.familyList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var indicatorJsonStr = JSON.stringify(datas[i]),
                    indicatorName = datas[i]["name"],
                    poluType = datas[i]["poluType"]== undefined?"":datas[i]["poluType"];
                addRow(indicatorJsonStr,(i+1),indicatorName,poluType);
            }
            //表分页
            sorter.init("indicatorTable",2);
        }
    }
    //向表中添加一行数据
    function addRow(indicatorJsonStr,length,indicatorName,poluType){
        $("#indicatorTable tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+indicatorJsonStr+"</td>" +
            "<td style='width: 6%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+indicatorName+"</td>" +
            "<td>"+poluType+"</td>" +
            "<td><a href='#' class='delApp tablelink'> 删除</a></td>" +
            "</tr>");
    }
    //修改指标界面赋值
    function updateIndicatorDialog(obj){
        obj.each(function () {
            var indicatorObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var name = indicatorObject.name;
            var type = indicatorObject.poluType;
            $("#indicatorName").val(name);
            $("#type").val(type);

            addOrUpdate.dialog("open");
            addOrUpdate.dialog({title:"修改指标"});
            tips.text("修改指标信息")
        });
    }
    //修改指标信息
    function updateIndicatorInfo(){
        var title = $("#addIndicator").dialog("option","title");
        var name = $("#indicatorName").val().trim();
        var type = $("#type").val().trim();
        if(name == ""){
            $(".confirmMsg").html("指标名称不能为空！");
            return false;
        }else if(type == ""){
            $(".confirmMsg").html("指标类型不能为空！");
            return false;
        }
        if(title == "添加指标"){
            var response = createdatatype(name,type);
            var responseObject  = JSON.parse(response);
            if(responseObject.errCode != "success"){
                alert("添加指标信息失败！");
                return false;
            }else{
                var indicatorObject = new Object();
                indicatorObject.id = responseObject.poluFamilyId;
                indicatorObject.name = name;
                indicatorObject.poluType = type;
                var indicatorJsonStr = JSON.stringify(indicatorObject);
                var length = $("#indicatorTable tbody tr").length + 1;
                addRow(indicatorJsonStr,length,name,type);
            }
        }else{
            /*var response = updated(name,type);
            var responseObject  = JSON.parse(response);
            if(responseObject.errCode != "sucess"){
                alert("修改指标信息失败！");
                return false;
            }*/
        }

    }
});