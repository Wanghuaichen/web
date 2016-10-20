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

    //定义全局变量
    var dialog,tipdialog, deltipdialog,
        tips = $(".validateTips");

    dialog = $("#add-app").dialog({
        autoOpen: false,
        height: 280,
        width: 500,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = addorUpdateapp();
                if(response != false){
                    dialog.dialog("close");
                }
            },
            class:"sure",
        },{
            text:"取消",
            click:function(){
                dialog.dialog("close");
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
                funcPerm = appObject.funcPerm== undefined?new Array():appObject.funcPerm;
                if(del == "del"){
                    $("input[type=checkbox][name=checkbox]:checked").each(function () {
                        var attrId = $(this).attr("id");
                        if(attrId == "checkAll"){
                            return true;
                        }
                        var funcName = $(this).parent().parent().children("td").eq(3).text();
                        funcPerm.splice($.inArray(funcName,funcPerm),1);
                        $(this).parent().parent().remove();
                    });
                }else{
                    var funcName = del.parent().parent().children("td").eq(3).text();
                    funcPerm.splice($.inArray(funcName,funcPerm),1);
                    del.parent().parent().remove();
                }
                //构造功能列表参数
                var functionParm = "";
                for(var i=0;i<funcPerm.length;i++){
                    functionParm += funcPerm[i]+"|";
                }
                functionParm = functionParm.substring(0,functionParm.length-1);
                if(functionParm == ""){
                    functionParm = "null";
                }
                var object = new Object();
                object.funcPerm = functionParm;
                var response = JSON.parse(updateapp(appObject.id,appObject.seen,object));
                if(response.errCode != "success"){
                    alert("删除功能"+ functionParm +"失败！");
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
    /*添加应用信息*/
    $(".add").click(function () {
        $(".confirmMsg").html("");
        $("#appName").val("");
        dialog.dialog("open");
        dialog.dialog({title:"添加功能"});
        tips.text("添加功能信息");

    });
    /*更新应用信息*/
    $(".update").click(function () {
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 0 && length == 1){
            var obj = $("input[type=checkbox][name=checkbox]:checked");
            //给文本框赋值
            updateAppUi(obj);
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
    //通过cookie获取当前选中的应用信息
    var appObject = JSON.parse(getCookie("functionlist")),
        funcPerm = appObject.funcPerm== undefined?"":appObject.funcPerm,
        selectedFunctionName;
    fillRow(funcPerm);

    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#appTable tbody").empty();
        $("#appTable tbody").html("");
        for (var i = 0; i < parm.length; i++) {

            $("#appTable tbody").append("<tr id='functionList_"+(i+1)+"'>" +
                "<td style='display: none'>"+parm+"</td>" +
                "<td><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+(i+1)+"'/></td>" +
                "<td>"+(i+1)+"</td>" +
                "<td>"+parm[i]+"</td>" +
                "<td><a href='#' class='delApp tablelink'> 删除</a></td>" +
                "</tr>");

        }
        //表分页
        sorter.init("appTable",1);
    }

    //添加或修改功能信息
    function addorUpdateapp(){
        var title = $("#add-app").dialog("option","title");
        var functionName = $("#appName").val().trim();
        if(functionName == ""){
            $(".confirmMsg").html("功能名称不能为空！");
            return false;
        }
        funcPerm = appObject.funcPerm== undefined?new Array():appObject.funcPerm;
        if(title == "添加功能"){
            console.log("functionPerm="+funcPerm);
            //构造功能列表参数
            var functionParm = "";
            for(var k=0; k<funcPerm.length; k++){
                functionParm += funcPerm[k]+"|";
            }
            functionParm += functionName;
            var object = new Object();
            object.funcPerm = functionParm;

            var responsedata = JSON.parse(updateapp(appObject.id,appObject.seen,object));
            if(responsedata.errCode == "success"){
                funcPerm.push(functionName);
                appObject.funcPerm = funcPerm;
                var length = $("#appTable tbody tr").length + 1;
                $("#appTable tbody").append("<tr id='app"+length+"'>" +
                    "<td style='display: none'></td>" +
                    "<td><input name='checkbox' type='checkbox' id='checkbox_"+length+"'/></td>" +
                    "<td>"+length+"</td>" +
                    "<td>"+functionName+"</td>" +
                    "<td><a href='#' class='delApp tablelink'> 删除</a></td>" +
                    "</tr>");
            }else{
                alert("添加失败！");
            }

        }else{
            if(functionName == selectedFunctionName){
                $(".confirmMsg").html("功能名称没有做任何修改！");
                return false;
            }
            for(var i=0; i<funcPerm.length; i++){
                if(funcPerm[i] == selectedFunctionName){
                    funcPerm[i] = functionName;
                }
            }
            //构造功能列表参数
            var functionParm = "";
            for(var i=0;i<funcPerm.length;i++){
                functionParm+=funcPerm[i]+"|";
            }
            functionParm = functionParm.substring(0,functionParm.length-1);

            var object = new Object();
            object.funcPerm = functionParm;
            var response = JSON.parse(updateapp(appObject.id,appObject.seen,object));
            if(response.errCode == "success"){
                appObject.funcPerm = funcPerm;
                $("input[type=checkbox][name=checkbox]:checked").each(function () {
                    var tr = $(this).parent().parent();
                    tr.children("td").eq(3).text(functionName);
                });
            }else{
                alert("修改失败！");
            }
        }
    }
    /*修改功能界面信息*/
    function updateAppUi(obj){
        obj.each(function () {
            selectedFunctionName = $(this).parent().parent().children("td").eq(3).text();
            $("#appName").val(selectedFunctionName);
        });
        dialog.dialog("open");
        dialog.dialog({title:"修改功能"});
        tips.text("修改功能信息")
    }

});