$(function () {
    //初始化窗口变量
    var orgdialog,
        tipdialog, //提示信息对话框
        orgType = new Object(),
        addOrUpdateOrgTips = $(".validateTips");
    orgType.factory = "工厂";
    orgType.deviceProvider = "设备商";
    orgType.operator = "运营商";

    orgdialog = $("#add-org").dialog({
        autoOpen: false,
        height: 450,
        width: 530,
        modal: true,
        buttons: [{
            text: "确定",
            click: function () {
                var flag = addorupdateorg();
                if(flag != false){
                    orgdialog.dialog("close");
                }
            },
            class: "sure",
        }, {
            text: "取消",
            click: function () {
                orgdialog.dialog("close");
            },
            class: "cancel",
        }],
        close: function () {
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
                //只有删除操作才处理
                var del = $(this).dialog("option","_button");
                if(del != null){
                    if(del == "del"){
                        $("input[type=checkbox][name=checkbox]:checked").each(function () {
                            var attrId = $(this).attr("id");
                            if(attrId == "checkAll"){
                                return true;
                            }
                            var org = JSON.parse($(this).parent().parent().children("td").eq(0).text());
                            deleteorg(org.id);
                            $(this).parent().parent().remove();
                        });
                    }else{
                        var org = JSON.parse(del.parent().parent().children("td").eq(0).text());
                        deleteorg(org.id);
                        del.parent().parent().remove();
                    }
                }
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
    //添加
    $(".add").click(function () {
        $(".confirmMsg").html("");
        $("#unitname").val("");
        $("#s1 option:first").prop("selected", 'selected');
        $("#s2 option:first").prop("selected", 'selected');
        $("#s3 option:first").prop("selected", 'selected');
        $("#unittype option:first").prop("selected", 'selected');
        $("#professional option:first").prop("selected", 'selected');
        $("#detailaddress").val("");
        $("#lnt").val("");
        $("#lat").val("");
        $("#linkman").val("");
        $("#stuffs").val("");
        $("#phone").val("");
        orgdialog.dialog("open");
        orgdialog.dialog({title: "添加组织"});
        addOrUpdateOrgTips.text("请添加下面信息");
    });
    //修改
    $(".update").click(function () {
        $(".confirmMsg").html("");
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if (length != 0 && length == 1) {
            var obj = $("input[type=checkbox][name=checkbox]:checked");
            //给文本框赋值
            updateorgui(obj);
        } else {
            tipdialog.dialog("option","title","提示信息");
            $("#tip .tipright p").html("当前需要且只能选择一条数据进行修改，请重新选择！");
            tipdialog.dialog("open");
        }
    });
    //del one or more data
    $(".del").click(function () {
        var length = $("input[type=checkbox][name=checkbox]:checked").length;
        if (length == 0) {
            tipdialog.dialog("option","title","删除提示信息");
            $("#tip .tipright p").html("当前没有选择任何数据进行删除！");
        } else {
            tipdialog.dialog("option","title","删除提示信息");
            $("#tip .tipright p").html("确定删除数据信息！");
            tipdialog.dialog("option","_button","del");
        }
        tipdialog.dialog("open");
    });
    //del a data
    $(document).on("click",".delOrg",function () {
        tipdialog.dialog("option","title","删除提示信息");
        $("#tip .tipright p").html("确定删除数据信息！！");
        tipdialog.dialog("option","_button",$(this));
        tipdialog.dialog("open");
    });
    //search
    $("#searchType").change(function(){
        var selectType = $("#searchType option:selected").text();
        if(selectType == "全部"){
            $("#searchByName").css("display","none");
            $("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "单位名称"){
            $("#searchByName").css("display","inline");
            $("#searchByAddress").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "单位地址"){
            $("#searchByAddress").css("display","inline");
            $("#searchByName").css("display","none");
            $("#searchByType").css("display","none");
        }else if(selectType == "单位类型"){
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
        }else if(selectType == "单位类型"){
            var selectByType = $("#searchByType option:selected").text();
            parm.type = selectByType;
        }
        fillRow(parm);
    });
    //从服务器获取所有数据
    var all = new Object();
    all.all = "";
    fillRow(all);

    //添加或修改组织数据处理
    function addorupdateorg(){
        var title = $("#add-org").dialog("option", "title");
        var name = $("#unitname").val().trim();
        var type = $("#unittype option:selected").val().trim();
        var province = $("#s1 option:selected").text().trim();
        var city = $("#s2 option:selected").text().trim();
        var district = $("#s3 option:selected").text().trim();
        var detailAddress = $("#detailaddress").val().trim();
        var lnt = $("#lnt").val().trim();
        var lat = $("#lat").val().trim();
        var linkman = $("#linkman").val().trim();
        var professional = $("#professional option:selected").text().trim();
        var stuffs = $("#stuffs").val().trim();
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
        } else if(lnt == ""){
            $(".confirmMsg").html("经度不能为空！");
            return false;
        } else if(lat == ""){
            $(".confirmMsg").html("纬度不能为空！");
            return false;
        }else if(linkman == ""){
            $(".confirmMsg").html("单位联系人名称不能为空！");
            return false;
        }else if(isNaN(stuffs)){
            $(".confirmMsg").html("人数请输入数字!");
            return false;
        }else if(!phone.match(/^(\d{11})$/)){
            $(".confirmMsg").html("手机格式不正确！");
            return false;
        }
        var location = new Object();
        location.province = province;
        location.city = city;
        location.district = district ;
        location.address = detailAddress;
        if(lnt != "" && lat != ""){
            location.lnt = lnt;
            location.lat = lat;
        }
        var loc_code = "9999";

        var contact = new Object();
        contact.name = linkman;
        contact.phone = phone;
        if (title == "添加组织") {
            var response = JSON.parse(createorg(name.replace(/\s/g, ""),professional,type,location,loc_code,stuffs,contact));
            var errorcode = response.errCode;
            if(errorcode == "success"){
                var orgId = response.id;
                var parm = new Object();
                parm.id = orgId;
                parm.name = name;
                parm.type = type;
                parm.profession = professional;
                parm.stuffs = stuffs;
                parm.contact = contact;
                parm.location = location;
                var length = $(".orgTable tbody tr").length + 1;
                $(".orgTable tbody").append("<tr id='org_" + length + "'>" +
                    "<td style='display: none'>" + JSON.stringify(parm) + "</td>" +
                    "<td><input name='checkbox' type='checkbox' id='checkbox_" + length + "'/></td>" +
                    "<td>" + length + "</td>" +
                    "<td>" + name + "</td>" +
                    "<td>" + orgType[type] + "</td>" +
                    "<td>" + province+city+district+detailAddress + "</td>" +
                    "<td>" + lnt + "</td>" +
                    "<td>" + lat + "</td>" +
                    "<td>" + linkman + "</td>" +
                    "<td>" + phone + "</td>" +
                    "<td><a href='#'  class='delOrg tablelink'> 删除</a></td>" +
                    "</tr>");
            }else{
                alert("添加失败！");
                return false;
            }
        } else {
            var orgObject = JSON.parse($("input[type=checkbox][name=checkbox]:checked").parent().parent().children("td").eq(0).text());

            var parm = new Object();
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
                $("input[type=checkbox][name=checkbox]:checked").each(function () {
                    var tr = $(this).parent().parent();
                    tr.children("td").eq(0).text(JSON.stringify(orgObject));
                    tr.children("td").eq(3).text(name);
                    tr.children("td").eq(4).text(orgType[type]);
                    tr.children("td").eq(5).text(province+city+district+detailAddress);
                    tr.children("td").eq(6).text(lnt);
                    tr.children("td").eq(7).text(lat);
                    tr.children("td").eq(8).text(linkman);
                    tr.children("td").eq(9).text(phone);
                });
            }else{
                alert("修改失败！");
                return false;
            }
        }
    }
    //修改组织时，给弹出窗口控件赋值
    function updateorgui(obj){
        obj.each(function () {
            var orgObject = JSON.parse($(this).parent().parent().children("td").eq(0).text());
            var contact = orgObject.contact;
            var name = orgObject.name == undefined?"":orgObject.name,
                type = orgObject.type== undefined?"":orgObject.type,
                profession = orgObject.profession== undefined?"":orgObject.profession,
                location = orgObject.location == undefined?"":orgObject.location,
                province = location == ""?"":location.province==undefined?"":location.province,
                city = location == ""?"":location.city== undefined?"":location.city,
                district = location == ""?"":location.district== undefined?"":location.district,
                address = location == ""?"":location.address== undefined?"":location.address,
                lnt = location == ""?"":location.lnt== undefined?"":location.lnt,
                lat = location == ""?"":location.lat== undefined?"":location.lat,
                stuffs = orgObject.stuffs== undefined?"":orgObject.stuffs,
                contactname = "",
                contactphone = "";
            if (contact != undefined) {
                contactname = contact.name== undefined?"":contact.name;
                contactphone = contact.phone== undefined?"":contact.phone;
            }

            $("#unitname").val(name);
            $("#detailaddress").val(address);
            $("#linkman").val(contactname);
            $("#stuffs").val(stuffs);
            $("#phone").val(contactphone);
            $("#lnt").val(lnt);
            $("#lat").val(lat);
            //类型
            $("#unittype option[value="+type+"]").attr("selected",true);
            //行业
            $("#professional option[value="+profession+"]").attr("selected",true);
            //省
            $("#s1 option[value="+province+"]").attr("selected",true);
            change(1,s);
            //市
            $("#s2 option[value="+city+"]").attr("selected",true);
            change(2,s);
            //区
            $("#s3 option[value="+district+"]").attr("selected",true);
            orgdialog.dialog("open");
            orgdialog.dialog({title: "修改组织"});
            addOrUpdateOrgTips.text("修改组织信息");
        });
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
                $(".orgTable tbody").append("<tr id='org_" + (i + 1) + "'>" +
                    "<td style='display: none'>" + JSON.stringify(datas[i]) + "</td>" +//id
                    "<td><input name='checkbox' class='nosort' type='checkbox' id='checkbox_" + (i + 1) + "'/></td>" +
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + name + "</td>" +//name
                    "<td>" + orgType[type] + "</td>" +//type
                    "<td>" + province + city + district + address + "</td>" +//location
                    "<td>" + lnt + "</td>" +//linkman
                    "<td>" + lat + "</td>" +//linkman
                    "<td>" + contactname + "</td>" +//linkman
                    "<td>" + contactphone + "</td>" +//tel
                    "<td><a href='#' class='delOrg tablelink'> 删除</a></td>" +
                    "</tr>");
            }
            sorter.init("orgTable",2);
        }
    }
    var s = new Array();
    s.push("s1");
    s.push("s2");
    s.push("s3");
    setup(s);
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
    $("#s1").change(function(){
        change(1,s);
    });
    $("#s2").change(function(){
        change(2,s);
    });

});