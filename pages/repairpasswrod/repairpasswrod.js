// pages/Sign/Sign.js
let interval = null //倒计时函数
const app = getApp();
const { isPoneAvailable, showSuccessToast, showErrorToast } = require('../../utils/util.js');
const { api, wxApi } = require('../../server/index.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Name: '',
    Pass: '',
    Code: '',
    bg_bj: 'bth_tj',
    time: '获取验证码', //倒计时 
    currentTime: 61,
    phonePass: '',
    rePhonePass: '',
    unionid: '',
    apicode: '',
    login_type: '',
    isCorrectPhone: false,
    timeState: 'end'
  },
  // 用户名
  userName(e) {
    this.setData({
      Name: e.detail.value,
    });
  },
  // 手机号码
  userPass(e) {

    if (this.data.timeState !== 'end') {
      this.setData({
        Pass: e.detail.value,
        isCorrectPhone: false
      });
      return;
    };

    this.setData({
      Pass: e.detail.value,
      isCorrectPhone: isPoneAvailable(e.detail.value)
    });
  },
  // 短信验证码
  userCode(e) {
    this.setData({
      Code: e.detail.value,
    });
  },
  // 密码
  userphonePass(e) {
    const phonePassvalue = e.detail.value;

    this.setData({
      phonePass: phonePassvalue,
    });

    // 判断 短信 有内容就提交光亮  没有内容就提交不光亮 
    if (this.data.phonePass !== '') {
      this.setData({
        bg_bj: 'bth_tj42'
      })
    } else {
      this.setData({
        bg_bj: 'bth_tj'
      })
    };

  },
  reUserphonePass(e) {
    this.setData({
      rePhonePass: e.detail.value,
    });
  },
  /**
   * 验证码倒计时
   */
  getCode() {
    let currentTime = this.data.currentTime;

    interval = setInterval(() => {
      currentTime--;
      this.setData({
        time: `${currentTime}秒`,
        timeState: 'start'
      });

      if (currentTime <= 0) {
        clearInterval(interval)
        this.setData({
          time: '重新发送',
          currentTime: 61,
          isCorrectPhone: true,
          disabled: false,
          timeState: 'end'
        })
      }
    },1200);

  },
  /**
   * 获取验证码 判断是否 注册 和未注册
   */
  getVerificationCode() {
    const that = this;
    const phonepas = that.data.Pass;

    if (!isPoneAvailable(phonepas)) {
      showErrorToast('请填写正确的手机号码！');
      return;
    };

    api.phonecode(phonepas).then(res=>{ 
        
        if (res.data.msg === '发送成功') {
          
          wx.showToast({
            title: '发送成功',
          })

          that.getCode();
          that.setData({
            disabled: true,
            isCorrectPhone: false
          });
          return;
        };


       
    }).catch(err => console.error(err));

  },
  /**
   * 获得授权信息
   */
  onGotUserInfo(e) {
    const that = this;
  },

  /**
   * 提交注册
   */
  submit:function(e){
    const that = this;

    // 手机号码验证
    if (!isPoneAvailable(that.data.Pass)) {
      showErrorToast('请输入手机号码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
      return false;
    };

    if (that.data.Code === '' || typeof parseInt(that.data.Code) !== 'number') {
      showErrorToast('请输入验证码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
      return false;
    }

    if (that.data.phonePass === '') {
      showErrorToast('请设置密码', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
      return false;
    }

    if (that.data.phonePass.length < 6){ 
      showErrorToast('密码不能少于6位', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
      return false;
    }

    if (that.data.phonePass !== that.data.rePhonePass) {
      showErrorToast('密码不一致', 'https://sp.lion-mall.com/miniprogram/images/errors.png');
      return false;
    }
  var list_up={ 
    code:that.data.Code,
    mobile: that.data.Pass,
    password: that.data.phonePass
  }

  api.repPassWrod(list_up).then(res=>{ 
        if (res.data.status==false){ 
          if (res.data.msg == "验证码不正确"){ 
            showErrorToast(res.data.msg, 'https://sp.lion-mall.com/miniprogram/images/errors.png');
          }
        }


        if (res.data.status==true){ 
          if (res.data.msg =='重置成功'){ 
            wx.showToast({
              title: '密码修改成功',
            })
          }

        setTimeout(function(){
          wx.navigateTo({
            url: '/pages/binding/binding',
          })
        },2000)

        }
  
  }).catch(err=>{ 
  
      console.log(err);
  
  })

    // api.registerMember(
    //   that.data.Code,
    //   that.data.Pass,
    //   that.data.phonePass,
    //   that.data.unionid).then(res => {

    //     that.Signin(); //登录函数调用
    //   }).catch(err => console.log(err));

  },
  // 注册成功自动登录到我界面
  Signin: function () {
    const that = this;

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  },
  /**
   * 失去焦点验证手机号码 
   */
  focusInput(e) {
    if (e.detail.value === '') return;

    if (!isPoneAvailable(e.detail.value)) {
      showErrorToast('请填写正确的手机号码！');
      return;
    };
  }
})