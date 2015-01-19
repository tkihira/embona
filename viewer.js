window.viewer = {};
(function() {
	var isMouseDown = false;
	var dragFromX = 0;
	var dragFromY = 0;
	var imageFromX = 0;
	var imageFromY = 0;
	var targetImage = null;
	var targetPiece = null;
	var cloneElement = null;
	viewer.isDraggable = false;
	viewer.isSente = false;

	var clearDragAndDrop = function() {
		if(cloneElement && cloneElement.parentNode) {
			cloneElement.parentNode.removeChild(cloneElement);
		}
		if(elements["focusMasu"].parentNode) {
			elements["focusMasu"].parentNode.removeChild(elements["focusMasu"]);
		}
		isMouseDown = false;
		dragFromX = 0;
		dragFromY = 0;
		targetImage = null;
		targetPiece = null;
	};
	document.addEventListener("mousedown", function(e) {
		if(isMouseDown || !viewer.isDraggable) {
			return;
		}
		var element = e.target;
		for(var i = 0; i < pieceImageList.length; i++) {
			var pieceImage = pieceImageList[i];
			if(element == pieceImage) {
				break;
			}
		}
		if(pieceList && i != pieceImageList.length) {
			e.preventDefault();
			//console.log(pieceList[i]);
			dragFromX = e.screenX;
			dragFromY = e.screenY;
			imageFromX = parseInt(element.style.left);
			imageFromY = parseInt(element.style.top);
			targetImage = element;
			for(var i = 0; i < pieceList.length; i ++) {
				if(pieceImageList[pieceList[i].index] == element) {
					break;
				}
			}
			targetPiece = pieceList[i];
			if(targetPiece.sente != viewer.isSente) {
				return;
			}
			targetImage.parentNode.appendChild(targetImage);
			isMouseDown = true;
			if(!targetPiece.onBoard) {
				elements["board"].appendChild(targetImage);
				if(targetPiece.sente && !flip || !targetPiece.sente && flip) {
					imageFromX -= elements["board"].offsetLeft - elements["sente"].offsetLeft;
					imageFromY -= elements["board"].offsetTop - elements["sente"].offsetTop;
				} else {
					imageFromX -= elements["board"].offsetLeft - elements["gote"].offsetLeft;
					imageFromY -= elements["board"].offsetTop - elements["gote"].offsetTop;
				}
				element.style.left = imageFromX + "px";
				element.style.top = imageFromY + "px";
			}
			cloneElement = element.cloneNode(true);
			cloneElement.style.opacity = "0.2";
			elements["board"].appendChild(cloneElement);
		}
	}, false);
	document.addEventListener("mousemove", function(e) {
			e.preventDefault();
		if(isMouseDown) {
			var x = imageFromX + e.screenX - dragFromX;
			var y = imageFromY + e.screenY - dragFromY;
			targetImage.style.left = x + "px";
			targetImage.style.top = y + "px";
			x = ((x - 1) / (pieceWidth - 1) + 0.5) | 0;
			y = ((y - 1) / (pieceHeight - 1) + 0.5) | 0;
			var focusElement = elements["focusMasu"];
			if(!focusElement.parentNode) {
				elements["board"].insertBefore(focusElement, pieceImageList[0]);
			}
			if(x < 0 || x > 8 || y < 0 || y > 8) {
				focusElement.style.display = "none";
			} else {
				focusElement.style.display = "block";
			}
			focusElement.style.left = ((x * (pieceWidth + 1)) + 1) + "px";
			focusElement.style.top = ((y * (pieceHeight + 1)) + 1) + "px";
		}
	}, false);
	document.addEventListener("mouseup", function(e) {
		if(isMouseDown) {
			isMouseDown = false;
			if(cloneElement && cloneElement.parentNode) {
				elements["board"].removeChild(cloneElement);
			}
			if(elements["focusMasu"].parentNode) {
				elements["board"].removeChild(elements["focusMasu"]);
				targetImage.style.left = elements["focusMasu"].style.left;
				targetImage.style.top = elements["focusMasu"].style.top;

				var fromX = 9 - targetPiece.x;
				var fromY = targetPiece.y + 1;
				var x = ((parseInt(targetImage.style.left) - 1) / (pieceWidth - 1)) | 0;
				var y = ((parseInt(targetImage.style.top) - 1) / (pieceHeight - 1)) | 0;
				var toX = 9 - x;
				var toY = y + 1;
				if(flip) {
					toX = 10 - toX;
					toY = 10 - toY;
				}
				if(toX < 1 || toX > 9 || toY < 1 || toY > 9 || (targetPiece.onBoard && fromX == toX && fromY == toY)) {
					showBoard();
					return;
				}
				//var type = { FU: 1, TO: 2, KY: 3, NY: 4, KE: 5, NK: 6, GI: 7,
				//			NG: 8, KI: 9, KA: 10, UM: 11, HI: 12, RY: 13, OU: 14
				var type = targetPiece.type;
				var types =  ["", "FU", "TO", "KY", "NY", "KE", "NK", "GI",
								"NG", "KI", "KA", "UM", "HI", "RY", "OU"];
				if(!targetPiece.onBoard) {
					fromX = 0;
					fromY = 0;
				}
				if(targetPiece.type == targetPiece.screen) {
					if(type == 1 || type == 3 || type == 5 || type == 7 || type == 10 || type == 12) {
						//console.log(fromY, toY, targetPiece.sente, targetPiece, fromX);
						if(fromX != 0 && ((fromY >=7 || toY >= 7) && !targetPiece.sente || (fromY <= 3 || toY <= 3) && targetPiece.sente)) {
							if(confirm("成りますか？")) {
								type++;
							}
						}
					}
				} else {
					type = targetPiece.screen;
				}
				if(viewer.onmoveenter) {
					viewer.onmoveenter("" + fromX + fromY, "" + toX + toY, types[type]);
				}
				viewer.isDraggable = false;
			}
		}
	}, false);

	// const
	var pieceWidth = 43;
	var pieceHeight = 48;
	var flip = false;
	viewer.setFlip = function(f) {
		flip = f;
	};
	
	// instance
	var imageList = {};
	var pieceLetterList = ["", "fu", "to", "kyo", "nkyo", "kei", "nkei", "gin", "ngin", "kin", "kaku", "uma", "hi", "ryu", "ou"];
	var elements = {};
	var pieceImageList = [];
	
	// by game
	var pieceList;
	var lastHand;
	
	var inited = false;
	viewer.init = function() {
		if(inited) {
			initialize();
			return;
		}
		inited = true;
		var needToBeLoaded = 0;
		for(var j = 0; j < 2; j++) {
			var sg = (j == 0)? "S": "G";
			for(var i = 0; i < pieceLetterList.length; i++) {
				var piece = pieceLetterList[i];
				if(piece.length == 0) {
					// null piece
					continue;
				}
				var key = sg + piece;
				var url = "img/" + key + ".png";
				needToBeLoaded++;
				var img = document.createElement("img");
				img.onload = function() {
					needToBeLoaded--;
					if(needToBeLoaded == 0) {
						initialize();
					}
				};
				img.onerror = function() {
					Error("load failure");
				};
				img.src = url;
				imageList[key] = img;
			}
		}
		// create board on html
		var board = document.getElementById("board");
		board.style.width = ((pieceWidth + 1) * 9 + 1) + "px";
		board.style.height = ((pieceHeight + 1) * 9 + 1) + "px";
		for(var x = 0; x < 9; x++) {
			for(var y = 0; y < 9; y++) {
				var masu = document.createElement("div");
				masu.style.position = "absolute";
				masu.style.backgroundColor = "#fff";
				masu.style.left = ((x * (pieceWidth + 1)) + 1) + "px";
				masu.style.top = ((y * (pieceHeight + 1)) + 1) + "px";
				masu.style.width = pieceWidth + "px";
				masu.style.height = pieceHeight + "px";
				board.appendChild(masu);
			}
		}
		elements["board"] = board;
		var gote = document.getElementById("gote_mochigoma");
		gote.style.width = ((pieceWidth + 1) * 9 + 1) + "px";
		gote.style.height = ((pieceHeight + 1) * 1 + 1) + "px";
		elements["gote"] = gote;
		var sente = document.getElementById("sente_mochigoma");
		sente.style.width = ((pieceWidth + 1) * 9 + 1) + "px";
		sente.style.height = ((pieceHeight + 1) * 1 + 1) + "px";
		elements["sente"] = sente;
		elements["comment"] = document.getElementById("comment");
		elements["kifu"] = document.getElementById("kifu");
		// create piece images
		for(var i = 0; i < (9 + 2 + 9) * 2; i++) {
			var img = document.createElement("img");
			img.style.position = "absolute";
			img.style.width = pieceWidth + "px";
			img.style.height = pieceHeight + "px";
			pieceImageList.push(img);
		}
		var div = document.createElement("div");
		div.style.position = "absolute";
		div.style.width = pieceWidth + "px";
		div.style.height = pieceHeight + "px";
		div.style.backgroundColor = "rgba(255,0,0,0.2)";
		elements["focusMasu"] = div;
	};
	
	var showBoard = function(hand) {
		hand = hand || lastHand;
		lastHand = hand;
		clearDragAndDrop();
		for(var i = 0; i < pieceImageList.length; i++) {
			var pieceImage = pieceImageList[i];
			if(pieceImage.parentNode) {
				pieceImage.parentNode.removeChild(pieceImage);
			}
			pieceImage.style.backgroundColor = "";
		}
		var bin = [[],[]];
		pieceList = hand.pieceList;
		for(var i = 0; i < pieceList.length; i++) {
			var piece = pieceList[i];
			var key = ((!flip && piece.sente || flip && !piece.sente)? "S": "G") + pieceLetterList[piece.screen];
			if(piece.onBoard) {
				var x = flip ? 8 - piece.x : piece.x;
				var y = flip ? 8 - piece.y : piece.y;
				var pieceImage = pieceImageList[piece.index];
				pieceImage.src = imageList[key].src;
				pieceImage.style.zIndex = "";
				pieceImage.style.left = ((x * (pieceWidth + 1)) + 1) + "px";
				pieceImage.style.top = ((y * (pieceHeight + 1)) + 1) + "px";
				if(piece.x == hand.lastX && piece.y == hand.lastY) {
					pieceImage.style.backgroundColor = "#ff0";
				}
				elements["board"].appendChild(pieceImage);
			} else {
				// mark mochigoma
				if(!flip && piece.sente || flip && !piece.sente) {
					bin[0][piece.type] = (bin[0][piece.type] || []);
					bin[0][piece.type].push(piece);
				} else {
					bin[1][piece.type] = (bin[1][piece.type] || []);
					bin[1][piece.type].push(piece);
				}
			}
		}
		// mochigoma
		count = 0;
		for(var t = 0; t < 2; t++) {
			var k = (t == 0)? 1: -1;
			var currentPos = (t == 0)? 1: pieceWidth * 8 + 1;
			for(var i = bin[t].length - 1; i >= 0; i--) {
				if(bin[t][i]) {
					var key = ((t == 0)? "S": "G") + pieceLetterList[i];
					for(var j = 0; j < bin[t][i].length; j++) {
						var piece = bin[t][i][j];
						var image = pieceImageList[piece.index];
						image.src = imageList[key].src;
						image.style.top = 1 + "px";
						image.style.left = currentPos + "px";
						image.style.zIndex = 100 + k * (count++);
						currentPos += k * pieceWidth * ((bin[t][i].length > 3)? 0.3: 0.4);
						elements[(t == 0)?"sente":"gote"].appendChild(image);
					}
					currentPos += k * pieceWidth * 0.5;
				}
			}
		}
		// comment
		elements["comment"].value = hand.comment;
	};
	viewer.showBoard = showBoard;
	
	var lastPosition = 0;
	var initialize = function() {
		while(elements["kifu"].firstChild) {
			elements["kifu"].removeChild(elements["kifu"].firstChild);
		}
		for(var i = 0; i < parser.handList.length; i++) {
			var option = document.createElement("option");
			option.value = i;
			var hand = parser.handList[i];
			option.appendChild(document.createTextNode(hand.text));
			elements["kifu"].appendChild(option);
		}
		var i = 0;
		/*
		(function test() {
			showBoard(parser.handList[i++]);
			if(i < parser.handList.length) {
				setTimeout(test, 100);
			}
		});
		*/
		if(lastPosition >= parser.handList.length) {
			lastPosition = parser.handList.length - 1;
		}
		if(lastPosition == parser.handList.length - 2) {
			lastPosition = parser.handList.length - 1;
		}
		showBoard(parser.handList[lastPosition]);
		elements["kifu"].options[lastPosition].selected = true;
		elements["kifu"].focus();
		elements["kifu"].onchange = function() {
			lastPosition = +elements["kifu"].value;
			showBoard(parser.handList[+elements["kifu"].value]);
		};
	};
})();
