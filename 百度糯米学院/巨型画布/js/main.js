var BigCanvas = (function(document,undefined){
	function BigCanvas(options){
		this.lCanvasWidth = 200;
		this.lCanvasHeight = 100;
		this.bCanvasWidth = 1024;
		this.bCanvasHeight = 768;
		this.indicatorSpeed = 10;
		this.indicatorPos = { x : 0, y : 0};
		this.panColor = '#0000ff';
		this.init(options);
	}

	BigCanvas.prototype = {
		constructor : BigCanvas,
		/**
		初始化画布函数
		@param {options} 初始化参数列表
		*/
		init : function(options){
			var that = this;
			this.shapes = [];
			this.bigCanvas = document.getElementById(options.bigCanvasId);
			this.imgFile = document.getElementById(options.imgFileId);
			this.littleCanvas = document.getElementById(options.littleCanvasId);
			this.indicator = document.getElementById(options.indicatorId);
			this.rangeX = document.getElementById(options.xrangeId);
			this.rangeY = document.getElementById(options.yrangeId);
			this.rectBtn = document.getElementById(options.rectBtn);
			this.circleBtn = document.getElementById(options.circleBtn);
			this.lineBtn = document.getElementById(options.lineBtn);
			this.textHelp = document.getElementById(options.textHelpId);
			this.panColorInput = document.getElementById(options.panColorId);
			this.lCtx = this.littleCanvas.getContext('2d');
			this.bCtx = this.bigCanvas.getContext('2d');

			// 创建图片背景
			this.backgroundImg = this.getImage('img/1.jpg');
			this.backImgReloaded =  this.backImgReloaded.bind(this);
			this.backgroundImg.onload = this.backImgReloaded;
			//添加事件处理
			var isMouseDown = false;
			//标志画布是否正在被绘制
			this.canvasOnDraw = false;
			//小画布点击事件
			this.littleCanvas.addEventListener('mousedown', function(event){
				if(event.button == 0){
	                isMouseDown = true;
					var maxWidth = that.lCanvasWidth - that.indicatorWidth -2;
					var maxHeight = that.lCanvasHeight - that.indicatorHeight - 2;
					that.indicatorPos.x = event.offsetX >  maxWidth ? maxWidth : event.offsetX;
					that.indicatorPos.y = event.offsetY >  maxHeight ? maxHeight : event.offsetY;
					that.drawLittleCanvas();
					that.drawBigCanvas();
				}	
				
			});

			this.littleCanvas.addEventListener('mousemove',function(event){
				if(isMouseDown && event.button == 0){
					
					var maxWidth = that.lCanvasWidth - that.indicatorWidth -2;
					var maxHeight = that.lCanvasHeight - that.indicatorHeight - 2;
					that.indicatorPos.x = event.offsetX >  maxWidth ? maxWidth : event.offsetX;
					that.indicatorPos.y = event.offsetY >  maxHeight ? maxHeight : event.offsetY;
					that.drawLittleCanvas();
					that.drawBigCanvas();
				}
				
			});
			//大画布点击事件
			var isBigMouseDown = false;
			this.bigCanvas.addEventListener('mousedown', function(event){
				if(event.button == 0){
					if(that.canvasOnDraw){
						//点击起始位置
						that.canvasDrawStartPos = [event.offsetX,event.offsetY];
						
					}
					isBigMouseDown = true;
				}
				
			});
			this.bigCanvas.addEventListener('mousemove', function(event){	
				if(isBigMouseDown && event.button == 0){
					if(that.canvasOnDraw){
						//点击结束位置
						that.canvasDrawEndPos = [event.offsetX,event.offsetY];
						that.drawLittleCanvas();
				        that.drawBigCanvas();
						return;
					}
					var posX = that.indicatorPos.x - event.movementX / that.indicatorSpeed;
					var posY =  that.indicatorPos.y - event.movementY / that.indicatorSpeed;
					if(posX < 0){
						posX = 0;
					}
					else if(posX > that.lCanvasWidth - that.indicatorWidth -2){
						posX = that.lCanvasWidth - that.indicatorWidth -2;

					}
					if(posY < 0){
						posY = 0;
					}
					else if(posY > that.lCanvasHeight - that.indicatorHeight - 2){
						posY = that.lCanvasHeight - that.indicatorHeight - 2;
					}
					that.indicatorPos.x = posX; 
					that.indicatorPos.y = posY; 
					that.drawLittleCanvas();
				    that.drawBigCanvas();

				}
			});
			this.bigCanvas.addEventListener('mouseup',function(event){

				if(that.canvasOnDraw && event.button == 0){
					//鼠标抬起保存画的形状,及其它在整个巨型画布中的相对位置
					that.shapes.push({
						color : that.panColor,
						type : that.canvasDrawType,
						startPos : [that.canvasDrawStartPos[0] + that.backgroundImg.width * that.indicatorPos.x / that.lCanvasWidth,
						           that.canvasDrawStartPos[1] + that.backgroundImg.height * that.indicatorPos.y / that.lCanvasHeight],
						endPos : [that.canvasDrawEndPos[0] + that.backgroundImg.width * that.indicatorPos.x / that.lCanvasWidth,
						           that.canvasDrawEndPos[1] + that.backgroundImg.height * that.indicatorPos.y / that.lCanvasHeight]
					});
				}
				
			});
			document.addEventListener('mouseup',function(event){
				if(event.button == 0){
					isMouseDown = false;
				    isBigMouseDown = false;
				}else if(event.button == 2){
					//alert('f');
					that.textHelp.innerHTML = '请选择要画的形状';
				    that.bigCanvas.className = '';
				    that.canvasOnDraw = false;
				}
				
			});
			document.addEventListener('mousedown',function(event){
				if(that.canvasOnDraw && event.target != that.bigCanvas){
					that.textHelp.innerHTML = '请选择要画的形状';
				    that.bigCanvas.className = '';
					that.canvasOnDraw = false;
				}
			});
			document.addEventListener('contextmenu', function (event) {
				var event = event || window.event;
				if( event.target == that.littleCanvas || event.target == that.bigCanvas){
					event.preventDefault();
				    event.returnValue = false;
				}	
				return false;
			})
			//画图形按钮事件
			this.circleBtn.addEventListener('click',function(event){
				that.textHelp.innerHTML = '请点击并拖动进行画圆，右键取消';
				that.bigCanvas.className = 'ondraw';
				that.canvasOnDraw = true;
				that.canvasDrawType = 'circle';
			});
			this.rectBtn.addEventListener('click',function(event){
				that.textHelp.innerHTML = '请点击并拖动进行画矩形，右键取消';
				that.bigCanvas.className = 'ondraw';
				that.canvasOnDraw = true;
				that.canvasDrawType = 'rect';
			});
			this.lineBtn.addEventListener('click',function(event){
				that.textHelp.innerHTML = '请点击并拖动进行画线，右键取消';
				that.bigCanvas.className = 'ondraw';
				that.canvasOnDraw = true;
				that.canvasDrawType = 'line';
			});
			//背景图片修改事件
			this.imgFile.onchange = function(){
				var fileReader = new FileReader();
	    	    fileReader.readAsDataURL(file.files[0]);
	    	    fileReader.onload = function(){
	    	    	//alert(this.result);
	    	    	that.backgroundImg = that.getImage(this.result);
	    	    	that.backgroundImg.onload = that.backImgReloaded;
	    	    	
	    	    }
			}

			//滑动条事件
			this.rangeX.addEventListener('change', function(event){
				that.indicatorPos.x = this.value;
				that.drawLittleCanvas();
				that.drawBigCanvas();
			});
			this.rangeY.addEventListener('change', function(event){
				that.indicatorPos.y = this.max - this.value;
				that.drawLittleCanvas();
				that.drawBigCanvas();
			});
			//画笔颜色onchange事件
			this.panColorInput.onchange = function(){
				var reg = /#[0-9abcdef]{6}/ig;
				if(!reg.test(this.value)){
					alert('输入格式错误');
					this.value = '#0000ff';
					return;
				}
				that.panColor = this.value;
			}
			
		},
		/**
		背景图片变化的onload函数
		*/
		backImgReloaded : function(){
			var that = this;
			if(that.backgroundImg.width < that.bCanvasWidth || that.backgroundImg.height < that.bCanvasHeight){
				that.backgroundImg = that.getImage('img/1.jpg');
				alert('图片像素小于1024x768');
				return;
			}
			that.scaleX = that.backgroundImg.width / that.bCanvasWidth;
			that.scaleY = that.backgroundImg.height / that.bCanvasHeight;
			//红色方框的宽高是自适应的
			that.indicatorWidth = that.lCanvasWidth / that.scaleX;
	        that.indicatorHeight = that.lCanvasHeight / that.scaleY;
	        that.indicator.style.width = that.indicatorWidth + 'px';
	        that.indicator.style.height = that.indicatorHeight + 'px';
	        
	        that.rangeX.max = that.lCanvasWidth - that.indicatorWidth - 2;
	        that.rangeY.max = that.lCanvasHeight - that.indicatorHeight - 2;
	        that.rangeX.value = 0;
	        that.rangeY.value = that.rangeY.max;
			that.drawLittleCanvas();
			that.drawBigCanvas();
		},
		/**
		重新绘制小画布

		*/
		drawLittleCanvas : function(){
			this.lCtx.clearRect(0, 0, this.lCanvasWidth, this.lCanvasHeight);
			//this.lCtx.fillStyle = this.backgroundStyle;
			//this.lCtx.fillRect(0, 0, this.lCanvasWidth, this.lCanvasHeight);
			this.lCtx.drawImage(this.backgroundImg, 0, 0, this.backgroundImg.width, this.backgroundImg.height,
				0, 0, this.lCanvasWidth, this.lCanvasHeight);

			this.rangeX.value = this.indicatorPos.x;
			this.rangeY.value = this.rangeY.max - this.indicatorPos.y;
			this.indicator.style.top = this.indicatorPos.y + 'px';
			this.indicator.style.left = this.indicatorPos.x + 'px';
		},
		/**
		重新绘制大画布

		*/
		drawBigCanvas : function(){
			this.bCtx.clearRect(0, 0, this.bCanvasWidth,this.bCanvasWidth);

            this.bCtx.drawImage(this.backgroundImg, this.indicatorPos.x * this.backgroundImg.width / this.lCanvasWidth, 
            	  this.indicatorPos.y *  this.backgroundImg.height / this.lCanvasHeight, 
            	  this.bCanvasWidth, this.bCanvasHeight,0,0, this.bCanvasWidth,this.bCanvasHeight);
			this.drawShape();
		},
		/**
		绘制形状，有两种，一种是在内存中保存的已绘制的形状，另一种是画布正在被绘制时候的动态形状。
		*/
		drawShape : function(){
			var xtemp, ytemp, dist, i;
			if(this.canvasDrawType === 'circle' && this.canvasOnDraw){
				xtemp = this.canvasDrawEndPos[0] - this.canvasDrawStartPos[0];
				ytemp = this.canvasDrawEndPos[1] - this.canvasDrawStartPos[1];
				dist = Math.sqrt(xtemp * xtemp + ytemp * ytemp);
				this.drawCircle(this.canvasDrawStartPos, dist, this.panColor);
			}else if(this.canvasDrawType === 'rect' && this.canvasOnDraw){
				this.drawRect(this.canvasDrawStartPos, this.canvasDrawEndPos, this.panColor);
			}else if(this.canvasDrawType === 'line' && this.canvasOnDraw){
				this.drawLine(this.canvasDrawStartPos, this.canvasDrawEndPos, this.panColor);
			}
			for(i = 0; i < this.shapes.length; i++){
				if(this.shapes[i].type == 'circle'){
					xtemp = this.shapes[i].startPos[0] - this.shapes[i].endPos[0],
					ytemp = this.shapes[i].startPos[1] - this.shapes[i].endPos[1];
					dist = Math.sqrt(xtemp * xtemp + ytemp * ytemp);
					this.drawCircle([this.shapes[i].startPos[0] - this.backgroundImg.width * this.indicatorPos.x / this.lCanvasWidth
						,this.shapes[i].startPos[1] - this.backgroundImg.height * this.indicatorPos.y / this.lCanvasHeight], dist, this.shapes[i].color);
				}else if(this.shapes[i].type == 'rect'){
					this.drawRect([this.shapes[i].startPos[0] - this.backgroundImg.width * this.indicatorPos.x / this.lCanvasWidth
						,this.shapes[i].startPos[1] - this.backgroundImg.height * this.indicatorPos.y / this.lCanvasHeight], 
						[this.shapes[i].endPos[0] - this.backgroundImg.width * this.indicatorPos.x / this.lCanvasWidth
						,this.shapes[i].endPos[1] - this.backgroundImg.height * this.indicatorPos.y / this.lCanvasHeight], this.shapes[i].color);
				}else if(this.shapes[i].type == 'line'){
					this.drawLine([this.shapes[i].startPos[0] - this.backgroundImg.width * this.indicatorPos.x / this.lCanvasWidth
						,this.shapes[i].startPos[1] - this.backgroundImg.height * this.indicatorPos.y / this.lCanvasHeight], 
						[this.shapes[i].endPos[0] - this.backgroundImg.width * this.indicatorPos.x / this.lCanvasWidth
						,this.shapes[i].endPos[1] - this.backgroundImg.height * this.indicatorPos.y / this.lCanvasHeight], this.shapes[i].color);
				}
			}
		},
		/**
		获取图片
		*/
		getImage : function(url){
			var img = new Image();
		    img.src = url;
		    return img;
		},
		/**
		画圆
		*/
		drawCircle: function (coc, radial, color) {
			var context = this.bCtx;
			context.beginPath();
			context.lineWidth = 3;
			context.strokeStyle = color;
			context.arc(coc[0], coc[1], radial, 0, 2 * Math.PI);
			context.closePath();
			context.stroke();
		},
		/**
		画矩形
		*/
		drawRect: function (coc1, coc2, color) {

			var context = this.bCtx;
			context.beginPath();
			context.lineWidth = 3;
			context.strokeStyle = color;
			context.moveTo(coc1[0], coc1[1]);
			context.lineTo(coc1[0], coc2[1]);
			context.lineTo(coc2[0], coc2[1]);
			context.lineTo(coc2[0], coc1[1]);
			context.closePath();
			context.stroke();

		},
		/**
		画线
		*/
		drawLine: function (coc1, coc2, color) {
			var context = this.bCtx;
			context.beginPath();
			context.lineWidth = 3;
			context.strokeStyle = color;
			context.moveTo(coc1[0], coc1[1]);
			context.lineTo(coc2[0], coc2[1]);
			context.stroke();
		}
	}
	return BigCanvas;
})(document,undefined);