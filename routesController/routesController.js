const Utils = require(__basename + '/utils/utils.js');

const API = require(__basename + '/service/api.js');

const SQL = require(__basename + '/lib/sql/sql.js');

const common =require(__basename + '/common/common.js');

class RouteController {
	constructor () {}
    //短信获取验证码功能
	sendMessageController (req,res){
        //随机生成6位验证码

        let time = new Date().getTime().toString();
        
        let code = time.slice(time.length - 6);
         
        Utils.sendMessage(req.body.phone,code)
        .then((data) => {

				    let {Code} = data;
				    if (Code === 'OK') {
				        //处理返回参数
				        res.json({code:code,msg:'发送成功',status:1})
				        console.log(data)
				    }
				}, (err) => {
				    console.log(err);
				    res.json({msg:'发送超时',status:0})
				})
	}
	//email获取验证码功能
	forget_pwd_email_codeController(req,res){
		let time = new Date().getTime().toString();
		let code = time.slice(time.length - 6);
		let selectSQL = SQL.emailSQL(req.body);
		API.query(selectSQL)
		.then(result =>{
			if(result[0].length == 1){
				let options = {
				from:'13927975080@163.com',
				to:req.body.email,
				subject:'修改密码',
				text:'验证码',
				html:'<b>您的验证码是'+ code +'请在规定时间输入</b>'
			    };
				Utils.sendEmail(options,() =>{
	                res.send({msg: '验证码已发至您的邮箱, 请注意查收!', statusCode: 700, validCode: code});
				})
			}else{
				res.send('出错了');
			}
			
		})
		.catch(err =>{
			res.send('出错了');
		})
	}
	//注册功能
	registerController(req,res){
      //查询手机号是否被注册
      let selectSQL = SQL.findOneSQL(req.body,'phone');
      API.query(selectSQL)
        .then(result =>{
        	if(result[0].length == 1){
        		res.json(common.register.info);
        	}else{
	    		Utils.addCrypto(req.body,'pwd');
					  let sql = SQL.registerSQL(req.body);

					  API.query(sql)
						  .then(data =>{
						  	console.log(sql);
						  	res.json(common.register.success);
						  }) 
						  .catch(err =>{
						  	
						  	res.json(common.register.error);
				 })
	          }
        })
        .catch(err =>{
        	res.json(common.register.error);
        })
	  
	}
    //登陆功能
	loginController(req,res){
		Utils.addCrypto(req.body,'pwd');
		let selectSQL1 = SQL.findOneSQL(req.body,'phone');
		let selectSQL2 = SQL.loginSQL(req.body,'phone','pwd');
		   API.query(selectSQL1)
		     .then(result =>{
		     	if(result[0].length === 1){
                    API.query(selectSQL2[0])
                      .then(result =>{
                      	if(result[0].length === 1){
                      		common.login.success.phone = result[0][0].phone;
                      		common.login.success.uname = result[0][0].uname;
                      		common.login.success.uid = result[0][0].uid;
                      		common.login.success.ger = result[0][0].ger;
	                      		let updatsql = SQL.loginstatusSQL(req.body,1);
	                      		for(let i=0;i<updatsql.length;i++){
	                      			  API.query(updatsql[i])
		                      		   .then(result =>{
		                      		   	   if( i === updatsql.length - 1 ){
		                                       common.login.success.default_address = result[0][0].area +','+result[0][0].detailed_area;
			                      		   	   res.json(common.login.success);
			                      		   	   }
		                                 
		                      		   })
		                      		   .catch(err =>{
		                      		   	   res.json(common.login.info);
		                      		   })
	                      		}
                      		
                      	}else{
                            res.json(common.login.error);
                      	}
                      })
		     	}else{
		     		res.json(common.login.info);
		     	}
		     })
		     .catch(err =>{
		     	res.json(common.login.info);
		     })
	}
    //首页数据查询
	homeController(req,res){
		let selectSQL = SQL.homeSQL(req.query);
		let data = {};
		let arr =['banner', 'classify', 'products'];
		selectSQL.forEach((v,i) =>{
            API.query(v)
	          .then(result =>{
	          	data[arr[i]] = result[0];
	          	if(i == selectSQL.length - 1 ){
	          		res.send(data);
	          	}
	          })
	          .catch(err =>{
	          	res.send(err);
	          })
		})
	}
	//产品详情页查询
	product_dataController(req,res){
		let selectSQL = SQL.product_dataSQL(req.query,'id'); 
		API.query(selectSQL)
		  .then(result =>{
		  	  res.send(result[0]);
		  })
		  .catch(err =>{
		  	res.send(err);
		  })
	}

