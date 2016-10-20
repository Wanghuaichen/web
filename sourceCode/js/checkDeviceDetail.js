$(function () {
    //获取当前选中的设备信息
    var deviceJson = getCookie("deviceselected"),
        currentPage = getCookie("deviceCurrentPage");
    setCookie("backCurrentPage",currentPage);
    /*ipc dialog*/
    var ipcdialog = $("#ipcdialog").dialog({
        autoOpen: false,
        height: 450,
        width: 530,
        modal: true,
    });

    var iotdialog = $("#iotdialog").dialog({
        autoOpen: false,
        height: 450,
        width: 650,
        modal: true,
    });

    $(document).on("click",".pcShow",function(){
        ipcdialog.dialog("open");

        $("#ipctable tbody").html("");
        $("#ipctable tbody").empty();
        var content = JSON.parse($(this).parent().attr("id")),
            ipcObject = content.ipc;
        var pcName = ipcObject.pcName == undefined?"":ipcObject.pcName,
            state = ipcObject.state  == undefined?"":ipcObject.state,
            version = ipcObject.version == undefined?"":ipcObject.version,
            ip = ipcObject.ip == undefined?"":ipcObject.ip;

        $("#ipctable tbody").append("<tr id='plcdetail_"+1+"'>" +
            "<td>"+1+"</td>" +
            "<td>"+pcName+"</td>" +
            "<td>"+ip+"</td>" +
            "<td>"+state+"</td>" +
            "</tr>");
        $("#ipcVersion").text(version);
    });
    $(document).on("click",".iot",function(){
        iotdialog.dialog("open");
        $("#plctable tbody").html("");
        $("#plctable tbody").empty();
        var content = JSON.parse($(this).parent().attr("id")),
            plcObject = content.plc;
        var port = plcObject.port == undefined?"":plcObject.port,
            state = plcObject.state == undefined?"":plcObject.state,
            ip = plcObject.ip == undefined?"":plcObject.ip,
            pid = plcObject.pid == undefined?"":plcObject.pid,
            code = plcObject.code == undefined?"":plcObject.code;
        $("#plctable tbody").append("<tr id='plcdetail_"+1+"'>" +
            "<td>"+1+"</td>" +
            "<td>"+pid+"</td>" +
            "<td>"+code+"</td>" +
            "<td>"+ip+"</td>" +
            "<td>"+port+"</td>" +
            "</tr>");
    });


    $("#lantable tbody").html("");
    $("#lantable tbody").empty();

    $("#wantable tbody").html("");
    $("#wantable tbody").empty();

    $("#childDevice tbody").html("");
    $("#childDevice tbody").empty();
    if(deviceJson != undefined && deviceJson != "" && deviceJson!= null) {
        var deviceObject = JSON.parse(deviceJson),
            deviceName = deviceObject.name,
            deviceId = deviceObject.devId == undefined ?"": deviceObject.devId,
            deviceCode = deviceObject.code == undefined ?"": deviceObject.code,
            factoryName = deviceObject.org,
            k37sn = deviceObject.k37sn == undefined ? "" : deviceObject.k37sn,
            address = deviceObject.location.province + deviceObject.location.city + deviceObject.location.district + deviceObject.location.address,
            accountId = deviceObject.account.uid,
            desc = deviceObject.desc,
            deviceSubs = deviceObject.subs;
        $("#deviceName").text(deviceName);
        $("#deviceId").text(deviceId);
        $("#deviceCode").text(deviceCode);
        $("#factoryName").text(factoryName);
        $("#factoryAddress").text(address);
        $("#k37sn").text(k37sn);
        $("#desc").text(desc);
        if(deviceObject.wcard != undefined ){
            var wcard = deviceObject.wcard;
            $("#cardNum").text(wcard.number);
            $("#cardExpire").text(wcard.expire);
        }
        if(accountId != undefined){
            var userParm = new Object();
            userParm.userId = accountId;
            var listuserresponsestr = listuser(userParm);
            var listuserobject = JSON.parse(listuserresponsestr);
            if(listuserobject.errCode == "success" && listuserobject.total == 1){
                var accountObject = (listuserobject.accountList)[0];
                var orgname = accountObject.org;
                var accountname = accountObject.userName;
                var accounttel = accountObject.mobile;
                $("#customer").text(orgname+"/"+accountname);
                $("#tel").text(accounttel);
            }
        }
        showInfo();
        if(deviceSubs != undefined){
            fillDeviceSub();
        }

    }

    //显示当前选中设备的详细信息
    function showInfo(){
        $(".plcState").html("<img src='../images/fail.png'>");
        $(".boxState").html("<img src='../images/fail.png'>");
        $(".ipcState").html("<img src='../images/fail.png'>");
        $(".pcShow").html("<img src='../images/pc_alarm.png' width='125px' height='87px' alt='ipc' class='ipc'>");
        //查找该设备的连接信息
        var connresponse = findconnstate(deviceObject.id);
        var responseObject = JSON.parse(connresponse);
        if(responseObject.errCode == "success"){
            if(responseObject.connState != undefined && responseObject.connState != 'noState'){
                var connState = responseObject.connState;
                for(var i in connState){
                    var subDevice = connState[i],
                        sub = subDevice.sub,
                        pid = sub == undefined?"":sub.pid,
                        code = sub == undefined?"":sub.code,
                        winccState = subDevice.winccState == undefined?"":subDevice.winccState,
                        plcState= subDevice.plcState == undefined?"":subDevice.plcState;
                    var plcStateTd = "<td class='plcState'><img src='../images/fail.png'></td>",
                        pcShowTd ="<td class='pcShow'><img src='../images/pc.png' width='125px' height='87px' alt='ipc'></td>",
                        boxStateTd = "<td class='boxState'><img src='../images/fail.png'></td>",
                        ipcStateTd = "<td class ='ipcState'><img src='../images/fail.png'></td>";
                    var iotContent = new Object(),ipcObject = new Object(), plcObject = new Object();
                    plcObject.pid = pid;
                    plcObject.code = code;
                    if(winccState != ""){
                        if(winccState != undefined && winccState != "noState"){
                            var state,fs;
                            fs = winccState.fs == undefined?"":winccState.fs;
                            ipcObject.pcName = winccState.pcName == undefined?"":winccState.pcName;
                            ipcObject.state = state= winccState.state == undefined?"":winccState.state;
                            ipcObject.version = winccState.version == undefined?"":winccState.version;
                            ipcObject.ip = winccState.ip == undefined?"":winccState.ip;
                            if(fs == "on"){
                                ipcStateTd = "<td class ='ipcState'><img src='../images/ok.png'></td>";
                            }
                            if(state == "on"){
                                pcShowTd ="<td class='pcShow'><img src='../images/pc.png' width='125px' height='87px' alt='ipc'></td>";
                            }else{
                                pcShowTd ="<td class='pcShow'><img src='../images/pc_alarm.png' width='125px' height='87px' alt='ipc'></td>";
                            }
                        }
                    }
                    if(plcState != ""){
                        if(plcState != undefined && plcState != "noState"){
                            var state, fs;
                            plcObject.port = plcState.port == undefined?"":plcState.port;
                            plcObject.state = state =  plcState.state == undefined?"":plcState.state;
                            plcObject.fs = fs= plcState.fs == undefined?"":plcState.fs;
                            plcObject.ip = plcState.ip == undefined?"":plcState.ip;
                            if(state == "on"){
                                plcStateTd = "<td class='plcState'><img src='../images/ok.png'></td>";
                            }
                            if(fs = "on"){
                                boxStateTd = "<td class='boxState'><img src='../images/ok.png'></td>"
                            }
                        }
                    }
                    iotContent.ipc = ipcObject;
                    iotContent.plc = plcObject;
                    //background-image: url(../images/monitorbg.png);background-color:#ABABAB;
                    $(".monitorshow").append("<div class='subDevice'><label style='margin-left:400px;font-size: larger'>"+pid +"</label>"+
                        "<table align='center' width='900px' height='180px'  style='background-image: url(../images/dbg.png)'>"+
                        "<tr id='"+JSON.stringify(iotContent) +"'>"+
                        "<td><img src='../images/plc.png' width='80px' height='35' alt='plc' class='plc'></td>"+
                        plcStateTd+
                        "<td class='iot'><img src='../images/iot.png' width='80px' height='30px' alt='iot'></td>"+
                        boxStateTd+
                        "<td><img src='../images/rs-fs.png' width='100px' height='70px' alt='中转服务器'></td>"+
                        ipcStateTd+
                        pcShowTd+
                        "</tr>"+
                        "</table></div>");
                }
            }
            //获取盒子状态
            var boxState = responseObject.boxState;
            if(boxState != undefined && boxState != "noState"){
                var time = boxState.time == undefined?"":boxState.time,
                    version = boxState.version == undefined?"":boxState.version,
                    lan = boxState.lan == undefined?"":boxState.lan,
                    wan = boxState.wan == undefined?"":boxState.wan;
                var wangw = wan.gw == undefined?"":wan.gw,
                    wandns1 = wan.dns1 == undefined?"":wan.dns1,
                    wandns2 = wan.dns2 == undefined?"":wan.dns2,
                    wanmask = wan.mask == undefined?"":wan.mask,
                    wanip = wan.ip == undefined?"":wan.ip;
                var langw = lan.gw == undefined?"":lan.gw,
                    lanmask = lan.mask == undefined?"":lan.mask,
                    lanip = lan.ip == undefined?"":lan.ip;
                $("#lantable tbody").append("<tr id='landetail_"+1+"'>" +
                    "<td>"+1+"</td>" +
                    "<td>"+lanip+"</td>" +
                    "<td>"+lanmask+"</td>" +
                    "<td>"+langw+"</td>" +
                    "</tr>");
                $("#wantable tbody").append("<tr id='wandetail_"+1+"'>" +
                    "<td>"+1+"</td>" +
                    "<td>"+(wanip==""?"未连接":"已连接")+"</td>" +
                    "<td>"+wanip+"</td>" +
                    "<td>"+wanmask+"</td>" +
                    "<td>"+wangw+"</td>" +
                    "<td>"+(wandns1==""?wandns2:wandns2==""?"":(wandns1+"/"+wandns2))+"</td>" +
                    "</tr>");
                $("#boxVersion").text(version);
            }

        }
    }
    //给设备plc表填充数据
    function fillDeviceSub(){
        for(var i =0 ;i<deviceSubs.length;i++){
            var plcId = deviceSubs[i]["pid"],
                plcCheckCode = deviceSubs[i]["code"],
                plcType = deviceSubs[i]["type"]==undefined?"":deviceSubs[i]["type"];
            $("#childDevice tbody").append("<tr id='plcdetail_"+i+"'>" +
                "<td>"+(i+1)+"</td>" +
                "<td>"+plcId+"</td>" +
                "<td>"+plcCheckCode+"</td>" +
                "<td>"+plcType+"</td>" +
                "</tr>");
        }
    }
    $(".monitorshow").width() > 900?$('.subDevice').css({'margin-left': ($(".monitorshow").width()-900) / 2}):"";
    ($(window).height()-290)>$(".monitorshow").height()?$(".monitorshow").css({"height":($(window).height()-290)}):"";

    $(window).resize(function () {
        $(".monitorshow").width() > 900?$('.subDevice').css({'margin-left': ($(".monitorshow").width()-900) / 2}):"";
        ($(window).height()-290)>$(".monitorshow").height()?$(".monitorshow").css({"height":($(window).height()-290)}):"";
    });

});
if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    window.applicationCache.update();
}