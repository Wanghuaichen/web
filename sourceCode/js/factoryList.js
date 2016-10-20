$(function () {
    //初始化窗口变量
    var tipdialog, //提示信息对话框
        selectTime, // 当前选择的时间
        addDataDialog, //添加数据对话框
        importDataDialog;
    var recordTimeoption = {
        elem: '#recordTime',
        istime: true,
        isclear:false,
        istoday:false,
        format: 'YYYY/MM/DD hh:mm:ss',
        issure:false, //是否显示确认
        start:laydate.now(0),//设置起始日期
        //min: laydate.now(), //设定最小日期为当前日期
        max: laydate.now(0), //最大日期
        choose: function(datas){ //选择日期完毕的回调
            selectTime = new Date(datas);
        }
    };
    $("#recordTime").click(function(){
        laydate(recordTimeoption);
    });
    addDataDialog = $("#add-data").dialog({
        autoOpen: false,
        height: 450,
        width: 750,
        modal: true,
        buttons: [{
            text: "确定",
            click: function () {
                var response = addDataToDatabase();
                if(response != false){
                    addDataDialog.dialog("close");
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                addDataDialog.dialog("close");
            },
            class: "cancel",
        }],
        close: function () {
            recoveryUI();
        }
    });
    importDataDialog = $("#import-data").dialog({
        autoOpen: false,
        height: 350,
        width: 580,
        modal: true,
        buttons: [
            {
            text: "导入",
            click: function () {
                $(".confirmMsg").html("");
                var fileObject = document.getElementById("fileName"),//$("#fileName"),
                    fileName = $("#fileName").val();
                if(fileName == ""){
                    $(".confirmMsg").html("请先选择文件！");
                    return false ;
                }
                $("#progressbar").css("display","block");
                var factoryObj = importDataDialog.dialog("option","_button");//$(this).dialog("option","_button");
                uploadfile(factoryObj,fileObject,2);
            },
            class: "sure",
        },{
            text: "关闭",
            click: function () {
                importDataDialog.dialog("close");
            },
            class: "cancel",
        }
        ],
        close: function () {
            $("#fileName").val("");
            $("#showFile").val("");
            $(".confirmMsg").html("");
            $("#progressbar").css("display","none");
        }
    });
    tipdialog = $("#tip").dialog({
        autoOpen: false,
        height: 300,
        width: 530,
        modal: true,
        buttons: [{
            text: "确定",
            click: function (_button) {
                tipdialog.dialog("close");
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                tipdialog.dialog("close");
            },
            class: "cancel",
        }]
    });
    // jquery conflict handle
    //jQuery.noConflict();
    $("#checkAll").click(function () {
        if ($(this).is(':checked')) {
            $("input[name=checkbox][type=checkbox]").each(function () {
                $(this).prop("checked", true);
            });
        } else {
            $("input[type=checkbox][name=checkbox]").each(function () {
                $(this).prop("checked", false);
            });
        }
    });
    //浏览按钮点击触发file类型input
    $("#showFile").click(function () {
        $("#fileName").click();
    });
    $("#browse").click(function () {
        $("#fileName").click();
    });
    //file类型input值改变时赋值给showFile
    $("#fileName").change(function () {
        $("#showFile").val($(this).val());
    });
    //导入按钮
    //$(document).on("click","#importData",function(){
    ////$("#importData").click(function () {
    //    $(".confirmMsg").html("");
    //    var fileObject = document.getElementById("fileName"),//$("#fileName"),
    //        fileName = $("#fileName").val();
    //    if(fileName == ""){
    //        $(".confirmMsg").html("请先选择文件！");
    //        return false ;
    //    }
    //    $("#progressbar").css("display","block");
    //    var factoryObj = importDataDialog.dialog("option","_button");//$(this).dialog("option","_button");
    //    uploadfile(factoryObj,fileObject,2);
    //});
    $(".addData").click(function () {
        var factoryOrgTr = $("input[type=checkbox][name=checkbox]:checked"),
            length = factoryOrgTr.length;
        tipdialog.dialog("option","title","手动添加数据提示信息");
        if (length != 1) {
            $("#tip .tipright p").html("当前需要且只能选择一条数据进行添加数据！");
            tipdialog.dialog("open");
        } else {
            var orgInfo = JSON.parse(factoryOrgTr.parent().parent().children("td").eq(0).text());
            if(orgInfo.type != "factory"){
                $("#tip .tipright p").html("请选择工厂类型的组织！");
                tipdialog.dialog("open");
            }else{
                addDataDialog.dialog("open");
            }
        }
    });
    $(".importDataDialog").click(function () {
        var factoryOrgTr = $("input[type=checkbox][name=checkbox]:checked"),
            length = factoryOrgTr.length;
        tipdialog.dialog("option","title","导入excel数据提示信息");
        if (length != 1) {
            $("#tip .tipright p").html("当前需要且只能选择一条数据进行导入excel数据！");
            tipdialog.dialog("open");
        } else {
            var orgInfo = JSON.parse(factoryOrgTr.parent().parent().children("td").eq(0).text());
            if(orgInfo.type != "factory"){
                $("#tip .tipright p").html("请选择工厂类型的组织！");
                tipdialog.dialog("open");
            }else{
                $("#progressbar").css("display","none");
                importDataDialog.dialog("option","_button",orgInfo);
                importDataDialog.dialog("open");
            }
        }
    });
    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").text();
        if(selectType == "全部"){
            $("#searchByName").css("display","none");
            $("#searchByAddress").css("display","none");
        }else if(selectType == "单位名称"){
            $("#searchByName").css("display","inline");
            $("#searchByAddress").css("display","none");
        }else if(selectType == "单位地址"){
            $("#searchByAddress").css("display","inline");
            $("#searchByName").css("display","none");
        }
    });
    $("#searchpng").click(function(){
        //从服务器获取数据
        var parm = new Object();
        var selectType = $("#searchType option:selected").text();
        if(selectType == "全部"){
            parm.all="";
        }else if(selectType == "单位名称"){
            var orgname = $("#searchByName").val().trim();
            if(orgname == ""){
                alert("组织名称不能为空！");
                return false;
            }
            parm.name = orgname;
        }else if(selectType == "单位地址"){
            var province = $("#search1 option:selected").text().trim();
            var city = $("#search2 option:selected").text().trim();
            var district = $("#search3 option:selected").text().trim();
            parm.location = new Object();
            if(province == "省份" && city == "地级市" && district == "市、区、县"){
                alert("省、市、区至少选择一种！");
                return false;
            }else {
                if(province != "省份"){
                    parm.location.province = province;
                }
                if(city != "地级市"){
                    parm.location.city = city;
                }
                if(district != "市、区、县"){
                    parm.location.disctrict = district;
                }
            }
        }
        parm.type = "factory";
        fillRow(parm);
    });
    //从服务器获取所有数据
    var param = new Object();
    param.type = "factory";
    fillRow(param);
    var familyArray = ["运行时间","O2","CO","CO2","NO","NO2","烟温","NOx","SO2","净效率","毛效率","环温","泵流量","稀释倍数"],
        familyType = ["ms","%25","ppm","%25","ppm","ppm","℃","ppm","ppm","%25","%25","℃","l/min","倍","Double"];

    //手动添加数据录入到数据库
    function addDataToDatabase(){
        var O2 = $("#O2").val().trim(),
            CO = $("#CO").val().trim(),
            CO2 = $("#CO2").val().trim(),
            NO = $("#NO").val().trim(),
            NO2 = $("#NO2").val().trim(),
            yanwen = $("#yanwen").val().trim(),
            NOx = $("#NOx").val().trim(),
            SO2 = $("#SO2").val().trim(),
            jingxiaolv = $("#jingxiaolv").val().trim(),
            maoxiaolv = $("#maoxiaolv").val().trim(),
            bengliuliang = $("#bengliuliang").val().trim(),
            items = new Array(),
            re = /^[0-9]+.?[0-9]*$/;   //判断字符串是否为数字 ;
        var parm = new Object(),factory = Object(),O2Object = new Object(), COObject = new Object(),CO2Object = new Object(),
            NOObject = new Object(),NO2Object = new Object(),yanwenObject = new Object(),NOxObject = new Object(),SO2Object = new Object(),
            jingxiaolvObject = new Object(),maoxiaolvObject = new Object(),bengliuliangObject = new Object();
        if(O2 != "" && !re.test(O2)){
            $(".confirmMsg").html("O2只能输入数字！");
            return false ;
        }else if(O2 != ""){
            O2Object.family = familyArray[1];
            O2Object.unit = familyType[1];
            O2Object.value = Number(O2);
            O2Object.vtype = familyType[14];
            items.push(O2Object);
        }
        if(CO != "" && !re.test(CO)){
            $(".confirmMsg").html("CO只能输入数字！");
            return false ;
        }else if(CO != ""){
            COObject.family = familyArray[2];
            COObject.unit = familyType[2];
            COObject.value = Number(CO);
            COObject.vtype = familyType[14];
            items.push(COObject);
        }
        if(CO2 != "" && !re.test(CO2)){
            $(".confirmMsg").html("CO2只能输入数字！");
            return false ;
        }else if(CO2 != ""){
            CO2Object.family = familyArray[3];
            CO2Object.unit = familyType[3];
            CO2Object.value = Number(CO2);
            CO2Object.vtype = familyType[14];
            items.push(CO2Object);
        }
        if(NO != "" && !re.test(NO)){
            $(".confirmMsg").html("NO只能输入数字！");
            return false ;
        }else if(NO != ""){
            NOObject.family = familyArray[4];
            NOObject.unit = familyType[4];
            NOObject.value = Number(NO);
            NOObject.vtype = familyType[14];
            items.push(NOObject);
        }
        if(NO2 != "" && !re.test(NO2)){
            $(".confirmMsg").html("NO2只能输入数字！");
            return false ;
        }else if(NO2 != ""){
            NO2Object.family = familyArray[5];
            NO2Object.unit = familyType[5];
            NO2Object.value = Number(NO2);
            NO2Object.vtype = familyType[14];
            items.push(NO2Object);
        }
        if(yanwen != "" && !re.test(yanwen)){
            $(".confirmMsg").html("烟温只能输入数字！");
            return false ;
        }else if(yanwen != ""){
            yanwenObject.family = familyArray[6];
            yanwenObject.unit = familyType[6];
            yanwenObject.value = Number(yanwen);
            yanwenObject.vtype = familyType[14];
            items.push(yanwenObject);
        }
        if(NOx != "" && !re.test(NOx)){
            $(".confirmMsg").html("NOx只能输入数字！");
            return false ;
        }else if(NOx != ""){
            NOxObject.family = familyArray[7];
            NOxObject.unit = familyType[7];
            NOxObject.value = Number(NOx);
            NOxObject.vtype = familyType[14];
            items.push(NOxObject);
        }
        if(SO2 != "" && !re.test(SO2)){
            $(".confirmMsg").html("SO2只能输入数字！");
            return false ;
        }else if(SO2 != ""){
            SO2Object.family = familyArray[8];
            SO2Object.unit = familyType[8];
            SO2Object.value = Number(SO2);
            SO2Object.vtype = familyType[14];
            items.push(SO2Object);
        }
        if(jingxiaolv != "" && !re.test(jingxiaolv)){
            $(".confirmMsg").html("净效率只能输入数字！");
            return false ;
        }else if(jingxiaolv != ""){
            jingxiaolvObject.family = familyArray[9];
            jingxiaolvObject.unit = familyType[9];
            jingxiaolvObject.value = Number(jingxiaolv);
            jingxiaolvObject.vtype = familyType[14];
            items.push(jingxiaolvObject);
        }
        if(maoxiaolv != "" && !re.test(maoxiaolv)){
            $(".confirmMsg").html("毛效率只能输入数字！");
            return false ;
        }else if(maoxiaolv != ""){
            maoxiaolvObject.family = familyArray[10];
            maoxiaolvObject.unit = familyType[10];
            maoxiaolvObject.value = Number(maoxiaolv);
            maoxiaolvObject.vtype = familyType[14];
            items.push(maoxiaolvObject);
        }
        if(bengliuliang != "" && !re.test(bengliuliang)){
            $(".confirmMsg").html("泵流量只能输入数字！");
            return false ;
        }else if(bengliuliang != ""){
            bengliuliangObject.family = familyArray[12];
            bengliuliangObject.unit = familyType[12];
            bengliuliangObject.value = Number(bengliuliang);
            bengliuliangObject.vtype = familyType[14];
            items.push(bengliuliangObject);
        }
        if(selectTime == null){
            $(".confirmMsg").html("请选择登记时间！");
            return false;
        }
        var orgObject = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());
        factory.uId = orgObject.id;
        factory.name = orgObject.name;
        parm.time = selectTime.getTime();
        parm.factory = factory;
        parm.location = orgObject.location;
        parm.items = items;

        var createResponse = JSON.parse(manvcreate(parm));
        if(createResponse.errCode != "success"){
            alert("添加失败!");
        }
    }
    //填充表数据
    function fillRow(parm) {
        //清空表数据
        $(".orgTable tbody").empty();
        $(".orgTable tbody").html("");
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for (var i = 0; i < datas.length; i++) {
                var contact = datas[i]["contact"];
                var name = datas[i]["name"] == undefined?"":datas[i]["name"],
                    type = datas[i]["type"]== undefined?"":datas[i]["type"],
                    location = datas[i]["location"]== undefined?"":datas[i]["location"],
                    province = location == ""?"":location["province"]==undefined?"":location["province"],
                    city = location == ""?"":location["city"]== undefined?"":location["city"],
                    district = location == ""?"":location["district"]== undefined?"":location["district"],
                    address = location == ""?"":location["address"]== undefined?"":location["address"],
                    lnt = location == ""?"":location["lnt"]== undefined?"":location["lnt"],
                    lat = location == ""?"":location["lat"]== undefined?"":location["lat"],
                    contactname = "",
                    contactphone = "";
                if (contact != undefined) {
                    contactname = contact["name"]== undefined?"":contact["name"];
                    contactphone = contact["phone"]== undefined?"":contact["phone"];
                }
                var sort=new Object();
                var page=new Object();
                var find=new Object();
                var other=new Object();
                var factory=new Object();
                sort.asc = "time";
                page.max = 1;
                page.start = 0;
                factory.name = name;
                factory.uId = datas[i]["id"];
                find.factory = factory;
                //find.family="SO2";
                other.sort = sort;
                var filter=new Object();
                filter.include="time";
                other.filter=filter;
                var responseObject  = JSON.parse(manvListNow(find,page,other));
                var timestr;
                if(responseObject.errCode=="success")
                    timestr=format(responseObject.poluList[0].time*1000, 'yyyy/MM/dd HH:mm:ss');
                else
                    timestr = "未录入";

                var dataId = "data"+(i+1);
                $(".orgTable tbody").append("<tr id='org_" + (i + 1) + "'>" +
                    "<td style='display: none'>" + JSON.stringify(datas[i]) + "</td>" +//id
                    "<td style='width: 4%'><input name='checkbox' class='nosort' type='checkbox' id='checkbox_" + (i + 1) + "'/></td>" +
                    "<td style='width: 6%'>" + (i + 1) + "</td>" +
                    "<td>" + name + "</td>" +//name
                    //"<td>" + type + "</td>" +//type
                    "<td>" + province + city + district + address + "</td>" +//location
                    "<td>" + timestr + "</td>" +//name
                    //"<td>" + lnt + "</td>" +//linkman
                    //"<td>" + lat + "</td>" +//linkman
                    //"<td>" + contactname + "</td>" +//linkman
                    //"<td>" + contactphone + "</td>" +//tel
                    "<td><a href='../environmental/manualIndicatorList.html' target='rightFrame' class='tablelink' id='"+dataId+"'> 查看数据</a></td>" +
                    "</tr>");
                $(document).on("click","#"+dataId,function(){
                    var factoryJsonStr = $(this).parent().parent().children("td").eq(0).text();
                    setCookie("indicatorFactory",factoryJsonStr);
                });
            }
            sorter.init("orgTable",2);
        }
    }

    function format(time, format){
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
        })
    }

    //重置弹出窗口数据
    function recoveryUI(){
        selectTime = null;
        $("#O2").val("");
        $("#CO").val("");
        $("#CO2").val("");
        $("#NO").val("");
        $("#NO2").val("");
        $("#yanwen").val("");
        $("#NOx").val("");
        $("#SO2").val("");
        $("#jingxiaolv").val("");
        $("#maoxiaolv").val("");
        $("#bengliuliang").val("");
        $("#recordTime").val("");
    }
    //导入excel数据
    function importXLS(fileName)
    {
        objCon = new ActiveXObject("ADODB.Connection");
        objCon.Provider = "Microsoft.Jet.OLEDB.4.0";
        objCon.ConnectionString = "Data Source=" + fileName + ";Extended Properties=Excel 8.0;";
        objCon.CursorLocation = 1;
        objCon.Open;
        var strQuery;
        //Get the SheetName
        var strSheetName = "Sheet1$";
        var rsTemp =   new ActiveXObject("ADODB.Recordset");
        rsTemp = objCon.OpenSchema(20);
        if(!rsTemp.EOF)
            strSheetName = rsTemp.Fields("Table_Name").Value;
        rsTemp = null;
        rsExcel =   new ActiveXObject("ADODB.Recordset");
        strQuery = "SELECT * FROM [" + strSheetName + "]";
        rsExcel.ActiveConnection = objCon;
        rsExcel.Open(strQuery);
        while(!rsExcel.EOF)
        {
            for(i = 0;i<rsExcel.Fields.Count;++i)
            {
                alert(rsExcel.Fields(i).value);
            }
            rsExcel.MoveNext;
        }
        // Close the connection and dispose the file
        objCon.Close;
        objCon =null;
        rsExcel = null;
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
});
if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    window.applicationCache.update();
}