	//产品查询
	productController(req,res){
        let selectSQL = SQL.homeSQL();
        let data=[];
        API.query(selectSQL[2])
          .then(result =>{
          	data.push(result[0]);
          	API.query(selectSQL[3])
          	  .then(result =>{
          	  	data.push(result[0]);
          	  	res.send(data);
          	  })
          	  .catch(err =>{
          	  	res.send(err);
          	  })
          })
          .catch(err =>{
          	res.send(err);
          })
        
	}
	//手机修改密码
	forget_pwdController(req,res){
		Utils.addCrypto(req.body,'pwd');
		let selectSQL = SQL.findOneSQL(req.body,'phone');
		let selectSQL1 = SQL.forget_pwdSQL(req.body);
		API.query(selectSQL)
		  .then(result =>{
		  	  if(result[0].length === 1){
                     API.query(selectSQL1[0])
                     .then(result =>{
                   	    res.send('修改成功');
                     })
                     .catch(err =>{
                     	res.send(err);
                     })
		  	  }else{
		  	  	 res.send('账号未注册');
		  	  }
		  })
		  .catch(err =>{
		  	res.send(err);
		  })
	}
	//email修改密码
	forget_pwd_emailController(req,res){
		Utils.addCrypto(req.body,'pwd');
		let selectSQL = SQL.findOneSQL(req.body,'email');
		let selectSQL1 = SQL.forget_pwdSQL(req.body);
		API.query(selectSQL)
		  .then(result =>{
		  	  if(result[0].length === 1){
                     API.query(selectSQL1[1])
                     .then(result =>{
                     	console.log(result[0]);
                   	    res.send('修改成功');
                     })
                     .catch(err =>{
                     	res.send(err);
                     })

		  	  }else{
		  	  	 res.send('email未注册');
		  	  }
		  	 
		  })
		  .catch(err =>{
		  	res.send(err);
		  })
	}
    //订单查询
	orderController(req,res){
		let selectSQL = SQL.orderSQL();
		let data=[];
		API.query(selectSQL[0])
		  .then(result =>{
		  	data.push(result[0]);
		  	API.query(selectSQL[1])
		  	  .then(result =>{
		  	  	data.push(result[0]);
		  	  	res.send(data);
		  	  })
		  	  .catch(err =>{
		  	  	res.send(err);
		  	  })
		  	
		  })
		  .catch(err =>{
		  	res.send(err);
		  })
	}
    //购物车查询
	shoppingController(req,res){
		let selectSQL = SQL.shoppingSQL(req.query);
		let data = [];
		API.query(selectSQL[0])
		  .then(result =>{
		  	data.push(result[0])
		  	API.query(selectSQL[1])
			  	.then(result =>{
			  		data.push(result[0])
			  		res.send(data);
			  	})
			  	.catch(err =>{
			  		res.send(err);
			  	})
		  
		  })
		  .catch(err =>{
		  	res.send(err);
		  })
	}
	//退货查询
	returnsController(req,res){
		let selectSQL = SQL.returnsSQL();
		API.query(selectSQL)
		  .then(result =>{
		  	res.send(result[0]);
		  })
		  .catch(err =>{
		  	res.send(err);
		  })
	}
    //删除订单
	Deletete_orderController(req,res){
		 let selectSQL = SQL.Delete_orderSQL(req.query.id);
		 API.query(selectSQL)
		 .then(result =>{
		 	res.send(result[0]);
		 })
		 .catch(err =>{
		 	res.send(err);
		 })
	}
	//添加地址
	addressController(req,res){
		let selectSQL = SQL.addressSQL(req.query);
		API.query(selectSQL[0])
		  .then(result =>{
		  	res.send(result[0]);
		  })
		  .catch(err =>{
		  	res.send(err);
		  })
	}
	//地址管理
    ship_adsController(req,res){
    	let selectSQL = SQL.addressSQL(req.query);
			API.query(selectSQL[1])
			  .then(result =>{
			  	res.send(result[0]);
			  })
			  .catch(err =>{
			  	res.send(err);
			  })
	} 
    //加入购物车
    join_shoppingController(req,res){
    	let selectSQL = SQL.shoppingSQL(req.query);
    	API.query(selectSQL[2])
    	  .then(result =>{
    	  	console.log(result[0]);
    	  	res.send(result[0]);
    	  })
    	  .catch(err =>{
    	  	res.send('出错了');
    	  })
    }
    //修改个人资料
    mine_dataController(req,res){
    	let obj=JSON.parse(req.query.obj)
    	let selectSQL = SQL.mine_dataSQL(obj,req.query.val1,req.query.val2,req.query.val3);
    	API.query(selectSQL)
    	  .then(result =>{
    	  	res.send(result[0]);
    	  })
    	  .catch(err =>{
    	  	res.send('出错了');
    	  })
    }
    //退出登录
    drop_outController(req,res){
    	let selectSQL = SQL.loginstatusSQL(req.query,0);
    	  API.query(selectSQL[0])
    	    .then(reault =>{
    	    	res.send('成功退出');
    	    })
    	    .catch(err =>{
    	    	res.send('出错了');
    	    })
    }
}

module.exports = new RouteController();