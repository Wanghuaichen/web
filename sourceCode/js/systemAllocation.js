/**
 * Created by admin on 2015/11/2.
 */
$(function () {
    $("#checkAll1").click(function(){
        if($(this).is(':checked')){//全选
            $("input[name='checkbox1']").each(function(){
                var checkbox = $(this);
                checkbox.prop('checked', true);
            });
        } else {//全不选
            $("input[name='checkbox1']").each(function(){
                $(this).prop('checked', false);
            });
        }
    });
    $("#checkAll2").click(function(){
        if($(this).is(':checked')){//全选
            $("input[name='checkbox2']").each(function(){
                var checkbox = $(this);
                checkbox.prop('checked', true);
            });
        } else {//全不选
            $("input[name='checkbox2']").each(function(){
                $(this).prop('checked', false);
            });
        }
    });
    var funcDialog;
    funcDialog = $("#funcDialog").dialog({
        autoOpen: false,
        height: 350,
        width: 530,
        modal: true,
        buttons: [{
            text:"提交",
            click:function(){
                var appName, funcList = "",
                    //权限数组
                    permList_array = new Array();

                $("#funcTable tbody tr").each(function(){
                    appName = $(this).children("td").eq(0).text();
                    var funcName = $(this).children("td").eq(2).text();
                    funcList += funcName + "|";
                    var isReadOrWrite = "";
                    $(this).children("td").children("input").each(function(){
                        if($(this).is(':checked')){
                            var value = $(this).val();
                            isReadOrWrite += value+"|";
                        }
                    });
                    //功能对象
                    var funcNameObject = new Object();
                    funcNameObject[funcName] = isReadOrWrite.substring(0,isReadOrWrite.length-1);
                    permList_array.push(funcNameObject);
                });
                var userSelected = $("#userlist option:selected").val();
                var userInfo = JSON.parse(userSelected);
                var option = funcDialog.dialog("option","update");
                var response;
                if(option == "true"){
                    response = JSON.parse(updateuserperm(userInfo.id, appName,funcList.substring(0,funcList.length-1),permList_array));

                }else{
                    response = JSON.parse(createuserperm(userInfo.id, appName,funcList,permList_array));
                }
                if(response.errCode != "success"){
                    alert("修改用户应用权限失败！");
                }
                funcDialog.dialog("close");
            },
            class:"sure",
            id:"funcsure"
        },{
            text:"关闭",
            click:function(){
                funcDialog.dialog("close");
            },
            class:"cancel",
        }]
    });
    $("#orglist").change(function(){
        createUserSelect();
    });
    $("#userlist").change(function(){
        fillUserRow();
    });
    $("#btnLeftAll").click(function(){
        var jsonApplist = new Array();
        $("input[type=checkbox][name=checkbox2]").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            jsonApplist.push(jsonApp);
        });
        leftOrRight("left",jsonApplist);
    });
    $("#btnLeft").click(function(){
        var jsonApplist = new Array();
        $("input[type=checkbox][name=checkbox2]:checked").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            jsonApplist.push(jsonApp);
        });
        leftOrRight("left",jsonApplist);
    });
    $("#btnRight").click(function(){
        var jsonApplist = new Array();
        $("input[type=checkbox][name=checkbox1]:checked").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            jsonApplist.push(jsonApp);
        });
        leftOrRight("right", jsonApplist);
    });
    $("#btnRightAll").click(function(){
        var jsonApplist = new Array();
        $("input[type=checkbox][name=checkbox1]").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            jsonApplist.push(jsonApp);
        });
        leftOrRight("right",jsonApplist);
    });

    //给下拉框赋值
    createOrgSelect();
    //右边表填充数据
    function fillAllRow(datas) {
        var length = datas.length;
        for (var i = 0; i < length; i++) {
            var appName = datas[i]["appName"],
            appObject = JSON.stringify(datas[i]);
            addrightrow((i+1),appObject,appName);
        }
    }
    /** 添加左边用户应用*/
    function addleftrow(length,jsonapp,appName){
        var detailId = "detail"+length;
        $("#userSystem tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+jsonapp+"</td>" +
            "<td><input name='checkbox1' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td>"+appName+"</td>" +
            "<td><a href='#' class='tablelink' id='"+detailId+"'>查看功能权限</a></td>" +
            "</tr>");
        $(document).on("click","#"+detailId,function(){
            //清空左边表数据
            $("#funcTable tbody").empty();
            $("#funcTable tbody").html("");
            var appJsonStr = $(this).parent().parent().children("td").eq(0).text();
            var appObject = JSON.parse(appJsonStr);
            funcDialog.dialog("open");
            var appName = appObject.appName;
            var userSelected = $("#userlist option:selected").val();
            var userInfo = JSON.parse(userSelected);
            var faId = userInfo.faId == undefined?userInfo.id:userInfo.faId;
            //超级管理员可看到所有用户的权限信息， 但只能修改自己创建用户的权限
            if((getuserInfo()).type == "root"){
                $("#funcsure").css("display","inline");
            }else if(faId == (getuserInfo()).userId){
                $("#funcsure").css("display","inline");
            }else{
                $("#funcsure").css("display","none");
            }
            //获取用户使用某应用的功能权限列表
            var userpermlistrespose = listuserperm(userInfo.id, appName);
            var userpermlist = JSON.parse(userpermlistrespose);
            if(userpermlist.errCode == "success"){
                funcDialog.dialog("option","update","true");
                //获取权限数组
                var permissionArray = userpermlist.permission;
                for(var k=0; k<permissionArray.length; k++){
                    var permission = permissionArray[k];
                    if(permission.appName == appName){
                        var permList = permission.permList;
                        for(var j=0; j<permList.length; j++){
                            var funclength = j+1,
                                permObject = JSON.parse(permList[j]);
                            for(var key in permObject){
                                var funcName = key, readorwrite = permObject[key], checkbox;
                                if(readorwrite == "read"){
                                    checkbox = "<input type='checkbox' name='rwcheckbox' checked='checked' value='read'>读<input type='checkbox' name='rwcheckbox' value='write'>写";
                                }else if(readorwrite == "write"){
                                    checkbox = "<input type='checkbox' name='rwcheckbox' value='read'>读<input type='checkbox' name='rwcheckbox' checked='checked'  value='write'>写";
                                }else{
                                    checkbox = "<input type='checkbox' name='rwcheckbox' checked='checked' value='read'>读<input type='checkbox' name='rwcheckbox' checked='checked'  value='write'>写";
                                }
                                $("#funcTable tbody").append("<tr id='app_"+funclength+"'>" +
                                    "<td style='display: none'>"+appName+"</td>" +
                                    "<td>"+funclength+"</td>" +
                                    "<td>"+funcName+"</td>" +
                                    "<td>"+checkbox+"</td>" +
                                    "</tr>");
                            }
                        }
                    }
                }

            }else if(userpermlist.errCode == "noItem"){
                funcDialog.dialog("option","update","false");
                var funcPerm = appObject.funcPerm;
                for(var i=0; i<funcPerm.length; i++){
                    var funclength = i+1;
                    var checkbox = "<input type='checkbox' name='rwcheckbox' checked='checked' value='read'>读<input type='checkbox' name='rwcheckbox' value='write'>写";
                    $("#funcTable tbody").append("<tr id='app_"+funclength+"'>" +
                        "<td style='display: none'>"+appName+"</td>" +
                        "<td>"+funclength+"</td>" +
                        "<td>"+funcPerm[i]+"</td>" +
                        "<td>"+checkbox+"</td>" +
                        "</tr>");
                }
            }
        });

    }
    /** 添加右边所有应用*/
    function addrightrow(length,jsonapp,appName){
        $("#allSystem tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+jsonapp+"</td>" +
            "<td><input name='checkbox2' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td>"+appName+"</td>" +
            "</tr>");
    }
    //只填充某一个用户下面的系统（左边表）
    function fillUserRow() {
        //清空左边表数据
        $("#userSystem tbody").empty();
        $("#userSystem tbody").html("");
        //清空右边表数据
        $("#allSystem tbody").empty();
        $("#allSystem tbody").html("");

        var listallparm = new Object();
        listallparm.all = "";
        var jsonStr = listapp(listallparm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var alldatas = responsedata.appList;
            var userInfoSelected = $("#userlist option:selected").val();
            if(userInfoSelected != "" && userInfoSelected != undefined){
                var userInfo = JSON.parse(userInfoSelected);
                var appNameArray = userInfo.appName == undefined?new Array():userInfo.appName;
                for (var i = 0; i < appNameArray.length; i++) {
                    var appName = appNameArray[i];
                    var parm = new Object();
                    parm.appName = appName;

                    var jsonStr = listapp(parm);
                    var responsedata = JSON.parse(jsonStr);
                    //当返回状态是success的时候才去填充表数据
                    if (responsedata.errCode == "success") {
                        for(var r=0; r<alldatas.length; r++){
                            if(alldatas[r]["appName"] == appName){
                                alldatas.splice(r,1);
                            }
                        }
                        addleftrow((i+1),JSON.stringify(responsedata.appList[0]),appName)
                    }
                }
            }
            fillAllRow(alldatas);
        }
    }
    /*给组织下拉框赋值*/
    function createOrgSelect(){
        var parm = new Object();
        parm.all="";
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for(var i = 0; i < datas.length; i++){
                var type = datas[i]["type"];
                //工厂类型的组织不显示
                if(type == "factory"){
                    continue;
                }
                var orgId = datas[i]["id"];
                var orgname = datas[i]["name"];
                $("<option value="+orgId+">"+orgname+"</option>").appendTo($("#orglist"));
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
                var userName = datas[i]["userName"];
                $("<option value="+JSON.stringify(datas[i]).replace(" ","")+">"+userName+"</option>").appendTo($("#userlist"));
            }
        }
        fillUserRow();
    }

    //左移或右移操作
    function leftOrRight(obj,jsonAppList){
        var userSelected = $("#userlist option:selected").val();
        //判断当前是否有用户被选
        if(userSelected != "" && userSelected != undefined){
            var userInfo = JSON.parse(userSelected);
            //循环需要左移或右移的应用对象
            for(var i=0; i<jsonAppList.length; i++){
                var jsonApp = jsonAppList[i];
                var appObject = JSON.parse(jsonApp);
                var appName = appObject.appName;
                if(obj =="left") {
                    var funcPermList = appObject.funcPerm,
                        funcList="",permList_array = new Array();
                    //构建该应用的功能和权限
                    for(var k =0; k<funcPermList.length; k++){
                        funcList += funcPermList[k]+"|";
                        var permObject = new Object();
                        permObject[funcPermList[k]] = "read";
                        permList_array.push(permObject);
                    }
                    funcList = funcList.substring(0,funcList.length-1);
                    updateUserAppnameAndPerm("create",userInfo,appName,funcList,permList_array,jsonApp);
                }else if(obj == "right"){
                    updateUserAppnameAndPerm("del",userInfo,appName,"","",jsonApp);
                }
            }
        }else{
            alert("当前没有选择任何用户信息！");
            for(var i=0; i<jsonAppList.length; i++){
                var length = i+1;
                var jsonApp = jsonAppList[i];
                var appObject = JSON.parse(jsonApp);
                var appName = appObject.appName;
                if(obj == "left"){
                    addrightrow(length,jsonApp,appName);
                }else{
                    addleftrow(length,jsonApp,appName);
                }
            }

            return false;
        }
    }
    /*先修改用户appName，成功后再修改权限信息*/
    function updateUserAppnameAndPerm(flag,userInfo,permApp,funcList,permList_array,jsonApp){
            var rightlength = $("#allSystem tbody tr").length + 1;
            var leftlength = $("#userSystem tbody tr").length + 1;
            var userParm = new Object();
            var appNameArray = userInfo.appName == undefined?new Array():userInfo.appName;
            var updateUserResponse = "";
            if(flag == "create"){
                //将新应用名称添加到用户应用数组中去
                appNameArray.push(permApp);
                var appName ="";
                //构建appName参数
                for(var name in appNameArray){
                    appName += appNameArray[name] +"|";
                }
                //去掉最后“|”字符
                userParm.appName= appName.substring(0,appName.length-1);
                //修改用户信息appName属性
                updateUserResponse = updateuser(userInfo.id, userParm);
                var updateResponse = JSON.parse(updateUserResponse);
                //修改用户信息成功以后，再创建用户应用权限
                if(updateResponse.errCode == "success"){
                    //调用创建用户权限接口
                    var createresponse = createuserperm(userInfo.id, permApp,funcList,permList_array);
                    if(JSON.parse(createresponse).errCode == "success"){
                        addleftrow(leftlength,jsonApp,permApp);
                    }else{
                        alert("左移应用"+permApp+"失败！");
                        addrightrow(rightlength,jsonApp,permApp);
                        //修改用户权限信息失败需要重新修改用户信息
                        appNameArray.splice(jQuery.inArray(permApp,appNameArray),1);
                        var appName ="";
                        for(var name in appNameArray){
                            appName += appNameArray[name] +"|";
                        }
                        userParm.appName= appName.substring(0,appName.length-1);
                        updateuser(userInfo.id, userParm);
                    }
                }else{
                    alert("修改用户应用"+permApp+"失败！");
                    addrightrow(rightlength,jsonApp,permApp);
                }
            }else{
                //用户appName数组中移除当前的应用名称
                //appNameArray.splice(jQuery.inArray(permApp,appNameArray),1);
                var appName ="";
                for(var name in appNameArray){
                    if(appNameArray[name] == permApp || appNameArray[name]=="0"){
                        continue;
                    }
                    appName += appNameArray[name] +"|";
                }
                userParm.appName= appName.substring(0,appName.length-1);
                updateUserResponse = updateuser(userInfo.id, userParm);
                var updateResponse = JSON.parse(updateUserResponse);
                if(updateResponse.errCode == "success"){
                    //删除用户权限信息
                    var delresponse = deleteuserperm(userInfo.id, permApp);
                    var delresponseObject = JSON.parse(delresponse);
                    if(delresponseObject.errCode == "success"){
                        addrightrow(rightlength,jsonApp,permApp);
                        appNameArray.splice(jQuery.inArray(permApp,appNameArray),1);
                    }else{
                        alert("右移应用"+permApp+"失败！");
                        addleftrow(leftlength,jsonApp,permApp);
                        var appName ="";
                        for(var name in appNameArray){
                            appName += appNameArray[name] +"|";
                        }
                        userParm.appName= appName.substring(0,appName.length-1);
                        updateuser(userInfo.id, userParm);
                    }
                }else{
                    alert("修改用户应用"+permApp+"失败！");
                    addleftrow(leftlength,jsonApp,permApp);
                }
            }
        userInfo.appName = appNameArray;
        $("#userlist option:selected").val(JSON.stringify(userInfo));
    }
    //获取登录用户信息
    function getuserInfo(){
        var cookie = getCookie("userInfo");
        console.log("cookie="+cookie);
        var cookieInfo = JSON.parse(cookie);
        var userInfo = cookieInfo.account;
        return userInfo;
    }
});
