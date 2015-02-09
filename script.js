jQuery(document).ready(function() {
	if (!window.projectName) {
		// 项目名称
		var projectName = 'Change Logs';
	};
	if (!window.projectAlias) {
		// 项目 localStorage 名
		var projectAlias = 'ChangeLogs';
	};
	if (!window.indexJson) {
		// logs 列表
		var indexJson = 'index.json';
	};

	// 项目 URL
	var projectURL = window.location.origin+window.location.pathname;
	var MainBox = $('#Main');	// 内容 DOM
	var Main = document.getElementById('Main');
	var indeBn = $('#index-bn');	// 目录按钮
	var loadBar = $('#loading');

	// 列出 localStorage 内容
	function listsData () {
		var localData = JSON.parse(localStorage[projectAlias]);
		var logsPost = '';
		for (var i = 0; i < localData.length; i++) {
			if (localData[i].name) {
				logsPost += '<div id="list-box" class="list-left left100"><h2>'+localData[i].name+'</h2>';
				if (localData[i].list) {
					logsPost += catList(localData[i].list);
				};
				logsPost += '</div>';
			};
		};

		// 修改内容，先隐藏
		MainBox.fadeOut('fast', function() {
			// 改变内容
			Main.innerHTML = logsPost;
			$(this).fadeIn('fast');	// 显示内容
			console.log('列出目录');
		});
	}

	// 处理列表
	function catList (carArray) {
		var Category = '<ul class="Category">'
		for (var i = 0; i < carArray.length; i++) {
			Category += '<li><a href="'+projectURL+'#!'+encodeURIComponent(carArray[i].name)+'">'+carArray[i].name+'</a></li>'
		};
		Category += '<ul>';
		return(Category);
	}

	// 遍历数据获取对应的路径并加载
	function loadData (loadAlias,notFirst) {
		// 读取数据
		var localData = JSON.parse(localStorage[projectAlias]);
		loadLength = localData.length;
		for (var i = 0; i < loadLength; i++) {
			for (var i2 = 0; i2 < localData[i].list.length; i2++) {
				if(localData[i].list[i2].name === loadAlias) {
					loadLog(localData[i].list[i2].path, localData[i].list[i2].name);
					console.log('找到并输出 %s', loadAlias);
					break;
				} else if (i === loadLength-1){
					Main.innerHTML = '<div class="error center">没有在数据库中找到该项目</div>';
					console.log('数据中没有 %s', loadAlias);
				};
			};
		};
	}

	// 显示项目 Log
	function loadLog (logPath,logName) {
		/*
		*	logPath -> 需要加载 log 的路径
		*	logName -> log 名
		*/ 
		var logPost = '<h2>'+logName+'</h2><div id="Log-Path" class="fz12"><a href="'+projectURL+logPath+'">'+projectURL+logPath+'</a></div>';
		// console.log(logPath);
		$.ajax({
			url: logPath,
			cache: false,
			dataType: 'json',
			success: function (logData) {
				logPost += '<ul id="Log-Main" class="main-box-list left100">';
				for (var i = 0; i < logData.length; i++) {
					logPost += '<li class="left100"><button class="log-header left100"><h3>'+logData[i].version+'</h3><time class="fz12 c777">'+logData[i].time+'</time></button><div class="post left100">'+marked(logData[i].log)+'</div></li>';
				};
				logPost += '</ul>'
				MainBox.fadeOut('fast', function() {
					Main.innerHTML = logPost;
					console.log("将 %s 内容输出页面",logPath);
					$(this).fadeIn('fast');
				});
			},
			error: function () {
				console.log("无法读取 %s",logPath);
			}
		});
		
	}
	
	// 点击 index 按钮列出所有 logs
	indeBn.click(function() {
		if (window.location.hash) {
			$("html,body").animate({scrollTop: '0'}, 500);
			listsData();
			// 修改 URL
			window.history.pushState(null, projectName, ' ');
		};
	});

	// 项目列表 A 标签
    $('#Main').on("click", ".Category a", function(){  
        //使用 on 是可以让 jQuery 后来载入的内容也可以支持点击动作
    	var href = $(this).attr("href");   //获取a标签 URL
    	var loadAlias = href.substring(href.lastIndexOf("#!"));    // 获取 URL 问号之后的字符
    	if (loadAlias) {  
            //如果 PageID 存在运行下面的内容
    		loadAlias = decodeURIComponent(loadAlias.substr(2)); //截取前面的问号
    		var nowTitle = loadAlias + ' - ' + projectName;
    		window.history.pushState(null, nowTitle, '#!'+loadAlias);
    		loadData(loadAlias); //载入页面内容，后面的 'go' 
            return false; //阻止a标签跳转
    	};
	});

    // 点击显示日志详情
	$(document).on('click','.log-header',function(){
		var thisVer = $(this).parent().index()+1;
		$('#Log-Main>li:nth-child('+thisVer+')>.post').slideToggle('fast');
	});

	// 将 index.json 写入 localStorage
	function theFirst (argument) {
		$.ajax({
			url: indexJson,
			dataType: 'text',
			success: function (indexData) {
				localStorage[projectAlias] = indexData;
				console.log("将 %s 写入 localStorage",indexJson);
	            var logAlias = window.location.hash; //重新获取对应的值
				if (logAlias) {
					logAlias = decodeURIComponent(logAlias.substr(2));
					console.log("当前文档别 %s",logAlias);
	            	loadData(logAlias);
				} else {
	            	listsData();
				};
				
			},
			error: function () {
				console.log("无法读取 %s",indexJson);
			}
		});
	}
	theFirst();

    /*  判断 url 载入内容，有下面的 window.addEventListener 就不需要这里了!
    *   但是 Firefox 和 IE 不能直接用 window.addEventListener 载入内容所以判断一下浏览器。
    *   navigator.userAgent.match("MSIE")||navigator.userAgent.match("Firefox")
    */
	if (navigator.userAgent.match("MSIE")||navigator.userAgent.match("Firefox")) {
		logAlias = window.location.hash;
		if (logAlias) {
			logAlias = decodeURIComponent(logAlias.substr(2));
			console.log("当前文档名 %s",logAlias);
            loadData(logAlias);
		} else {
            listsData();
		};
    };

    // 浏览器前进后退按钮
	window.addEventListener('popstate', function(e){   
        //当点击浏览器前进后退按钮时候
		if (history.pushState){
            var logAlias = window.location.hash; //重新获取对应的值
			if (logAlias) {
				logAlias = decodeURIComponent(logAlias.substr(2));
				console.log("当前文档别 %s",logAlias);
            	loadData(logAlias);
			} else {
            	listsData();
			};
		}
	}, false);

	// ajax Loadingbar
	$(document).ajaxStart(function () {
		loadBar.show();
	})
	$(document).ajaxStop(function () {
		loadBar.fadeOut(100);
	})


});