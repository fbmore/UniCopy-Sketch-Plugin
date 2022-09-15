// Load necessary framework
Mocha.sharedRuntime().loadFrameworkWithName('CoreFoundation');

// Lets import the library that allows us to talk with the UI
@import "MochaJSDelegate.js";

// Lets import other functions
@import "constraints.js";
@import "functions.js";

// Lets get a hold on the Sketch API
const sketch = require('sketch')

var ui = require('sketch/ui');

const util = require('util')

/////
var Settings = require('sketch/settings');
var Document = require('sketch/dom').Document;
var	document = sketch.getSelectedDocument();


let Style = sketch.Style
let ShapePath = sketch.ShapePath
let Text = sketch.Text
let Rectangle = sketch.Rectangle


//let's expose these globally
var document;

var arrHistory = Settings.documentSettingForKey(document, 'savedFullSelectionIDsArrayHistory') || [];

var currentKeyObjectIndex = -1;
var savedFullSelectionIDs = [];
var currentKeyObjectID = Settings.documentSettingForKey(document, 'currentKeyObjectID') || "";

console.log("currentKeyObjectID: " + currentKeyObjectID)


var page;

//the main function we run when we execute the plugin. It creates the webview and hooks
function onRun(context) {
  console.log("start: " + Date.now())

  document = sketch.fromNative(context.document)
  page = document.selectedPage;
  var selectedLayers = document.selectedLayers.layers;


  // var originalSelectedLayers = selectedLayers;
  var resultingSelectedLayers = [];


  var tokensSpacingKeys = ["xs","sm","md","lg","xl"]
  var tokensSpacingValues = ["4","8","16","32","64"]

  


  // if (selectedLayers.length == 0) {
  //   ui.message("🦄: Please select at least a Layer or Artboard 🙏");
  if (0) {
    //ui.message("🦄: Please select at least a Layer or Artboard 🙏");


  } else {
    //A couple of functions used in the plugin:
    //A function to count the number of artboards in the page
    function artboardsCount() {
      var artboardCount = 0;
      var artboardNames = "";
      for (x=0;x<selectedLayers.length;x++) {
        if (selectedLayers[x].type == 'Artboard') {
          artboardCount = artboardCount+1;
          // artboardCount = artboardCount+","+selectedLayers[x].name;
        }
      }
      return artboardCount;
    }

    //A couple of functions used in the plugin:
    //A function to pass the selected layers
    function selectedLayersNames() {
      var selectedLayersCount = 0;
      var selectedLayersNames = []
      for (l=0;l<selectedLayers.length;l++) {
        selectedLayersNames.push(selectedLayers[l].name);
      }

      var selectedLayerName = selectedLayers[0].name;
      // console.log(selectedLayersNames.join(","))
      selectedLayersNames = selectedLayersNames.join(", ")
      // return selectedLayersNames;

      ui.message("🦄: Key Object set to "+ selectedLayerName + " 👏 🚀");
      //ui.message("🦄: Let's go! 🚀");

      /////// ON launching the plugin webview set the selection as Key Object automatically

      console.log("saving selection as keyObject") 

      console.log(Settings.documentSettingForKey(document, 'savedFullSelectionIDsArray'));
      var arr  = Settings.documentSettingForKey(document, 'savedFullSelectionIDsArray') || [];

      console.log("arr");
      console.log(arr);



      if (document.selectedLayers){
        var selection = document.selectedLayers;      
        
        console.log(selection.layers.length);

        Settings.setDocumentSettingForKey(document, 'savedFullSelection', selection.layers);
        Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDs', selection.map(layer => layer.id));

        console.log("Doc: savedFullSelectionIDs")
        
        Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDs', selection.map(layer => layer.id));
        var savedFullSelectionIDs = Settings.documentSettingForKey(document, 'savedFullSelectionIDs');
        
        console.log(savedFullSelectionIDs)


      }

      return selectedLayersNames;
    }
    
    
    
    //A couple of functions used in the plugin:
    //A function to pass the selected layers
    function selectedLayersAsSVG() {
      var selectedLayersCount = 0;
      var selectedLayersNames = [];
      var savedFullSelectionIDs = Settings.documentSettingForKey(document, 'savedFullSelectionIDs');
      var layerKeyObject;


      if (document.selectedLayers.length >> 0){

        var selection = document.selectedLayers;      
        
        console.log(selection.layers.length);

        Settings.setDocumentSettingForKey(document, 'savedFullSelection', selection.layers);
        Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDs', selection.map(layer => layer.id));

        console.log("Doc: savedFullSelectionIDs----")
        
        Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDs', selection.map(layer => layer.id));
        savedFullSelectionIDs = Settings.documentSettingForKey(document, 'savedFullSelectionIDs');

        layerKeyObject = document.getLayerWithID(savedFullSelectionIDs[0])

        
        console.log(savedFullSelectionIDs)
        
      } else {


        savedFullSelectionIDs = Settings.documentSettingForKey(document, 'savedFullSelectionIDs');
        console.log(savedFullSelectionIDs)

        currentKeyObjectID = savedFullSelectionIDs[0]
        // var arr  = Settings.documentSettingForKey(document, 'savedFullSelectionIDsArray') || [].push(currentKeyObjectID);

        layerKeyObject = document.getLayerWithID(currentKeyObjectID)
  

      }


      var newValue = getLayerAsSVG(layerKeyObject);

      printValue("SVG",newValue)

      return newValue;
    }

    var userDefaults = NSUserDefaults.standardUserDefaults();

    // Create a window
    var title = "🦄";
    var identifier = "com.fbmore.magiccopier";
    var threadDictionary = NSThread.mainThread().threadDictionary();

    if (threadDictionary[identifier]) {
      return;
    }

    var windowWidth = 200,
    windowHeight = 540;
    var webViewWindow = NSPanel.alloc().init();
    webViewWindow.setFrame_display(NSMakeRect(0, 0, windowWidth, windowHeight), true);
    // webViewWindow.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSResizableWindowMask);
    webViewWindow.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask);

    //Uncomment the following line to define the app bar color with an NSColor
    //webViewWindow.setBackgroundColor(NSColor.whiteColor());
    webViewWindow.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
    webViewWindow.standardWindowButton(NSWindowZoomButton).setHidden(true);
    webViewWindow.setTitle(title);
    webViewWindow.setTitlebarAppearsTransparent(true);
    webViewWindow.becomeKeyWindow();
    webViewWindow.setLevel(NSFloatingWindowLevel);
    threadDictionary[identifier] = webViewWindow;
    COScript.currentCOScript().setShouldKeepAround_(true);

    //Add Web View to window
    var webView = WebView.alloc().initWithFrame(NSMakeRect(0, 0, windowWidth, windowHeight - 24));
    webView.setAutoresizingMask(NSViewWidthSizable|NSViewHeightSizable);
    var windowObject = webView.windowScriptObject();
    var delegate = new MochaJSDelegate({

      "webView:didFinishLoadForFrame:" : (function(webView, webFrame) {
        //We call this function when we know that the webview has finished loading
        //It's a function in the UI and we run it with a return coming from the artboardCount

        windowObject.evaluateWebScript("updateSelectedLayersNames('"+selectedLayersAsSVG()+"')");
        // windowObject.evaluateWebScript("updateSelectedLayersData('"+selectedLayersMeta()+"')");
        //updateSelectedLayersNames();
      }),

      //To get commands from the webView we observe the location hash: if it changes, we do something
      "webView:didChangeLocationWithinPageForFrame:" : (function(webView, webFrame) {
        var locationHash = windowObject.evaluateWebScript("window.location.hash");
        //The hash object exposes commands and parameters
        //In example, if you send updateHash('add','artboardName','Mark')
        //You’ll be able to use hash.artboardName to return 'Mark'
        var hash = parseHash(locationHash);
        //We parse the location hash and check for the command we are sending from the UI
        //If the command exist we run the following code
        if (hash.hasOwnProperty('update')) {
          //In example updating the artboard count based on the current contex.
          //The evaluateWebScript function allows us to call a function from the UI.html with parameters
          //coming from Sketch
          windowObject.evaluateWebScript("updateInput("+artboardsCount()+");");

        } else if (hash.hasOwnProperty('saveData')) {
          //If you are sending arguments from the UI
          //You can simply grab them from the hash object

          // var abCount = 2;
          //windowObject.evaluateWebScript("updateInput("+artboardsCount()+");");


          selectedLayers = document.selectedLayers;

          // read values from webview
          var myLayerX = hash.myLayerX.toLowerCase();
          // console.log(myLayerX)
          var myLayerY = hash.myLayerY.toLowerCase();
          // console.log(myLayerY)
          var myDirection = hash.direction.toLowerCase();


          // var prop = h
          var prop = myDirection
          var valuex = parseInt(myLayerX) || 0
          var valuey = parseInt(myLayerY) || 0



          console.log("prop: " + prop)

          /// Center on Key Object
          // console.log("centeronkeyobject?") 
          if (prop == "centeronkeyobject"){
            console.log("centeronkeyobject") 
            
            // var savedFullSelectionIDs = Settings.documentSettingForKey(document, 'savedFullSelectionIDs');
            var currentKeyObjectID = Settings.documentSettingForKey(document, 'currentKeyObjectID');

            // var r = document.getLayerWithID(savedFullSelectionIDs[0]);
            var r = document.getLayerWithID(currentKeyObjectID);
            console.log(r.name);
            document.selectedLayers = []
            r.selected = true;
        
            document.selectedPage = r.getParentPage();
        
            document.centerOnLayer(r);
        

          }  
          
          /// setnextkeyobject
          if (prop == "setnextkeyobject"){
    
            currentKeyObjectID = Settings.documentSettingForKey(document, 'currentKeyObjectID');
            console.log("currentKeyObjectID: " + currentKeyObjectID);

            Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDsHistory', arrHistory);
            console.log("History After NEXT: " + arrHistory);

            console.log("loading prev keyobj from array:")  
            console.log(arrHistory) 
            // console.log("arrHistory[0]") 
            // console.log(arrHistory[0].toString()) 

            
            var currentKeyObjectIndex = arrHistory.indexOf(currentKeyObjectID);
            console.log("currentKeyObjectID - Arr History: " + currentKeyObjectIndex);

            if ((currentKeyObjectIndex + 1) == arrHistory.length){
              currentKeyObjectIndex = -1 
              // currentKeyObjectIndex = -1;
            }  

            currentKeyObjectIndex = currentKeyObjectIndex + 1;

            console.log("currentKeyObjectIndex: " + currentKeyObjectIndex);

            currentKeyObjectID = arrHistory[currentKeyObjectIndex]

            Settings.setDocumentSettingForKey(document, 'currentKeyObjectID', currentKeyObjectID);

            

            var layerKeyObject = document.getLayerWithID(arrHistory[currentKeyObjectIndex])

            Settings.setDocumentSettingForKey(document, 'currentKeyObjectID', layerKeyObject.id);

            currentKeyObjectID = Settings.documentSettingForKey(document, 'currentKeyObjectID');
 
            // console.log("currentKeyObjectID: " + currentKeyObjectID);

            // console.log("layerKeyObject name: " + layerKeyObject.name) 

            var newValue = getLayerAsSVG(layerKeyObject);
            
            // console.log("layerKeyObject SVG: " + newValue) 

            // var newValue = '<svg width="477px" height="111px" viewBox="0 0 477 111" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Artboard" transform="translate(-84.000000, -67.000000)" fill="#6236FF"><rect id="Rectangle-purple" x="84" y="67" width="477" height="111"></rect></g></g></svg>';              

            windowObject.evaluateWebScript("updateSelectedLayersNames('"+newValue+"')");
          }  
        

          
          // Catch CMD + Z in Webview

          if (hash.direction.toLowerCase() == "undo"){
            //MSUndoAction
            // console.log("undo---")
            // ui.message("🦄: Undo! 👏 🚀");

            context.document.actionsController().actionForID("MSUndoAction").doPerformAction(null);

          } 
          if (hash.direction.toLowerCase() == "redo"){
            //MSUndoAction
            // console.log("redo---")
            // ui.message("🦄: Undo! 👏 🚀");

            context.document.actionsController().actionForID("MSRedoAction").doPerformAction(null);

          } 


          for (j = 0; j < selectedLayers.length; ++j){


            var layer = selectedLayers.layers[j]

            

            if (tokensSpacingKeys.indexOf(myLayerX) != -1){
              myLayerX = tokensSpacingValues[tokensSpacingKeys.indexOf(myLayerX)]
            }

            if (tokensSpacingKeys.indexOf(myLayerY) != -1){
              myLayerY = tokensSpacingValues[tokensSpacingKeys.indexOf(myLayerY)]
            }

            if (myLayerX.includes("%")){
              myLayerX = parseInt(myLayerX.replace("%",""))
              myLayerX = layer.parent.frame.width * (myLayerX/100)
            }

            if (myLayerY.includes("%")){
              myLayerY = parseInt(myLayerY.replace("%",""))
              myLayerY = layer.parent.frame.height * (myLayerY/100)
            }



            /// LAYOUT SETTINGS

            if (layer.type === "Artboard"){
              var parentArtboard = layer;
            } else {
              var parentArtboard = layer.getParentArtboard();
            }

            // var parentArtboard = layer.getParentArtboard();

            if (parentArtboard.sketchObject.layout() !== null ){

              var layout = parentArtboard.sketchObject.layout()
              var columnWidth = layout.columnWidth();
              var drawHorizontal = layout.drawHorizontal();
              var drawHorizontalLines = layout.drawHorizontalLines();
              var drawVertical = layout.drawVertical();
              var gutterHeight = layout.gutterHeight();
              var gutterWidth = layout.gutterWidth();
              var guttersOutside = layout.guttersOutside();
              var horizontalOffset = layout.horizontalOffset();
              var isEnabled = layout.isEnabled();
              var numberOfColumns = layout.numberOfColumns();
              var rowHeightMultiplication = layout.rowHeightMultiplication();
              var totalWidth = layout.totalWidth()

              // console.log(columnWidth)
              // console.log(gutterWidth)
              // console.log(guttersOutside)


              // COLUMNS as values

              if (myLayerX.includes("c")){
                myLayerX = myLayerX.replace("c","");
                if (myLayerX == 1) {
                  myLayerX = horizontalOffset
                } else {
                  myLayerX = horizontalOffset + columnWidth * (myLayerX - 1) + gutterWidth * (myLayerX - 1);
                }
                // console.log("Cols:" + myLayerX)

              }

              if (myLayerY.includes("c")){
                myLayerY = myLayerY.replace("c","");
                if (myLayerY == 1) {
                  myLayerY = 0;
                  //horizontalOffset is removed for vertical spacing
                } else {
                  myLayerY = columnWidth * (myLayerY - 1) + gutterWidth * (myLayerY - 1);
                }
                // console.log("Cols:" + myLayerY)
              }

            } 

            /// setkeyobject

            if (prop == "setkeyobject"){
              
              console.log("saving keyObject") 


              if (document.selectedLayers){
                var selection = document.selectedLayers;
                //var parent = selection.layers[0].parent;
                
                console.log(selection.layers.length);

                
                
                Settings.setDocumentSettingForKey(document, 'savedFullSelection', selection.layers);
                Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDs', selection.map(layer => layer.id));

                console.log("Doc: savedFullSelectionIDs")
                
                Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDs', selection.map(layer => layer.id));
                savedFullSelectionIDs = Settings.documentSettingForKey(document, 'savedFullSelectionIDs');
              

                if (!arrHistory.includes(savedFullSelectionIDs[0])) {
                  arrHistory.unshift(savedFullSelectionIDs[0])
                }

                Settings.setDocumentSettingForKey(document, 'currentKeyObjectID', savedFullSelectionIDs[0]);

                currentKeyObjectID =  Settings.documentSettingForKey(document, 'currentKeyObjectID');

                // console.log("currentKeyObjectID from set object: " + currentKeyObjectID)  


                Settings.setDocumentSettingForKey(document, 'savedFullSelectionIDsHistory', arrHistory);
                // console.log("History After: " + arrHistory);

                

                // console.log("currentKeyObjectIndex: " + arrHistory.indexOf(currentKeyObjectID));

                //Settings.setDocumentSettingForKey(document, 'currentKeyObjectIndex', currentKeyObjectIndex);
                //console.log("currentKeyObjectIndex: " + currentKeyObjectIndex);

                currentKeyObjectID = Settings.documentSettingForKey(document, 'currentKeyObjectID');


                Settings.setDocumentSettingForKey(document, 'currentKeyObjectID', currentKeyObjectID);
                // console.log("currentKeyObjectID: " + currentKeyObjectID);

              // console.log("Add new key and get selectedLayersNames()")  
              // console.log(selectedLayersNames())  
              // var layerKeyObject = document.getLayerWithID(savedFullSelectionIDs[0])
              var layerKeyObject = document.getLayerWithID(currentKeyObjectID)
              // var layerName = layerKeyObject.name

              var newValue = getLayerAsSVG(layerKeyObject);

              printValue("SVG",newValue)

              // var newValue = '<svg width="477px" height="111px" viewBox="0 0 477 111" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Artboard" transform="translate(-84.000000, -67.000000)" fill="#6236FF"><rect id="Rectangle-purple" x="84" y="67" width="477" height="111"></rect></g></g></svg>';              
              //"test" 
              
              windowObject.evaluateWebScript("updateSelectedLayersNames('"+newValue+"')");

              }

              ///
           }  





           /// Get Key Object
            var savedFullSelectionIDs = Settings.documentSettingForKey(document, 'savedFullSelectionIDs');


            
            // var layer = document.getLayerWithID(savedFullSelectionIDs[0])
            var currentKeyObjectID = Settings.documentSettingForKey(document, 'currentKeyObjectID') || savedFullSelectionIDs[0];

            var layer = document.getLayerWithID(currentKeyObjectID)




           /// Paste Everywhere 

           if (prop == "pasteeverywhere"){
            console.log("pasteeverywhere") 
            
            if (layer) {
             
              var duplicatedLayer;
              // console.log("duplicating...")
              if (layer.type != "SymbolMaster"){
                duplicatedLayer = layer.duplicate()              
              } else {

  
                var symbolMaster = layer;
                // console.log(symbolMaster)
                var symbolInstance = symbolMaster.createNewInstance();
                
                duplicatedLayer = symbolInstance;


              }
              
                var selectedLayer = selectedLayers.layers[j];
              var newParent;




              if (selectedLayer.type == "Artboard" || selectedLayer.type == "Group" || (layer.type == "SymbolMaster")){
                newParent = selectedLayer
              } else {
                newParent = selectedLayer.parent
                duplicatedLayer.frame.x = selectedLayer.frame.x
                duplicatedLayer.frame.y = selectedLayer.frame.y
              }

                duplicatedLayer.parent = newParent;


                if (selectedLayer.parent == "Group"){
                  selectedLayer.parent.adjustToFit();
                  // selection.frame.x = originalx;
                  // selection.frame.y = originaly;
                }
            
              }
            }  


           /// Paste and Replace 

           if (prop == "pastereplace"){
            console.log("pastereplace") 
            
            if (layer) {
             
              var selectedLayer = selectedLayers.layers[j];

              syncWithLayer = layer

              // for (l = 0; l < selection.length; l++){

                if (selectedLayer.id != syncWithLayer.id){
                  
                  // console.log(selection.layers[l].name)

                  var newLayer = syncWithLayer.duplicate()
                  var tempIndex = selectedLayer.index
                  var tempFrame = selectedLayer.frame

                  newLayer.parent = selectedLayer.parent

                  newLayer.frame = tempFrame

                  if (newLayer.parent.type == "Group"){
                    newLayer.parent.adjustToFit();
                  }

                  if (newLayer.type == "Artboard"){
                    newLayer.frame = selectedLayer.frame
                  }

                  selectedLayer.remove()

                  newLayer.index = tempIndex

                } 

            }  

          }
            
            



            
            /// Paste Position 
            if (prop == "pasteposition"){
            console.log("pasteposition") 
            
            if (layer) {
              for (l = 0; l < selectedLayers.layers.length; ++l){

              selectedLayers.layers[l].frame.x = layer.frame.x;
              selectedLayers.layers[l].frame.y = layer.frame.y;
            
                }
              }
            }
  
            


            /// Paste Size 

           if (prop == "pastesize"){
            console.log("pastesize") 
            
            if (layer) {
              for (l = 0; l < selectedLayers.layers.length; ++l){

              selectedLayers.layers[l].frame.width = layer.frame.width;
              selectedLayers.layers[l].frame.height = layer.frame.height;
            
                }
              }
            }  

            /// Paste Resizing Properties 

           if (prop == "pasteresizing"){
            console.log("pasteresizing") 
            
            if (layer) {
              for (l = 0; l < selectedLayers.layers.length; ++l){

              layerResizingConstraint = layer.sketchObject.resizingConstraint();
              selectedLayers.layers[l].sketchObject.setResizingConstraint(layerResizingConstraint);

            
                }
              }
            }  



            /// Paste LAYOUT / WIP

          //  if (prop == "pastelayout"){
          //   console.log("pastelayout") 

          //   var selectedLayer = selectedLayers.layers[j];
            
          //   if (layer) {

          //     selectedLayer.setLayout(getLayoutSettings(layer.sketchObject))
            
          //       }
              
          //   }  


            // Paste all position, size and resizing properties

           if (prop == "pasteall"){
            console.log("pasteall") 
            
            if (layer) {
              for (l = 0; l < selectedLayers.layers.length; ++l){

              console.log("selectedLayers.layers")
              selectedLayers.layers[l].frame = layer.frame;

              layerResizingConstraint = layer.sketchObject.resizingConstraint();
              selectedLayers.layers[l].sketchObject.setResizingConstraint(layerResizingConstraint);

            
                }
              }
            }  

          // Paste COLOR

          if (prop == "pastecolor"){

            console.log("pastecolor") 
          
            if (layer) {

              var setToColor;
              var allSymbols = document.selectedLayers;
  
              if (layer.type === "Text" || layer.type === "ShapePath"){
                setToColor = layer.style.textColor || layer.style.fills[0].color;
              }
  
              if (layer.type === "Artboard"){
                setToColor = layer.background.color;
              }
  

              for (l = 0; l < selectedLayers.layers.length; ++l){
                  // selectedLayers.layers[l].style = layer.style;

                  if (allSymbols.layers[j].type === "Text"){
                    allSymbols.layers[j].style.textColor = setToColor;
                  }
                  if (allSymbols.layers[j].type === "ShapePath"){
                    allSymbols.layers[j].style.fills[0].color = setToColor;
                  }
                  if (allSymbols.layers[j].type === "Shape"){
                    allSymbols.layers[j].style.fills[0].color = setToColor;
                  }
                  if (allSymbols.layers[j].type === "Artboard"){
                    // console.log("color")
                    // console.log(setToColor)
                    allSymbols.layers[j].background.color = setToColor;
                    allSymbols.layers[j].background.enabled = true;
                    allSymbols.layers[j].background.includedInExport = true;
                  }
    

              }
            }
  
                  
            ui.message("🦄:  Done pasting the color of selected elements to match the Key Object ("+(setToColor)+")! 👏 🚀");
             
            ////            
          }  


          ////
          // Paste OPACITY

          if (prop == "pasteopacity"){

            console.log("pasteopacity") 
          
            if (layer) {

              var setToOpacity;
              var allSymbols = document.selectedLayers;
  
              // if (layer.type !== "Artboard"){
                setToOpacity = layer.style.opacity || 1
              // }
    

              for (l = 0; l < selectedLayers.layers.length; ++l){

                  allSymbols.layers[j].style.opacity = setToOpacity;    
              }
            }
                  
            ui.message("🦄:  Done pasting the opacity value of selected elements to match the Key Object ("+(setToOpacity)+")! 👏 🚀");
              
          }  

          ////

          // Paste FONT FAMILY

          if (prop == "pastefontfamily"){

            console.log("pastefontfamily") 
          
            if (layer) {

              var setToFontFamily;
              var setToFontSize;
              var setToFontLineHeight;

              var allSymbols = document.selectedLayers;
  
              // if (layer.type === "Text"){
                setToFontFamily = layer.style.fontFamily 
              // }
    

              for (l = 0; l < selectedLayers.layers.length; ++l){

                setToFontSize = allSymbols.layers[j].style.fontSize;
                setToFontLineHeight = allSymbols.layers[j].style.lineHeight;


                allSymbols.layers[j].style.fontFamily = setToFontFamily;    
                allSymbols.layers[j].style.fontSize = setToFontSize;
                allSymbols.layers[j].style.lineHeight = setToFontLineHeight;

              }
            }
                  
            ui.message("🦄:  Done pasting the font family value of selected elements to match the Key Object ("+(setToFontFamily)+")! 👏 🚀");
              
          }  

          //// Paste FONT SIZE

          if (prop == "pastefontsize"){

            console.log("pastefontsize") 
          
            if (layer) {

              var setToFontSize;
              var setToFontLineHeight;
              var allSymbols = document.selectedLayers;
  
              //if (layer.type === "Text"){
                setToFontSize = layer.style.fontSize
                setToFontLineHeight = layer.style.lineHeight || undefined
              //}
    

              for (l = 0; l < selectedLayers.layers.length; ++l){

                var setToFontFamily = allSymbols.layers[j].style.fontFamily;

                  allSymbols.layers[j].style.fontSize = setToFontSize;    
                  allSymbols.layers[j].style.lineHeight = setToFontLineHeight;    
                  allSymbols.layers[j].style.fontFamily = setToFontFamily; 
              }
            }
                  
            ui.message("🦄:  Done pasting the font size value of selected elements to match the Key Object ("+(setToFontSize)+")! 👏 🚀");
              
          }  

          ////        


          // Paste all STYLES

           if (prop == "pastestyleall"){

            console.log("pastestyleall") 

            
            if (layer) {
              for (l = 0; l < selectedLayers.layers.length; ++l){
                
                selectedLayers.layers[l].style = layer.style;
                }
              }
            }  


            //////////////

            
         /// Paste CONTENT 

         if (prop == "pastevalue"){
          console.log("pastevalue") 
          

          if (layer) {

            for (sl = 0; sl < selectedLayers.layers.length+1; ++sl) {

              
            console.log("paste value to element... " + sl + "of" + selectedLayers.layers.length )
            
            var selectedLayer = selectedLayers.layers[sl];

            console.log(selectedLayer.type)

            if (selectedLayer.type == "Text"){

              console.log("el: " + sl + " - type: " + selectedLayer.type + " - name: " + selectedLayer.name + " - value: " + selectedLayer.text ) 

            if (layer.type == "SymbolInstance"){

                console.log(layer.type)
                var sourceElementOverrides = layer.overrides;

                console.log("sourceElementOverrides.length:"+sourceElementOverrides.length)
                for (o = 0; o < sourceElementOverrides.length; ++o) {

                  if (selectedLayer.name == sourceElementOverrides[o].affectedLayer.name) {
                    selectedLayer.text = sourceElementOverrides[o].affectedLayer.text
                  }

                  console.log("----- getting source values:")
                  console.log("override name:" + sourceElementOverrides[o].affectedLayer.name);
                  console.log("layer name:" + selectedLayer.name);
                  // console.log("value:" + (sourceElementOverrides[o].value || "none"));
                  console.log("text:" + (sourceElementOverrides[o].affectedLayer.text || "none"));
                  // console.log("image:" + (sourceElementOverrides[o].affectedLayer.image));
  
                  // //layer.overrides[1].affectedLayer.image
                  // console.log("----- setting destination to:")
                  // console.log("name:" + selectionElementOverrides[o].affectedLayer.name);
                  // console.log("value:" + (selectionElementOverrides[o].value || "none"));
                  // selectionElementOverrides[o].value = sourceElementOverrides[o].value;
                  // console.log("text:" + (selectionElementOverrides[o].affectedLayer.text || "none"));
                  // selectionElementOverrides[o].affectedLayer.text  = sourceElementOverrides[o].affectedLayer.text;
  
                }

                layer.resizeWithSmartLayout();
              
              } 

             if (layer.type == "Text"){
                selectedLayer.text = layer.text;
             }
            
            } 

            if (selectedLayer.type == "SymbolInstance"){
              // console.log("paste overrides...")
              // console.log(layer.overrides)
              // console.log("paste overrides Des...")
              // console.log(selectedLayer.overrides)
              // selectedLayer.overrides = layer.overrides
              console.log("paste overrides Des2...")
              //////

              var sourceElementOverrides = layer.overrides;
              var selectionElementOverrides = selectedLayer.overrides;

              // console.log(sourceElementOverrides)

              for (o = 0; o < sourceElementOverrides.length; ++o) {
                // for (o = 0; o < 5; ++o) {

                // var o = 0
                /// source values
                // console.log("----- getting source values:")
                // console.log("name:" + sourceElementOverrides[o].affectedLayer.name);
                // console.log("value:" + (sourceElementOverrides[o].value || "none"));
                // console.log("text:" + (sourceElementOverrides[o].affectedLayer.text || "none"));
                // console.log("image:" + (sourceElementOverrides[o].affectedLayer.image));

                //layer.overrides[1].affectedLayer.image
                // console.log("----- setting destination to:")
                // console.log("name:" + selectionElementOverrides[o].affectedLayer.name);
                // console.log("value:" + (selectionElementOverrides[o].value || "none"));
                selectionElementOverrides[o].value = sourceElementOverrides[o].value;
                // console.log("text:" + (selectionElementOverrides[o].affectedLayer.text || "none"));
                selectionElementOverrides[o].affectedLayer.text  = sourceElementOverrides[o].affectedLayer.text;

              }


              console.log("resizeWithSmartLayout")

              selectedLayer.resizeWithSmartLayout();



              //////
              
            } 
          
            }
          }
        }
          
          /// Paste NAME 

         if (prop == "pastename"){
          console.log("pastename") 
          

          if (layer) {
           
            console.log("paste name...")
            var selectedLayer = selectedLayers.layers[j];

            // if (selectedLayer.type == "Text"){
              selectedLayer.name = layer.name
            // } 
          
            }
          }  









            ////

            if (prop == "fw"){
              console.log("fullwidth")
              layer.frame.x = valuex;
              // layer.frame.y = valuey;
              layer.frame.width = layer.parent.frame.width - 2*valuex;
            }

            if (prop == "fh"){
              console.log("fullheight")
              layer.frame.y = valuey;
              // layer.frame.x = valuex;
              layer.frame.height = layer.parent.frame.height - 2*valuey;
            }

            if (prop == "fs"){
              console.log("fullsize")
              if (layer.type == "Text"){
                console.log("fullsize")
                // layer.fixedWidth = true;
                // fixedWidth
                console.log(layer.fixedWidth)
              }

              layer.frame.x = valuex;
              layer.frame.y = valuey;
              layer.frame.width = layer.parent.frame.width - 2*valuex;
              layer.frame.height = layer.parent.frame.height - 2*valuey;

            }

            /// RTL

            if (prop == "%3e---%3e"){
              console.log("RTL/flip imported")
              flipPositionAndPins()
            }



            /// Padded Shape layer

            if (prop == "+---+"){

              console.log("padded layer")

              var paddedLayerColor = '#F2F2F2'

              if (layer.type != "Text"){
                paddedLayerColor = '#D3D3D3'
              }

              var paddedLayer = new ShapePath({
                name: layer.name,
                frame: new Rectangle(layer.frame.x - valuex,layer.frame.y - valuey,layer.frame.width + valuex*2,layer.frame.height + valuey*2),
                parent: layer.parent
              })

              paddedLayer.style.fills = [
                {
                  color: paddedLayerColor,
                  fillType: Style.FillType.Color,
                },
              ]


              layer.selected = false;

              var layerIndex = layer.index;

              console.log("valuex")
              console.log(valuex)

              if (valuex > 0) {
                paddedLayer.index = layerIndex;
              } else {
                paddedLayer.index = layerIndex + 1;
              }

              paddedLayer.selected = true;

              // console.log("layer.index")
              // console.log(layer.index)
              // console.log("rectangle.index")
              // console.log(paddedLayer.index)
              // console.log("padded layer")

              var layerResizingConstraint = layer.sketchObject.resizingConstraint();
              paddedLayer.sketchObject.setResizingConstraint(layerResizingConstraint);

              ui.message("🦄: Done creating padded layer! 👏 🚀");

            }



            /// Padded Text layer
            if (prop == "+++"){
              console.log("padded text layer")

              var paddedLayerColor = '#D3D3D3'

              if (layer.type != "Text"){

                valuex = valuex * (-1)
                valuey = valuey * (-1)


                createText(layer,layer.frame.x - valuex,layer.frame.y - valuey,layer.frame.width + valuex*2,layer.frame.height + valuey*2,"Type something")

                ui.message("🦄: Done creating padded layer! 👏 🚀");

              } else {

                console.log("duplicate down text layer")
                var newLayer = layer.duplicate();
                newLayer.frame.y = newLayer.frame.y + layer.frame.height + valuey
                newLayer.frame.x = newLayer.frame.x + valuex
                newLayer.frame.width = layer.frame.width + valuex*(-2)
                newLayer.index = layer.index;

                layer.selected = false;
                newLayer.selected = true;
                // resultingSelectedLayers.push(newLayer)

                adjustToFitIfGroup(layer)

                ui.message("🦄: Added a text layer just below the selcted one! 👏 🚀");

              }


            }





            if (prop == "|||"){

              // console.log("space horizzontally 4")


              if (layer.type == "Artboard"){

                var layerParentChildren = selectedLayers.layers

                if (j == 0) {
                  layer.frame.x = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.x; }))
                } else {
                  layer.frame.x = layerParentChildren[j-1].frame.x + layerParentChildren[j-1].frame.width + valuex
                }

                console.log("force Y to min")
                layer.frame.y = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.y; }))

              } else {

                var layerParent = layer.parent;
                var layerParentChildren = layer.parent.layers;

                if (j == 0) {
                  layer.frame.x = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.x; }))
                } else {
                  layer.frame.x = layerParentChildren[j-1].frame.x + layerParentChildren[j-1].frame.width + valuex
                }

                // console.log("force Y to min")
                layer.frame.y = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.y; }))


                if (j == layerParentChildren.length - 1) {
                  adjustToFitIfGroup(layer)
                }

              }


              ui.message("🦄: Spaced elements horizzontally! 👏 🚀");

            }


            /// Stacking

            if (prop == "-20-20-"){
              // console.log("space vertically - selectedLayers 7")

              if (layer.type == "Artboard"){

                var layerParentChildren = selectedLayers.layers

                if (j == 0) {
                  layer.frame.y = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.y; }))
                } else {
                  layer.frame.y = layerParentChildren[j-1].frame.y + layerParentChildren[j-1].frame.height + valuey
                }

                console.log("force X to min")
                layer.frame.x = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.x; }))

              } else {

                var layerParent = layer.parent;
                var layerParentChildren = layer.parent.layers;

                if (j == 0) {
                  layer.frame.y = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.y; }))
                } else {
                  layer.frame.y = layerParentChildren[j-1].frame.y + layerParentChildren[j-1].frame.height + valuey
                }

                // console.log("force X to min")
                layer.frame.x = Math.min.apply(Math, layerParentChildren.map(function(o) { return o.frame.x; }))


                if (j == layerParentChildren.length - 1) {
                  adjustToFitIfGroup(layer)
                }

              }

              ui.message("🦄: Spaced elements vertically! 👏 🚀");

            }


            // Duplicate


            if (prop == "dw"){
              console.log("down")
              var newLayer = layer.duplicate();
              newLayer.frame.y = newLayer.frame.y + layer.frame.height + valuey
              newLayer.index = layer.index;

              layer.selected = false;
              newLayer.selected = true;
              resultingSelectedLayers.push(newLayer)

              adjustToFitIfGroup(layer)

            }

            if (prop == "up"){
              console.log("up")
              var newLayer = layer.duplicate();
              newLayer.frame.y = newLayer.frame.y - layer.frame.height - valuey

              layer.selected = false;
              newLayer.selected = true;
              resultingSelectedLayers.push(newLayer)

              adjustToFitIfGroup(layer)

            }

            if (prop == "dx"){
              console.log("right")
              var newLayer = layer.duplicate();
              newLayer.frame.x = newLayer.frame.x + layer.frame.width + valuex
              newLayer.index = layer.index;

              layer.selected = false;
              newLayer.selected = true;

              resultingSelectedLayers.push(newLayer)

              adjustToFitIfGroup(layer);

            }

            if (prop == "sx"){
              console.log("left")
              var newLayer = layer.duplicate();
              newLayer.frame.x = newLayer.frame.x - layer.frame.width - valuex

              layer.selected = false;
              newLayer.selected = true;
              resultingSelectedLayers.push(newLayer)

              adjustToFitIfGroup(layer);
            }


            // left,right,top,bottom,fixedWidth,fixedHeight

            if (myDirection == "tl"){
              setResizingConstraint(layer, [true,false,true,false],[false,false])
            }
            if (myDirection == "tc"){
              setResizingConstraint(layer, [false,false,true,false],[false,false])
            }
            if (myDirection == "tr"){
              setResizingConstraint(layer, [false,true,true,false],[false,false])
            }

            if (myDirection == "ml"){
              setResizingConstraint(layer, [true,false,false,false],[false,false])
            }
            if (myDirection == "mc"){
              setResizingConstraint(layer, [false,false,false,false],[false,false])
            }
            if (myDirection == "mr"){
              setResizingConstraint(layer, [false,true,false,false],[false,false])
            }

            if (myDirection == "bl"){
              setResizingConstraint(layer, [true,false,false,true],[false,false])
            }
            if (myDirection == "bc"){
              setResizingConstraint(layer, [false,false,false,true],[false,false])
            }
            if (myDirection == "br"){
              setResizingConstraint(layer, [false,true,false,true],[false,false])
            }

            if (myDirection == "fw"){
              setResizingConstraint(layer, [true,true,false,false],[false,false])
            }
            if (myDirection == "fh"){
              setResizingConstraint(layer, [false,false,true,true],[false,false])
            }
            if (myDirection == "fs"){
              setResizingConstraint(layer, [true,true,true,true],[false,false])
            }


            if (layer.parent.layers.length << 2) {
              // console.log("only child")
              adjustToFitIfGroup(layer);
            }



            ///
            // console.log(layer.sketchObject.resizingConstraint())

            ui.message("🦄: Done! 👏 🚀");

            /// UNDO
          //   if (prop == "undo"){
          //   //MSUndoAction
          //   console.log("undo---")
          //   ui.message("🦄: Undo! 👏 🚀");

          //   context.document.actionsController().actionForID("MSUndoAction").doPerformAction(null);

          // }

            //Settings.setLayerSettingForKey(layer, 'meta', myLayerX);

            // }

            // for (s = 0; s < resultingSelectedLayers.length; s++) {

            //   console.log("resultingSelectedLayers")
            //   console.log(resultingSelectedLayers)
            //   resultingSelectedLayers[s].selected = true;
            // }


          }



        } else if (hash.hasOwnProperty('close')) {
          //We can also call commands on the window itself, like closing the window
          //This can be run aftr other commands, obviously
          threadDictionary.removeObjectForKey(identifier);
          webViewWindow.close();
        }

      })
    });

    webView.setFrameLoadDelegate_(delegate.getClassInstance());
    webView.setMainFrameURL_(context.plugin.urlForResourceNamed("ui.html").path());
    webViewWindow.contentView().addSubview(webView);
    webViewWindow.center();
    webViewWindow.makeKeyAndOrderFront(nil);
    // Define the close window behaviour on the standard red traffic light button
    var closeButton = webViewWindow.standardWindowButton(NSWindowCloseButton);
    closeButton.setCOSJSTargetFunction(function(sender) {
      COScript.currentCOScript().setShouldKeepAround(false);
      threadDictionary.removeObjectForKey(identifier);
      webViewWindow.close();
    });
    closeButton.setAction("callAction:");
  };


  ////

  const getLayoutSettings = artboard => {
    const abLayout = artboard.layout();
    return {
      drawVertical: abLayout.drawVertical(),
      totalWidth: abLayout.totalWidth(),
      horizontalOffset: abLayout.horizontalOffset(),
      numberOfColumns: abLayout.numberOfColumns(),
      guttersOutside: abLayout.guttersOutside(),
      gutterWidth: abLayout.gutterWidth(),
      columnWidth: abLayout.columnWidth(),
      drawHorizontal: abLayout.drawHorizontal(),
      gutterHeight: abLayout.gutterHeight(),
      rowHeightMultiplication: abLayout.rowHeightMultiplication(),
      drawHorizontalLines: abLayout.drawHorizontalLines(),
      isEnabled: abLayout.isEnabled()
    }
  }
  
  const getGridSettings = artboard => {
    const abGrid = artboard.grid();
    return {
      gridSize: abGrid.gridSize(),
      thickGridTimes: abGrid.thickGridTimes(),
      isEnabled: abGrid.isEnabled()
    }
  }


  /////





  //A function to parse the hash we get back from the webview
  function parseHash(aURL) {
    aURL = aURL;
    var vars = {};
    var hashes = aURL.slice(aURL.indexOf('#') + 1).split('&');

    for(var i = 0; i < hashes.length; i++) {
      var hash = hashes[i].split('=');

      if(hash.length > 1) {
        vars[hash[0].toString()] = hash[1];
      } else {
        vars[hash[0].toString()] = null;
      }
    }

    return vars;
  }

  //A function that returns a selection as SVG string 
  function getLayerAsSVG(layer) {

    // var slice = layerKeyObject;
    var options = {
      formats: "svg",
      output: false
    }

    var svgCode = sketch.export(layer, options).toString();
    // var svgCode1 = svgCode.split('<svg width="')
    // // console.log 
    // var svgCode2 = svgCode.split('px"')
    // svgCode = svgCode1[0] +'<svg width="'+ '100%"' + svgCode2[1]
    svgCode = svgCode.split('\n').join('')

    return svgCode;
  }

}

