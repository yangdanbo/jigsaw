              //拼圖游戲自動求解javascript版代碼
//作者:Dumbbell Yang
//郵箱:yangdanbo@163.com,dumbbellyang@gmail.com
//日期:2011-04-06
//Copyright (c) 2011, Dumbbell Yang
//All rights reserved.
//自由代碼，歡迎引用，歡迎改進，歡迎郵件探討。
//
//示例：
// 
/*function playJigsaw(){
    //缺省為3階，我測試到6階
    var game = new JigsawGame(6);
    game.initProperty();
    game.initResolve();
    //寫log文件
    game.isLog = true;
    
    //交換初始化，保證有解  
    //game.initRuffle(100);
    
    //隨機初始化，可能無解
      game.randomInit();
      
    //指定數據，用于測試
    //game.testInit();
    //game.testSpec(arr);
     
    //求解  
    game.resolve();
    
    //是否有解
    if (game.hasResolve){
        alert("Resolved!");
        
        //顯示解法步驟  
        game.showResolveSteps();
    }
    else{
        alert("No Resolved!");
    }  
      
    //寫log文件    
    game.writeFile(game.getCurrentFolder(),
          "resolve_" + (new Date()).format("yyyyMMddhhmmssS") + ".log",
          game.logContent);
    
    //顯示自動解法步驟
    //game.showAutoSteps(); 
}
*/

