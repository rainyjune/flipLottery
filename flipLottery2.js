/**
 * @author rainyjune<rainyjune@live.cn>
 *
 */
(function(factory){
  if (typeof define =="function" && define.cmd) {
    define(function(require, exports, module){
      var $ = require("zepto");
      require("./imageViewer.js");
      factory($);
    });
  } else {
    factory(Zepto);
  }
}(function($){
  var isDebug = false;
  var transitionEnd = transitionEndEventName();
  var panels = $(".panel");
  var backCards = $(".img-view-box.back");
  var backCardChild = backCards.find(".img-view-box-in");
  var isWin = false;
  var theWinBackCard = null;
  var luckPageIndex = null; // Indicates the lucky card, this values starts from 1.
  
  var ajaxUrl = $("#ajaxUrl").val().replace("&open=1&dec=1", "");
  var isDec = 0;
  
  var times = 3, isShowError = false;
  
  var adImages = pageConf.adImages;
  var ajaxResult = pageConf.ajaxResult;
  
  // Hide the splash screen
  setTimeout(function(){
    $("#splash-screen").addClass("hidden");
  }, 3000);
  
  function addEventListeners() {
    panels.on("click", panelClicked);
    backCards.on(transitionEnd, backCardTransitionEnd);
    
    // Use our imageViwer plugin
    backCards.imageViewer({
      afterViewerClose: afterViewerCloseFunc
    });
    
    // Refresh buttons
    $("a.d-oncemore").on("click", refreshPage);
    
    $("div.d-share").on("click", showShareMask);
    
    $("#share-mask").on("click", function(){
      $(this).addClass("hidden");
      return false;
    });
    $("#share-mask").on("touchmove", function(){
      return false;
    });
  }
  
  function showShareMask(event) {
    $("#share-mask").removeClass("hidden");
    
    return false;
  }
  
  function afterViewerCloseFunc() {
    var isAllOpened = $(".panel.flip").length === 4;
    if (isAllOpened) {
      if (isWin) {
        extendWinCard();
      } else {
        $("div.d-once-btn").show();
      }      
    }
    return false;
  }
  
  function extendWinCard() {
    if (theWinBackCard) {
      //theWinBackCard.find(".img-view-box-in").addClass("gameOverWin");
      //$(".bottom-img").append(theWinBackCard.find(".img-view-box-in").clone()).show();
      $(".bottom-img").show();
    }
  }
  
  /**
   * Put images into cards.
   *
   */
  function setBackCardContents() {
    if (!ajaxResult || !($.isArray(ajaxResult)) || ajaxResult.length == 0) {
      return ;
    }
    for (var i = 0; i < backCards.length; i++) {
      var thisRecord = ajaxResult[i];
      var recordType = thisRecord.type;
      var thisBackCard = $(backCards[i]);
      var backCardInnerNode = thisBackCard.find(".img-view-box-in");
      thisBackCard.attr('data-resultType', thisRecord.type);
      thisBackCard.attr('data-resultContent', thisRecord.content);
      thisBackCard.attr('data-isWin', thisRecord.isWin);
      if (thisRecord.isWin) {
        isWin = true;
        luckPageIndex = i + 1;
        theWinBackCard = thisBackCard;
      }
      if (recordType==="image") {
        //thisBackCard.html('');
        backCardInnerNode.html('');
        thisBackCard.css("background-image", "url(" + thisRecord.content + ")");
      } else if (recordType==="text") {
        /*
        if (thisRecord.isWin) {
          $(".bottom-img").find(".img-win").html(thisRecord.content);
        }
        */
        backCardInnerNode.html(thisRecord.isWin ? "<p>恭喜您获得"+thisRecord.content+"<a class='more' href='"+thisRecord.link+"'>详情</a></p>" : "");
      }
      
    }
  }
  
  setBackCardContents();
  
  /**
   * Add the CSS class 'flip' to the specific card to flip it.
   */
  function panelClicked(e){
    if (!$(this).hasClass("flip") && $(this).find(".front").find(".img-view-box-in").find("img").length ) {
      $(this).addClass("flip");
      if (!isWin) {
        if (!isDec) {
          isDec = 1;
          //doDecRequest();
        }
      }
    }
    var target = e.target;
    if (target && target.tagName == "A" && target.className == "more") {
      location.href = e.target.href;
      return false;
    }
    return false;
  }
  
  /**
   * Do everything after card transition end.
   */
  function backCardTransitionEnd(e) {
    isDebug && console.log('back card transition end event,', this, e);
    var target = $(this);
    var parentNode = target.parent();
    var innerNode = target.find(".img-view-box-in");
    var cardIndex = parseInt(parentNode.attr("data-cardIndex"));
    var resultType = target.attr("data-resultType");

    // Trigger the viewImage event.
    target.trigger("viewImage");
    setTimeout(function(){
      if (luckPageIndex != cardIndex) {
        if (adImages && adImages[cardIndex-1]) {
          target.css("background-image", "url(" + adImages[cardIndex-1] + ")");
        }
      } else {
        target.css("background-image", "");
        if (isWin) {
          //doDecRequest();
        }
      }
    }, 200);
    
    return false;
  }
  
  addEventListeners();
  
  function refreshPage(e) {
    location.reload(true); 
    return false;
  }
  
  function doDecRequest(){
    if(times < 0){
        return;
    }
    var requestUrl = ajaxUrl;    
    $.ajax({
        "type": "get",
        "dataType": "json",
        "url": requestUrl,
        "success": function(data) {
            if( data.result == "succ" ){
                times = -1;
                var $cishu = $("div.d-number").find("span");
                $cishu.length && $cishu.text() > 0 && $cishu.text( $cishu.text() - 1 );
            }else if( data.result == "fail" ){
                times = -1;
            }else{
                window.setTimeout(doDecRequest, 1000);
            }
        },
        "error": function(){
            if(!isShowError && times == 1){ //发送3次请求仍然失败时，提示网络异常
                //$("#errorTip").show();
                window.setTimeout(function(){
                    window.location.reload(true);
//                            $("#errorTip").hide();
                }, 2000);
                isShowError = true;
            }
            window.setTimeout(doDecRequest, 1000);
        }
    });
    times--;
      
  }
  /*
  *Normalize the transiton end event name.
  */
  function transitionEndEventName() {
   var i,
       undefined,
       el = document.createElement('div'),
       transitions = {
         'OTransition': 'otransitionend',  // oTransitionEnd in very old Opera
         'MozTransition': 'transitionend',
         'WebkitTransition': 'webkitTransitionEnd',
         'transition': 'transitionend'
       };
  
   for (i in transitions) {
     if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
       return transitions[i];
     }
   }
  
   //TODO: throw 'TransitionEnd event is not supported in this browser';
   throw new Error("TransitionEnd event is not supported in this browser");
  }

}));