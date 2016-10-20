$(function () {

    var userInfo = (JSON.parse(getCookie("userInfo"))).account;
    var ownOrgId = userInfo.orgId;
    //初始化窗口变量
    var orgType = new Object();
    orgType.factory = "工厂";
    orgType.deviceProvider = "设备商";
    orgType.operator = "运营商";


    //从服务器获取所有数据
    var param = new Object();
    param.all = "";
    param.orgId = ownOrgId;
    var responseObj = JSON.parse(listorg(param));
    if(responseObj.errCode == "success"){

    }

    fillRow(all);

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
});