Date.prototype.format = function(fmt) { //author: meizz 
  var o = { 
    "M+" : this.getMonth()+1,                 //月份 
    "d+" : this.getDate(),                    //日 
    "h+" : this.getHours(),                   //小? 
    "m+" : this.getMinutes(),                 //分 
    "s+" : this.getSeconds(),                 //秒 
    "q+" : Math.floor((this.getMonth()+3)/3), //季度 
    "S"  : this.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) 
    fmt=fmt.replace(RegExp.$1, 
        (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    for(var k in o) 
        if(new RegExp("("+ k +")").test(fmt)) 
          fmt = fmt.replace(RegExp.$1, 
          (RegExp.$1.length==1) ? (o[k]) : 
          (("00"+ o[k]).substr((""+ o[k]).length))); 
      return fmt; 
}

function JigsawGame(){
    if(isNaN(arguments[0]))  {
        //缺省為三階
        this.Rows = this.Cols = 3; 
        this.processLevel = this.Rows;
    }
    else {
        this.Rows = this.Cols = parseInt(arguments[0]);
        this.processLevel = this.Rows;
    }  
    
    this.originPicIndex = new Array(this.Rows * this.Cols);  
    this.picIndex = new Array(this.Rows * this.Cols);
    
    this.autoSteps = [];
    this.resolveSteps = [];
    this.hasResolve = false;
    this.lastMoveDirect = "";
        
    //最后四個Block的Index，三階為5，6，8，9（base 1）
    this.lastIdx1 = this.Rows * this.Cols - this.Cols - 1; //5
    this.lastIdx2 = this.Rows * this.Cols - this.Cols;     //6
    this.lastIdx3 = this.Rows * this.Cols - 1;             //8
    this.lastIdx4 = this.Rows * this.Cols;                 //9
                
    //二階有解的十二種情況 ,block index(base 1)  三階為5，6，8，9
    this.fourResolvedBlocks = new Array(
            new Array(this.lastIdx1, this.lastIdx2, this.lastIdx3, this.lastIdx4),
            new Array(this.lastIdx1, this.lastIdx2, this.lastIdx4, this.lastIdx3),
            new Array(this.lastIdx2, this.lastIdx3, this.lastIdx1, this.lastIdx4),
            new Array(this.lastIdx3, this.lastIdx1, this.lastIdx2, this.lastIdx4),
            new Array(this.lastIdx2, this.lastIdx3, this.lastIdx4, this.lastIdx1),
            new Array(this.lastIdx3, this.lastIdx1, this.lastIdx4, this.lastIdx2),
            new Array(this.lastIdx4, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx4, this.lastIdx3, this.lastIdx2, this.lastIdx1),
            new Array(this.lastIdx4, this.lastIdx1, this.lastIdx3, this.lastIdx2),
            new Array(this.lastIdx2, this.lastIdx4, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx3, this.lastIdx4, this.lastIdx2, this.lastIdx1),
            new Array(this.lastIdx1, this.lastIdx4, this.lastIdx3, this.lastIdx2)
    );
        
    //二階有解的解法
    this.fourResolvedSteps = new Array(
            new Array(),
            new Array(this.lastIdx3 + ""),
            new Array(this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx2, this.lastIdx3, this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx1, this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx3, this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx2, this.lastIdx1, this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx1, this.lastIdx2, this.lastIdx3, this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx2 + "")
    );
        
    this.isLog = false;
    this.logContent = "";
    //已經按順序移動好的塊，除了左上角和右下角大回轉外，不許移動
    this.fixedBlocks = [];  
    this.isTest = false;
    this.isResolving = false;
}

JigsawGame.prototype = { 
    initProperty : function(){
        this.originPicIndex = new Array(this.Rows * this.Cols); 
        this.picIndex = new Array(this.Rows * this.Cols);
        this.autoSteps = [];
        this.resolveSteps = [];
        this.hasResolve = false;
        this.lastMoveDirect = "";
            
        this.isLog = false;
        this.logContent = "";
        this.fixedBlocks = [];  //已經按順序移動好的塊，除了左上角和右下角大回轉外，不許移動
        this.isTest = false;
        this.isResolving = false;   
    },    
    initResolve : function(){
        //最后四個Block的Index，三階為5，6，8，9（base 1）
        this.lastIdx1 = this.Rows * this.Cols - this.Cols - 1; //5
        this.lastIdx2 = this.Rows * this.Cols - this.Cols;     //6
        this.lastIdx3 = this.Rows * this.Cols - 1;             //8
        this.lastIdx4 = this.Rows * this.Cols;                 //9
                  
        //二階有解的十二種情況 ,block index(base 1)  三階為5，6，8，9
        this.fourResolvedBlocks = new Array(
            new Array(this.lastIdx1, this.lastIdx2, this.lastIdx3, this.lastIdx4),
            new Array(this.lastIdx1, this.lastIdx2, this.lastIdx4, this.lastIdx3),
            new Array(this.lastIdx2, this.lastIdx3, this.lastIdx1, this.lastIdx4),
            new Array(this.lastIdx3, this.lastIdx1, this.lastIdx2, this.lastIdx4),
            new Array(this.lastIdx2, this.lastIdx3, this.lastIdx4, this.lastIdx1),
            new Array(this.lastIdx3, this.lastIdx1, this.lastIdx4, this.lastIdx2),
            new Array(this.lastIdx4, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx4, this.lastIdx3, this.lastIdx2, this.lastIdx1),
            new Array(this.lastIdx4, this.lastIdx1, this.lastIdx3, this.lastIdx2),
            new Array(this.lastIdx2, this.lastIdx4, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx3, this.lastIdx4, this.lastIdx2, this.lastIdx1),
            new Array(this.lastIdx1, this.lastIdx4, this.lastIdx3, this.lastIdx2)
        );
        
        //二階有解的解法
        this.fourResolvedSteps = new Array(
            new Array(),
            new Array(this.lastIdx3 + ""),
            new Array(this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx2, this.lastIdx3, this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx1, this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx3, this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx2, this.lastIdx1, this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx3, this.lastIdx2, this.lastIdx1, this.lastIdx3),
            new Array(this.lastIdx1, this.lastIdx2, this.lastIdx3, this.lastIdx1, this.lastIdx2),
            new Array(this.lastIdx2 + "")
        );
    },            
    //get current htm folder
    getCurrentFolder : function(){
        var strRef = self.location.href;
        strRef = strRef.replace("file:///","");
        while(strRef.indexOf("/") != -1){
            strRef = strRef.replace("/","\\");
        }
    
        while(strRef.indexOf("%20") != -1){
            strRef = strRef.replace("%20"," ");
        }
    
        return strRef.substring(0,strRef.lastIndexOf("\\") + 1);
    },
    writeFile : function(strFolder,strFileName,strFileContent){
        var fso, tf;
        fso = new ActiveXObject("Scripting.FileSystemObject");

        var arrFolder = strFolder.split("\\");
        var startFolder = arrFolder[0];
        if (arrFolder.length > 1){
            for (var i = 1;i < arrFolder.length;i ++){
                if (arrFolder[i] != ""){
                    startFolder += "\\" + arrFolder[i];
                    if (fso.FolderExists(startFolder) == false){
                        fso.CreateFolder(startFolder);
                    }
                }
            }
        }

        tf = fso.CreateTextFile(strFolder + strFileName, true, true); 

        var arrFileContent = strFileContent.split("\n");

        for(var i = 0;i < arrFileContent.length;i ++){
            tf.WriteLine(arrFileContent[i]);
             if (i % this.Rows == 0){
                tf.WriteLine("");
            }
        }

        tf.Close();

        alert(strFolder + strFileName + " saved!");
    },
    getString : function(){
        var result = "";
        for (var i = 0 ;i < this.picIndex.length; i++){
            if ( i % this.Rows == 0){
                result += "\n" + (this.picIndex[i] < 10 ?  
                " " + this.picIndex[i] : this.picIndex[i]) + "\t";
            }
            else{
                result += (this.picIndex[i] < 10 ?  
                " " + this.picIndex[i] : this.picIndex[i]) + "\t";
            }
        }
        
        return result;
    },
    isBlankCanMoveLeft : function (curBlank){
        if ((curBlank % this.Cols) >= 1){
            return true;
        }
        else{
            return false;
        }
    },
    isBlankCanMoveRight : function(curBlank){
        if ((curBlank % this.Cols) < (this.Cols - 1)){
            return true;
        }
        else{
            return false;
        }
    },
    isBlankCanMoveUp : function(curBlank){
        if (parseInt(curBlank / this.Cols) >= 1){
            return true;
        } 
        else{
            return false;
        }
    },
    isBlankCanMoveDown : function(curBlank){
        if (parseInt(curBlank / this.Cols) < (this.Rows - 1)){
            return true;
        } 
        else{
            return false;
        }
    },  
    //基于1的位置下標
    getLocation : function(curValue){
        for (var i = 0;i < this.picIndex.length;i ++){
            if (this.picIndex[i] == curValue){
                return i + 1;
            }
        }
        
        return -1;
    },
    getBlankLocation : function(){
        return this.getLocation(this.Rows * this.Cols);
    },
    getRandomNextIndex : function(curIndex){
        var moveIndex = parseInt(Math.random()* 1000) % 4;
        var newIndex = curIndex;
        switch(moveIndex){
            case 0:
              if ((this.isBlankCanMoveRight(curIndex)) && 
                  (this.lastMoveDirect != "left")){
                  this.lastMoveDirect = "right";
                  newIndex = parseInt(curIndex) + 1;
              }
              break;
            case 1:
              if ((this.isBlankCanMoveDown(curIndex)) && 
                  (this.lastMoveDirect != "up")){
                  this.lastMoveDirect = "down";
                  newIndex = parseInt(curIndex) + parseInt(this.Cols);
              }
              break;
            case 2:
              if ((this.isBlankCanMoveLeft(curIndex)) && 
                  (this.lastMoveDirect != "right")){
                  this.lastMoveDirect = "left";
                  newIndex = curIndex - 1;
              }
              break;
            case 3:
              if((this.isBlankCanMoveUp(curIndex)) && 
                 (this.lastMoveDirect != "down")){
                  this.lastMoveDirect = "up";
                  newIndex = curIndex - this.Cols; 
              }
              break;
            default:
              newIndex = curIndex;
              break;
        }
        
        return newIndex;
    },
    saveOriginPicIndex : function(){
        for(var i = 0;i < this.picIndex.length;i ++){
            this.originPicIndex[i] = this.picIndex[i];
        }
    },
    //交換初始化，確保有解
    initRuffle : function (ruffleLevel){
        for (var i = 0;i < this.picIndex.length;i ++){
            this.picIndex[i] = i + 1;
        }
        
        for(var i = 0; i < ruffleLevel; i++){
            var firstIndex = this.getBlankLocation();
            var secondIndex = this.getRandomNextIndex(firstIndex);
    
            if ((firstIndex != secondIndex) && 
                (secondIndex < this.picIndex.length)){
          
                var intTemp = this.picIndex[firstIndex];
                this.picIndex[firstIndex] = this.picIndex[secondIndex];
                this.picIndex[secondIndex] = intTemp;
          
                this.autoSteps[this.autoSteps.length] = firstIndex; 
            }
        }
        
        if (this.isLog){
            this.logContent += this.getString();
        }
        
        this.saveOriginPicIndex();
    },     
    randomInit : function (){
        this.isTest = false;
        
        for (var i = 0;i < this.picIndex.length;i ++){
            this.picIndex[i] = -1;
        }
       
        for (var i = 0; i < this.picIndex.length;i ++){
            var curLoc = parseInt(Math.random()* 1000) % (this.Rows * this.Rows);
            while (this.picIndex[curLoc] != -1){
               curLoc ++;
               if (curLoc == this.Rows * this.Rows){
                  curLoc = 0;
               }
            }
            this.picIndex[curLoc] = i + 1;
        }
        
        this.hasResolve = true;
        //this.writeFile(this.getCurrentFolder(),
        //      "testing_" + (new Date()).format("yyyyMMddhhmmssS") + ".dat",
        //      this.getString()); 
        this.saveOriginPicIndex();
    }, 
    testInit : function (){
         //測試數據
        this.isTest = true;
        
        //this.picIndex[0] = 2;this.picIndex[1] = 3;this.picIndex[2] = 8;
        //this.picIndex[3] = 9;this.picIndex[4] = 5;this.picIndex[5] = 6;
        //this.picIndex[6] = 4;this.picIndex[7] = 7;this.picIndex[8] = 1;
        
        //this.picIndex[0] = 5;this.picIndex[1] = 3;this.picIndex[2] = 2;
        //this.picIndex[3] = 7;this.picIndex[4] = 9;this.picIndex[5] = 4;
        //this.picIndex[6] = 6;this.picIndex[7] = 1;this.picIndex[8] = 8;
        //this.picIndex[0] = 9;this.picIndex[1] = 10;this.picIndex[2] = 12;this.picIndex[3] = 7;
       // this.picIndex[4] = 3;this.picIndex[5] = 4;this.picIndex[6] = 11;this.picIndex[7] = 13;
        //this.picIndex[8] = 2;this.picIndex[9] = 14;this.picIndex[10] = 15;this.picIndex[11] = 16;
        //this.picIndex[12] = 1;this.picIndex[13] = 5;this.picIndex[14] = 6;this.picIndex[15] = 8;
        
        //this.picIndex[0] = 13;this.picIndex[1] = 8;this.picIndex[2] = 14;this.picIndex[3] = 1;
        //this.picIndex[4] = 15;this.picIndex[5] = 7;this.picIndex[6] = 4;this.picIndex[7] = 16;
        //this.picIndex[8] = 5;this.picIndex[9] = 9;this.picIndex[10] = 6;this.picIndex[11] = 10;
       //this.picIndex[12] = 11;this.picIndex[13] = 2;this.picIndex[14] = 3;this.picIndex[15] = 12;
        
        this.picIndex[0] = 15; this.picIndex[1] = 5;  this.picIndex[2] = 9;  picIndex[3] = 11;	this.picIndex[4] = 17;	
        this.picIndex[5] = 4;	this.picIndex[6] = 20;	this.picIndex[7] = 1;  picIndex[8] = 14;	this.picIndex[9] = 12;	
        this.picIndex[10] =22;	this.picIndex[11] = 18;this.picIndex[12] = 7; picIndex[13] = 8;	this.picIndex[14] = 3;	
        this.picIndex[15] =16;	this.picIndex[16] = 21;this.picIndex[17] = 23;picIndex[18] = 24;this.picIndex[19] = 25;	
        this.picIndex[20] =19;	this.picIndex[21] = 6;	this.picIndex[22] = 2;	picIndex[23] = 10;this.picIndex[24] = 13;	
        
        this.saveOriginPicIndex();
    }, 
    testSpec : function (arrIndex){
        this.Rows = this.Cols = Math.sqrt(arrIndex.length);
        this.processLevel = this.Rows;
            
        this.initProperty();
        this.initResolve();
          
        this.isTest = true;
            
        this.picIndex = arrIndex;
        //保存原来的图块索引
        this.saveOriginPicIndex();
    },
    getCol : function(curLoc){
        //從基于1的Location取得基于0的列索引
        return (curLoc - 1) % this.Cols;
    },
    getRow : function(curLoc){
        //從基于1的Location取得基于0的行索引
        return parseInt((curLoc - 1) / this.Cols);
    },
    check : function(){
        //檢查是否成功完成拼圖，所有圖塊號和索引相等
        for (var i = 0;i < this.picIndex.length;i ++){
            if (this.picIndex[i] != (i + 1)){
                return false;
            }
        }
        
        return true;
    }, 
    swap : function(from,to){
        if (this.isTest){
           //alert("Swap from:" + picIndex[from] + "(" + from + ") to " + picIndex[to] + "(" + to + ")");
        }
        
        if (this.isResolving){
            if (this.picIndex[from] == this.Rows * this.Cols){
                this.resolveSteps.push(this.picIndex[to]);
                //this.resolveSteps.push(to);
            }
            else{
                this.resolveSteps.push(this.picIndex[from]);
                //this.resolveSteps.push(from);
            }
        }
        
        var temp = this.picIndex[from];
        this.picIndex[from] = this.picIndex[to];
        this.picIndex[to] = temp;
    },
    isCanMoveTo : function(idx){
        if(idx < 0 || idx > this.Cols * this.Rows - 1){
            return false;
        }
        
        for (var i = 0;i < this.fixedBlocks.length;i ++){
            if (this.fixedBlocks[i] == idx){
                return false;
            }
        }
        
        return true;
    },
    moveBlankTargetAdjacent : function(blankRow,blankCol,curRow,curCol){
       //將空塊和目標塊移動到相鄰位置
        while(blankRow < curRow - 1){
            this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
            blankRow ++;
        }
        
        while(blankRow > curRow + 1){
            if (this.isCanMoveTo((blankRow - 1) * this.Cols + blankCol)){
                this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                blankRow --;
            }
            else{
                if (blankCol == this.Cols - 1){
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                }
            }
        }
        
        while (blankCol < curCol - 1){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
        }
        
        while (blankCol > curCol + 1){
            if (this.isCanMoveTo(blankRow * this.Cols + blankCol - 1)){
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                blankCol --;
            }
            else{
                if (blankRow == this.Rows - 1){
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                }
            }
        }
        
        if ((blankRow == (this.Rows - this.processLevel)) && 
            (blankRow == curRow - 1)) {
            if (blankCol != curCol){
                this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
            
                this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
            }
            else if (blankCol == this.Cols - 1){
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                blankCol --;
                
                this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
            
                this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
                
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
            }
            else{
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
                
                this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
            
                this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
                
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                blankCol --;
            }
        } 

        if ((blankCol == (this.Cols - this.processLevel)) && 
             blankCol == curCol - 1){
            if (blankRow != curRow){
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
            
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
            }
            else if(blankRow == this.Rows - 1){
                this.swap((blankRow - 1) * this.Cols + blankCol, blankRow * this.Cols + blankCol);
                blankRow --;
                
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
            
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
                
                this.swap((blankRow + 1) * this.Cols + blankCol, blankRow * this.Cols + blankCol);
                blankRow ++;
            }
            else{
                this.swap((blankRow + 1) * this.Cols + blankCol, blankRow * this.Cols + blankCol);
                blankRow ++;
                
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
            
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
                
                this.swap((blankRow - 1) * this.Cols + blankCol, blankRow * this.Cols + blankCol);
                blankRow --;
            }
        }
    },
    moveBlankToTop : function(curRow,curCol){
        if (this.isTest){
            alert("moveBlankToTop:" + (curRow * this.Cols + curCol));
        }
        
        var blankLoc = this.getBlankLocation();
        var blankRow = this.getRow(blankLoc);
        var blankCol = this.getCol(blankLoc);
        
        this.moveBlankTargetAdjacent(blankRow,blankCol,curRow,curCol);
        
        blankLoc = this.getBlankLocation();
        blankRow = this.getRow(blankLoc);
        blankCol = this.getCol(blankLoc);
        
        var isMovedRight = false;
                
        if(blankCol == curCol){
            if(blankRow == curRow - 1){
                return;
            }
            
            if(blankRow == curRow + 1){
                if (blankCol < this.Cols - 1){ 
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                    isMovedRight = true;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                    isMovedRight = false;
                }
                
                this.swap((blankRow - 1) * this.Cols + blankCol, blankRow * this.Cols + blankCol);
                blankRow --;
                
                this.swap((blankRow - 1) * this.Cols + blankCol, blankRow * this.Cols + blankCol);
                blankRow --;
                
                if (isMovedRight){
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                }
            } 
        }
        
        if(blankRow == curRow){
            if (blankCol == curCol - 1){
                if (this.isCanMoveTo((blankRow - 1) * this.Cols + blankCol)){
                    this.swap((blankRow - 1) * this.Cols + blankCol, 
                        blankRow * this.Cols + blankCol);
                    blankRow --;
                    
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                    
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                    
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                    
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
            
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                    
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                }
            }
            else {
                this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                blankRow --;
                    
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                blankCol --;
            }
        }
          
        if ((blankCol == curCol - 1) && (blankRow == curRow - 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
        }
          
        if ((blankCol == curCol + 1) && (blankRow == curRow - 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
        }
          
        if ((blankCol == curCol - 1) && (blankRow == curRow + 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
              
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
              
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
            blankRow --;
              
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
            blankRow --;
              
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
        }
          
        if ((blankCol == curCol + 1) && (blankRow == curRow + 1)){
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
            blankRow --;
              
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
            blankRow --;
              
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
        }  
    },
    moveBlankToBottom : function(curRow,curCol){
        if (this.isTest){
            alert("moveBlankToBottom:" + (curRow * this.Cols + curCol));
        }
          
        var blankLoc = this.getBlankLocation();
        var blankRow = this.getRow(blankLoc);
        var blankCol = this.getCol(blankLoc);
          
        this.moveBlankTargetAdjacent(blankRow,blankCol,curRow,curCol);
          
        blankLoc = this.getBlankLocation();
        blankRow = this.getRow(blankLoc);
        blankCol = this.getCol(blankLoc);
         
        var isMovedRight = false;
           
        if (blankCol == curCol){
            if(blankRow == curRow + 1){
                return;
            }
              
            if (blankRow == curRow - 1){
                if (blankCol < this.Cols - 1){ 
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                    isMovedRight = true;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                    isMovedRight = false;
                }
                  
                this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
                  
                this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
              
                if (isMovedRight){
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                }
            }
        }
          
        if (blankRow == curRow){
            if (blankCol == curCol - 1){
                if (this.isCanMoveTo((blankRow - 1) * this.Cols + blankCol)){
                    this.swap(blankRow * this.Cols + blankCol,(blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                  
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                  
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                      
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                      
                    this.swap(blankRow * this.Cols + blankCol,(blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                      
                    this.swap(blankRow * this.Cols + blankCol,(blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                      
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                }
            }
              
            if (blankCol == curCol + 1){
                this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
                  
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                blankCol --;
            }
        }
          
        if ((blankRow == curRow - 1) && (blankCol == curCol - 1)){
            this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
            blankRow ++;
                  
            this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
            blankRow ++;
                  
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
        }
          
        if ((blankRow == curRow - 1) && (blankCol == curCol + 1)){
            this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
            blankRow ++;
                  
            this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
            blankRow ++;
              
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
        }
  
        if ((blankRow == curRow + 1) && (blankCol == curCol - 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
        }
    
        if ((blankRow == curRow + 1) && (blankCol == curCol + 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
        }
    },
    moveBlankToRight : function(curRow,curCol){
        if (this.isTest){
            alert("moveBlankToRight:" + (curRow * this.Cols + curCol));
        }
          
        var blankLoc = this.getBlankLocation();
        var blankRow = this.getRow(blankLoc);
        var blankCol = this.getCol(blankLoc);
     
        this.moveBlankTargetAdjacent(blankRow,blankCol,curRow,curCol);
          
        blankLoc = this.getBlankLocation();
        blankRow = this.getRow(blankLoc);
        blankCol = this.getCol(blankLoc);
          
        if (blankRow == curRow){
            if(blankCol == curCol + 1){
                return;
            }
     
            if(blankCol == curCol - 1){
                if (this.isCanMoveTo((blankRow - 1) * this.Cols + blankCol)){
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                      
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                      
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                  
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                      
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                      
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                      
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                }
            }
        }
              
        if (blankCol == curCol){
            if (blankRow == curRow - 1){
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
                  
                this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                blankRow ++;
            }
              
            if (blankRow == curRow + 1){
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                blankCol ++;
                  
                this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                blankRow --;
            }
        }
          
        if ((blankRow == curRow - 1) && (blankCol == curCol - 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
              
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
              
            this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
            blankRow ++;    
        }
        
        if ((blankRow == curRow - 1) && (blankCol == curCol + 1)){
            this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
            blankRow ++;  
        }
        
        if ((blankRow == curRow + 1) && (blankCol == curCol - 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
              
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
            blankCol ++;
              
            this.swap(blankRow * this.Cols + blankCol,(blankRow - 1) * this.Cols + blankCol);
            blankRow --;
        }
          
        if ((blankRow == curRow + 1) && (blankCol == curCol + 1)){
            this.swap(blankRow * this.Cols + blankCol,(blankRow - 1) * this.Cols + blankCol);
            blankRow --;
        }
    }, 
    moveBlankToLeft : function(curRow,curCol){
        if (this.isTest){
            alert("moveBlankToLeft:" + (curRow * this.Cols + curCol));
        }
          
        var blankLoc = this.getBlankLocation();
        var blankRow = this.getRow(blankLoc);
        var blankCol = this.getCol(blankLoc);
       
        this.moveBlankTargetAdjacent(blankRow,blankCol,curRow,curCol);
        
        blankLoc = this.getBlankLocation();
        blankRow = this.getRow(blankLoc);
        blankCol = this.getCol(blankLoc);
       
        if (blankRow == curRow){
            if(blankCol == curCol - 1){
                return;
            }
            
            if(blankCol == curCol + 1){
                if (blankRow < this.Rows - 1){
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
            
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
            
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
            
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
            
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                }
            }
        }
        
        if (blankCol == curCol){
            if(blankRow == curRow - 1){
                if (this.isCanMoveTo(blankRow * this.Cols + blankCol - 1)){
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                    
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                }
                else {
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                    
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                    
                    this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                    
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                    
                    this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                    blankCol --;
                    
                    this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                    blankRow --;
                }
            }
            
            if(blankRow == curRow + 1){
                this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
                blankCol --;
                
                this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
                blankRow --;
            }
        }
        
        if ((blankRow == curRow - 1) && (blankCol == curCol - 1)){
            this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
            blankRow ++;
        }
        
        if ((blankRow == curRow - 1) && (blankCol == curCol + 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
            
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
            
            this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol);
            blankRow ++;
        }
        
        if ((blankRow == curRow + 1) && (blankCol == curCol - 1)){
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
            blankRow --;
        }
        
        if ((blankRow == curRow + 1) && (blankCol == curCol + 1)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
            
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1);
            blankCol --;
            
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol);
            blankRow --;
        }
    },
    moveToRightUp : function(){
        var blankLoc = this.getBlankLocation();
        var blankRow = this.getRow(blankLoc);
        var blankCol = this.getCol(blankLoc);
            
        while(blankCol > (this.Cols - this.processLevel)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1); 
            blankCol --;
        }
           
        while(blankRow > (this.Rows - this.processLevel)){
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol); 
            blankRow --;
        }
          
        while(blankCol < this.Cols - 1){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1); 
            blankCol ++;
        }
        
        this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol); 
        blankRow ++;
            
        this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1); 
        blankCol --;
        
        this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol); 
        blankRow --;
        
        while(blankCol > (this.Cols - this.processLevel)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1); 
            blankCol --;
        }
        
        this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol); 
        blankRow ++;
    },
    moveToLeftBottom : function(){
        var blankLoc = this.getBlankLocation();
        var blankRow = this.getRow(blankLoc);
        var blankCol = this.getCol(blankLoc);
       
        while(blankCol < this.Cols - 1){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1); 
            blankCol ++;
        }
        
        while(blankRow > (this.Rows - this.processLevel)){
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol); 
            blankRow --;
        }
        
        while(blankCol > (this.Cols - this.processLevel)){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1); 
            blankCol --;
        }
        
        while(blankRow < this.Rows - 1){
            this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol); 
            blankRow ++;
        }
        
        this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1); 
        blankCol ++;
        
        this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol); 
        blankRow --;
        
        this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol - 1); 
        blankCol --;
        
        while(blankRow > (this.Rows - this.processLevel)){
            this.swap(blankRow * this.Cols + blankCol, (blankRow - 1) * this.Cols + blankCol); 
            blankRow --;
        }
       
        while(blankCol < this.Cols - 1){
            this.swap(blankRow * this.Cols + blankCol, blankRow * this.Cols + blankCol + 1); 
            blankCol ++;
        }
        
        this.swap(blankRow * this.Cols + blankCol, (blankRow + 1) * this.Cols + blankCol); 
        blankRow ++; 
    },
    move : function(curBlock){
        var valueLoc = this.getLocation(curBlock);
        var valueRow = this.getRow(valueLoc);
        var valueCol = this.getCol(valueLoc);
            
        var targetRow = this.getRow(curBlock);
        var targetCol = this.getCol(curBlock);
        
        var blankLoc = this.getBlankLocation();
        var blankRow = this.getRow(blankLoc);
        var blankCol = this.getCol(blankLoc);
        
        var isRightUp = false;
        var isLeftBottom = false;
        
        if (this.isTest){
            alert("cur " + curBlock + " Value:" + valueLoc + " Row:" + valueRow + " col:" + valueCol + "\n" +
                  " target row:" + targetRow + " col:" + targetCol + "\n" +
                  " blank row:" + blankRow + " col:" + blankCol);
        }
        
        if ((targetRow == valueRow) && (targetCol == valueCol)){
            return;
        }
        
        if ((targetRow == (this.Rows - this.processLevel)) && 
            (targetCol == this.Cols - 1)){
            if ((blankRow == targetRow) && (blankCol == targetCol)){
                if ((valueRow == blankRow + 1) && (valueCol == blankCol)){
                    this.swap(valueRow * this.Cols + valueCol,(valueRow - 1) * this.Cols + valueCol);
                    return;
                } 
                else{
                    this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                    
                    this.swap(blankRow * this.Cols + blankCol,(blankRow + 1) * this.Cols + blankCol);
                    blankRow ++;
                    
                    valueLoc = this.getLocation(curBlock);
                    valueRow = this.getRow(valueLoc);
                    valueCol = this.getCol(valueLoc);
                }             
             }
             targetRow ++;
             
             isRightUp = true;
        }
        
        if ((targetRow == this.Rows - 1) && 
            (targetCol == (this.Cols - this.processLevel))) {
            if ((blankRow == targetRow) && (blankCol == targetCol)){
                if ((valueCol == blankCol + 1) && (valueRow == blankRow)){
                    this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol - 1);
                    return;
                }
                else{
                    this.swap(blankRow * this.Cols + blankCol,blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                    
                    this.swap(blankRow * this.Cols + blankCol,blankRow * this.Cols + blankCol + 1);
                    blankCol ++;
                    
                    valueLoc = this.getLocation(curBlock);
                    valueRow = this.getRow(valueLoc);
                    valueCol = this.getCol(valueLoc);
                }
            }
            targetCol ++;
            
            isLeftBottom = true;
        }
        
        if (targetRow == valueRow){
            if (targetCol > valueCol){
                while(targetCol > valueCol){
                    this.moveBlankToRight(valueRow,valueCol);
                    this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol + 1);
                    valueCol ++;
                }
            }
            else{
                while(targetCol < valueCol){
                    if (this.isCanMoveTo(valueRow * this.Cols + valueCol - 1)){
                        this.moveBlankToLeft(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol - 1);
                        valueCol --;
                    }
                    else if (targetRow < this.Rows - 1){
                        this.moveBlankToBottom(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,(valueRow + 1) * this.Cols + valueCol);
                        valueRow ++;
                    }
                    else{
                        this.moveBlankToTop(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,(valueRow - 1) * this.Cols + valueCol); 
                        valueRow --;
                    }
                }  
            }
        }
        
        while(targetRow < valueRow){
            if (targetCol == valueCol){
                if (this.isCanMoveTo((valueRow - 1) * this.Cols + valueCol)){
                    this.moveBlankToTop(valueRow,valueCol);
                    this.swap(valueRow * this.Cols + valueCol,(valueRow - 1) * this.Cols + valueCol); 
                    valueRow --;
                }
                else if (targetCol < this.Cols - 1){
                    this.moveBlankToRight(valueRow,valueCol);
                    this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol + 1);
                    valueCol ++;
                }
                else{
                    this.moveBlankToLeft(valueRow,valueCol);
                    this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol - 1);
                    valueCol --;
                }
            }
            
            if (targetCol > valueCol){
                while(targetCol > valueCol){
                    this.moveBlankToRight(valueRow,valueCol);
                    this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol + 1);
                    valueCol ++;
                }
            }
            else{
                while(targetCol < valueCol){
                    if (this.isCanMoveTo(valueRow * this.Cols + valueCol - 1)){
                        this.moveBlankToLeft(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol - 1);
                        valueCol --;
                    }
                    else if (targetRow < this.Rows - 1){
                        this.moveBlankToBottom(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,(valueRow + 1) * this.Cols + valueCol);
                        valueRow ++;
                    }
                    else{
                        this.moveBlankToTop(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,(valueRow - 1) * this.Cols + valueCol); 
                        valueRow --;
                    }
                }  
            }
        }
      
        while(targetRow > valueRow){
            if (targetCol == valueCol){
                this.moveBlankToBottom(valueRow,valueCol);
                this.swap(valueRow * this.Cols + valueCol,(valueRow + 1) * this.Cols + valueCol);
                valueRow ++;
            }
          
            if (targetCol > valueCol){
                while(targetCol > valueCol){
                    this.moveBlankToRight(valueRow,valueCol);
                    this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol + 1);
                    valueCol ++;
                }
            }
            else{
                while(targetCol < valueCol){
                    if (this.isCanMoveTo(valueRow * this.Cols + valueCol - 1)){
                        this.moveBlankToLeft(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,valueRow * this.Cols + valueCol - 1);
                        valueCol --;
                    }
                    else if (targetRow < this.Rows - 1){
                        this.moveBlankToBottom(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,(valueRow + 1) * this.Cols + valueCol);
                        valueRow ++;
                    }
                    else{
                        this.moveBlankToTop(valueRow,valueCol);
                        this.swap(valueRow * this.Cols + valueCol,(valueRow - 1) * this.Cols + valueCol); 
                        valueRow --;
                    }
                }  
            }
        } 
        
        if (isRightUp){
            this.moveToRightUp();
        }
        
        if (isLeftBottom){
            this.moveToLeftBottom();
        }   
    },
    checkResolve : function(){
        if (this.check()){
            alert("Resolved!"); 
        }
        else{
            alert("No Resolve!");
        }
        
        this.show();
    },
    checkLast4Block : function(){
        for (var i = 0;i < this.fourResolvedBlocks.length;i ++){
            var curBlocks = this.fourResolvedBlocks[i];
            
            if ((curBlocks[0] == this.picIndex[this.lastIdx1 - 1]) &&
                (curBlocks[1] == this.picIndex[this.lastIdx2 - 1]) &&
                (curBlocks[2] == this.picIndex[this.lastIdx3 - 1]) &&
                (curBlocks[3] == this.picIndex[this.lastIdx4 - 1])){
                 return i;
            }
        }   
        
        return -1;
    },
    resolve : function(){
        //this.show();
        this.fixBlocks = [];
        this.isResolving = true;
        this.resolveSteps = [];
        this.processLevel = this.Rows;
        
        while(this.processLevel >= 3){
            var level = this.Rows - this.processLevel;
            for(var i = 1 + level * (this.Cols + 1); 
                    i <= (level + 1) * this.Cols;i ++){
                this.move(i);
                
                this.fixedBlocks.push(i-1);
              
                //this.show();
            }
            
            var j = (this.Cols + 1) * (level + 1);
            while(j < this.Cols * this.Rows){
                this.move(j);
                
                this.fixedBlocks.push(j-1);
                
                //this.show();
                
                j += this.Cols;
            }
            
            if (parseInt(this.processLevel) == 3){
                var resolveIdx = this.checkLast4Block(); 
                //alert("Resolved:" + resolveIdx);
                if ( resolveIdx == -1){
                    this.hasResolve = false;
                    //alert("No resolve!");
                }
                else{
                    var lastSteps = this.fourResolvedSteps[resolveIdx];
                    //alert("Resolved:" + resolveIdx + " steps:" + lastSteps);
                    for(var i = 0;i < lastSteps.length;i ++){
                        this.resolveSteps.push(lastSteps[i]);
                    }
                    
                    this.hasResolve = true;
                }
                
                break;
            }
            
            this.processLevel --;
        }
        
        this.isResolving = false;
        
        //this.showResolveSteps();
    },
    showAutoSteps : function(){
        var result = "Auto " + this.autoSteps.length + " Steps:";
        var count = 0;
        
        for (var j = this.autoSteps.length - 1;j >= 0;j --){
            if (count % 10 == 0){
                result += "\n" + this.autoSteps[j] + ",";
            }
            else{
                if (j == 0){
                    result += this.autoSteps[j];
                }
                else{
                    result += this.autoSteps[j] + ",";
                }
            }
    
            count ++;
        }

        alert(result);
    },
    show : function(){
        if (this.isLog){
            this.logContent += this.getString();
        }
        alert(this.getString());
    },
    getOrigin : function(){
        var result = "Origin PicIndex:";
        for (var i = 0 ;i < this.originPicIndex.length; i++){
            if ( i % this.Rows == 0){
                result += "\n" + (this.originPicIndex[i] < 10 ?  
                " " + this.originPicIndex[i] : this.originPicIndex[i]) + "\t";
            }
            else{
                result += (this.originPicIndex[i] < 10 ?  
                    " " + this.originPicIndex[i] : this.originPicIndex[i]) + "\t";
            }
        }
            
        return result;
    },
    showOrigin : function(){
        var result = "";
        for (var i = 0 ;i < this.originPicIndex.length; i++){
            if ( i % this.Rows == 0){
                result += "\n" + (this.originPicIndex[i] < 10 ?  
                " " + this.originPicIndex[i] : this.originPicIndex[i]) + "\t";
            }
            else{
                result += (this.originPicIndex[i] < 10 ?  
                    " " + this.originPicIndex[i] : this.originPicIndex[i]) + "\t";
            }
        }
            
        alert(result);
    },
    showResolveSteps : function(){
        var result = "Resolve " + this.resolveSteps.length + " Steps:";
        
        for (var i = 0 ;i < this.resolveSteps.length; i++){
          
            if ( i % 10 == 0){
                result += "\n" + this.resolveSteps[i] + ",";
            }
            else{
                if (i == this.resolveSteps.length - 1){
                    result += this.resolveSteps[i];
                }
                else{
                    result += this.resolveSteps[i] + ",";
                }
            }
        }

        alert(result);
    }
} 
