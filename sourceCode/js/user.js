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
    $("#accessCheckAll").click(function(){
        if($(this).is(':checked')){//全选
            $("input[name='accessCheckbox']").each(function(){
                var checkbox = $(this);
                checkbox.prop('checked', true);
            });
        } else {//全不选
            $("input[name='accessCheckbox']").each(function(){
                $(this).prop('checked', false);
            });
        }
    });
    //定义常量
    var addOrUpdateuserDialog,//添加修改用户对话框
         tipdialog, //一般提示对话框
        deltipdialog, //删除提示对话框
        orgdialog, //添加组织对话框
        accessDialog, //添加组织对话框
        userInfo = (JSON.parse(getCookie("userInfo"))).account, //当前登录的用户信息
        resetpwddialog, //重置密码对话框
        userTypeObject = new Object(),  //用户类型中英文替换
        orgType = new Object(),  //组织类型中英文替换
        errCode = new Object(), //后台返回信息
        countIsOP = 0, //判断当前用户是否可执行删除、重置操作
        tips = $(".validateTips"), //添加修改用户提示信息
        accountListData = null, //查找账户信息的Json字符串
        selectedOrgInfo = null,
        accessMenuClickCount = 0,
        userAccessList,
        sortArray = new Object(); //存放已经排序的组织信息
        //orgBranch = new Object(); //存放子组织的信息
    userTypeObject["root"] = "root";
    userTypeObject["superr"] = "超级管理员";
    userTypeObject["admin"] = "管理员";
    userTypeObject["common"] = "普通用户";

    errCode["hasSubAccount"] = "该账户下还有子账户，请先删除子账户信息！";
    addOrUpdateuserDialog = $("#add-user").dialog({
        autoOpen: false,
        height: 540,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = addorUpdateUser();
                if(response != false){
                    addOrUpdateuserDialog.dialog("close");
                }
            },
            class:"sure",
        },{
            text:"取消",
            click:function(){
                addOrUpdateuserDialog.dialog("close");
            },
            class:"cancel",
        }],
        close: function () {
            initOrUpdateOrgInfo();
            $(".confirmMsg").html("");
        }
    });
    resetpwddialog = $("#resetpwd").dialog({
        autoOpen: false,
        height: 340,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = updatepwd();
                if(response != false){
                    resetpwddialog.dialog("close");
                }
            },
            class:"sure",
        },{
            text:"取消",
            click:function(){
                resetpwddialog.dialog("close");
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
                var response;
                if(del == "del"){
                    $("input[type=checkbox][name=checkbox]:checked").each(function () {
                        var attrId = $(this).attr("id");
                        if(attrId == "checkAll"){
                            return true;
                        }
                        var userObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                        response = JSON.parse(deleteuser(userObject.id));
                        if(response.errCode == "success"){
                            $(this).parent().parent().remove();
                        }else{
                            alert("删除用户失败！原因："+(errCode[response.errCode]== undefined?response.errCode:errCode[response.errCode])+"!");
                        }
                    });
                }else if(del == "delOrg"){
                    var responseObj = JSON.parse(deleteorg(selectedOrgInfo.id));
                    if(responseObj.errCode == "success"){
                        //需要更新左边菜单列表
                        $("#"+selectedOrgInfo.id).remove();
                    }else{
                        alert("删除组织:"+selectedOrgInfo.name+" 失败！原因："+(responseObj.errCode)+"!");
                    }
                }else{
                    var userObject = JSON.parse(del.parent().parent().children("td").eq(0).text());
                    response = JSON.parse(deleteuser(userObject.id));
                    if(response.errCode == "success"){
                        del.parent().parent().remove();
                    }else{
                        alert("删除用户失败！原因："+(errCode[response.errCode]== undefined?response.errCode:errCode[response.errCode])+"!");
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
    orgdialog = $("#add-org").dialog({
        autoOpen: false,
        height: 450,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = addOrUpdateOrg();
                if(response != false){
                    orgdialog.dialog("close");
                    var orgObj = JSON.parse(response);
                    if(orgObj.isCreate){

                        if($("#"+selectedOrgInfo.id+" ul").length == 0){
                            selectedOrgInfo.bflag = "branch";
                            $("#"+selectedOrgInfo.id).attr("value",JSON.stringify(selectedOrgInfo));
                            var ulStr="<ul class='child'></ul>";
                            $(ulStr).appendTo($("#"+selectedOrgInfo.id));
                            $("#"+selectedOrgInfo.id).children("a:first").css({background:"url(../images/list.gif) no-repeat left center"});
                            clickEvent(selectedOrgInfo.id,"orgMenu");
                        }
                        var param = new Object();
                        param.all = "";
                        param.scope = "me";
                        param.orgId = orgObj.id;
                        listOrgMenu(selectedOrgInfo.id,param);

                    }else{
                        var type = orgObj.type;
                        var liStr = "";
                        if(type == "operator"){
                            liStr += "<img src='../images/yunyingshang.min.png'>";
                        }else if(type == "envProtectAgency"){
                            liStr += "<img src='../images/huanbaoju.min.png'>";
                        }else if(type == "deviceProvider"){
                            liStr += "<img src='../images/deviceprovider.min.png'>";
                        }else if(type == "factory"){
                            liStr += "<img src='../images/factory.min.png'>";
                        }else{
                            liStr += "<img src='../images/factory.min.png'>";
                        }
                        $("#"+orgObj.id+" img:first").remove();
                        $("#"+orgObj.id+" a:first").text(orgObj.name);
                        $("#"+orgObj.id +" a:first").prepend(liStr);
                        $("#"+orgObj.id).attr("value",JSON.stringify(orgObj));
                    }
                }
            },
            class:"sure",
            id:"addorg"
        },{
            text:"取消",
            click:function(){
                orgdialog.dialog("close");
            },
            class:"cancel",
        }],
        close:function(){
            initOrUpdateOrgInfo();
            $("#unitname").val("");
            $("#unittype option:first").attr("selected",true);
            $("#linkman").val("");
            $("#professional option:first").attr("selected",true);
            $("#stuffs").val("");
            $("#phone").val("");
            $(".confirmMsg").html("");
        }
    });
    accessDialog = $("#accessDialog").dialog({
        autoOpen: false,
        height: 450,
        width: 530,
        modal: true,
        buttons: [{
            text:"应用",
            click:function(){
                var userInfoSelected = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
                $("input[name='accessCheckbox']").each(function(){
                    var orgObj = JSON.parse($(this).parent().attr("value")),createParam = new Array(),delParam = new Array();
                    if($(this).is(":checked") && orgObj.allocation == undefined){
                        var user = new Object(),item = new Object(),orgParam = new Object(),mgroups = "all";
                        user.uid=userInfoSelected.id;
                        user.name=userInfoSelected.userName;
                        item.user=user;
                        orgParam.uId=orgObj.id;
                        orgParam.name=orgObj.name;
                        item.org=orgParam;
                        item.mgroups = mgroups;
                        //item.mgroups=mgroups;
                        createParam.push(item);
                        var responseObj = JSON.parse(resaccessCreate(createParam));
                        if(responseObj.errCode != "success"){
                            $(this).removeAttr("checked");
                            alert("授权："+orgObj.name+"失败！原因："+responseObj.errCode);
                        }
                    }else if(!$(this).is(":checked") && orgObj.allocation != undefined){
                        var resaccess = JSON.parse(userAccessList[orgObj.id]);
                        var responseObj = JSON.parse(resaccessDelete(resaccess.id));
                        if(responseObj.errCode != "success"){
                            $(this).attr("checked",true);
                            alert("取消授权："+orgObj.name+"失败！原因："+responseObj.errCode);
                        }
                    }
                });
                accessDialog.dialog("close");
            },
            class:"sure",
            id:"addorg"
        },{
            text:"取消",
            click:function(){
                accessDialog.dialog("close");
            },
            class:"cancel"
        }],
        close:function(){
            $("#accessMenu").find("ul").remove();
        }
    });
    /*添加用户信息*/
    $(".add").click(function () {
        if(isSelectedOrg() != false){
            $(".confirmMsg").html("");
            $("#passwordli").css("display","block");
            $("#confirmpwdli").css("display","block");
            $("#userName").attr("readonly",false);

            $("#userName").val("");
            $("#realname").val("");
            $("#passwordli").val("");
            $("#confirmpwdli").val("");
            $("#mobile").val("");
            $("#email").val("");

            var province=selectedOrgInfo.location.province;
            var city=selectedOrgInfo.location.city;
            var district=selectedOrgInfo.location.district;
            var address=selectedOrgInfo.location.address;
            $("#users1 option[value="+province+"]").attr("selected",true);
            change(1,users);
            $("#users2 option[value="+city+"]").attr("selected",true);
            change(2,users);
            $("#users3 option[value="+district+"]").attr("selected",true);
            $("#userdetailaddress").val(address);

            $("input[name=isEnableRadio][value='active']").attr("checked",true);
            addOrUpdateuserDialog.dialog("open");
            addOrUpdateuserDialog.dialog({title:"添加用户"});
            tips.text("添加用户信息")
        }
    });
    /*重置密码*/
    $(".resetpwd").click(function () {

        $(".resetconfirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 0 && length == 1){
            var resetUser = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
            if(resetUser.id != userInfo.userId){
                var resetresponse = resetuserpassword(resetUser.id);
                var resetres = JSON.parse(resetresponse);
                if(resetres.errCode == "success"){
                    alert("重置密码成功！");
                }else{
                    alert("重置密码失败！");
                }
            }else{
                resetpwddialog.dialog("open");
            }
        }else{
            $("#tip .tipright p").text("当前仅且需要选择一个用户信息！");
            tipdialog.dialog("open");
        }

    });
    /*更新用户信息*/
    $(".update").click(function () {
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 0 && length == 1){
            $("#passwordli").css("display","none");
            $("#confirmpwdli").css("display","none");
            //$("#group").css("display","none");

            var object = $("input[type=checkbox][name=checkbox]:checked");
            updateuserui(object);
            $("#userName").attr("readonly",true);
            addOrUpdateuserDialog.dialog("open");
            addOrUpdateuserDialog.dialog({title:"修改用户"});
            tips.text("修改用户信息")
        }else{
            $("#tip .tipright p").text("当前仅且需要选择一个用户信息！");
           tipdialog.dialog("open");
        }
    });
    //del one or more data
    $(".del").click(function () {
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length == 0){
            $("#tip .tipright p").text("当前没有选择任何用户信息！");
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

    $(".addOrg").click(function(){
        if(isSelectedOrg() != false){
            $("#ownerLi").css("display","none");
	    adjustUnitType(selectedOrgInfo.type);
            orgdialog.dialog({title: "添加组织"});
            tips.text("添加组织信息")
            orgdialog.dialog("open");
        }
    });
    $(document).on("click","input[name='checkbox']",function () {
        var attrId = $(this).attr("id");
        //判断当前是选择还是反选
        if($(this).is(":checked") && attrId != "checkAll"){
            //如果是选择则判断当前用户是否有权限删除
            var userObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var fathId = userObject.faId == undefined?userInfo.userId : userObject.faId;
            countIsOP ++;
            userIsOp(userObject);
        }else{
            var length = $("input[type=checkbox][name=checkbox]:checked").length;
            if(length == 0){
                countIsOP = 0;
                $(".update").css("display","inline");
                $(".del").css("display","inline");
                $(".resetpwd").css("display","inline");
            }else{
                if(countIsOP > 0){
                    countIsOP--;
                }
                userIsOp();
            }
        }
    });
    $(".updateOrg").click(function () {
        if(isSelectedOrg() != false){
            $("#ownerLi").css("display","block");
            updateOrgUI();
            orgdialog.dialog({title: "修改组织"});
            tips.text("修改组织信息");
            orgdialog.dialog("open");
        }
    });
    $(".delOrg").click(function () {
        if(isSelectedOrg() != false){
            var length = $("#userTable tbody tr").length;
            if(length !=0){
                alert("当前组织下有用户信息，不能删除！");
            }else{
                deltipdialog.dialog("option","_button","delOrg");
                deltipdialog.dialog("open");
            }
        }
    });
    $(".access").click(function(){
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if($("input:checkbox[id=checkAll]:checked").length != 0){
            length--;
        }
        if(length != 0 && length == 1){
            accessList();
            accessDialog.dialog("open");
            var count = 0,str = "";
            for(var i in userAccessList){
                var accessObj = JSON.parse(userAccessList[i]);
                str += accessObj.org.name+"、";
                count++;
            }
            tips.html("<h2>当前用户授权个数是："+count+";</h2><h2>分别是：" + str+"</h2><br/>");
            var param = new Object();
            param.all = "";
            param.scope = "me";
            accessTree("accessMenu",param);
        }else{
            $("#tip .tipright p").text("当前仅且需要选择一个用户信息！");
            tipdialog.dialog("open");
        }
    });
    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").val();
        if(selectType == "all"){
            $("#searchByName").css("display","none");
            //$("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
            $("#searchByState").css("display","none");
        }else if(selectType == "userName"){
            $("#searchByName").css("display","inline");
            //$("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
            $("#searchByState").css("display","none");
        }else if(selectType == "userType"){
            $("#searchByType").css("display","inline");
            $("#searchByName").css("display","none");
            $("#searchByState").css("display","none");
            //$("#searchByAddress").css("display","none");
        }else if(selectType == "userState"){
            $("#searchByState").css("display","inline");
            $("#searchByType").css("display","none");
            $("#searchByName").css("display","none");
        }
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").val();
        if(selectType == "all"){
            parm.all="";
        }else if(selectType == "userName"){
            var userName = $("#searchByName").val().trim();
            if(userName == ""){
                alert("用户名称不能为空！");
                return false;
            }
            if(accountListData != null){
                $("#userTable tbody").empty();
                $("#userTable tbody").html("");
                var length = accountListData.length, k = 0;
                for (var i = 0; i < length; i++) {
                    var userJsonstr = JSON.stringify(accountListData[i]);
                    var username = accountListData[i]["userName"],
                        type = accountListData[i]["type"] == undefined?"":userTypeObject[accountListData[i]["type"]],
                        orgname = accountListData[i]["org"]== undefined?"":accountListData[i]["org"],
                        realname = accountListData[i]["realName"]== undefined?"":accountListData[i]["realName"],
                        mobile = accountListData[i]["mobile"]== undefined?"":accountListData[i]["mobile"],
                        status = accountListData[i]["audit"] == "audited"?accountListData[i]["status"]:accountListData[i]["audited"],
                        appName = accountListData[i]["appName"] == undefined?"":accountListData[i]["appName"],
                        faId = accountListData[i]["faId"] == undefined?"":accountListData[i]["faId"];
                    if(userName != null &&!(new RegExp(userName).test(username))){
                        continue;
                    }
                    k++;
                    addUserTableRow(userJsonstr,k,username,type,appName,orgname,realname,mobile,status,faId);
                }
                //表分页
                sorter.init("userTable",2);
                return;
            }else{
                parm.userName = userName;
            }
        }else if(selectType == "userType"){
            var selectByType = $("#searchByType option:selected").val();
            parm.type = selectByType;
        }else if(selectType == "userState"){
            var selectByState = $("#searchByState option:selected").val();
            parm.status = selectByState;
        }
        fillRow(parm);
    });
    //检测用户可操作那些项
    function userIsOp(userObject){
        if(userObject != undefined){
            var fathId = userObject.faId == undefined?userInfo.userId : userObject.faId;
            if(!((userInfo.type == "root" || userInfo.userId == fathId) && userInfo.userName != userObject.username && userObject.type !="root")){
                $(".update").css("display","none");
                $(".del").css("display","none");
                $(".resetpwd").css("display","none");
            }
        }else{
            var count = 0;
            $("input[type=checkbox][name=checkbox]:checked").each(function () {
                if($(this).attr("id") == "checkAll"){
                    return true;
                }
                var userObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                var fathId = userObject.faId == undefined?userInfo.userId : userObject.faId;
                if(!((userInfo.type == "root" || userInfo.userId == fathId) && userInfo.userName != userObject.username && userObject.type !="root")){
                    count++;
                    $(".update").css("display","none");
                    $(".del").css("display","none");
                    $(".resetpwd").css("display","none");
                }
            });
            if(count == 0){
                $(".update").css("display","inline");
                $(".del").css("display","inline");
                $(".resetpwd").css("display","inline");
            }
        }
    }
    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#userTable tbody").empty();
        $("#userTable tbody").html("");
        var jsonStr = listuser(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            accountListData = responsedata.accountList;
            var length = accountListData.length;
            for (var i = 0; i < length; i++) {
                var userJsonstr = JSON.stringify(accountListData[i]);
                var username = accountListData[i]["userName"],
                    type = accountListData[i]["type"] == undefined?"":userTypeObject[accountListData[i]["type"]],
                    orgname = accountListData[i]["org"]== undefined?"":accountListData[i]["org"],
                    realname = accountListData[i]["realName"]== undefined?"":accountListData[i]["realName"],
                    mobile = accountListData[i]["mobile"]== undefined?"":accountListData[i]["mobile"],
                    status = accountListData[i]["audit"] == "audited"?accountListData[i]["status"]:accountListData[i]["audited"],
                    appName = accountListData[i]["appName"] == undefined?"":accountListData[i]["appName"],
                    faId = accountListData[i]["faId"] == undefined?"":accountListData[i]["faId"];

                    addUserTableRow(userJsonstr,(i+1),username,type,appName,orgname,realname,mobile,status,faId);
            }
            //表分页
            sorter.init("userTable",2);
            sorter.size(10);
            if(getCookie("backCurrentPage")!= null){
                sorter.transferToPage(Number(getCookie("backCurrentPage")));
                delCookie("backCurrentPage");
            }
        }
    }
    //添加用户表行
    function addUserTableRow(userJsonstr,length,username,type,appName,orgname,realname,mobile,status,faId){
        var detailId = "detail"+length;
        //不能删除当前登录用户、root类型用户
        if((userInfo.type == "root" || userInfo.userId == faId) && userInfo.userName != username && type !="root"){
            $("#userTable tbody").append("<tr id='user_"+length+"'>" +
                "<td style='display: none'>"+userJsonstr+"</td>" +
                "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
                "<td style='width: 6%'>"+length+"</td>" +
                "<td>"+username+"</td>" +
                "<td>"+type+"</td>" +
                "<td>"+appName+"</td>" +
                "<td style='display:none'>"+orgname+"</td>" +
                "<td style='display:none'>"+realname+"</td>" +
                "<td style='display:none'>"+mobile+"</td>" +
                "<td>"+status+"</td>" +
                "<td><a href='../user/checkUserDetail.html' target='rightFrame' class='tablelink' id='"+detailId+"'>详情</a> <a href='javascript:void(0)' class='delUser tablelink'> 删除</a></td>" +
                "</tr>");
        }else{
            $("#userTable tbody").append("<tr id='user_"+length+"'>" +
                "<td style='display: none'>"+userJsonstr+"</td>" +
                "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
                "<td style='width: 6%'>"+length+"</td>" +
                "<td>"+username+"</td>" +
                "<td>"+type+"</td>" +
                "<td>"+appName+"</td>" +
                "<td style='display:none'>"+orgname+"</td>" +
                "<td style='display:none'>"+realname+"</td>" +
                "<td style='display:none'>"+mobile+"</td>" +
                "<td>"+status+"</td>" +
                "<td><a href='../user/checkUserDetail.html' target='rightFrame' class='tablelink' id='"+detailId+"'>详情</a> </td>" +
                "</tr>");
        }
        $(document).on("click","#"+detailId,function(){
            var userJsonStr = $(this).parent().parent().children("td").eq(0).text();
            setCookie("userselected",userJsonStr);
            setCookie("userCurrentPage",$("#currentpage").text());
        });
    }

    //添加或修改用户信息
    function addorUpdateUser(){
        var title = $("#add-user").dialog("option","title");
        var userName = $("#userName").val().trim();
        var realName = $("#realname").val().trim();
        //用户类型
        var userType = $("input[name=accountTypeRadio]:checked").val();
        //组织对象
        //var orgObject = $("#orgList option:selected").val();
        //var usergroup = $("#usergroup option:selected").val();
        var mobile = $("#mobile").val().trim();
        var email = $("#email").val().trim();
        var province = $("#users1 option:selected").text().trim();
        var city = $("#users2 option:selected").text().trim();
        var district = $("#users3 option:selected").text().trim();
        var detailAddress = $("#userdetailaddress").val().trim();
        var isEnable = $("input[name=isEnableRadio]:checked").val();
        if(userName == ""){
            $(".confirmMsg").html("用户名称不能为空！");
            return false;
        }else if(realName == ""){
            $(".confirmMsg").html("真实姓名不能为空！");
            return false;
        }
        //else if(usergroup == ""){
        //    $(".confirmMsg").html("请选择用户所在组织！");
        //    return false;
        //}
        else if( !mobile.match(/^(\d{7,12})$/)){
            $(".confirmMsg").html("电话格式不正确，必须为7-12位数字");
            return false;
        }else if(email == ""){
            $(".confirmMsg").html("邮箱不能为空！");
            return false;
        }else if(province == "省份" || city == "地级市" || district == "市、区、县"){
            $(".confirmMsg").html("请正确选择用户所在地！");
            return false;
        } else if(detailAddress == ""){
            $(".confirmMsg").html("详细地址不能为空！");
            return false;
        }
        var location = new Object();
        location.province = province;
        location.city = city;
        location.district = district ;
        location.address = detailAddress;
        var response = "";
        if(title == "添加用户"){
            var password = $("#password").val().trim();
            var confirmpassword = $("#confirmpwd").val().trim();
            if(password == "" || confirmpassword==""){
                $(".confirmMsg").html("密码或确认密码不能为空！");
                return false;
            }else if(password != confirmpassword){
                $(".confirmMsg").html("密码与确认密码信息不一致！");
                return false;
            }
            var orgName = "",orgId="",kind = "";
            var finduserresponse = finduser(userName);
            var finduserresponseObject = JSON.parse(finduserresponse);
            if(finduserresponseObject.errCode == "failed"){
                $(".confirmMsg").html("用户名已经存在！");
                return false;
            }
            if(userInfo.type == "root" || userInfo.type == "superr"){
                orgName = selectedOrgInfo.name;
                orgId = selectedOrgInfo.id;
                kind = selectedOrgInfo.type;
                response = createuser(userName,password,userType,kind,realName,"","cywee",orgName,orgId,mobile,email,location,isEnable);
            }else{
                orgName = userInfo.org;
                orgId = userInfo.orgId;
                kind = userInfo.kind;
                if(orgName != undefined && orgId != undefined){
                    response = createuser(userName,password,userType,kind,realName,"","cywee",orgName,orgId,mobile,email,location,isEnable);
                }
            }
            var responseUserObject = JSON.parse(response);
            if(responseUserObject.errCode == "success"){
                var userObject = new Object();
                userObject.id = responseUserObject.userId;
                userObject.address = detailAddress;
                userObject.userName = userName;
                userObject.realName = realName;
                userObject.kind = kind;
                userObject.status = isEnable;
                userObject.audit = "audited";
                userObject.type = userType;
                userObject.org = orgName;
                userObject.city = city;
                userObject.orgId = orgId;
                userObject.email = email;
                userObject.faId = responseUserObject.userId;
                userObject.province = province;
                userObject.district = district;
                userObject.zone = "cywee";
                userObject.mobile = mobile;
                var userJsonstr = JSON.stringify(userObject);
                var length = $("#userTable tbody tr").length + 1;
                addUserTableRow(userJsonstr,length,userName,userTypeObject[userType],"",orgName,realName,mobile,isEnable,userInfo.userId);
            }else{
                alert("创建用户失败！原因："+responseUserObject.errCode);
                return false;
            }

        }else{
            var object = new Object(),kind = "";
            object.userName = userName;
            //object.type = userType;
            object.realName = realName;
            object.email = email;
            object.mobile = mobile;
            object.location = location;
            object.status = isEnable;
            var updateUser = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
            if(userInfo.type == "root" || userInfo.type == "superr") {
                orgName = selectedOrgInfo.name;
                orgId = selectedOrgInfo.id;
                object.org = orgName;
                object.orgId = orgId;
                object.kind = selectedOrgInfo.type;

                updateUser.org = orgName;
                updateUser.orgId = orgId;
                updateUser.kind = selectedOrgInfo.type;
            }
            var responseupdate = JSON.parse(updateuser(updateUser.id, object));
            if(responseupdate.errCode =="success"){
                updateUser.userName = userName;
                //updateUser.type = userType;
                updateUser.realName = realName;
                updateUser.email = email;
                updateUser.mobile = mobile;
                updateUser.email = email;
                updateUser.city = city;
                updateUser.province = province;
                updateUser.district = district;
                $("input[type=checkbox][name=checkbox]:checked").each(function(){
                    var id = $(this).parent().parent().attr("id");
                    $("tr[id='"+id+"']").children("td").eq(0).text(JSON.stringify(updateUser));
                    $("tr[id='"+id+"']").children("td").eq(3).text(userName);
                    $("tr[id='"+id+"']").children("td").eq(4).text(userTypeObject[userType]);
                    $("tr[id='"+id+"']").children("td").eq(6).text(selectedOrgInfo.name);
                    $("tr[id='"+id+"']").children("td").eq(7).text(realName);
                    $("tr[id='"+id+"']").children("td").eq(8).text(mobile);
                    $("tr[id='"+id+"']").children("td").eq(9).text(isEnable);
                });
            }else{
                alert("修改用户信息失败！原因："+responseupdate.errCode);
                return false;
            }
        }
    }
    //修改密码
    function updatepwd(){
        var password = $("#resetpassword").val().trim();
        var confirmpassword = $("#resetconfirmpwd").val().trim();
        if(password == "" || confirmpassword==""){
            $(".resetconfirmMsg").html("密码或确认密码不能为空！");
            return false;
        }else if(password != confirmpassword){
            $(".resetconfirmMsg").html("密码与确认密码信息不一致！");
            return false;
        }
        var object = new Object();
        object.password = password;
        var updateUser = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
        var responseupdate = JSON.parse(updateuser(updateUser.id, object));
        if(responseupdate.errCode =="success"){
            alert("修改密码成功！");
        }else{
            alert("修改密码失败！原因："+responseupdate.errCode);
        }
    }
    //弹出用户修改窗口，给对应控件赋值
    function updateuserui(obj){
        obj.each(function(){
            var userObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var parm = new Object();
            parm.userId = userObject.id;
            var userName = userObject.userName;
            var realName = userObject.realName == undefined?"":userObject.realName;
            var orgName = userObject.org == undefined?"":userObject.org;
            var mobile = userObject.mobile == undefined?"":userObject.mobile;
            var email = userObject.email == undefined?"":userObject.email;
            var province = userObject.province== undefined?"":userObject.province;
            var city = userObject.city== undefined?"":userObject.city;
            var district = userObject.district== undefined?"":userObject.district;
            var address = userObject.address == undefined?"":userObject.address;
            var status = userObject.status == undefined?"":userObject.status;

            $("#userName").val(userName);
            $("#password").val("");
            $("#realname").val(realName);
            //用户类型不做修改
            $("#userType").css("display","none");
            $("#mobile").val(mobile);
            $("#email").val(email);
            $("#users1 option[value="+province+"]").attr("selected",true);
            change(1,users);
            $("#users2 option[value="+city+"]").attr("selected",true);
            change(2,users);
            $("#users3 option[value="+district+"]").attr("selected",true);
            $("#userdetailaddress").val(address);
            $("input[name=isEnableRadio][value="+status+"]").attr("checked",true);
        });
    }
    //添加或修改组织数据处理
    function addOrUpdateOrg(){
        var title = $("#add-org").dialog("option", "title");
        var name = $("#unitname").val().trim();
        var type = $("#unittype option:selected").val().trim();
        var province = $("#s1 option:selected").text().trim();
        var city = $("#s2 option:selected").text().trim();
        var district = $("#s3 option:selected").text().trim();
        var detailAddress = $("#detailaddress").val().trim();

        var lnt = $("#lnt").val().trim()==""?0:$("#lnt").val().trim();
        var lat = $("#lat").val().trim()==""?0:$("#lat").val().trim();
        var linkman = $("#linkman").val().trim();
        var professional = $("#professional option:selected").text().trim();
        var stuffs = $("#stuffs").val().trim()==""?0:$("#stuffs").val().trim();
        var phone = $("#phone").val().trim();
        if(name == ""){
            $(".confirmMsg").html("单位组织名称不能为空！");
            return false;
        } else if(province == "省份" || city == "地级市" || district == "市、区、县"){
            $(".confirmMsg").html("请正确选择单位所在地！");
            return false;
        } else if(detailAddress == ""){
            $(".confirmMsg").html("单位详细地址不能为空！");
            return false;
        }else if(linkman == ""){
            $(".confirmMsg").html("单位联系人名称不能为空！");
            return false;
        }else if(isNaN(stuffs)){
            $(".confirmMsg").html("人数请输入数字!");
            return false;
        }else if(!phone.match(/^(\d{7,12})$/)){
            $(".confirmMsg").html("电话格式不正确，必须为7-12位数字");
            return false;
        }
        //var location_object = new Object();
        var location = new Object();
        location.province = province;
        location.city = city;
        location.district = district ;
        location.address = detailAddress;
        location.lnt = lnt;
        location.lat = lat;
        var loc_code = "9999";
        //var contact_object = new Object();
        var contact = new Object();
        contact.name = linkman;
        contact.phone = phone;

        if (title == "添加组织") {
            var response = JSON.parse(createorg(name,professional,type,location,loc_code,stuffs,contact,selectedOrgInfo.id));
            var errorcode = response.errCode;
            if(errorcode == "success"){
                //需要更新左边菜单列表
                var newOrg = new Object();
                newOrg.id = response.id;
                newOrg.location = location;
                newOrg.profession = professional;
                newOrg.name = name;
                newOrg.stuffs = stuffs;
                newOrg.type = type;
                newOrg.contact = contact;
                newOrg.isCreate = true;
                return JSON.stringify(newOrg);
            }else{
                alert("添加组织失败！原因："+errorcode);
                return false;
            }
        }else{
            var ownerStr = $("#owner").val();
            var orgObject = JSON.parse(JSON.stringify(selectedOrgInfo));
            var parm = new Object();
            if(ownerStr != "" && ownerStr != undefined){
                var ownerObj = new Object(),owner = JSON.parse(ownerStr);
                ownerObj.name = owner.userName;
                ownerObj.uid = owner.id;
                parm.owner = ownerObj;
                orgObject.owner=ownerObj;
            }
            if(type != orgObject.type){parm.type = type;orgObject.type=type;}
            if(professional != orgObject.profession ) {parm.prof = professional;orgObject.profession=professional;}
            if(stuffs != orgObject.stuffs){parm.stuffs = stuffs;orgObject.stuffs=stuffs;}
            if(phone != orgObject.contact.phone || linkman != orgObject.contact.name){parm.contact = contact;orgObject.contact=contact;}
            if(province != orgObject.location.province || city != orgObject.location.city
                ||district != orgObject.location.district || detailAddress != orgObject.location.address
                ||lnt != orgObject.location.lnt ||lat != orgObject.location.lat){
                parm.location = location;
                orgObject.location = location;
            }
            var response = JSON.parse(updateorg(name, orgObject.id, parm));
            if(response.errCode == "success"){
                if(selectedOrgInfo.name != name){
                    orgObject.name = name;
                    orgObject.isCreate = false;
                }
                selectedOrgInfo = orgObject;
                initOrUpdateOrgInfo();
                return JSON.stringify(orgObject);
            }else{
                alert("修改组织失败！原因："+ response.errCode);
                return false;
            }
        }
    }
    function adjustUnitType(type){
        $("#unittype").empty();
        if(type=="factory")
        {
            $("<option value="+orgType["factory"]+">"+orgType["factory"]+"</option>").appendTo($("#unittype"));
        }
        else if(type=="deviceProvider"){
            $("<option value="+orgType["factory"]+">"+orgType["factory"]+"</option>").appendTo($("#unittype"));
            $("<option value="+orgType["deviceProvider"]+">"+orgType["deviceProvider"]+"</option>").appendTo($("#unittype"));
        }
        else if(type=="operator")
        {
            $("<option value="+orgType["factory"]+">"+orgType["factory"]+"</option>").appendTo($("#unittype"));
            $("<option value="+orgType["deviceProvider"]+">"+orgType["deviceProvider"]+"</option>").appendTo($("#unittype"));
            $("<option value="+orgType["operator"]+">"+orgType["operator"]+"</option>").appendTo($("#unittype"));
            $("<option value="+orgType["maintenor"]+">"+orgType["maintenor"]+"</option>").appendTo($("#unittype"));
            $("<option value="+orgType["appuser"]+">"+orgType["appuser"]+"</option>").appendTo($("#unittype"));
        }
    }
    //弹出组织修改窗口，给对应控件赋值
    function updateOrgUI(){
        var contact = selectedOrgInfo.contact,
            ownerName = selectedOrgInfo.owner == undefined?"": selectedOrgInfo.owner.name;
        $("#unitname").val(selectedOrgInfo.name);
	    adjustUnitType(selectedOrgInfo.type);
        $("#unittype option[value="+selectedOrgInfo.type+"]").attr("selected",true);
        $("#linkman").val(contact==undefined?"":contact.name==undefined?"":contact.name);
        $("#professional option["+selectedOrgInfo.profession+"]").attr("selected",true);
        $("#stuffs").val(selectedOrgInfo.stuffs);
        $("#phone").val(contact==undefined?"":contact.phone==undefined?"":contact.phone);
        $("#owner").empty();
     //   $("<option></option>").appendTo($("#owner"));

        var parm = new Object();
        //parm.faId = userInfo.userId;
        parm.orgId = selectedOrgInfo.id;
        var responseObj = JSON.parse(listuser(parm));
        if(responseObj.errCode == "success"){
            accountListData = responseObj.accountList;
            var length = accountListData.length;
            for (var i = 0; i < length; i++) {
                var userJsonstr = JSON.stringify(accountListData[i]);
                var username = accountListData[i]["userName"];
                if(ownerName == username){
                    $("<option value='"+ userJsonstr+"' selected>"+ username +"</option>").appendTo($("#owner"));
                }else{
                    $("<option value='"+ userJsonstr+"'>"+ username +"</option>").appendTo($("#owner"));
                }
            }
        }
    }
    //当组织信息发生修改时需要更新默认控件的值
    function initOrUpdateOrgInfo(){
        var type = selectedOrgInfo.type,
            contact = selectedOrgInfo.contact,
            location = selectedOrgInfo.location,
            province = location == undefined?"":(location.province == undefined?"":location.province),
            city = location == undefined?"":(location.city == undefined?"":location.city),
            address = location == undefined?"":(location.address == undefined?"":location.address),
            district = location == undefined?"":(location.district == undefined?"":location.district),
            lnt = location == undefined?"":(location.lnt == undefined?"":location.lnt),
            lat = location == undefined?"":(location.lat == undefined?"":location.lat);
        //初始化页面组织信息
        $("#orgNameInfo").text(selectedOrgInfo.name);
        $("#typeInfo").text(orgType[type] == undefined?"":orgType[type]);
        $("#linkInfo").text(contact == undefined?"":(contact.name ==undefined?"":contact.name));
        $("#telInfo").text(contact == undefined?"":(contact.phone ==undefined?"":contact.phone));
        $("#lntInfo").text(lnt);
        $("#latInfo").text(lat);
        $("#addressInfo").text(province+city+district+address);
        //初始化弹出框信息
        $("#s1 option[value="+province+"]").attr("selected",true);
        change(1,s);
        $("#s2 option[value="+city+"]").attr("selected",true);
        change(2,s);
        $("#s3 option[value="+district+"]").attr("selected",true);
        $("#detailaddress").val(address);
        $("#lnt").val(lnt);
        $("#lat").val(lat);
    }
    //左边菜单赋值
    function listOrgMenu(orgId,param){
        var responseObj = JSON.parse(listorg(param));
        if(responseObj.errCode == "success" && responseObj.total != 0){
            if(orgId == "orgMenu"){
                var ulStr="<ul class='child'></ul>";
                $(ulStr).appendTo($("#"+orgId));
            }
            var orgList = responseObj.orgList;
            sortArray.operator = new Array();
            sortArray.deviceProvider = new Array();
            sortArray.envProtectAgency = new Array();
            sortArray.factory = new Array();
            sortArray.other = new Array();
            //按照运营商、排序
            for(var i in orgList){
                var orgStr = JSON.stringify(orgList[i]),
                    type  = orgList[i]["type"];
                if(type == "operator"){
                    sortArray.operator.push(orgStr);
                }else if(type == "envProtectAgency"){
                    sortArray.envProtectAgency.push(orgStr);
                }else if(type == "factory"){
                    sortArray.factory.push(orgStr);
                }else if(type == "deviceProvider"){
                    sortArray.deviceProvider.push(orgStr);
                }else{
                    sortArray.other.push(orgStr);
                }
            }
            for(var j in sortArray){
                for(var k in sortArray[j]){
                    var orgStr = sortArray[j][k],
                        orgObj = JSON.parse(orgStr),
                        id  = orgObj["id"],
                        type  = orgObj["type"],
                        name = orgObj["name"];
                    var liStr = "<li id='"+id+"' value='"+orgStr+"'><a href='#' class='treeMenu'>";
                    if(type == "operator"){
                        liStr += "<img src='../images/yunyingshang.min.png'>";
                    }else if(type == "envProtectAgency"){
                        liStr += "<img src='../images/huanbaoju.min.png'>";
                    }else if(type == "deviceProvider"){
                        liStr += "<img src='../images/deviceprovider.min.png'>";
                    }else if(type == "factory"){
                        liStr += "<img src='../images/factory.min.png'>";
                    }
                    
                    liStr += name+"</a></li>";
                    $(liStr).appendTo($("#"+orgId+" ul:first"));
                    $(document).on("click","#"+id+" a:first", function () {
                        var selectedOrg = $(this).parent().attr("value");
                        selectedOrgInfo = JSON.parse(selectedOrg);
                        initOrUpdateOrgInfo();
                        var parm = new Object(),orgParam = new Object();
                        //parm.faId = userInfo.userId;
                        parm.orgId = selectedOrgInfo.id;
                        //parm.all = "";
                        fillRow(parm);
                        orgParam.all = "";
                        orgParam.scope = "other";
                        orgParam.orgId = selectedOrgInfo.id;
                        if( $(this).parent().find("ul li").length == 0){
                            var liId = $(this).parent().attr("id");
                            listOrgMenu(liId,orgParam);
                        }
                    });
                    //判断当前是否有子组织
                    if(orgObj["bflag"] == "branch" ){
                        var ulStr="<ul class='child'></ul>";
                        $(ulStr).appendTo($("#"+id));
                        //$("#"+orgId+" ul:first").find("li").children("a").css({background:"url(../images/list.gif) no-repeat left center"});
                    }
                    clickEvent(id,"orgMenu");
                }
            }
            if(orgId == "orgMenu"){
                clickEvent("orgMenu","orgMenu");
                $("#"+orgId+" a:first").click();
            }
            if(param.scope == "me"){
                $("#"+orgId+" ul li a:first").click();
            }
        }
    }
    //添加click事件
    function clickEvent(liId,menuClass){
        $("#"+liId).not(":has(ul)").children("a").css({textDecoration:"none",background:"none"})
            .click(function(){
            //.one("click",function(){
                $("."+menuClass+" li").removeClass("active");
                $(this).parent("li").addClass("active");
            });
        if($("#"+liId).find("ul").length != 0){
            $("#"+liId).children("a:first").css({background:"url(../images/list.gif) no-repeat left center"})
                .click(function(e){
                    //.one("click",function(){
                    $("."+menuClass+" li").removeClass("active");
                    $(this).parent("li").addClass("active");
                    if($(this).next("ul").is(":hidden")){
                        $(this).next("ul").slideDown("slow");
                        if($(this).parent("li").siblings("li").children("ul").is(":visible")){
                            $(this).parent("li").siblings("li").find("ul").slideUp("1000");
                            $(this).parent("li").siblings("li:has(ul)").children("a").css({background:"url(../images/list.gif) no-repeat left center"})
                                .end().find("li:has(ul)").children("a").css({background:"url(../images/list.gif) no-repeat left center"});
                        }
                        $(this).css({background:"url(../images/clist.min.png) no-repeat left center"});
//                            return false;
                    }else{
                        $(this).next("ul").slideUp("normal");
//不用toggle()的原因是为了在收缩菜单的时候同时也将该菜单的下级菜单以后的所有元素都隐藏
                        $(this).css({background:"url(../images/list.gif) no-repeat left center"});
                        $(this).next("ul").children("li").find("ul").fadeOut("normal");
                        $(this).next("ul").find("li:has(ul)").children("a").css({background:"url(../images/list.gif) no-repeat left center"});
//                            return false;
                    }
                });
        }
    }
    //判断当前是否选择组织
    function isSelectedOrg(){
        if(selectedOrgInfo == null){
            $("#tip .tipright p").text("当前没有选中任何组织信息！");
            tipdialog.dialog("open");
            return false;
        }
    }
    //组织类型下拉框赋值
    function getOrgType(){
        var orgTypeListResponse = JSON.parse(dictionary("UserKinds"));
        var list = orgTypeListResponse.resultList;
        $("#unittype").empty();
        for(var i in list){
            var UserKindslist = list[i]["UserKinds"];
            for(var i in UserKindslist){
                var type = UserKindslist[i];
                $("<option value="+type+">"+type+"</option>").appendTo($("#unittype"));
                orgType[UserKindslist[i]]=UserKindslist[i];
            }

        }
    }
    //访问权限树结构
    function accessTree(accessTreeId,param){
        var responseObj = JSON.parse(listorg(param));
        if(responseObj.errCode == "success" && responseObj.total != 0){
            if(accessTreeId == "accessMenu"){
                var ulStr="<ul class='child'></ul>";
                $(ulStr).appendTo($("#"+accessTreeId));
            }
            var orgList = responseObj.orgList;
            sortArray.operator = new Array();
            sortArray.deviceProvider = new Array();
            sortArray.envProtectAgency = new Array();
            sortArray.factory = new Array();
            sortArray.other = new Array();
            //按照运营商、排序
            for(var i in orgList){
                var orgStr = JSON.stringify(orgList[i]),
                    type  = orgList[i]["type"];
                if(type == "operator"){
                    sortArray.operator.push(orgStr);
                }else if(type == "envProtectAgency"){
                    sortArray.envProtectAgency.push(orgStr);
                }else if(type == "factory"){
                    sortArray.factory.push(orgStr);
                }else if(type == "deviceProvider"){
                    sortArray.deviceProvider.push(orgStr);
                }else{
                    sortArray.other.push(orgStr);
                }
            }
            for(var j in sortArray){
                for(var k in sortArray[j]){
                    var orgStr = sortArray[j][k],
                        orgObj = JSON.parse(orgStr),
                        id  = orgObj["id"]+Math.floor(Math.random()*100+1),
                        type  = orgObj["type"],
                        name = orgObj["name"];
                    var checkBox = "<input type='checkbox' name='accessCheckbox'/>";
                    if(userAccessList[orgObj["id"]] != undefined){
                        checkBox = "<input type='checkbox' name='accessCheckbox' checked/>";
                        orgObj.allocation = true;
                        orgStr = JSON.stringify(orgObj);
                    }
                    if($("#accessCheckAll").is(':checked')){
                        checkBox = "<input type='checkbox' name='accessCheckbox' checked/>";
                    }
                    var liStr = "<li id='"+id+"' value='"+orgStr+"'>"+ checkBox +"<a href='#' class='treeMenu'>";
                    if(type == "operator"){
                        liStr +="<img src='../images/yunyingshang.min.png'>";
                    }else if(type == "envProtectAgency"){
                        liStr += "<img src='../images/huanbaoju.min.png'>";
                    }else if(type == "deviceProvider"){
                        liStr += "<img src='../images/deviceprovider.min.png'>";
                    }else if(type == "factory"){
                        liStr += "<img src='../images/factory.min.png'>";
                    }

                    liStr += name+"</a></li>";
                    $(liStr).appendTo($("#"+accessTreeId+" ul:first"));
                    $(document).on("click","#"+id+" a:first", function () {
                        var selectedOrgInfo = JSON.parse($(this).parent().attr("value"));
                        var orgParam = new Object();
                        orgParam.all = "";
                        orgParam.scope = "other";
                        orgParam.orgId = selectedOrgInfo.id;
                        if( $(this).parent().find("ul li").length == 0){
                            var liId = $(this).parent().attr("id");
                            accessTree(liId,orgParam);
                        }
                    });
                    //判断当前是否有子组织
                    if(orgObj["bflag"] == "branch" ){
                        var ulStr="<ul class='child'></ul>";
                        $(ulStr).appendTo($("#"+id));
                    }
                    clickEvent(id,"accessMenu");
                }
            }
            if(accessTreeId == "accessMenu" && accessMenuClickCount == 0){
                clickEvent("accessMenu","accessMenu");
                accessMenuClickCount++;
            }
            if(param.scope == "me"){
                $("#"+accessTreeId+" a:first").click();
                $("#"+accessTreeId+" ul li a:first").click();
            }
        }
    }
    //当前选择的用户授权
    function accessList(){
        userAccessList = new Object();
        var userInfoSelected = "";
        $('input[type=checkbox][name=checkbox]:checked').each(function() {
            //授权只能对一个用户操作，如果选中了checkAll则取消
            if($(this).attr("id") != "checkAll"){
                userInfoSelected = $(this).parent().parent().children("td").eq(0).text();
            }
        });
        if(userInfoSelected != "" && userInfoSelected != undefined){
            var userInfo = JSON.parse(userInfoSelected),unallocated = new Object();
            var userId = userInfo.id;
            var responsedata = JSON.parse(resaccessList(userId));
            //当返回状态是success的时候才去填充表数据
            if (responsedata.errCode == "success") {
                var alldatas = responsedata.resultList;
                for(var i in alldatas){
                    var resaccess = alldatas[i],
                        orgInfo = resaccess["org"],
                        orgName = orgInfo.name,
                        orgId = orgInfo.id;
                    userAccessList[orgId] = JSON.stringify(resaccess);
                }
            }
        }
    }
    var s = new Array();
    s.push("s1");
    s.push("s2");
    s.push("s3");
    setup(s);
    var users = new Array();
    users.push("users1");
    users.push("users2");
    users.push("users3");
    setup(users);
    var search = new Array();
    search.push("search1");
    search.push("search2");
    search.push("search3");
    setup(search);
    //从服务器获取所有组织数据
    var param = new Object();
    param.all = "";
    param.scope = "me";
    //param.orgId = userInfo.orgId;
    listOrgMenu("orgMenu",param);
    getOrgType();
    //根据用户类型控制可以创建哪几种子用户
    if(userInfo.type == "common"){
        $(".add").css("display","none");
    }else if(userInfo.type == "admin" || userInfo.type == "superr"){
        $(".radio1").css("display","none");
        $(".radio2").css("display","none");
        $(".radio3").css("display","inline");
        $(".radio4").css("display","inline");
        $("#radio3").attr("checked",true);
    }else{
        $(".radio3").css("display","none");
        $(".radio4").css("display","none");
        $(".radio1").css("display","none");
        $(".radio2").css("display","inline");
        $("#radio1").attr("checked",true);
    }
    $("#search1").change(function(){
        change(1,search);
    });
    $("#search2").change(function(){
        change(2,search);
    });
    $("#search3").change(function(){
        change(3,search);
    });
    $("#s1").change(function(){
        change(1,s);
    });
    $("#s2").change(function(){
        change(2,s);
    });
    $("#s3").change(function(){
        change(3,s);
    });
    $("#users1").change(function(){
        change(1,users);
    });
    $("#users2").change(function(){
        change(2,users);
    });
});