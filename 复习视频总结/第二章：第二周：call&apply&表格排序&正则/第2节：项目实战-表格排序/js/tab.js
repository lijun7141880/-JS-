/**
 * Created by jun.li on 2017/2/21.
 */
//->想要操作谁就先获取谁
var oTab = document.getElementById('tab');
var tHead = oTab.tHead;//获取table里的thead，表格特有的获取方式
var oThs = tHead.rows[0].cells;//获取thead下的第一行里的所有列
var tBody = oTab.tBodies[0];//获取table下的第一个tbody
var oRows = tBody.rows;//获取tbody下的所有的行

var data = null;

//->1、首先获取后台（data.txt）中的数据->"JSON格式的字符串" ->Ajax(async javascript and xml)
//1)首先创建一个Ajax对象
var xhr = new XMLHttpRequest;

//2)打开我们需要请求数据的那个文件地址
xhr.open("get", "json/data.txt", false);

//3)监听请求状态
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {
        var val = xhr.responseText;
        data = utils.jsonParse(val);
    }
};

//4)发送请求
xhr.send(null);

//->2、实现我们的数据邦定
function bind() {
    var frg = document.createDocumentFragment();
    for (var i = 0; i < data.length; i++) {
        var cur = data[i];

        var oTr = document.createElement('tr');//->每一次循环创建一个TR

        //每一个TR中还需要创建四个TD，因为每一个对象中有四组键值对
        for (var key in cur) {
            var oTd = document.createElement('td');
            //->对性别进行特殊处理 0->男 1->女
            if (key === 'sex') {
                oTd.innerHTML = cur[key] === 0 ? "男" : "女";
            } else {
                oTd.innerHTML = cur[key];
            }
            oTr.appendChild(oTd);
        }
        frg.appendChild(oTr);
    }
    tBody.appendChild(frg);
    frg = null;
}
bind();

//->实现隔行变色
function changeBg() {
    for (var i = 0; i < oRows.length; i++) {
        oRows[i].className = i % 2 === 1 ? "bg" : null;
    }
}
changeBg();

//4、编写表格排序的方法：实现按照年龄这一列进行排序
function sort(n) {//->n是当前点击这一列的索引
    //this->oThs[1]
    var _this = this;

    //->把存储所有行的类数组转换为数组
    var ary = utils.listToArray(oRows);

    //->点击当前列，需要让其他列的flag存储的值回归到初始值-1，这样再返回头点击其他列才是按照升序排列
    for (var k = 0; k < oThs.length; k++) {
        if (oThs[k] !== this) {
            oThs[k].flag = -1;
        }
    }

    //->给数组进行排序:按照每一行的第二列的内容由小到大进行排序
    _this.flag *= -1;//->每一次执行sort，进来的第一步就是先让flag的值*-1 第一次flag=-1 *=-1 flag=1 升序   第二次*=-1 flag=-1 降序   第三次*=-1 flag=1 升序...
    ary.sort(function (a, b) {
        //->this->window
        var curInn = a.cells[n].innerHTML;
        var nexInn = b.cells[n].innerHTML;
        var curInnNum = parseFloat(a.cells[n].innerHTML);
        var nexInnNum = parseFloat(b.cells[n].innerHTML);
        if (isNaN(curInnNum) || isNaN(nexInnNum)) {
            return curInn.localeCompare(nexInn) * _this.flag;
        } else {
            return (curInnNum - nexInnNum) * _this.flag;
        }
    });

    //->按照ary中的最新顺序，把每一行重新的添加到tBody中
    var frg = document.createDocumentFragment();
    for (var i = 0; i < ary.length; i++) {
        frg.appendChild(ary[i]);
    }
    tBody.appendChild(frg);
    frg = null;

    //->按照最新的顺序重新进行隔行变色
    changeBg();
}

//->5、点击排序：所有具有class="cursor"这个样式的列都可以实现点击排序
for (var i = 0; i < oThs.length; i++) {
    var curTh = oThs[i];
    curTh.index = i;//->用来存储索引的
    curTh.flag = -1;//->给当前点击这一列增加一个自定义属性,用来实现升降序
    if (curTh.className == 'cursor') {
        curTh.onclick = function () {
            //->this=>oThs[1]

            //sort();//->sort中的this->window
            //sort.call(oThs[1]);
            sort.call(this, this.index);
        };
    }
}

