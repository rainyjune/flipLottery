/**
 * @author rainyjune<rainyjune@live.cn>
 *
 */
(function(factory){
  if (typeof define =="function" && define.cmd) {
    define(function(require, exports, module){
      var $ = require("zepto");
      factory($);
    });
  } else {
    factory(Zepto);
  }
}(function($){
  $.fn.imageViewer = function(options){
    var elements = $(this);
    var scrollTop = 0;
    var imgContainerName = "imageViewerContainer";
    var viewerContainer = null;
    var contentContainer = null;
    var closeButton = null;
    var largeImage = null;
    var progressBar = null;
    var textElement = null;
    var isOverflowFixNeeded = isAndroidBrowser() && getAndroidVersion() < 3;
    
    function init() {
      buildImageViewerContainer();
      
      viewerContainer = $("#" + imgContainerName);
      contentContainer = $("#"+imgContainerName).find(".contentContainer");
      closeButton = viewerContainer.find(".closeBtn");
      largeImage = $("#largeImg");
      progressBar = $("#loadingBar");
      textElement = $("#viewerText");
      
      // We don't need the click event here.
      //elements.on("click", smallImgClicked);
      
      // We add a special event listener named 'viewImage'
      elements.on("viewImage", viewImageHandler);
      //$("#" + imgContainerName).on("click", largeImgClicked);
      
      closeButton.on("click", closeViewer);
      
      largeImage.on("click", closeViewer);
      textElement.on("click", closeViewer);
    }
    
    function viewImageHandler() {
      var thisElement = $(this);
      var dataContent = thisElement.attr("data-resultContent");
      var dataType = thisElement.attr("data-resultType");
      var dataIsWin = thisElement.attr("data-isWin");
      scrollTop = $(document).scrollTop() ? $(document).scrollTop().valueOf() : 0;
      $("body").addClass("modal-open");
      if (isOverflowFixNeeded && (dataType === "image" || (dataType === "text" && dataIsWin === "1"))) {
        $("body").addClass("overflowFix");
      }
      
      //loadImage(imgUrl, dataType);
      renderContent(dataType, dataContent, dataIsWin);
      return false;
    }
    
    function renderContent(dataType, dataContent, dataIsWin) {
      beforeRender();
      if (dataType==="image") {
        loadImage(dataContent);
      } else if (dataType==="text") {
        showText(dataContent, dataIsWin);
      }
      return false;
    }
    
    function beforeRender() {
      contentContainer.removeClass("tableLayer");
      largeImage.hide();
      //largeImage.attr("src", "");
      progressBar.show();
      textElement.html('');
      textElement.removeClass("ad").removeClass("win");
      textElement.hide();
      $("#" + imgContainerName).css("width", "auto");
      $("#" + imgContainerName).removeClass("image");
    }
    
    function closeViewer(e) {
      $("body").removeClass("modal-open").removeClass("overflowFix");
      window.scrollTo(0,scrollTop);
      if (options.afterViewerClose) {
        options.afterViewerClose();
      }
      return false;
    }
    
    function loadImage(imgUrl) {
      var img = new Image();
      img.onload = function() {
        largeImage.show();
        progressBar.hide();
        largeImage.attr("src",imgUrl);
        if (isOverflowFixNeeded) {
          $("#" + imgContainerName).width(this.width);
          $("#" + imgContainerName).addClass("image");
        }
      };
      setTimeout(function(){
      img.src = imgUrl;  
      }, 0); 
    }
    
    function showText(text, dataIsWin) {
      progressBar.hide();
      dataIsWin = parseInt(dataIsWin);
      if(!dataIsWin){
        contentContainer.addClass("tableLayer");
      }
      var str = dataIsWin ? "<span class='gongxi'>恭喜您获得<br/>" + text + "</span>"   : text;
      textElement.html(str);
      var className = dataIsWin ? "win" : "ad";
      textElement.addClass(className);
      textElement.show();
    }
    
    /**
     *
     *<div id="imageViewerContainer">
        <div class="contentContainer">
          <img class="closeBtn" src="images/close.png" alt="X" />
          <img id="largeImg" alt="pic1" />
          <p id="loadingBar" style="">
            <img src="images/loading-animation-8.gif" alt="">
          </p>
        </div>
        
    </div>
     **/
    
    function buildImageViewerContainer() {
      if($("#" + imgContainerName).length == 0){
        var viewerContainer = $('<div id="imageViewerContainer"></div>');
        var contentContainer = $('<div class="contentContainer">');
        var closeBtn = $('<img class="closeBtn" src="orange/images/close.png" alt="X" />');
        var largeImg = $('<img id="largeImg"  alt="pic1" />');
        var textElement = $("<p id='viewerText'></p>");
        var loadingBar = $('<p id="loadingBar" style=""><img src="orange/images/loading-animation-8.gif" alt=""></p>');
        contentContainer.append(closeBtn);
        contentContainer.append(largeImg);
        contentContainer.append(textElement);
        contentContainer.append(loadingBar);
        viewerContainer.append(contentContainer);
        $("body").prepend(viewerContainer);
      }
    }
    
    function isAndroidBrowser() {
      var ua = navigator.userAgent;
      // The user agent string of IE mobile v11 on Windows Phone 8.1 contains "Android"
      if (ua.match(/MSIE|Trident/)) {
        return false;
      }
      return (ua.indexOf("Android") >= 0) || (ua.indexOf("android") >= 0);
    }
    
     /**
     * Get 2 digit version of Android
     */
    function getAndroidVersion() {
      var ua = navigator.userAgent;
      return parseFloat(ua.slice(ua.indexOf("Android")+8)).toFixed(1);
    }
    
    init();
    return elements;
  };
}));
