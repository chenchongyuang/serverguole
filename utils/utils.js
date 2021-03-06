﻿const SMSClient = require('@alicloud/sms-sdk')

const crypto = require('crypto');

const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: 'smtp.163.com', //主机地址
  port: 25, //端口
  auth: {
    user: '13927975080@163.com', //发件邮箱
    pass: '13927975080qq' //授权码  
  }
});

class Utils{
	constructor () {}
	//短信功能
	sendMessage (phone,code) {
        
		// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
		const accessKeyId = 'LTAIVSulUBsxpgT4'
		const secretAccessKey = 'BWuid66FiUFNFXhWtSitTJETuAQ87F'
		//初始化sms_client
		let smsClient = new SMSClient({accessKeyId, secretAccessKey})
		//发送短信
		return smsClient.sendSMS({
		   PhoneNumbers: phone,
		   SignName: '红星商城',
		   TemplateCode: 'SMS_119091894',
		   TemplateParam: '{"code":'+ code +'}'
		})
	}

	//加密功能
    addCrypto (o,field) {
    	//使用md5加密
       let md5 = crypto.createHash('md5');

       //指定加密字段
       md5.update(o[field]);

       o[field] = md5.digest('hex');
	}
	//发邮箱
	sendEmail (options, fn) {
    transporter.sendMail(options, fn);
  }
}
	

module.exports = new Utils();