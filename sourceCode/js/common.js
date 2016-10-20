/**
 * Created by admin on 2015/10/15.
 */

var xmlHttp;
var url="http://rest.icloud40.com:8081/rest/api/";
var dataurl="http://rest.icloud40.com:8083/rest/api/";
var datatypeurl="http://envcloud.icloud40.com:8083/rest/api/";
var loginpage="../login.html"
//
function createXMLHttpRequest() {
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
        var aTypes = ['Microsoft.XMLHTTP', 'MSXML.XMLHTTP', 'Msxml2.XMLHTTP.7.0','Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
        var len = aTypes.length;
        for (var i = 0; i < len; i++) {
            try {
                xmlHttp = new ActiveXObject(aTypes[i]);
            } catch (e) {
                continue;
            }
            break;
        }
    }
    //if (window.ActiveXObject) {
        //try{
        //    if(!!document.documentMode){
        //        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP.4.0");//判断是否是IE8
        //    }else{
        //        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        //    }
        //} catch(e1){
        //    try{
        //        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP.4.0");
        //    }catch(e2){
        //        xmlHttp = new  ActiveXObject('Microsoft.XMLDOM');
        //    }
        //}
    //    //xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
    //}else if (window.XMLHttpRequest) {
    //    //alert("window.XMLHttpRequest");
    //    xmlHttp = new XMLHttpRequest();
    //}
    //alert("xmlHttp="+xmlHttp.toLocaleString());
}

var wCRCTalbeAbs = [0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
    0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400];
function Gen_Checksum(id, len)
{
    var wCRC = 0xFFFF, i,chChar,checksum,str;
    for (i = 0; i < len; i++)
    {
        chChar = id.charCodeAt(i);
        wCRC = wCRCTalbeAbs[(chChar ^ wCRC) & 15] ^ (wCRC >> 4);
        wCRC = wCRCTalbeAbs[((chChar >> 4) ^ wCRC) & 15] ^ (wCRC >> 4);
    }
    wCRC=(wCRC<<3)|(wCRC>>(16-3));
    wCRC = ~(wCRC&0xFFFF);
    checksum = wCRC&0xFFFF;
    str = checksum.toString(16);
    if(str.length==0)str="0000"; else if(str.length==1)str="000"+str; else if(str.length==2)str= "00"+str; else if(str.length==3)str= "0"+str;
    return str.toUpperCase();
}

function setCookie(name,value)
{
	var reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    var minutes = 100;
    var exp = new Date();
    var arr;

    arr = document.cookie.match(reg);
    if(arr!=null)
    {
    		exp.setTime(exp.getTime() -1000);
    		document.cookie = name + "="+";path=/;expires=" + exp.toGMTString();
    	}
    exp.setTime(exp.getTime() + minutes*60*1000);
    document.cookie = name + "="+value + ";path=/;expires=" + exp.toGMTString();
}

function getCookie(name)
{	
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return arr[2];
    else{
        //location.reload(true);
        return null;
    }

}

function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1000);
    var cval=getCookie(name);
    if(cval!=null) document.cookie= name + "="+";path=/;expires="+exp.toGMTString();
}

function ajaxcommand(Url,param) {
    var userInfo;
    if(Url.indexOf(url) >= 0){
        userInfo = JSON.parse(getCookie("userInfo"));
    }else{
        userInfo = JSON.parse(getCookie("datauserInfo"));
    }
    if(userInfo==null)
    {
    	delCookie("userInfo");
    	alert("用户认证过期，请重新登录！");
    	window.parent.location.href =loginpage;
    	return;
    }
    param.operatorId = userInfo.account.userId;
    param.accessId=userInfo.accessId;
    param.operType = userInfo.account.type;
    var param1 = JSON.stringify(param);
    console.log(Url+" param="+param1);
    try{
	    createXMLHttpRequest();
	    if (!xmlHttp) {
	        return "{\"errCode\":\"createXMLHttpRequest\"}";
	    }
	    xmlHttp.open("POST", Url, false);
//	    xmlHttp.onreadystatechange = createorgresponse;
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //xmlHttp.setRequestHeader("Cache-Control","no-cache");
	    xmlHttp.send("callback=?&param=" + param1+ "&" + Math.random);
	  }
	  catch(e){
	  	return "{\"errCode\":\"NetworkError\"}";
	  }
	  var ret = JSON.parse(xmlHttp.responseText);
    if (ret.errCode == "authenFailed") {
      delCookie("userInfo");
     	alert("服务用户认证过期，请重新登录！");
    	window.parent.location.href =loginpage;
    	return;
    }
    console.log("response = " + xmlHttp.responseText);
    return xmlHttp.responseText;
}