// var onSelectionChanged = function(context) {
//   // BUG: newSelection is empty when changing selection
//   // WORKAROUND: document.selectedLayers().layers()
//   // http://sketchplugins.com/d/112-bug-selectionchanged-finish-newselection-is-empty
//
//   console.log("You are selecting things")
//
//   ui.message("🦄: You are selecting things! 👏 🚀");
// }

function printValue(label,value){
  console.log(label + ":"+ value)
}


/// Adjust to fit if parent is a group

function adjustToFitIfGroup(layer) {
  var layerParent = layer.parent;
  if (layerParent.type === "Group") {
    layerParent.adjustToFit();
  }
}

/// Create text layer

function createText(layer,textX,textY,width,height,textValue) {
  // textX = 10;
  // textY = 10;
  textParent = layer.parent;

  var textFontSize = 12;

  var backgroundColor = layer.style.fills[0].color.slice(0,7)
  // console.log("Fill:" + layer.style.fills[0].color.slice(0,7))
  var highContrastColor = invertColor(backgroundColor, true) || "#999"

  // console.log(highContrastColor)

  var textColor = highContrastColor

  var textLineHeight = 24;
  var textAlignment = "left";
  var textFontFamily = 'Open Sans';
  var textFontWeight = 5;
  // textValue = "Hello!";
  // textName = "Notes";

  var text = new Text({
    text: textValue
  })

  text.frame.x = textX
  text.frame.y = textY
  text.frame.width = width
  text.frame.height = height
  text.parent = textParent;
  text.index = layer.index+1;
  text.style.fontSize = textFontSize;
  text.style.textColor = textColor;
  text.style.lineHeight = textLineHeight;
  text.style.alignment = textAlignment;
  text.style.fontFamily= textFontFamily;
  text.style.fontWeight= textFontWeight;

  text.name = textName;

}

