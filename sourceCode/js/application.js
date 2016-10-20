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

    //
    var dialog,tipdialog, deltipdialog,operatedialog,
        tips = $(".validateTips"),
        userInfo; //当前登录的用户信息

    dialog = $("#add-app").dialog({
        autoOpen: false,
        height: 350,
        width: 530,
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
                if(del == "del"){
                    $("input[type=checkbox][name=checkbox]:checked").each(function () {
                        var attrId = $(this).attr("id");
                        if(attrId == "checkAll"){
                            return true;
                        }
                        var appObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                        var response = JSON.parse(deleteapp(appObject.id));
                        if(response.errCode == "success"){
                            $(this).parent().parent().remove();
                        }else{
                            alert("删除应用" + appObject.appName +"失败！");
                        }

                    });
                }else{
                    var appObject = JSON.parse(del.parent().parent().children("td").eq(0).text());
                    var response = JSON.parse(deleteapp(appObject.id));
                    if(response.errCode == "success"){
                        del.parent().parent().remove();
                    }else{
                        alert("删除应用" + appObject.appName +"失败！");
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
        }],
    });
    operatedialog = $("#operateDialog").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text:"关闭",
            click:function(){
                operatedialog.dialog("close");
            },
            class:"sure",
        }],
    });
    /*添加应用信息*/
    $(".add").click(function () {
        $(".confirmMsg").html("");
        $("#appName").val("");
        dialog.dialog("open");
        dialog.dialog({title:"添加应用"});
        tips.text("添加应用信息");

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
    $("#orglist").change(function(){
        createUserSelect();

    });
    getuserInfo();
    var parm = new Object();
    parm.all = "";
    fillRow(parm);
    //给下拉框赋值
    //createOrgSelect();

    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#appTable tbody").empty();
        $("#appTable tbody").html("");
        var jsonStr = listapp(parm);
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
                    funcPerm = datas[i]["funcPerm"]== undefined?new Array():datas[i]["funcPerm"],
                    status = datas[i]["audit"] == "audited"?datas[i]["status"]:datas[i]["audited"],
                    moreId = "more"+(i+1),
                    newFuncPerm = new Array();
                //功能列表只显示前3个
                for(var j = 0;j< funcPerm.length; j++){
                    if(j == 3){
                        break;
                    }else{
                        newFuncPerm.push(funcPerm[j]);
                    }
                }

                $("#appTable tbody").append("<tr id='app_"+(i+1)+"'>" +
                    "<td style='display: none'>"+appJsonStr+"</td>" +
                    "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+(i+1)+"'/></td>" +
                    "<td style='width: 6%'>"+(i+1)+"</td>" +
                    "<td>"+appName+"</td>" +
                    "<td>"+creator+"</td>" +
                    "<td>"+type+"</td>" +
                    "<td>"+newFuncPerm+"<a href='../application/functionList.html' target='rightFrame' class='tablelink' id='"+moreId+"'>...更多</a> </td>" +
                    "<td><a href='#' class='delApp tablelink'> 删除</a></td>" +
                    "</tr>");
                $(document).on("click","#"+moreId,function(){
                    var appJsonStr = $(this).parent().parent().children("td").eq(0).text();
                    //operatedialog.dialog("open");
                    setCookie("functionlist",appJsonStr);

                });

            }
            //表分页
            sorter.init("appTable",2);
        }
    }

    //通过userId查找用户信息
    function findOrgUserId(userId){
        var parm = new Object();
        parm.userId = userId;
        var jsonStr = listuser(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var username = "";
            var datas = responsedata.accountList;
            for (var i = 0; i < datas.length; i++) {
                username = datas[i]["userName"] == undefined?"":datas[i]["userName"];
            }
            return username;
        }
    }
    //添加或修改应用信息
    function addorUpdateapp(){
        var title = $("#add-app").dialog("option","title");
        var appName = $("#appName").val().trim();
        var appType = $("#appType option:selected").val();
        var typename = $("#appType option:selected").text();
        var creatorId = userInfo.userId;
        var creatorName = userInfo.userName;
        //var creatorId = $("#userlist option:selected").val();
        //var creatorName = $("#userlist option:selected").text();
        if(appName == ""){
            $(".confirmMsg").html("应用名称不能为空！");
            return false;
        }
        if(title == "添加应用"){
            var responsedata = JSON.parse(createapp(creatorId,appType,appName,""));
            if(responsedata.errCode == "success"){
                var length = $("#appTable tbody tr").length + 1;
                var moreId = "more"+length;
                var appObject = new Object();
                appObject.id = responsedata.id;
                appObject.appName = appName;
                appObject.creator = creatorId;
                appObject.seen = appType;
                appObject.funcPerm = new Array();
                $("#appTable tbody").append("<tr id='app"+length+"'>" +
                    "<td style='display: none'>"+JSON.stringify(appObject)+"</td>" +
                    "<td><input name='checkbox' type='checkbox' id='checkbox_"+length+"'/></td>" +
                    "<td>"+length+"</td>" +
                    "<td>"+appName+"</td>" +
                    "<td>"+creatorName+"</td>" +
                    "<td>"+typename+"</td>" +
                    "<td><a href='../application/functionList.html' target='rightFrame' class='tablelink' id='"+moreId+"'>...更多</a> </td>" +
                    "<td><a href='#' class='delApp tablelink'> 删除</a></td>" +
                    "</tr>");
                $(document).on("click","#"+moreId,function(){
                    var appJsonStr = $(this).parent().parent().children("td").eq(0).text();
                    //operatedialog.dialog("open");
                    setCookie("functionlist",appJsonStr);
                });
            }else{
                alert("添加失败！");
                return false;
            }
        }else{

            var appObject = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
            var object = new Object();
            object.appName = appName;
            object.creator = creatorId;

            var response = JSON.parse(updateapp(appObject.id,appType,object));
            if(response.errCode == "success"){
                appObject.appName = appName;
                appObject.creator = creatorId;
                appObject.seen = appType;
                $("input[type=checkbox][name=checkbox]:checked").each(function () {
                    var tr = $(this).parent().parent();
                    tr.children("td").eq(0).text(JSON.stringify(appObject));
                    tr.children("td").eq(3).text(appName);
                    tr.children("td").eq(4).text(creatorName);
                    tr.children("td").eq(5).text(typename);
                });
            }else{
                alert("修改失败！");
                return false;
            }
        }
    }
    /*给创建组织下拉框赋值*/
    function createOrgSelect(){
        var parm = new Object();
        parm.all="";
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for(var i = 0; i < datas.length; i++){
                var type = datas[i]["id"];
                //只显示运营商组织
                if(type == "运营商"){
                    var orgId = datas[i]["id"];
                    var orgname = datas[i]["name"];
                    $("<option value="+orgId+">"+orgname+"</option>").appendTo($("#orglist"));
                }
            }
            createUserSelect();
        }
    }
    /*给用户下拉列表赋值*/
    function createUserSelect(){
        $("#userlist").empty();
        var orgId = $("#orglist option:selected").val().trim();
        var parm = new Object();
        parm.orgId = orgId;
        var jsonStr = listuser(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var datas = responsedata.accountList;
            for(var i = 0; i < datas.length; i++){
                var userId = datas[i]["id"];
                var userName = datas[i]["userName"];
                $("<option value="+userId+">"+userName+"</option>").appendTo($("#userlist"));
            }
        }
    }
    /*修改应用界面信息*/
    function updateAppUi(obj){
        obj.each(function () {
            var appName = $(this).parent().parent().children("td").eq(3).text();
            var parm = new Object();
            parm.appName = appName;
            var responsedata = JSON.parse(listapp(parm));
            if (responsedata.total == 1) {
                $("#appName").val(appName);
                var appList = responsedata.appList;
                var appType = appList[0]["seen"];
                var accountId = appList[0]["creator"];
                $("#appType option[value="+appType+"]").attr("selected", true);

                //通过用户id查找组织信息
                //var userparm = new Object();
                //userparm.userId = accountId;
                //var responseUser = JSON.parse(listuser(userparm));
                //if (responseUser.total == 1) {
                //    var orgId = responseUser.accountList[0]["orgId"];
                //    $("#orglist option[value="+orgId+"]").attr("selected", true);
                //
                //   /* var orgcount=$("#orglist").options.length;
                //    for(var i=0;i<orgcount;i++){
                //        if($("#orglist").options[i].val == orgId)
                //        {
                //            $("#orglist").options[i].selected = true;
                //            break;
                //        }
                //    }*/
                //    createUserSelect();
                //    $("#userlist option[value="+accountId+"]").attr("selected", true);
                //    /*var usercount=$("#userlist").get(0).options.length;
                //    for(var i=0;i<usercount;i++){
                //        if($("#userlist").get(0).options[i].val == accountId)
                //        {
                //            $("#userlist").get(0).options[i].selected = true;
                //            break;
                //        }
                //    }*/
                //}
                dialog.dialog("open");
                dialog.dialog({title:"修改应用"});
                tips.text("修改应用信息")
            }else{
                alert("请重新登录，获取数据！");
            }
        });
    }
    //获取登录用户信息2
    function getuserInfo(){
        var cookie = getCookie("userInfo");
        console.log("cookie="+cookie);
        var cookieInfo = JSON.parse(cookie);
        userInfo = cookieInfo.account;
    }
});