//##############组织接口##############
function createorgresponse() {
    var responseText = xmlHttp.responseText;
    var response= JSON.parse(xmlHttp.responseText);
    if (xmlHttp.readyState==4 && xmlHttp.status==200&&   response.errCode == "success") {
        alert(xmlHttp.responseText);
    } else {
        alert(xmlHttp.responseText);
    }
}

//object location_object   location{province,city,district,address}
//object contact_object    contact{name,phone}
function createorg(name,prof,type,location_object,loc_code,stuffs,contact_object,faOrgId) {
    var Url = url;
    Url +="org/create";

    var param = new Object();
    param.prof = prof;
    param.type = type;
    param.location = location_object;
    param.name = name;
    param.stuffs = stuffs;
    param.loc_code= loc_code;
    param.contact = contact_object;
    param.faOrgId = faOrgId;
    var userInfo = JSON.parse(getCookie("userInfo"));
    if(userInfo==null)
    {
    		delCookie("userInfo");
        alert("用户认证过期，请重新登录！");
        window.parent.location.href =loginpage;
        return;
    }
    param.creator=userInfo.account.userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}


//object 只传修改项
/*
 location{province,city,district,address}
 contact{name,phone}
 loc_code
 prof
 stuffs
 name
*/
function updateorg(name, orgId, object){
    var Url = url;
    Url +="org/update";

    var param = new Object();
    param.name = name;
    param.orgId =orgId;
    for(var i in object){
        param[i]=object[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}

//string  orgId
function deleteorg(orgId){
    var Url = url;
    Url +="org/delete";

    var param = new Object();
    param.orgId = orgId;
    var ret = ajaxcommand(Url,param);
	  return ret;
}

//object, 可选  {"all","location","name","orgId","creator","type"}
function listorg(object){
    var Url = url;
    Url +="org/list";

    var param = new Object();
    for(var i in object){
    	param[i]=object[i];
    	}
     var ret = ajaxcommand(Url,param);
    return ret;
}




//##############用户接口##############
//group: operator,deviceProvider,factory,envProtectAgency,common,other;
//type: root,superr,admin,common
function login(userName,password) {
    var Url = url;
    Url +="account/login";

    var param = new Object();
    param.userName = userName;
    param.password = password;

    var param1 = JSON.stringify(param);
    try{
	    createXMLHttpRequest();
	    if (!xmlHttp) {
	        return "{\"errCode\":\"createXMLHttpRequest\"}";
	    }
	    xmlHttp.open("POST", Url, false);
//	    xmlHttp.onreadystatechange = loginresponse;
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    xmlHttp.send("callback=login&param=" + param1);
	  }
	  catch(e){
	  	return "{\"errCode\":\"NetworkError\"}";
	  }

    userInfo = JSON.parse(xmlHttp.responseText);
    if (userInfo.errCode == "success") {
        accessId = userInfo.accessId;
        setCookie("userInfo",JSON.stringify(userInfo));
        window.location.href ="main.html";
        //alert(xmlHttp.responseText);
    } else {
       // alert(xmlHttp.responseText);
    }

	  return xmlHttp.responseText;
}

function logout() {
		delCookie("userInfo");
}

//appName, 传入“all”，可获取该用户所有app权限。
function getbizperm(userId,appName){
    var Url = url;
    Url +="perm/getbizperm";

    var param = new Object();
    param.userId = userId;
    if(appName!="all")
        param.appName = appName;
    var ret = ajaxcommand(Url,param);
    return ret;
}

function register(userName,password,type,group,realName,location_object,mobile,email) {
    var Url = url;
    Url +="account/register";
    
    var appName = "";
    var zone = "cywee";
    var org = "";

    var param = new Object();
    param.userName = userName;
    param.password = password;
    param.type = type;
    param.group = group;
    param.appName = appName;
    param.zone = zone;
    param.org= org;
    param.location = location_object;
    param.realname=realname;
    param.mobile=mobile;
    param.email=email;

    var param1 = JSON.stringify(param);
    try{
	    createXMLHttpRequest();
	    if (!xmlHttp) {
	        return "{\"errCode\":\"createXMLHttpRequest\"}";
	    }
	    xmlHttp.open("POST", Url, false);
//	    xmlHttp.onreadystatechange = registerresponse;
	    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    xmlHttp.send("callback=?&param=" + param1);
	  }
	  catch(e){
	  	return "{\"errCode\":\"NetworkError\"}";
	  }
	  return xmlHttp.responseText;
}


//group: operator,deviceProvider,factory,envProtectAgency,common,other;
//type: root,superr,admin,common
//status: active，disabled,deleted
function createuser(userName,password,type,kind,realName,appName,zone,org,orgId,mobile,email,location_object,status){
    var Url = url;
    Url +="account/create";

    var param = new Object();
    param.userName=userName;
    param.password=password;
    param.type=type;
    param.kind=kind;
    param.realName=realName;
    if(appName!="")
    	param.appName=appName;
    param.zone=zone;
    param.org=org;
    param.orgId=orgId;
    param.mobile=mobile;
    param.email=email;
    param.location=location_object;
    param.status = status;
    var ret = ajaxcommand(Url,param);
    return ret;
}

function deleteuser(userId){
    var Url = url;
    Url +="account/delete";
    var param = new Object();
    param.userId=userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object, 可选  {"all","fatherId","userId","userName","realName","appName","type","group","zone","email","mobile","org"}
function listuser(object){
    var Url = url;
    Url +="account/list";

    var param = new Object();
    for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object {"password","email","mobile","location","org","orgId","realName","appName"，"status"}
//status  值 "active" “disabled” "deleted"
function updateuser(userId, object){
    var Url = url;
    Url +="account/update";

    var param = new Object();
    param.userId=userId;
    for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}

function resetuserpassword(userId){
    var Url = url;
    Url +="account/resetpwd";

    var param = new Object();
    param.userId=userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//确认用户名是否已经存在 
//返回 failed 表示已被占用
function finduser(userName){
    var Url = url;
    Url +="account/nouser";

    var param = new Object();
    param.userName=userName;
    var ret = ajaxcommand(Url,param);
    return ret;
}


//##############用户权限接口################
//   "funcList":"orgMan|devMan|accountMan|logMan|appMan",
//   "permList":[{"orgMan":"read|write"},
//              {"devMan":"read|write"},
//              {"accountMan":"read|write"},
//              {"logMan":"read|write"},
//              {"appMan":"read|write"}]
function createuserperm(userId, appName,funcList,permList_array){
    var Url = url;
    Url +="perm/create";

    var param = new Object();
    param.userId=userId;
    param.appName=appName;
    var permission=new Object();
    permission.funcList=funcList;
    permission.permList=permList_array;
    param.permission=permission;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//userId   "all" 获取所有用户的权限信息
//appName  支持列表格式,  值为"all" 获取该用户所有访问权限
function listuserperm(userId, appName){
    var Url = url;
    Url +="perm/list";

    var param = new Object();
    if(userId=="all")
        param.all="";
    else
        param.userId=userId;
    if(appName!="all")
        param.appName=appName;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//   "funcList":"orgMan|devMan|accountMan|logMan|appMan",
//   "permList":[{"orgMan":"read|write"},
//              {"devMan":"read|write"},
//              {"accountMan":"read|write"},
//              {"logMan":"read|write"},
//              {"appMan":"read|write"}]
function updateuserperm(userId, appName,funcList,permList_array){
    var Url = url;
    Url +="perm/update";

    var param = new Object();
    var response = JSON.parse(listuserperm(userId, appName));
    var permissionId;
    if (response.errCode == "success") {
        var permissionList=response.permission;
        for(var i in permissionList) {
            if(permissionList[i].appName==appName)
            {
                permissionId = permissionList[i].id;
                break;
            }
        }
    }
    else
        return "{\"errCode\",\"No this appName access permission\"}";

    param.id=permissionId;
    param.userId=userId;
    param.appName=appName;
    var permission=new Object();
    permission.funcList=funcList;
    permission.permList=permList_array;
    param.permission=permission;
    var ret = ajaxcommand(Url,param);
    return ret;
}

function deleteuserperm(userId, appName){
    var Url = url;
    Url +="perm/delete";

    var param = new Object();
    var response = JSON.parse(listuserperm(userId, appName));
    var permissionId;
    if (response.errCode == "success") {
        var permissionList=response.permission;
        for(var i in permissionList) {
            if(permissionList[i].appName==appName)
            {
                permissionId = permissionList[i].id;
                break;
            }
        }
    }
    else
        return "{\"errCode\":\"No this appName access permission\"}";

    param.id=permissionId;
    var ret = ajaxcommand(Url,param);
    return ret;
}


//##############App接口##############
//funcPerm "1111|2222|33333"
function createapp(creator,scope,appName,funcPerm){
    var Url = url;
    Url +="app/create";

    var param = new Object();
    param.creator=creator;
    param.appName=appName;
    param.scope=scope;
    param.funcPerm=funcPerm;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object 可选项 {"appName","creator","scope","funcPerm"}
function updateapp(id,scope,object){
    var Url = url;
    Url +="app/update";

    var param = new Object();
    param.id=id;
    param.scope=scope;
    for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}

function deleteapp(id){
    var Url = url;
    Url +="app/delete";

    var param = new Object();
    param.id=id;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object  可选{"all","scope","creator","appName"};
function listapp(object){
    var Url = url;
    Url +="app/list";

    var param = new Object();
    for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}



//##############设备接口##############
//account ： 为创建者的account account{name,uid}
//state :  init,active,disabled,deleted
//location_object   填入工厂所在地址
//views： 为 account 列表
//devId、name：为必填参数
//other_Parm：其它可选参数
function createdevice(devId,name,other_Parm){
    var Url = url;
    Url +="device/create";

    var param = new Object();
		param.devId = devId;
		param.name = name;
    for(var i in other_Parm){
        param[i] = other_Parm[i];
    }
		//var account = new Object();
		//account.name = consumerName;
		//account.uid = consumerId;
		//param.account = account;
		//param.org = factory;
		//param.orgId = factoryId;
		//param.state = state;
		//param.desc = desc;
	//param.type = "plc";  //type:      plc,box,controlpoint
	//	param.appName="";
	//	param.views = ""; //那些用户可以看到
		
    var ret = ajaxcommand(Url,param);
    return ret;
}

//此id为数据库里的id
function deletedevice(id){
    var Url = url;
    Url +="device/delete";

    var param = new Object();
		param.id = id;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object   可选 {"location","account","devId","state","name","appName","desc","org","orgId","views","all"};
//返回    {"errCode":"success","total":2,deviceList:[{d1 },{d2}], 也有可能 {"total":0,"errCode":"noItem"}
function listdevice(object){
    var Url = url;
    Url +="device/list";

    var param = new Object();
		for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}
//查询设备历史心跳状态
function listhiststate(object){
    var Url = url;
    Url +="device/list/histstate";

    var param = new Object();
		for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}
//查询设备历史状态记录
function listhistreport(object){
    var Url = url;
    Url +="device/list/histreport";
    var param = new Object();
		for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}

//object  可选{"devId","code","state","name","appName","desc","org","orgId","location","account"};
function updatedevice(id,object){
    var Url = url;
    Url +="device/update";

    var param = new Object();
		param.id =id;
		for(var i in object){
    	param[i]=object[i];
    	}
    var ret = ajaxcommand(Url,param);
    return ret;
}

//action: 支持四种操作：enum OperAction{add,remove,set,clear};
//  	      set:表示将views设置为新列表中的值；
// 	        remove:表示在原有views中删除列表中的值；
//	        add:表示在原有views中增加新列表中的值；
// 	        clear:表示清除views中所有值
function updateviews(id,action,views_array){
    var Url = url;
    Url +="device/updateviews";

    var param = new Object();
    param.id =id;
    param.action =action;
    param.views = views_array;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//id:此id为/device/list中返回的id
//查找设备连接状态
function findconnstate(id){
    var Url = url;
    Url +="device/list/conn/detail";

    var param = new Object();
    param.id =id;
    var ret = ajaxcommand(Url,param);
    return ret;
}


//数据接口
//find 设置查找条件，支持如下条件查找
//	"location":{"province":"河北省","city":"唐山市"}
//	"family":"SO3|NO2"
//	"name":"流排放|氮排放"
//	"higher":"no"
//	"lower":"no"
//	"factory":{"name":"工厂组织1","uId":"562f021302aa5eb9ebd2ea13"}
//	"provider":{"uid":"562fhigher021302aa5eb9ebd2ea13","name":"Robin1"}
//sort   "sort":{"asc":"time"}
//page   "page":{"max":50,"start":0}
//filter  "filter":{"exclude":"location|provider|factory","include":"time|name|family|higher|lvalue|dvalue|svalue"}
function datanow(find_object,page_object,other_object){
    var Url = datatypeurl;
    Url +="polusource/listnow";

    var param = new Object();
    //param.sort = sort_object;
    param.page=page_object;
    //param.filter =filter_object;
    param.find =find_object;
    for(var i in other_object){
        param[i] = other_object[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}

function polusourcedistkey(key){
    var Url = datatypeurl;
    Url +="polusource/list/now/distkey";

    var param = new Object();
    param.key=key;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function manvdistkey(key){
    var Url = datatypeurl;
    Url +="polumanv/list/now/distkey";

    var param = new Object();
    param.key=key;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//{"total":3,,"errCode":"success",
//    "cities":[{"province":"河北省","city":"唐山市"},
//    {"province":"河北省","city":"辛集市"},
//    {"province":"山西省","city":"阳泉市"}]}
function listcities(){
    var Url = dataurl;
    Url +="polusource/listcities";

    var param = new Object();
    param.all="yes";
 //   param.from="mobile";
    var ret = ajaxcommand(Url,param);
    return ret;
}

//page   "page":{"max":50,"start":0}
//"find":{
//必选    "time":{"scale":"day","start":1449417600000,"end":1449698400000},
//可选    "uid","devId","name","family","poluType","higher","lower","location","factory","provider"
// 可选参数中，至少应该有一项。如果一项都没有，将不会有任何查询结果。}
function datahistory(find_object,page_object,other_object,isMulti){
    var Url = datatypeurl;
    Url +="polusource/listhist";

    var param = new Object();
    if(!isMulti){
        param.page=page_object;
        param.find =find_object;
    }
    for(var i in other_object){
        param[i] = other_object[i];
    }
    //filter_object.include="values|location";
    //param.filter=filter_object;
    var ret = ajaxcommand(Url,param);
    return ret;
}
//删除指标
function delPolusource(id){
    var Url = datatypeurl;
    Url +="polusource/delete";

    var param = new Object();
    param.id = id;
    var ret = ajaxcommand(Url,param);
    return ret;
}


function login1(userName,password) {
    var Url = datatypeurl;
    Url +="account/login";
    
    var param = new Object();
    param.userName = userName;
    param.password = password;

    var param1 = JSON.stringify(param);
    try{
        createXMLHttpRequest();
        if (!xmlHttp) {
            return "{\"errCode\":\"createXMLHttpRequest\"}";
        }
        xmlHttp.open("POST", Url, false);
//	    xmlHttp.onreadystatechange = loginresponse;
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send("callback=login&param=" + param1);
    }
    catch(e){
        return "{\"errCode\":\"NetworkError\"}";
    }

    userInfo = JSON.parse(xmlHttp.responseText);
    if (userInfo.errCode == "success") {
        accessId = userInfo.accessId;
        setCookie("datauserInfo",JSON.stringify(userInfo));
        //window.location.href ="main.html";
        //alert(xmlHttp.responseText);
    } else {
        // alert(xmlHttp.responseText);
    }

    return xmlHttp.responseText;
}

function createdatatype(name,poluType){
    var Url = datatypeurl;
    Url +="polufamily/create";
    var param = new Object();
    param.name=name;
    param.poluType=poluType;
    var ret = ajaxcommand(Url,param);
    return ret;
}

//{"total":2,"errCode":"success"，
//   "familyList":[{"id":"564c2dba11dd76664804d780","poluType":"air","name":"SO2"},
//    {"id":"564c2e3b11dd76664804d784","poluType":"air","name":"NO2"}]}
function listdatatype(param){
    var Url = datatypeurl;
    Url +="polufamily/list";
  //  param.from="mobile";
    var ret = ajaxcommand(Url,param);
    return ret;
}

//id 格式 "id1|id2|id3"
function deletedatatype(id){
    var Url = datatypeurl;
    Url +="polufamily/delete";
    var param = new Object();
    param.id=id;
    var ret = ajaxcommand(Url,param);
    return ret;
}
//手动录入指标数据
//必选参数：{"time","factory","location","items"}
function manvcreate(param){
    var Url = datatypeurl;
    Url +="polumanv/create";
    var ret = ajaxcommand(Url,param);
    return ret;
}
//可选参数：{find:{family,location, factory}}，支持"sort","page","filter"参数
function manvListNow(find_object,page_object,other_object){
    var Url = datatypeurl;
    Url +="polumanv/listnow";
    var param = new Object();
    var filter_object =new Object();
    param.page=page_object;
    param.find =find_object;
    for(var i in other_object){
        param[i] = other_object[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
// 必选参数：{id}，id：不支持列表
//可选参数：{"time","unit","vtype","value"} 参数说明请参考数据录入接口
function manvUpdate(param){
    var Url = datatypeurl;
    Url +="polumanv/update";
    var ret = ajaxcommand(Url,param);
    return ret;
}
//  find参数中：
//time为必选；
//"uid","devId","name","family","poluType","higher","lower","location","factory","provider" 为可选；其中uid为listnow中查出的id
//可选参数中，至少应该有一项。如果一项都没有，将不会有任何查询结果。
//--time:
//-scale：表示时间的刻度，TimeScale{all,year,month,day,hour,minute10,minute,second}; 当前支持day,hour和minute10,其余暂不支持
//当scale==hour时，表示以小时为时间长度来计算平均值，并提供每个小时的平均值，最大值，最小值；
//当scase==minute10时，表示以10分钟为时间长度来计算平均值，并提供每个10分钟的平均值，最大值，最小值
//当scase==day时，表示以天为时间长度，提供平均值，最大值和最小值；
//
//-start：为开始的日期，以毫秒为单位的long
//-end:  为结束的日期，以毫秒为单位的long
function manvListhist(find_object,page_object,other_object,isMulti){
    var Url = datatypeurl;
    Url +="polumanv/listhist";

    var param = new Object();
    if(!isMulti){
        param.page=page_object;
        param.find =find_object;
    }
    for(var i in other_object){
        param[i] = other_object[i];
    }
    //filter_object.include="values|location";
    //param.filter=filter_object;
    var ret = ajaxcommand(Url,param);
    return ret;
}
//必选参数：page,find,在find下面的必选参数有 time(time结构中, scale必须为"all") 和 distKey
//distKey即为需要查询的字段名称，比如查询时间，"distKey":"time"; 查询工厂名称："distKey":"factory.name"
function manvListdist(find_object,page_object,other_object){
    var Url = datatypeurl;
    Url +="polumanv/listdist";

    var param = new Object();
    var filter_object =new Object();
    param.page=page_object;
    param.find =find_object;
    for(var i in other_object){
        param[i] = other_object[i];
    }
    var ret = ajaxcommand(Url,param);
    return ret;
}
//必选参数：{id,which}, id支持列表{id: id1|id2|id3}
//可选参数：{time},time为TimeScale的结构。
function manvdelete(param){
    var Url = datatypeurl;
    Url +="polumanv/delete";
    var ret = ajaxcommand(Url,param);
    return ret;
}

/*file_type
0，表示raw 文件，不做任何转义处理
1, 表示json 格式文件，需按照json 格式的规范进行转义
以后有新的需求再增加
2. 表示.xls(excel)文件
3. .txt 文件
*/
function uploadfile(factory_object,file_object,file_type){
    var Url = datatypeurl;
    Url +="polumanv/excel/upload";
    //   Url ="http://218.75.123.26:8083/rest/api/polumanv/excel/upload";//"http://192.168.1.50";

    var userInfo;
    if(Url.indexOf(url) >= 0){
        userInfo = JSON.parse(getCookie("userInfo"));
    }else{
        userInfo = JSON.parse(getCookie("datauserInfo"));
    }
    if(userInfo==null)
    {
        delCookie("userInfo");
        alert("用户认证过期，请重新登录！");
        window.parent.location.href =loginpage;
        return;
    }

    var form = new FormData();
    form.append("operatorId",userInfo.account.userId);
    form.append("accessId",userInfo.accessId);
    form.append("type",file_type);
    form.append("factory.uId",factory_object.id);
    form.append("File",file_object.files[0]);
    console.log("form " + form);
    try{
        createXMLHttpRequest();
        if (!xmlHttp) {
            return "{\"errCode\":\"createXMLHttpRequest\"}";
        }
        xmlHttp.open("POST", Url, true);
        //xmlHttp.onreadystatechange = importRes7onse;
        ret = xmlHttp.send(form);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 ) {
                if(xmlHttp.status == 200){
                    var response = JSON.parse(xmlHttp.responseText);
                    if (response.errCode == "authenFailed") {
                            delCookie("userInfo");
                            alert("用户认证过期，请重新登录！");
                            window.parent.location.href =loginpage;
                            return;
                    }
                    if(response.errCode == "success"){
                        document.getElementById("confirmMsg").innerText = "导入成功！";
                    }else{
                        document.getElementById("confirmMsg").innerHTML = "导入失败，原因："+response.errCode+",错误信息：</br>"+JSON.stringify(response.errInfo)+"！";
                        //$(".confirmMsg").html("导入失败，原因："+response.errCode);
                    }
                    document.getElementById("progressbar").style.display="none";
                    document.getElementById("fileName").value = "";
                    document.getElementById("showFile").value = "";
                    console.log("response="+xmlHttp.responseText);

                    //$("#progressbar").css("display","none");
                }
            }
        };
    }
    catch(e){
        return "{\"errCode\":\"NetworkError\"}";
    }
}
//列出设备类型
//可选参数： type,info,orgId;  其中orgId，对于非operator账户，必须提交
function devtypeList(param){
    var Url = url;
    Url +="device/devtype/list";
    var ret = ajaxcommand(Url,param);
    return ret;
}
//创建设备类型
//必须参数：orgId,type
//可选参数：info //用于描述、说明定
function devtypeCreate(param){
    var Url = url;
    Url +="device/devtype/create";
    var ret = ajaxcommand(Url,param);
    return ret;
}
//删除设备类型，必须参数：{id}
function devtypeDelete(param){
    var Url = url;
    Url +="device/devtype/delete";
    var ret = ajaxcommand(Url,param);
    return ret;
}
//修改设备类型
// 必选参数：{id}
//可选参数：orgId,type,info
function devtypeUpdate(param){
    var Url = url;
    Url +="device/devtype/update";
    var ret = ajaxcommand(Url,param);
    return ret;
}


/*swInfo {
    private String name;  //sw name, 软件名称
    private String version;//sw version,软件版本
    private String url; //sw file URL
    private String state;//sw version state,is used? 是否启用状态
    private String fname;//sw file name，软件的文件名称*/
function upgradeCreate(dtype,name,swInfo){
    var Url = url;
    Url +="swversion/create";

    var param=new Object();
    param.dtype=dtype;
    param.name=name;
    param.swInfo=swInfo;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function upgradeList(all,dtype,name){
    var Url = url;
    Url +="swversion/list";

    var ppp=new Object();
    var swInfo=new Object();
    ppp.name="name";
    ppp.dtype="cywee-c801";
    swInfo.name=name;
    swInfo.fname="ddd.file";
    swInfo.version="1.0.0.1";
    swInfo.url="http://dddff/m.k";
    swInfo.state="active";
    ppp.swInfo=swInfo;
    var upgradeList=new Array();
    upgradeList[0]=ppp;
    var param1=new Object();
    param1.errCode="success";
    param1.upgradeList=upgradeList;
    return JSON.stringify(param1);

    var param=new Object();
    if(all=="all")
        param="all";
    else if(dtype!="")
        param.dtype=dtype;
    else if(name!="")
        param.name=name;

    var ret = ajaxcommand(Url,param);
    return ret;
}
function upgradeDelete(id){
    var Url = url;
    Url +="swversion/delete";

    var param=new Object();
    param.id=id;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function upgradeUpdate(id,dtype,name,swInfo){
    var Url = url;
    Url +="swversion/update";
    var param=new Object();
    param.id=id;
    param.dtype=dtype;
    param.name=name;
    var ret = ajaxcommand(Url,param);

    if(swInfo)
    {
        var param1=new Object();
        param1.id=id;
        param1.action="set";
        param1.swInfo=swInfo;
        var ret = ajaxcommand(Url,param1);
    }
    return ret;
}


/*user.uid=userInfo.userId;
user.name=userInfo.userName;
item.user=user;
org.uId=userInfo.orgId;
org.name=userInfo.org;
item.org=org;
item.mgroups=mgroups;
accessList[0]=item;*/
function resaccessCreate(accessList){
    var Url = url;
    Url +="resaccess/create";

    var param=new Object();
    param.accessList=accessList;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function resaccessList(userId){
    var Url = url;
    Url +="resaccess/list";

    var param=new Object();
    if(userId=="all")
        param.all="";
    else
        param.userId=userId;
    var ret = ajaxcommand(Url,param);
    return ret;
}

function resaccessDelete(id){
    var Url = url;
    Url +="resaccess/delete";

    var param=new Object();
    param.id=id;
    var ret = ajaxcommand(Url,param);
    return ret;
}
function resaccessUpdate(id,accessList){
    var Url = url;
    Url +="resaccess/update";

    var param=new Object();
    param.id=id;
    param.accessList=accessList;
    var ret = ajaxcommand(Url,param);
    return ret;
}


function dictionary(key)
{
    var Url = url;
    Url +="dictionary/list/enum";

    var param=new Object();
    param.items=key;
    var ret = ajaxcommand(Url,param);
    return ret;
}

function leftmenuclick(){
    window.parent.frames["leftFrame"].document.getElementById("dataAlarmMenuHeader").click();
    window.parent.frames["leftFrame"].document.getElementById("dataManaMenu").click();
    window.parent.frames["leftFrame"].document.getElementById("dataAlarmMenu").click();
}
/**
 * 日期格式转换
 * @param time
 * @param format
 * @returns {XML|*|string|void}
 */
function dataFormate(time, format){
    var t = new Date(time);
    var tf = function(i){return (i < 10 ? '0' : '') + i};
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
        switch(a){
            case 'yyyy':
                return tf(t.getFullYear());
                break;
            case 'MM':
                return tf(t.getMonth() + 1);
                break;
            case 'mm':
                return tf(t.getMinutes());
                break;
            case 'dd':
                return tf(t.getDate());
                break;
            case 'HH':
                return tf(t.getHours());
                break;
            case 'ss':
                return tf(t.getSeconds());
                break;
        }
    });
}
/**分页设置
 * @param tableId 表元素Id
 * @param currentPageId 当前页Id
 * @param pageListId 页数Id
 */
function sortOp(tableId,currentPageId,pageListId,pageSize){
    sorter.head = "head";
    sorter.asc = "asc";
    sorter.desc = "desc";
    sorter.even = "evenrow";
    sorter.odd = "oddrow";
    sorter.evensel = "evenselected";
    sorter.oddsel = "oddselected";
    sorter.paginate = true;
    sorter.currentid = currentPageId;
    sorter.limitid = pageListId;
    sorter.init(tableId,1);
    sorter.size(pageSize);
}
/**
 * 日期选择添加提示信息
 */
function addLaydateListener(){
    var tdList = document.getElementById("laydate_table").getElementsByTagName("td");
    for(var i in tdList){
        if(tdList[i].className.indexOf("laydate_void")>= 0){
            tdList[i].setAttribute("title","该值不能选择！");
        }
    }
}
if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    window.applicationCache.update();
}