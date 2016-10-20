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
    var funcDialog = $("#funcDialog").dialog({
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
        var userSelected = $("#userlist option:selected").val();
        if(userSelected == "" || userSelected == undefined){
            alert("当前没有选择任何用户信息！");
            return;
        }
        var orglist = new Array();
        $("input[type=checkbox][name=checkbox2]").each(function () {
            var orgInfo = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            orglist.push(orgInfo);
        });
        leftOrRight("left",orglist);
    });
    $("#btnLeft").click(function(){
        var userSelected = $("#userlist option:selected").val();
        if(userSelected == "" || userSelected == undefined){
            alert("当前没有选择任何用户信息！");
            return;
        }
        var orglist = new Array();
        $("input[type=checkbox][name=checkbox2]:checked").each(function () {
            var orgInfo = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            orglist.push(orgInfo);
        });
        leftOrRight("left",orglist);
    });
    $("#btnRight").click(function(){
        var orglist = new Array();
        $("input[type=checkbox][name=checkbox1]:checked").each(function () {
            var orgInfo = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            orglist.push(orgInfo);
        });
        leftOrRight("right", orglist);
    });
    $("#btnRightAll").click(function(){
        var orglist = new Array();
        $("input[type=checkbox][name=checkbox1]").each(function () {
            var orgInfo = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            orglist.push(orgInfo);
        });
        leftOrRight("right",orglist);
    });
    $("#submit").click(function(){
        var userSelected = $("#userlist option:selected").val();
        if(userSelected == "" || userSelected == undefined){
            alert("当前没有选择任何用户信息！");
            return;
        }
        var userInfo = JSON.parse(userSelected),accessList = new Array(),count = 0;
        $("#userOrg tbody tr").each(function(){
            var orgStr = $(this).children().eq(0).text(),orgObj = JSON.parse(orgStr),
                user = Object(),item = new Object(),orgParam = new Object(),mgroups =new Array();
            if(orgObj.allocation == undefined){
                user.uid=userInfo.id;
                user.name=userInfo.userName;
                item.user=user;
                orgParam.uId=orgObj.id;
                orgParam.name=orgObj.name;
                mgroups.push("all");
                item.org=orgParam;
                item.mgroups = mgroups;
                //item.mgroups=mgroups;
                accessList.push(item);
                var responseObj = JSON.parse(resaccessCreate(accessList));
                if(responseObj.errCode == "success"){ //如果创建成功则加属性allocation
                    var resaccess = new Object(),resOrg = new Object();
                    resOrg.id = orgObj.id;resOrg.name=orgObj.name;
                    resaccess.id = responseObj.id;
                    resaccess.user = user;
                    resaccess.org = resOrg;
                    resaccess.allocation = true;
                    $(this).children().eq(0).text(JSON.stringify(resaccess));
                }else{ //移除左边数据，同时在右边添加组织信息
                    $(this).remove();
                    addrightrow(0,orgObj.id,JSON.stringify(orgObj),orgObj.name);
                }
            }
        });
        for(var i in delArray){
            var resaccess =delArray[i];
            var responseObj = JSON.parse(resaccessDelete(resaccess.id));
            if(responseObj.errCode != "success"){ //如果删除失败，左边数据添加回来，右边数据清除
                addleftrow(0,delArray[i],resaccess["org"]["name"]);
                $("#"+resaccess["id"]).remove();
            }
        }
        sorter.init("userOrg",0);
        sorter.size(5);

        allTableSorter.init("allOrg",0);
        allTableSorter.size(5);
    });
    var orgAllList = new Object(),delArray = new Array();
    //给下拉框赋值
    createOrgSelect();
    //右边表填充数据
    function fillAllRow(orgList) {
        for(var i in orgList){
            if(orgList[i] != undefined){
                var orgInfo = JSON.parse(orgList[i]);
                addrightrow((i+1),orgInfo.id,orgList[i],orgInfo.name);
            }
        }
        if($("#allOrg").length != 0){
            allTableSorter.init("allOrg",0);
            allTableSorter.size(5);
        }
    }
    /** 添加左边用户应用*/
    function addleftrow(length,orgInfo,orgName){
        var detailId = "detail"+length;
        $("#userOrg tbody").append("<tr id='app_"+length+"'>" +
            "<td style='display: none'>"+orgInfo+"</td>" +
            "<td><input name='checkbox1' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td>"+orgName+"</td>" +
            //"<td><a href='#' class='tablelink' id='"+detailId+"'>查看功能权限</a></td>" +
            "</tr>");
    }
    /** 添加右边所有应用*/
    function addrightrow(length,trId,orgInfo,orgname){
        $("#allOrg tbody").append("<tr id='"+trId+"'>" +
            "<td style='display: none'>"+orgInfo+"</td>" +
            "<td><input name='checkbox2' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td>"+orgname+"</td>" +
            "</tr>");
    }
    //只填充某一个用户下面的系统（左边表）
    function fillUserRow() {
        //清空左边表数据
        $("#userOrg tbody").empty();
        $("#userOrg tbody").html("");
        //清空右边表数据
        $("#allOrg tbody").empty();
        $("#allOrg tbody").html("");
        var userInfoSelected = $("#userlist option:selected").val();
        if(userInfoSelected != "" && userInfoSelected != undefined){
            var userInfo = JSON.parse(userInfoSelected),unallocated = new Object();
            var userId = userInfo.id;
            var responsedata = JSON.parse(resaccessList(userId));
            unallocated = JSON.parse(JSON.stringify(orgAllList));
            //当返回状态是success的时候才去填充表数据
            if (responsedata.errCode == "success") {
                var alldatas = responsedata.resultList;
                for(var i in alldatas){
                    var resaccess = alldatas[i],
                        orgInfo = resaccess["org"],
                        orgName = orgInfo.name,
                        orgId = orgInfo.id;
                    resaccess.allocation = true;
                    addleftrow((i+1),JSON.stringify(resaccess),orgName);
                    if(unallocated[orgId] != undefined){
                        unallocated[orgId] = undefined;
                    }
                }
                if(responsedata.total != 0){
                    sorter.init("userOrg",0);
                    sorter.size(5);
                }
            }
            fillAllRow(unallocated);
        }else{
            fillAllRow(orgAllList);
        }
    }
    /*给组织下拉框赋值*/
    function createOrgSelect(){
        var parm = new Object();
        parm.all="";
        var responsedata = JSON.parse(listorg(parm));
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for(var i = 0; i < datas.length; i++){
                var type = datas[i]["type"],
                    orgIdInfo = JSON.stringify(datas[i]),
                    orgId = datas[i]["id"],
                    orgname = datas[i]["name"];
                orgAllList[orgId] = orgIdInfo;
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
        var responsedata = JSON.parse(listuser(parm));
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
    function leftOrRight(obj,orgList){
        var userSelected = $("#userlist option:selected").val();
        //判断当前是否有用户被选
        if(userSelected != "" && userSelected != undefined){
            var userInfo = JSON.parse(userSelected);

            //循环需要左移或右移的应用对象
            for(var i=0; i<orgList.length; i++){
                var orgInfo = JSON.parse(orgList[i]); //默认为org，有allocation属性的是resaccess
                if(orgInfo.allocation == undefined){
                    if(obj == "left"){
                        addleftrow((i+1),orgList[i],orgInfo.name);
                    }else{
                        addrightrow((i+1),orgInfo.id,orgList[i],orgInfo.name);
                    }
                }else{
                    var org = orgInfo.org;
                    if(obj == "left"){
                        addleftrow((i+1),orgList[i],org.name);
                    }else{
                        delArray.push(orgInfo);
                        addrightrow((i+1),orgInfo.id,orgList[i],org.name);
                    }
                }

                //var appObject = JSON.parse(jsonApp);
                //var appName = appObject.appName;
                //if(obj =="left") {
                //    var funcPermList = appObject.funcPerm,
                //        funcList="",permList_array = new Array();
                //    //构建该应用的功能和权限
                //    for(var k =0; k<funcPermList.length; k++){
                //        funcList += funcPermList[k]+"|";
                //        var permObject = new Object();
                //        permObject[funcPermList[k]] = "read";
                //        permList_array.push(permObject);
                //    }
                //    funcList = funcList.substring(0,funcList.length-1);
                //    updateUserAppnameAndPerm("create",userInfo,appName,funcList,permList_array,jsonApp);
                //}else if(obj == "right"){
                //    updateUserAppnameAndPerm("del",userInfo,appName,"","",jsonApp);
                //}
            }

            sorter.init("userOrg",0);
            sorter.size(5);

            allTableSorter.init("allOrg",0);
            allTableSorter.size(5);
        }else{
            alert("当前没有选择任何用户信息！");
            for(var i=0; i<orgList.length; i++){
                var length = i+1;
                var jsonApp = orgList[i];
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
            var rightlength = $("#allOrg tbody tr").length + 1;
            var leftlength = $("#userOrg tbody tr").length + 1;
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
