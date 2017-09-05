

var emitter = {
  // 注册事件
  on: function(event, fn) {
    var handles = this._handles || (this._handles = {}),
      calls = handles[event] || (handles[event] = []);

    // 找到对应名字的栈
    calls.push(fn);

    return this;
  },
  // 解绑事件???
  off: function(event, fn) {
    if(!event || !this._handles) this._handles = {};
    if(!this._handles) return;

    var handles = this._handles , calls;

    if (calls = handles[event]) {
      if (!fn) {
        handles[event] = [];
        return this;
      }
      // 找到栈内对应listener 并移除
      for (var i = 0, len = calls.length; i < len; i++) {
        if (fn === calls[i]) {
          calls.splice(i, 1);
          return this;
        }
      }
    }
    return this;
  },
  // 触发事件
  emit: function(event){
    var args = [].slice.call(arguments, 1),
      handles = this._handles, calls;

    if (!handles || !(calls = handles[event])) return this;
    // 触发所有对应名字的listeners
    for (var i = 0, len = calls.length; i < len; i++) {
      calls[i].apply(this, args)
    }
    return this;
  }
}

!function(){
  //解析为函数表达式而不是函数声明等同于(function(){})()
  // 帮助函数
  // ----------

  // 将HTML转换为节点(加工)
  function html2node(str){
    // 创建容器
    var container = document.createElement('div');
    // 字符串模版放入容器，转化为html
    container.innerHTML = str;
    // 返回此html模板
    return container.children[0];
  }

  // 赋值属性 （拷贝对象的属性）
  // extend({a:1}, {b:1, a:2}) -> {a:1, b:1}(不会覆盖原属性)
  function extend(o1, o2){
    for(var i in o2) if(typeof o1[i] === 'undefined'){
      o1[i] = o2[i]
    } 
    return o1
  }




  // Modal
  // -------

  var template = 
  '<div class="m-modal">\
    <div class="modal_align"></div>\
    <div class="modal_wrap animated">\
      <div class="modal_head">标题</div>\
      <div class="modal_body">内容</div>\
      <div class="modal_foot">\
        <a class="confirm" href="#">确认</a>\
        <a class="cancel" href="#">取消</a>\
      </div>\
    </div>\
  </div>';





  function Modal(options){
    options = options || {};
    // 即 div.m-modal 节点    克隆一下节点，确保私有性
    //如果不克隆,会出现什么bug???
    this.container = this._layout.cloneNode(true);
    // body 用于插入自定义内容
    this.body = this.container.querySelector('.modal_body');
    // 窗体节点，在应用动画时有用
    this.wrap = this.container.querySelector('.modal_wrap');

    // 将options复制到组件实例上 (传入的对象克隆成构造函数的属性)
    // 否则将找不到传入对象中的animation，相关操作出现bug；
    extend(this, options);


    this._initEvent();
    
  }

  
  //拷贝对象属性到Modal的原型上
  extend(Modal.prototype, {

    _layout: html2node(template),

    setContent: function(content){
      if(!content) return;

      //支持两种字符串结构和DOM节点
      if(content.nodeType === 1){ 
        //如果传入元素节点,那么加入此节点
        this.body.innerHTML = null;
        this.body.appendChild(content);

      }else{
        //如果是字符喜欢,直接写入
        this.body.innerHTML = content;
      }
    },

    // 显示弹窗
    show: function(content){
      //若传参，使用传入参数作为内容区
      if(content) this.setContent(content);
      //若不传参,直接插入模板
      document.body.appendChild(this.container);
      //动画  使弹窗添加一个类名
      animateClass(this.wrap, this.animation.enter)
    },
    //删除弹窗
    hide: function(){

      var container = this.container;
      //动画(使弹窗添加一个类名) + 移除模板
      animateClass(this.wrap, this.animation.leave, function(){
        document.body.removeChild(container);
      })
      
    },



    // 初始化事件
    _initEvent: function(){

      this.container.querySelector('.confirm').addEventListener(
        'click', this._onConfirm.bind(this)
      )
      this.container.querySelector('.cancel').addEventListener(
        'click', this._onCancel.bind(this)
      )
    },

    _onConfirm: function(){
      // this.onConfirm();  //弃用的设计
      this.emit('confirm')//添加confirm事件接口
      //使用此方法可将调用者与被调用者解耦,
      // 实现多个监听者对同一个对象的监听
      //例如：可以一次性添加更多事件接口,
      //开发者只需在使用时调用所需接口即可,
      //而不必在实例化时手动添加多个,再来这里添加
      this.hide();        //隐藏弹窗
    },

    _onCancel: function(){
      this.emit('cancel')//添加cancel事件接口
      this.hide();        //隐藏弹窗
    }

  })


  // 使用混入Mixin的方式使得Slider具有事件发射器功能
  extend(Modal.prototype, emitter);
  //这句不是应该写在前边吗???
  //为什么在构造函数已经出现的时候再进行混入
  //为什么modal产生后才后续添加内容???
  //上一批拷贝到原型的对象已经调用了this.emit(),
  //如果最后传入,它们怎么找到这个方法的






  //          5.Exports
  // ----------------------------------------------------------------------
  // 暴露API:  Amd || Commonjs  || Global 
  // 支持commonjs
  if (typeof exports === 'object') {
    module.exports = Modal;
    // 支持amd
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return Modal
    });
  } else {
    // 直接暴露到全局
    window.Modal = Modal;
  }


}()

