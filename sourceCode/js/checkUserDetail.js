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
    var dialog,tipdialog, deltipdialog,userInfo,tips = $(".validateTips"),
        userTypeObject = new Object();  //用户类型中英文替换
    userTypeObject["root"] = "root";
    userTypeObject["superr"] = "超级管理员";
    userTypeObject["admin"] = "管理员";
    userTypeObject["common"] = "普通用户";
    dialog = $("#add-user").dialog({
        autoOpen: false,
        height: 540,
        width: 530,
        modal: true,
        buttons: [{
            text:"确定",
            click:function(){
                var response = addorUpdateUser();
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
                        var userId = $(this).parent().parent().children("td").eq(0).text();
                        var response = JSON.parse(deleteuser(userId));
                        if(response.errCode == "success") {
                            $(this).parent().parent().remove();
                        }else{
                            alert("删除用户失败！");
                        }
                    });
                }else{
                    var userId = del.parent().parent().children("td").eq(0).text();
                    var response = JSON.parse(deleteuser(userId));
                    if(response.errCode == "success"){
                        del.parent().parent().remove();
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
    /*更新用户信息*/
    $(".update").click(function () {
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 0 && length == 1){
            var object = $("input[type=checkbox][name=checkbox]:checked");
            updateuserui(object);
            $("#userName").attr("readonly",true);
            dialog.dialog("open");
            dialog.dialog({title:"修改子用户"});
            tips.text("修改子用户信息")
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
            $("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "userName"){
            $("#searchByName").css("display","inline");
            $("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "location"){
            $("#searchByAddress").css("display","inline");
            $("#searchByName").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "userType"){
            $("#searchByType").css("display","inline");
            $("#searchByName").css("display","none");
            $("#searchByAddress").css("display","none");
        }
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").val();
        if(selectType == "userName"){
            var userName = $("#searchByName").val().trim();
            if(userName == ""){
                alert("组织名称不能为空！");
                return false;
            }
            parm.userName = userName;
        }else if(selectType == "location"){
            var province = $("#search1 option:selected").text().trim();
            var city = $("#search2 option:selected").text().trim();
            var district = $("#search3 option:selected").text().trim();
            parm.location = new Object();
            if(province == "省份" && city == "地级市" && district == "市、区、县"){
                alert("省、市、区至少选择一种！");
                return false;
            }else if(province == "省份" && city == "地级市"){
                parm.location.disctrict = district;
            }else if(city == "地级市" && district == "市、区、县"){
                parm.location.province = province;
            }else if(province == "省份" && district == "市、区、县"){
                parm.location.city = city;
            }
        }else if(selectType == "userType"){
            var selectByType = $("#searchByType option:selected").val();
            parm.type = selectByType;
        }
        parm.faId = fatherUserInfo.id;
        fillRow(parm);
    });
    var fatherUserInfo = JSON.parse(getCookie("userselected")), //获取父账户信息
        currentPage = getCookie("userCurrentPage"); //获取父账户所在页面数

    setCookie("backCurrentPage",currentPage);
    getCookieUserInfo();
    //delCookie("userselected");
    if(userInfo.userId != fatherUserInfo.id){
        $(".update").css("display","none");
        $(".del").css("display","none");
    }
    var parm = new Object();
    parm.faId = fatherUserInfo.id;
    fillRow(parm);
    //给下拉框赋值
    createSelect();
    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#childUser tbody").empty();
        $("#childUser tbody").html("");
        var jsonStr = listuser(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.accountList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var userJsonstr = JSON.stringify(datas[i]);
                var username = datas[i]["userName"],
                    type = datas[i]["type"],
                    orgname = datas[i]["org"]== undefined?"":datas[i]["org"],
                    realname = datas[i]["realName"]== undefined?"":datas[i]["realName"],
                    mobile = datas[i]["mobile"]== undefined?"":datas[i]["mobile"],
                    appName = datas[i]["appName"] == undefined?"":datas[i]["appName"],
                    status = datas[i]["audit"] == "audited"?datas[i]["status"]:datas[i]["audited"];

                $("#childUser tbody").append("<tr id='user_"+(i+1)+"'>" +
                    "<td style='display: none'>"+datas[i]["id"]+"</td>" +
                    "<td><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+(i+1)+"'/></td>" +
                    "<td>"+(i+1)+"</td>" +
                    "<td>"+username+"</td>" +
                    "<td>"+userTypeObject[type]+"</td>" +
                    "<td>"+appName+"</td>" +
                    "<td>"+orgname+"</td>" +
                    "<td>"+realname+"</td>" +
                    "<td>"+mobile+"</td>" +
                    "<td>"+status+"</td>" +
                    //"<td><a href='../user/checkUserDetail.html' target='rightFrame' class='tablelink' onclick='"+setCookie('userselected',userJsonstr)+"'>详情</a> <a href='#' class='delUser tablelink'> 删除</a></td>" +
                    "</tr>");
            }
            //表分页
            sorter.init("childUser",2);
        }
    }
    //添加或修改用户信息
    function addorUpdateUser(){
        var title = $("#add-user").dialog("option","title");
        var userName = $("#userName").val().trim();
        var realName = $("#realname").val().trim();
        //用户类型
        var userType = $("input[name=accountTypeRadio]:checked").val();
        //组织对象
        var orgObject = $("#childorgList option:selected").val();
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
        }else if(mobile == ""){
            $(".confirmMsg").html("手机不能为空！");
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
        if(title == "添加子用户"){
        }else{
            var object = new Object();
            object.userName = userName;
            //object.type = userType;
            object.realName = realName;
            object.email = email;
            object.mobile = mobile;
            object.location = location;
            object.status = isEnable;
            if(userInfo.type == "root" || userInfo.type == "superr") {
                if (orgObject == "" || orgObject == undefined) {
                    $(".confirmMsg").html("请选择组织信息！");
                    return false;
                }
                var org = JSON.parse(orgObject);
                orgName = org.name;
                orgId = org.id;
                object.org = orgName;
                object.orgId = orgId;
            }
            var userId = $("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text();
            var responseupdate = updateuser(userId, object);
            if((JSON.parse(responseupdate)).errCode =="success"){
                $("input[type=checkbox][name=checkbox]:checked").each(function(){
                    var id = $(this).parent().parent().attr("id");
                    $("tr[id='"+id+"']").children("td").eq(3).text(userName);
                    $("tr[id='"+id+"']").children("td").eq(4).text(userTypeObject[userType]);
                    $("tr[id='"+id+"']").children("td").eq(6).text(orgObject.name);
                    $("tr[id='"+id+"']").children("td").eq(7).text(realName);
                    $("tr[id='"+id+"']").children("td").eq(8).text(mobile);
                    $("tr[id='"+id+"']").children("td").eq(9).text(isEnable);
                });
            }else{
                alert("修改用户信息失败！");
                return false;
            }
        }
    }
    /*判断当前用户是否是root或superr，并给组织列表赋值*/
    function createSelect(){
        $("#fatherName").text(fatherUserInfo.userName);
        $("#fatherType").text(fatherUserInfo.type);
        $("#fatherAppName").text(fatherUserInfo.appName);
        $("#fatherOrgName").text(fatherUserInfo.org);
        $("#fatherRealName").text(fatherUserInfo.realName);
        $("#fatherTel").text(fatherUserInfo.mobile);
        $("#fatherState").text(fatherUserInfo.status);
        if(userInfo.type == "common"){
            $(".add").css("display","none");
        }else if(userInfo.type == "admin" || userInfo.type == "superr"){
            $(".radio1").css("display","none");
            $(".radio2").css("display","none");
            $(".radio3").css("display","inline");
            $(".radio4").css("display","inline");
        }else{
            $(".radio3").css("display","none");
            $(".radio4").css("display","none");
            $(".radio1").css("display","inline");
            $(".radio2").css("display","inline");
        }
        if(userInfo.type == "root" || userInfo.type == "superr"){
            $(".orgselect").css("display","block");
            var parm = new Object();
            parm.all="";
            parm.orgId = userInfo.orgId;
            var jsonStr = listorg(parm);
            var responsedata = JSON.parse(jsonStr);
            //当返回状态是success
            if (responsedata.errCode == "success") {
                var datas = responsedata.orgList;
                for(var i = 0; i < datas.length; i++){
                    var orgStr = JSON.stringify(datas[i]);
                    var orgname = datas[i]["name"];

                    $("<option value='"+orgStr.replace(/\s/g, "")+"'>"+orgname+"</option>").appendTo($("#childorgList"));
                }
            }
        }else{
            $(".orgselect").css("display","none");
        }
    }
    //修改用户时，给控件赋值
    function updateuserui(obj){
        obj.each(function(){
            var userId = $(this).parent().parent().children("td").eq(0).text();
            var parm = new Object();
            parm.userId = userId;
            var responsedata = JSON.parse(listuser(parm));
            if (responsedata.total == 1) {
                var userList = responsedata.accountList;
                var userName = userList[0].userName;
                var realName = userList[0].realName == undefined?"":userList[0].realName;
                var type = userList[0].type == undefined?"":userList[0].type;
                var orgName = userList[0].org == undefined?"":userList[0].org;
                var mobile = userList[0].mobile == undefined?"":userList[0].mobile;
                var email = userList[0].email == undefined?"":userList[0].email;
                var province = userList[0].province== undefined?"":userList[0].province;
                var city = userList[0].city== undefined?"":userList[0].city;
                var district = userList[0].district== undefined?"":userList[0].district;
                var address = userList[0].address == undefined?"":userList[0].address;
                var status = userList[0].status == undefined?"":userList[0].status;

                $("#userName").val(userName);
                $("#password").val("");
                $("#realname").val(realName);
                //用户类型不做修改
                $("#userType").css("display","none");
                //$("input[name=accountTypeRadio][value="+ type +"]").attr("checked",true);
                //组织对象
                //$("#orgList option[text="+orgName+"]").attr("selected","selected");
                $("#childorgList option:contains("+ orgName +")").attr("selected","selected");
                //$("#usergroup option[value="+group+"]").attr("selected",true);
                $("#mobile").val(mobile);
                $("#email").val(email);
                $("#users1 option[value="+province+"]").attr("selected",true);
                change(1,users);
                $("#users2 option[value="+city+"]").attr("selected",true);
                change(2,users);
                $("#users3 option[value="+district+"]").attr("selected",true);
                $("#userdetailaddress").val(address);
                $("input[name=isEnableRadio][value="+status+"]").attr("checked",true);
            }
        });
    }
    //获取登录用户信息
    function getCookieUserInfo(){
        var jsonstr = getCookie("userInfo");
        console.log("cookie="+jsonstr);
        var cookieUserInforesponsedata = JSON.parse(jsonstr);
        userInfo = cookieUserInforesponsedata.account;
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
    $("#s1").change(function(){
        change(1,s);
    });
    $("#s2").change(function(){
        change(2,s);
    });
    $("#s3").change(function(){
        change(3,s);
    });
    $("#search1").change(function(){
        change(1,search);
    });
    $("#search2").change(function(){
        change(2,search);
    });
    $("#search3").change(function(){
        change(3,search);
    });
    $("#users1").change(function(){
        change(1,users);
    });
    $("#users2").change(function(){
        change(2,users);
    });
    $("#users3").change(function(){
        change(3,users);
    });

});