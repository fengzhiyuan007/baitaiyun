var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    isPC: false,
    isIpad: false,
    isIOS: false,
    isAndroid: false,
    isWP: false,
    isQQ: false,
    isWeiXin: false
  },
  methods: {
  	isOS() {
	    let sUserAgent = navigator.userAgent.toLowerCase();

  	  this.isIpad = sUserAgent.match(/ipad/i) == "ipad", // ipad
      this.isIOS = sUserAgent.match(/iphone os/i) == "iphone os", // iphone
      this.isAndroid = sUserAgent.match(/android/i) == "android", // 安卓
  		this.isWP = sUserAgent.match(/Windows Phone/i) == "Windows Phone", // windows phone
  		this.isQQ = sUserAgent.match(/\sQQ/i) == " qq", // QQ
  		this.isWeiXin = sUserAgent.match(/MicroMessenger/i) == 'micromessenger'; // 微信

	    if(!(this.isIpad || this.isIOS || this.isAndroid || this.isWP)){ // pc
	    	console.log('pc')
	    	this.isPC = true
	    }else if(this.isWeiXin || this.isQQ){
	    	console.log('weixin || qq')
	    }else if(this.isIOS || this.isIpad){
	    	console.log('ios || ipad')
	    }else if(this.isAndroid){
	    	console.log('isAndroid')
	    }else if(this.isWP){
	    	console.log('isWP')
	    }
		}
  },
  created () {
  	this.isOS()
  }
})

