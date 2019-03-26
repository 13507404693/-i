/**
 * 日期格式化
 * @param {String} date 日期
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 获取本月第一天 
 * @param {String} date 日期
 */
const Firstmonth= date => { 
  // var date = new Date();
  var year = date.getFullYear() + "";
  var month = (date.getMonth() + 1) + "";

  // 本月第一天日期
  var begin = year + "-" + month+"-01"  
  return begin
}
    
/**
 * 本月最后一天日期
 * @param {String} date 日期
 */
const Thelastmonth = date => { 
  var year = date.getFullYear() + "";
  var month = (date.getMonth() + 1) + "";

  var lastDateOfCurrentMonth = new Date(year, month, 0);
  var end = year + "-" + month + "-" + lastDateOfCurrentMonth.getDate()

  return end;

}

/**
 * 数字补 0
 * @param {Number} n  
 */
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 验证手机号码
 * @param {number} num 手机号码
 */
const isPoneAvailable = num => {
  const reg = /^[1][3,4,5,7,8][0-9]{9}$/;
  if (!reg.test(num)) {
    return false;
  } else {
    return true;
  }
};

/**
 * 显示成功弹窗
 * @param {String} title 标题
 */
const showSuccessToast = (title, icon, time) => {
  let param = {
    title: title || '错误',
    duration: time || 1000
  };

  if (icon === '') {
    Object.assign(param, {
      icon: 'none'
    });
  } else {
    Object.assign(param, {
      icon: 'none',
      image: '../../images/success.png'
    });
  };
  wx.showToast(param);
}

/**
 * 显示错误弹窗
 * @param {String} title 标题
 */
const showErrorToast = (title, icon, time) => {
  let param = {
    title: title || '错误',
    duration: time || 1000
  };

  if (icon === '') {
    Object.assign(param, {
      icon: 'none'
    });
  } else {
    Object.assign(param, {
      icon: 'none',
      image: '../../images/errors.png'
    });
  };
  wx.showToast(param);
}

/**
 * id 分割
 * @param {String} param 
 */
const idSplit = param => {
  if (typeof param + '' !== 'string') return '';

  let strArr = param.split('');
  let str = '';
  for (let i = 0; i < strArr.length; i++) {
    str += i % 4 === 3 ? strArr[i] + ' ' : strArr[i];
  };

  return str;
};


/**
 * 去除字符串 Html 标签
 * @param {String} str HTML
 */
const filterHtml = str => {
  str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
  str = str.replace(/[ | ]*\n/g, ''); //去除行尾空白
  str = str.replace(/\n[\s| | ]*\r/g, ''); //去除多余空行
  str = str.replace(/&nbsp;/g, '');
  return str;
}

const extractURLparmes = url => {
  let pattern = /(\w+)=(\w+)/ig;
  let parames = {};
  url.replace(pattern, function (a, b, c) {
    parames[b] = c;
  });
  return parames;
};

/**
 * 对像数组去重
 * @param {Array} arr HTML
 */
const unique = (arr, key) => {
  var res = [];
  var json = {};
  for (var i = 0; i < arr.length; i++) {
    if (!json[arr[i][key]]) {
      res.push(arr[i]);
      json[arr[i][key]] = 1;
    }
  }
  return res;
};

/**
 * 切除 emoji表情
 * @param {String} str 
 */
const filterEmoji = str => {
  return str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
}

/**
 * 验证 金额
 * @param {Strong} value 金额
 */
const validateMoney = value => {
  const money = value;
  const moneyss = /^(([0-9]+[\.]?[0-9]{1,2})|[1-9])$/;

  if (money === '') return false;
  if (!moneyss.test(money) || money <= 0) {
    return false;
  };

  return true
};

/**
 * 计算两个 经纬度 距离
 */
const getGreatCircleDistance = (lat1, lng1, lat2, lng2) => {
  var EARTH_RADIUS = 6378137.0; //单位M
  var PI = Math.PI;

  function getRad(d) {
    return d * PI / 180.0;
  }

  var radLat1 = getRad(lat1);
  var radLat2 = getRad(lat2);

  var a = radLat1 - radLat2;
  var b = getRad(lng1) - getRad(lng2);

  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000.0;

  return s;
}

module.exports = {
  formatTime,
  formatNumber,
  isPoneAvailable,
  showSuccessToast,
  showErrorToast,
  idSplit,
  filterHtml,
  extractURLparmes,
  unique,
  filterEmoji,
  validateMoney,
  getGreatCircleDistance,
  Firstmonth,
  Thelastmonth
}