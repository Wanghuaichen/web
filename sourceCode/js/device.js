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
        tipdialog, //提示信息对话框
        deltipdialog, //删除提示信息对话框
        userInfo,  //登录用户信息
        devType = null, //设备类型
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
        height: 480,
        width: 780,
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
        }],
        close: function( event, ui ) {
            recoveryUI();
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
                        var attrId = $(this).attr("id");
                        if(attrId == "checkAll"){
                            return true;
                        }
                        var deviceObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                        var response = JSON.parse(deletedevice(deviceObject.id));
                        if(response.errCode == "success"){
                            $(this).parent().parent().remove();
                        }else{
                            alert("删除设备"+ deviceObject.name +"失败！");
                        }
                    });
                }else{
                    var deviceObject = JSON.parse(del.parent().parent().children("td").eq(0).text());
                    var response = JSON.parse(deletedevice(deviceObject.id));
                    if(response.errCode == "success"){
                        del.parent().parent().remove();
                    }else{
                        alert("删除"+ deviceObject.name +"失败！");
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
        dialog.dialog("open");
        dialog.dialog({title:"添加设备"});
        tips.text("添加设备信息");
        $("#boxType").change();
    });
    //添加指标数据
    //$(".addData").click(function () {
    //    var length = $("input[type=checkbox][name=checkbox]:checked").length;
    //    if(length == 0){
    //        tipdialog.dialog("open");
    //    }else {
    //        addDataDialog.dialog("open");
    //    }
    //});
    /*更新设备信息*/
    $(".update").click(function () {
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if(length != 0 && length == 1){
            var object = $("input[type=checkbox][name=checkbox]:checked");
            updateDeviceUi(object);
            dialog.dialog("open");
            dialog.dialog({title:"修改设备"});
            tips.text("修改设备信息");
            $("#boxType").change();
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
    //$("#orglist").change(function(){
    //    createUserSelect();
    //});
    $(document).on("click",".deviceSubs",function(){
        var className = $(this).attr('class'), //获取该标签的classname
            plcClassNameArray = className.split(" "); //获取标签有几个classname
        var plcClassName = plcClassNameArray[1]; //获取当前是哪一个子plc
        var num = $("tr[class^='sub']").length;
        if(plcClassNameArray.length > 2){
            var isAddOrMinus = plcClassNameArray[2];
            if(isAddOrMinus == "addSub"){
                num++;
                var parm = "plcId"+num;
                $(this).parent().parent().before("<tr class='sub"+num+"'>"+
                    "<td class='deviceeven'><label>子设备Id</label></td>"+
                    "<td class='deviceodd'><input type='text' class='dfinput tinput' placeholder='子设备Id' id='"+parm+"' maxlength='19' min='19'/>"+
                    "</td>"+
                    "<td class='deviceeven'><label>子设备认证码</label></td>"+
                    "<td class='deviceodd'>" +
                    "<input type='text' class='dfinput' placeholder='子设备认证码' id='plcCheckCode"+num+"' maxlength='4' min='4' " +
                    "style='width:125px'/>"+
                    devTypeSelect(true,"subType"+num)+
                    "<div class='deviceSubs plc minus'><img src='../images/-.min.png' style='vertical-align:middle;'></div></td>"+
                    "</tr>");
                $("#"+parm).keyup(function(){
                    test(parm);
                });
            }else{
                $(this).parent().parent().remove();
            }
        }
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
    $("#boxType").change(function(){
        var type = $(this).find("option:selected").text();
        if(type == "cywee-c801" || type == "cywee-c802"){
            $(".SIMtr").css("display","");
            $(".k37tr").css("display","");
        }else{
            $(".SIMtr").css("display","none");
            $(".k37tr").css("display","none");
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
        $("#deviceTable tbody").empty();
        $("#deviceTable tbody").html("");
        if(listDeviceResponsedata != null && listDeviceResponsedata.errCode == "success"){
            var datas = listDeviceResponsedata.deviceList;
            var length = datas.length;
            var k = 0;
            for (var i = 0; i < length; i++) {
                var deviceJsonstr = JSON.stringify(datas[i]);
                var devicename = datas[i]["name"],
                    devId = datas[i]["devId"],
                    orgname = datas[i]["org"] == undefined ? "" : datas[i]["org"],
                    consumerName = datas[i]["account"] == undefined ? "" : datas[i]["account"]["name"],
                    state = datas[i]["state"] == undefined ? "" : datas[i]["state"],
                    desc = datas[i]["desc"] == undefined ? "" : datas[i]["desc"],
                    connState = datas[i]["connState"] == undefined ? "" : datas[i]["connState"],
                    checkCode = datas[i]["code"] == undefined ? "" : datas[i]["code"],
                    devType = datas[i]["type"];
                if(parm.name != "" &&!(new RegExp(parm.name).test(devicename))){
                    continue;
                }else if(parm.devId != "" &&!(new RegExp(parm.devId).test(devId))){
                    continue;
                }
                k++;
                addDeviceTableRow(k, deviceJsonstr, devId, devicename, checkCode,devType, connState, orgname, consumerName, state, desc);
            }
            //表分页
            sorter.init("deviceTable",2);
        }
    });
    //获取登录用户信息
    var jsonstr = getCookie("userInfo"),listDeviceResponsedata;
    var devTypeParam = new Object();
    console.log("cookie="+jsonstr);
    var responsedata = JSON.parse(jsonstr);
    userInfo = responsedata.account;
    if(userInfo.type=="superr" || userInfo.type=="root")
       devTypeParam.all = "";
    else
        devTypeParam.orgId = userInfo.orgId;
    var devTypeListResponse = JSON.parse(devtypeList(devTypeParam));
    var parm = new Object();
    if(userInfo.type == "root" || userInfo.type == "superr"){
        parm.all = "";
    }else{
        var account = new Object();
        account.name = userInfo.userName;
        parm.account = account;
    }
    fillRow(parm);
    //初始化下拉框信息
    createOrgSelect();
    devTypeSelect(false,"","");
    if(userInfo.type != "root" && userInfo.type != "superr" && userInfo.type != "admin"){
        $(".add").css("display","none");
        $(".update").css("display","none");
        $(".del").css("display","none");
    }else{
        $(".add").css("display","inline");
        $(".update").css("display","inline");
        $(".del").css("display","inline");
    }
    //给表填充数据
    function fillRow(parm) {
        //清空表数据
        $("#deviceTable tbody").empty();
        $("#deviceTable tbody").html("");
        var jsonStr = listdevice(parm);
        listDeviceResponsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (listDeviceResponsedata.errCode == "success" && listDeviceResponsedata.total != 0) {
            var datas = listDeviceResponsedata.deviceList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var deviceJsonstr = JSON.stringify(datas[i]);
                var devicename = datas[i]["name"],
                    devId = datas[i]["devId"],
                    orgname = datas[i]["org"]== undefined?"":datas[i]["org"],
                    consumerName = datas[i]["account"]== undefined?"":datas[i]["account"]["name"],
                    state = datas[i]["state"]== undefined?"":datas[i]["state"],
                    desc = datas[i]["desc"] == undefined?"":datas[i]["desc"],
                    connState = datas[i]["connState"] == undefined?"":datas[i]["connState"],
                    checkCode = datas[i]["code"] == undefined?"":datas[i]["code"];
                    devType = datas[i]["type"];

                    addDeviceTableRow((i+1),deviceJsonstr,devId,devicename,checkCode,devType,connState,orgname,consumerName,state,desc)
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
    function addDeviceTableRow(length,deviceJsonstr,devId,devicename,checkCode,devType,connState,orgname,consumerName,state,desc){
        var detailId = "detail"+length,
            mainState = connState.main,
            connStateTd = "<td></td>",
            stateContent;
        if(mainState == "on"){
            stateContent = "<img src='../images/status_ok.min.png'> ";
            var subs = connState.subs;
            for(var i in subs){
                var runState = subs[i];
                if(runState == "on"){
                    stateContent += "<img src='../images/status_ok.min.png'> ";
                }else{
                    stateContent += "<img src='../images/status_err.min.png'> ";
                }
            }
        }else{
            stateContent = "<img src='../images/status_err.min.png'>";
        }
        connStateTd = "<td>"+stateContent+"</td>";

        $("#deviceTable tbody").append("<tr id='device_"+length+"'>" +
            "<td style='display: none'>"+deviceJsonstr+"</td>" +
            "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
            "<td style='width: 6%'>"+length+"</td>" +
            "<td>"+devicename+"</td>" +
            "<td>"+devId+"</td>" +
            "<td>"+checkCode+"</td>" +
            "<td>"+devType+"</td>" +
            connStateTd +
            "<td>"+orgname+"</td>" +
         /*   "<td>"+consumerName+"</td>" +
            "<td>"+state+"</td>" +
            "<td>"+desc+"</td>" +*/
            "<td><a href='../devices/checkDeviceDetail.html' target='rightFrame' class='tablelink' id='"+detailId+"'>详情</a> <a href='javascript:void(0)' class='delUser tablelink'> 删除</a></td>" +
            "</tr>");
        $(document).on("click","#"+detailId, function () {
            var deviceJsonStr = $(this).parent().parent().children("td").eq(0).text();
            setCookie("deviceselected",deviceJsonStr);
            setCookie("deviceCurrentPage",$("#currentpage").text());
        });
    }
    //向数据库中添加或修改设备信息
    function addorUpdateDevice(){
        var title = $("#add-device").dialog("option","title");
        var deviceName = $("#deviceName").val().trim();
        var deviceId = ($("#deviceId").val().trim()).replace(/\s{1,}/g,"");
        var checkCode = $("#checkCode").val().trim();
        var factoryOrg = $("#factorylist option:selected").val();
        var boxType = $("#boxType option:selected").text();
        var des = $("#des").val().trim();
        var cardNum = $("#cardNum").val().trim();
        var cardExpire = $("#cardExpire").val().trim();
        var k37sn = $("#k37sn").val().trim();
        //var useuserId = $("#userlist option:selected").val();
        //var useuserName = $("#userlist option:selected").text();

        //是否启用
        var isEnable = $("input[name=radio]:checked").val();

        if(deviceName == ""){
            $(".confirmMsg").html("设备名称不能为空！");
            return false;
        }else if(deviceId == "" || !/^\d+$/.test(deviceId) || deviceId.length < 16){
            $(".confirmMsg").html("请正确输入设备id，格式为16位数字！");
            return false;
        }else if(checkCode == "" || checkCode.length < 4){
            $(".confirmMsg").html("请正确输入验证码，格式为4位数字或字母！");
            return false;
        }else if(factoryOrg == ""){
            $(".confirmMsg").html("请选择工厂信息，如果没有请联系管理员添加！");
            return false;
        }else if(des == ""){
            $(".confirmMsg").html("描述信息不能为空！");
            return false;
        }
        if( boxType == "cywee-c801" || boxType == "cywee-c802"){
            if(cardNum == ""){
                $(".confirmMsg").html("卡号信息不能为空！");
                return false;
            }else if(cardExpire == ""){
                $(".confirmMsg").html("卡号过期时间信息不能为空！");
                return false;
            }
            var result = cardExpire.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

            if (result == null){
                $(".confirmMsg").html("卡号过期时间格式不正确！");
                return false;
            }else{
                var d = new Date(result[1], result[3] - 1, result[4]);
                if(!(d.getFullYear() == result[1] && (d.getMonth() + 1) == result[3] && d.getDate() == result[4])){
                    $(".confirmMsg").html("卡号过期时间不符合日期规范,月：1-12，天：1-31！");
                    return false;
                }
            }
            var wcard = new Object();
            wcard.number = cardNum;
            wcard.expire = cardExpire;
        }

        var subs = [],//定义子设备数组
            plcIdArray = [];//存储id数组，用于判断id是否有重复
        var reStatus = true; //检查子设备信息是否准确
        $("tr[class^='sub']").each(function(){
            var plcIdValue = ($(this).children('td').eq(1).children().val().trim()).replace(/\s{1,}/g,"");
            var plcCheckCodeValue = $(this).children('td').eq(3).children().val().trim();
            var subSelect = $(this).children('td').eq(3).children().eq(1);
            var subType = subSelect.find("option:selected").text();
            if(!(plcIdValue !="" && plcCheckCodeValue != "") && !(plcIdValue =="" && plcCheckCodeValue == "")){
                $(".confirmMsg").html("子设备的Id "+plcIdValue+"和对应认证码 "+plcCheckCodeValue+"不能同时为空，需一一对应！");
                reStatus = false;
                return false;
            }else{
                if(plcIdValue =="" && plcCheckCodeValue == ""){
                    return true;
                }
                //if($.inArray(plcIdValue, plcIdArray) != -1){
                //    $(".confirmMsg").html("子设备的Id："+plcIdValue+"有重复！");
                //    return false;
                //}
                //plcIdArray.push(plcIdValue);
                var confirmcheckcode = Gen_Checksum(plcIdValue,plcIdValue.length);
                if(confirmcheckcode != plcCheckCodeValue){
                    console.log("正确验证码=" + confirmcheckcode);
                    $(".confirmMsg").html("子设备Id："+plcIdValue+"的验证码输入有误！");
                    reStatus = false;
                    return false;
                }else{
                    var plc = new Object();
                    plc.pid = plcIdValue;
                    plc.code = plcCheckCodeValue;
                    plc.type = subType;
                    subs.push(plc);
                }
            }
        });
        if(!reStatus){
            subs = [];plcIdArray = [];
            return false;
        }
        //for(var k=0;k<subLength;k++){
        //    var i = k + 1,
        //        plcId = "plcId"+ i,
        //        plcCheckCode = "plcCheckCode" +i;
        //    var plcIdValue = ($("#"+plcId).val().trim()).replace(/\s{1,}/g,"");
        //    var plcCheckCodeValue = $("#"+plcCheckCode).val().trim();
        //
        //}

        var confirmcheckcode = Gen_Checksum(deviceId,deviceId.length);
        if(confirmcheckcode != checkCode){
            console.log("正确验证码=" + confirmcheckcode);
            $(".confirmMsg").html("设备验证码输入有误！");
            return false;
        }
        var factory = JSON.parse(factoryOrg);

        var location = new Object();
        location.province = factory.location.province;
        location.city = factory.location.city;
        location.district = factory.location.district ;
        location.address = factory.location.address;
        location.lnt = factory.location.lnt == undefined?"":factory.location.lnt;
        location.lat = factory.location.lat == undefined?"":factory.location.lat;

        //var account = new Object();
        //account.uid = useuserId == undefined?"":useuserId;
        //account.name = useuserName;



        //添加或修改设备参数
        var object = new Object();
        object.code = checkCode;
        object.state = isEnable;
        object.desc = des;
        object.org = factory.name;
        object.orgId = factory.id;
        object.location = location;
        //object.account = account;
        object.wcard = wcard;
        if(subs.length != 0)object.subs = subs;
        object.type = boxType;
        if(k37sn != ""){
            object.k37sn = k37sn;
        }
        if(title == "添加设备"){
            var response = createdevice(deviceId,deviceName,object);
            var responseDeviceObject = JSON.parse(response);
            if(responseDeviceObject.errCode == "success"){
                object.id = responseDeviceObject.id;
                object.name = deviceName;
                object.devId = deviceId;
                object.creator = userInfo.id;
                var deviceJsonstr = JSON.stringify(object);
                var length = $("#deviceTable tbody tr").length + 1;
                addDeviceTableRow(length,deviceJsonstr,deviceId,deviceName,checkCode,boxType,"",factory.name,"",isEnable,des);
            }else{
                $(".confirmMsg").html("创建设备失败，"+ (errCode[responseDeviceObject.errCode] == undefined?responseDeviceObject.errCode:errCode[responseDeviceObject.errCode])
                    + "!");
                return false;
            }
        }else{
            object.name = deviceName;
            object.devId = deviceId;
            var updateDevice = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());

            var updateParm = new Object();
            var oldDeviceName = updateDevice.name== undefined?"":updateDevice.name;
            var oldDeviceId = updateDevice.devId== undefined?"":updateDevice.devId;
            var oldFactoryOrgName = updateDevice.org== undefined?"":updateDevice.org;
            var oldDes = updateDevice.desc== undefined?"":updateDevice.desc;
            var oldState = updateDevice.state== undefined?"":updateDevice.state;
            var oldK37sn = updateDevice.k37sn== undefined?"":updateDevice.k37sn;
            //var oldUseuserId = updateDevice.account == undefined?"":updateDevice.account.uid;
            var oldSubs = updateDevice.subs== undefined?"":updateDevice.subs;
            var oldType = updateDevice.type== undefined?"":updateDevice.type;
            var oldWcard = updateDevice.wcard== undefined?"":updateDevice.wcard;
            var oldLocation = updateDevice.location== undefined?"":updateDevice.location;
            if(deviceName != oldDeviceName){
                updateParm.name = deviceName;
            }
            if(deviceId != oldDeviceId){
                updateParm.devId = deviceId;
                updateParm.code = checkCode;
            }
            if(factory.name != oldFactoryOrgName){
                updateParm.org = factory.name;
                updateParm.orgId = factory.id;
                updateParm.location = location;
            }
            if(des != oldDes) updateParm.desc = des;
            if(isEnable != oldState)updateParm.state = isEnable;
            if(k37sn != oldK37sn)updateParm.k37sn = k37sn;
            //if(useuserId != oldUseuserId)updateParm.account = account;
            if(subs != oldSubs) updateParm.subs = subs;
            if(boxType != oldType) updateParm.type = boxType;
            if(oldWcard == "" ||cardNum != oldWcard.number || cardExpire !=oldWcard.expire) updateParm.wcard = wcard;

            var responseupdate = JSON.parse(updatedevice(updateDevice.id, updateParm));
            if(responseupdate.errCode =="success"){
                object.id = updateDevice.id;
                $("input[type=checkbox][name=checkbox]:checked").each(function(){
                    var id = $(this).parent().parent().attr("id");
                    $("tr[id='"+id+"']").children("td").eq(0).text(JSON.stringify(object));
                    $("tr[id='"+id+"']").children("td").eq(3).text(deviceName);
                    $("tr[id='"+id+"']").children("td").eq(4).text(deviceId);
                    $("tr[id='"+id+"']").children("td").eq(5).text(checkCode);
                    $("tr[id='"+id+"']").children("td").eq(6).text(boxType);
                    $("tr[id='"+id+"']").children("td").eq(8).text(factory.name);
                 /*   $("tr[id='"+id+"']").children("td").eq(8).text(useuserName);
                    $("tr[id='"+id+"']").children("td").eq(9).text(isEnable);
                    $("tr[id='"+id+"']").children("td").eq(10).text(des);*/
                });
            }else{
                $(".confirmMsg").html("修改设备信息失败，"+ (errCode[responseupdate.errCode]==undefined?responseupdate.errCode:errCode[responseupdate.errCode]) + "!");
                return false;
            }
        }
    }
    //修改设备时，给控件赋值
    function updateDeviceUi(obj){
        obj.each(function(){
            var deviceObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());

            var deviceName = deviceObject.name== undefined?"":deviceObject.name;
            var deviceType = deviceObject.type== undefined?"":deviceObject.type;
            var deviceId = deviceObject.devId== undefined?"":deviceObject.devId;
            var checkCode = deviceObject.code== undefined?"":deviceObject.code;
            var factoryOrgName = deviceObject.org== undefined?"":deviceObject.org;
            var des = deviceObject.desc== undefined?"":deviceObject.desc;
            var state = deviceObject.state== undefined?"":deviceObject.state;
            var k37sn = deviceObject.k37sn== undefined?"":deviceObject.k37sn;
            var useuserId = deviceObject.account == undefined?"":deviceObject.account.uid;
            var subs = deviceObject.subs== undefined?"":deviceObject.subs;
            if(deviceObject.wcard != undefined){
                var wcard = deviceObject.wcard;
                $("#cardNum").val(wcard.number == undefined?"":wcard.number);
                $("#cardExpire").val(wcard.expire == undefined?"":wcard.expire);
            }
            $("#deviceName").val(deviceName);
            $("#deviceId").val(deviceId);
            $("#checkCode").val(checkCode);
            $("#k37sn").val(k37sn);
            $("#factorylist option").each(function(){
                if($(this).text()==factoryOrgName){
                    $(this).attr("selected", true);
                }
            });
            $("#boxType option").each(function(){
                var type = $(this).text();
                if(deviceType == type){
                    $(this).attr("selected",true);
                }
            });
            //$("#factorylist option[text='"+ factoryOrgName +"']").attr("selected",true);
            $("#des").val(des);
            if(subs != ""){
                for(var i=0; i<subs.length;i++){
                    var num = i+1;
                    var plcId = subs[i]["pid"];
                    var plcCheckCode = subs[i]["code"];
                    var subdevType = subs[i]["type"] == undefined?"":subs[i]["type"];
                    $("#plcId"+num).val(plcId);
                    $("#plcCheckCode"+num).val(plcCheckCode);
                    var id = "plcId"+num;
                    $("#addSubDevice").parent().parent().before("<tr class='sub"+num+"'>"+
                        "<td class='deviceeven'><label>子设备Id</label></td>"+
                        "<td class='deviceodd'><input type='text' class='dfinput tinput' placeholder='子设备Id' value='"+plcId+"' id='"+id+"' maxlength='19' min='19'/>"+
                        "</td>"+
                        "<td class='deviceeven'><label>子设备认证码</label></td>"+
                        "<td class='deviceodd'><input type='text' class='dfinput tinput' placeholder='子设备认证码' value='"+plcCheckCode+"' id='plcCheckCode"+num+"'maxlength='4' min='4' "+
                        "style='width:125px'/>"+
                        devTypeSelect(true,"subType"+num,subdevType)+
                        "<div class='deviceSubs plc"+num+" minus'><img src='../images/-.min.png' style='vertical-align:middle;'></div></td>"+
                        "</tr>");
                    $("#"+id).keyup(function(){
                        test(id);
                    });
                }
            }
            //是否启用
            $("input[name=radio][value="+state+"]").val();

            //通过用户id查找组织信息
            //var userparm = new Object();
            //userparm.userId = useuserId;
            //var responseUser = JSON.parse(listuser(userparm));
            //if (responseUser.total == 1) {
            //    var orgId = responseUser.accountList[0]["orgId"];
            //    $("#orglist option[value="+orgId+"]").attr("selected", true);
            //    createUserSelect();
            //    $("#userlist option[value="+useuserId+"]").attr("selected", true);
            //}
        });
    }
    //设备类型下拉框赋值
    function devTypeSelect(isSub,subTypeId,devType){
        if(devTypeListResponse.errCode == "success"){
            var devTypeList = devTypeListResponse.resultList;
            if(isSub){
                var optionList = "";
                for(var i in devTypeList){
                    var devTypeObj = JSON.stringify(devTypeList[i]),
                        type = devTypeList[i]["type"];
                    if(devType != null && devType == type){
                        optionList +="<option value='"+devTypeObj.replace(/\s/g, "")+"' selected>"+type+"</option>";
                    }else{
                        optionList +="<option value='"+devTypeObj.replace(/\s/g, "")+"'>"+type+"</option>";
                    }
                }
                var selectStr = "<select class='select' id='"+subTypeId+"' style='width: 110px;height: 33px;display: inline;margin-left: 10px'>"+
                    optionList+
                    "</select>";
                return selectStr;
            }else{
                $("#boxType").empty();
                for(var i in devTypeList){
                    var devTypeObj = JSON.stringify(devTypeList[i]),
                        type = devTypeList[i]["type"];
                    $("<option value="+devTypeObj.replace(/\s/g, "")+">"+type+"</option>").appendTo($("#boxType"));
                }
            }
        }else if(isSub){
            var selectStr = "<select class='select' id='"+subTypeId+"' style='width: 110px;height: 33px;display: inline;margin-left: 10px'>"+
                "</select>";
            return selectStr;
        }
    }
    /*给组织下拉框赋值*/
    function createOrgSelect(){
        //找出只是工厂类型的组织
        var parm = new Object();
        parm.type="factory";
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for(var i = 0; i < datas.length; i++){
                var orgInfo = JSON.stringify(datas[i]);
                var orgname = datas[i]["name"];
                $("<option value="+orgInfo.replace(/\s/g, "")+">"+orgname+"</option>").appendTo($("#factorylist"));
            }
     //       createUserSelect();
        }
        //找出所有的组织信息
        var listallparm = new Object();
        listallparm.all="";
        listallparm.orgId=userInfo.orgId;
        var jsonStr = listorg(listallparm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for(var i = 0; i < datas.length; i++){
                var type = datas[i]["type"];
                //不显示工厂类型的用户
                if(type != "工厂"){
                    var orgId = datas[i]["id"];
                    var orgname = datas[i]["name"];
                    $("<option value="+orgId+">"+orgname+"</option>").appendTo($("#orglist"));
                }
            }
      //      createUserSelect();
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
    //添加或修改设备窗口关闭时回复原始界面
    function recoveryUI(){
        $(".confirmMsg").html("");
        $("#deviceName").val("");
        $("#deviceId").val("");
        $("#checkCode").val("");
        $("#cardNum").val("");
        $("#cardExpire").val("");
        $("#des").val("");
        $("#orglist option:first").prop("selected", 'selected');
        $("#factorylist option:first").prop("selected", 'selected');
        $("#userlist").empty();

        $("tr[class^='sub']").each(function(){
            $(this).remove();
        });
    }
    //手动添加指标数据
    function addData(){
        var co2Value = $("#co2Value").val().trim();
        var time = $("#time").val();
        if(time == ""){
            $(".confirmMsg").html("时间不能输入为空！");
            return false;
        }else if(co2Value == ""){
            $(".confirmMsg").html("指标值不能输入为空！");
            return false;
        }
        var autoInfo = new Object();
        $("input[type=checkbox][name=checkbox]:checked").each(function () {

            var deviceObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            autoInfo.devId = deviceObject.id;
        });
        autoInfo.name = "co2";
        autoInfo.manv = Number(co2Value);
        autoInfo.time = (new Date()).getTime();
        var values = new Array();
        values.push(autoInfo);
        var param = new Object();//手动录入数据参数
        param.values = values;
        var response = JSON.parse(updatpolusource(param));
        if(response.errCode == "success"){
            return true;
        }
    }
    var search = new Array();
    search.push("search1");
    search.push("search2");
    search.push("search3");
    setup(search);
    $("#search1").change(function(){
        change(1,search);
    });
    $("#search2").change(function(){
        change(2,search);
    });
    $("#search3").change(function(){
        change(3,search);
    });

});