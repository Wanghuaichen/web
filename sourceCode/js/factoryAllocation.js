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
    $("#orglist").change(function(){
        createUserSelect();
    });
    $("#userlist").change(function(){
        var creator = $("#userlist option:selected").val();
        var parm = new Object();
        parm.creator = creator;
        //fillUseOrgrRow(parm);
    });
    $("#btnLeftAll").click(function(){
        $("input[type=checkbox][name=checkbox2]").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            left("left",jsonApp);
        });
    });
    $("#btnLeft").click(function(){
        $("input[type=checkbox][name=checkbox2]:checked").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            left("left",jsonApp);
        });
    });
    $("#btnRight").click(function(){
        $("input[type=checkbox][name=checkbox1]:checked").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            left("right", jsonApp);
        });

    });
    $("#btnRightAll").click(function(){
        $("input[type=checkbox][name=checkbox1]").each(function () {
            var jsonApp = $(this).parent().parent().children("td").eq(0).text();
            $(this).parent().parent().remove();
            left("right",jsonApp);
        });
    });

//给下拉框赋值
    createOrgSelect();
    var listallparm = new Object();
    listallparm.all = "";
    fillAllOrgRow(listallparm);

//给表填充所有工厂类型数据
    function fillAllOrgRow(parm) {
        //清空表数据
        $("#allFactory tbody").empty();
        $("#allFactory tbody").html("");
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var name = datas[i]["name"],
                orgObject = JSON.stringify(datas[i]);

                $("#allFactory tbody").append("<tr id='app_"+(i+1)+"'>" +
                    "<td style='display: none'>"+orgObject+"</td>" +
                    "<td><input name='checkbox2' class='nosort' type='checkbox' id='checkbox_"+(i+1)+"'/></td>" +
                    "<td>"+(i+1)+"</td>" +
                    "<td>"+name+"</td>" +
                    "</tr>");
            }
            //表分页
            //sorter.init("allSystem",1);
        }
    }
//只填充某一个用户下面的系统
    function fillUseOrgrRow(parm) {
        //清空表数据
        $("#factoryTable tbody").empty();
        $("#factoryTable tbody").html("");
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success的时候才去填充表数据
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            var length = datas.length;
            for (var i = 0; i < length; i++) {
                var name = datas[i]["name"],
                    orgObject = JSON.stringify(datas[i]);

                $("#factoryTable tbody").append("<tr id='app_"+(i+1)+"'>" +
                    "<td style='display: none'>"+orgObject+"</td>" +
                    "<td><input name='checkbox1' class='nosort' type='checkbox' id='checkbox_"+(i+1)+"'/></td>" +
                    "<td>"+(i+1)+"</td>" +
                    "<td>"+name+"</td>" +
                    "</tr>");
            }
            //表分页
            //sorter.init("allSystem",1);
        }
    }
    /*给创建组织下拉框赋值*/
    function createOrgSelect(){
        var parm = new Object();
        parm.all="";
        var jsonStr = listorg(parm);
        var responsedata = JSON.parse(jsonStr);
        //当返回状态是success
        if (responsedata.errCode == "success") {
            var datas = responsedata.orgList;
            for(var i = 0; i < datas.length; i++){
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
                var userId = datas[i]["id"];
                var userName = datas[i]["userName"];
                $("<option value="+userId+">"+userName+"</option>").appendTo($("#userlist"));
            }
        }
    }

    //左移
    function left(obj,jsonOrg){
        var orgObject = JSON.parse(jsonOrg);
        var name = orgObject.name;

        if(obj =="left"){
            var length = $("#factoryTable tbody tr").length + 1;
            $("#factoryTable tbody").append("<tr id='app_"+length+"'>" +
                "<td style='display: none'>"+jsonOrg+"</td>" +
                "<td><input name='checkbox1' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
                "<td>"+length+"</td>" +
                "<td>"+name+"</td>" +
                "</tr>");
        }else if(obj == "right"){
            var length = $("#allFactory tbody tr").length + 1;
            $("#allFactory tbody").append("<tr id='app_"+length+"'>" +
                "<td style='display: none'>"+jsonOrg+"</td>" +
                "<td><input name='checkbox2' class='nosort' type='checkbox' id='checkbox_"+length+"'/></td>" +
                "<td>"+length+"</td>" +
                "<td>"+name+"</td>" +
                "</tr>");
        }

    }
    var s = new Array();
    s.push("s1");
    s.push("s2");
    s.push("s3");
    setup(s);
    $("#s1").change(function(){
        change(1,s);
    });
    $("#s2").change(function(){
        change(2,s);
    });
    $("#s3").change(function(){
        change(3,s);
    });

});