// function getMaxValue(array,property) {
// var maxY = Math.max.apply(Math, array.map(function(o) { return o.y; }))
// }

//// RTL function from FreeFlow

// function flipPositionAndPins() {
//
//   // var sketch = require('sketch');
//   // var sketchDom = require('sketch/dom')
//   // var ui = require('sketch/ui');
//   // var document = sketch.getSelectedDocument();
//
//   var selection = document.selectedLayers;
//
//   console.log(selection.layers[0].name);
//
//   for (j = 0; j < selection.length; ++j){
//
//     console.log("RTL/flip imported function")
//
//     var layer = selection.layers[j]
//
//     var parentWidth = layer.parent.frame.width
//
//     console.log("before")
//     console.log(layer.frame.x)
//
//     layer.frame.x = parentWidth - layer.frame.x - layer.frame.width
//     console.log("after")
//     console.log(layer.frame.x)
//
//     var newConstraint = 0;
//     var newConstraint = layer.sketchObject.resizingConstraint();
//
//     if (layer.sketchObject.resizingConstraint() === 27) {
//       newConstraint = 30
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 30) {
//       newConstraint = 27
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 59) {
//       newConstraint = 62
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 62) {
//       newConstraint = 59
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 51) {
//       newConstraint = 54
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 54) {
//       newConstraint = 51
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 9) {
//       newConstraint = 12
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 12) {
//       newConstraint = 9
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 44) {
//       newConstraint = 41
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 41) {
//       newConstraint = 44
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 35) {
//       newConstraint = 38
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 38) {
//       newConstraint = 35
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 43) {
//       newConstraint = 46
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 46) {
//       newConstraint = 43
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 57) {
//       newConstraint = 60
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 60) {
//       newConstraint = 57
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 11) {
//       newConstraint = 14
//     }
//
//     if (layer.sketchObject.resizingConstraint() === 14) {
//       newConstraint = 11
//     }
//
//     // APPLY CONSTRAINT
//     layer.sketchObject.setResizingConstraint(newConstraint);
//
//   }
//
//   ui.message("🦄: Done repositioning and inverting pinning properties of " + selection.length + " layers! 👏 🚀");
//
//
// };



/////


//The whole function above is run here
onRun(context);
