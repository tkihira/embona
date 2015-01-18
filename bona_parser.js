// このファイルはUTF8
var parser = {};
(function() {
	var rawList;
	var currentHand;
	
	var initialize = function() {
		// create initial hand
		parser.handList = [];
		var hand = {};
		var board = [];
		for(var x = 0; x < 9; x++) {
			board[x] = [];
			for(var y = 0; y < 9; y++) {
				board[x][y] = null;
			}
		}
		var pieceList = [];
		var initialSetup = [3, 5, 7, 9, 14, 9, 7, 5, 3];
		var index = 0;
		for(var t = 0; t < 2; t++) {
			var k = (t == 0)? 1: -1;
			var base = (t == 0)? 6: 2;
			
			for(var x = 0; x < 9; x++) {
				var piece = { index: index++, type: 1, sente: (t == 0), screen: 1, x: x, y: base, onBoard: true };
				pieceList.push(piece);
				board[piece.x][piece.y] = piece;
				var p = initialSetup[x];
				piece = { index: index++, type: p, sente: (t == 0), screen: p, x: x, y: base + k * 2, onBoard: true };
				pieceList.push(piece);
				board[piece.x][piece.y] = piece;
			}
			piece = { index: index++, type: 10, sente: (t == 0), screen: 10, x: 4 - k * 3, y: base + k, onBoard: true };
			pieceList.push(piece);
			board[piece.x][piece.y] = piece;
			piece = { index: index++, type: 12, sente: (t == 0), screen: 12, x: 4 + k * 3, y: base + k, onBoard: true };
			pieceList.push(piece);
			board[piece.x][piece.y] = piece;
		}
		hand.text = "= 開始局面 =";
		hand.moveCount = 0;
		hand.sente = false;
		hand.lastX = -1;
		hand.lastY = -1;
		hand.pieceList = pieceList;
		hand.board = board;
		hand.mochigoma = [[], []];
		hand.appendix = false;
		hand.comment = "";
		parser.handList[0] = hand;
		currentHand = hand;
	};
	
	var comment = function(text) {
		currentHand.comment += text + "\n";
		if(text[0] == "※") {
			currentHand.appendix = true;
		}
	};
	
	var duplicateHand = function(orig) {
		var dup = {};
		dup.moveCount = orig.moveCount + 1;
		dup.sente = !orig.sente;
		dup.lastX = -1;
		dup.lastY = -1;
		dup.pieceList = [];
		for(var i = 0; i < orig.pieceList.length; i++) {
			var origPiece = orig.pieceList[i];
			var dupPiece = {};
			for(var key in origPiece) {
				dupPiece[key] = origPiece[key];
			}
			dup.pieceList.push(dupPiece);
		}
		dup.board = [];
		for(var x = 0; x < 9; x++) {
			dup.board[x] = [];
			for(var y = 0; y < 9; y++) {
				dup.board[x][y] = null;
			}
		}
		dup.mochigoma = [[], []];
		for(var i = 0; i < dup.pieceList.length; i++) {
			var piece = dup.pieceList[i];
			if(piece.onBoard) {
				dup.board[piece.x][piece.y] = piece;
			} else {
				dup.mochigoma[piece.sente?0: 1].push(piece);
			}
		}
		dup.appendix = false;
		dup.comment = "";
		dup.text = "";
		return dup;
	}
	
	var createHandText = function(hand, prevHand, fromX, fromY, nari) {
		var pieceLetterList = ["", "歩", "と", "香", "成香", "桂", "成桂", "銀", "成銀", "金", "角", "馬", "飛", "龍", "玉"];
		var ret = hand.sente?"▲": "△";
		
		var piece = hand.board[hand.lastX][hand.lastY];
		
		if(prevHand.lastX == hand.lastX && prevHand.lastY == hand.lastY) {
			ret += "同　"; 
		} else {
			ret += "１２３４５６７８９"[8 - hand.lastX];
			ret += "一二三四五六七八九"[hand.lastY];
		}
		if(nari) {
			ret += pieceLetterList[piece.type];
			var type = piece.type;
		} else {
			ret += pieceLetterList[piece.screen];
			var type = piece.screen;
		}
		
		// same piece check
		var board = prevHand.board;
		var k = hand.sente?1: -1;
		
		// check 8 way
		var mx = 0;
		var my = 0;
		var up = 0, down = 0, left = 0, right = 0;
		for(var dx = -1; dx <= 1; dx++) {
			for(var dy = -1; dy <= 1; dy++) {
				if(dx == 0 && dy == 0) {
					continue;
				}
				if((type == 1 || type == 3) && (dx != 0 || dy != k)) {
					// 歩か香車は後ろのみチェック
					continue;
				} else if(type == 5 && (dx == 0 || dy != k)) {
					// 桂馬は左右のみチェック
					continue;
				} else if(type == 7 && ((dx == 0 && dy == -k) || (dy == 0))) {
					// 銀は左右・後ろに行けない
					continue;
				} else if(type == 10 && (dx == 0 || dy == 0)) {
					// 角は斜め
					continue;
				} else if(type == 12 && (dx != 0 || dy != 0)) {
					// 飛車は縦横
					continue;
				} else if((type == 2 || type == 4 || type == 6 || type == 8 || type == 9) && dy == -k && dx != 0) {
					// 残りは金っぽいもののみ
					continue;
				}
				var sx = hand.lastX + dx;
				var sy = hand.lastY + dy;
				if(type == 5) {
					sy += dy;
				}
				var loop = (type == 3 || type == 10 || type == 12 || (type == 11 && (dx != 0 && dy != 0)) || (type == 13 && (dx == 0 || dy == 0)));
				do {
					if(!(sx >= 0 && sx < 9 && sy >= 0 && sy < 9)) {
						break;
					}
					if(sx == fromX && sy == fromY) {
						mx = dx * k;
						my = dy * k;
						break;
					} else {
						if(board[sx][sy]) {
							if(board[sx][sy].sente != hand.sente) {
								break;
							}
							if(board[sx][sy].screen == type) {
								if(dx == k) { 
									right++;
								} else if(dx == -k) {
									left++;
								}
								if(dy == k) {
									down++;
								} else if(dy == -k) {
									up++;
								}
							}
							break;
						}
					}
					sx += dx;
					sy += dy;
				} while(loop);
			}
		}
		
		if(up == 0 && down == 0 && left == 0 && right == 0) {
			// do nothing
		} else {
			if(fromX == -1) {
				ret += "打";
			} else {
				if(my == 1 && down == 0) {
					ret += "上";
				} else if(my == -1 && up == 0) {
					ret += "引";
				} else if(mx == 1 && right == 0) {
					ret += "右";
				} else if(mx == -1 && left == 0) {
					ret += "左";
				} else {
					if(mx == 1) {
						ret += "右";
					} else if(mx == -1) {
						ret += "左";
					}
					if(my == 1) {
						ret += "上";
					} else if(my == -1) {
						ret += "引";
					}
				}
			}
		}
		
		if(nari) {
			ret += "成";
		} else {
			if(piece.screen == 1 || piece.screen == 3 || piece.screen == 5 || piece.screen == 7 || piece.screen == 10 || piece.screen == 12) {
				if((hand.sente && fromY != -1 && hand.lastY <= 2) || (!hand.sente && fromY != -1 && hand.lastY >= 6)) {
					ret += "不成";
				} else if((hand.sente && fromY != -1 && fromY <= 2) || (!hand.sente && fromY >= 6)) {
					ret += "不成";
				}
			}
		}
		
		if(ret.length > 4) {
			ret = ret.split("　").join("");
		}
		return ret;
	};
	
	var createHand = function(text) {
		//console.log(text);
		// s.match(/ +([0-9]+) (.)(.)([^ \(]+)(\(([0-9]+)\))?/)
		// format: "   1 ５四金(55)   ( 0:00/00:00:00)"
		// format: " 123 ５四金(55)   ( 0:00/00:00:00)"
		// format: "  44 ２五歩打     ( 0:00/00:00:00)"
		// format: "  40 同　銀(24)   ( 0:00/00:00:00)"
		// format: "  75 同　桂成(25) ( 0:00/00:00:00)"
		// ↓
		// format: 1 57 56 FU -7

		var hand = duplicateHand(currentHand);
		var factors = text.split(" ");
		if(factors[1] == "resign") {
			//hand.lastX = currentHand.lastX;
			//hand.lastY = currentHand.lastY;
			hand.comment = currentHand.comment;
			hand.appendix = currentHand.appendix;
			return hand;
		}
		if(hand.moveCount != factors[0]) {
			Error("mismatch move count: " + text);
		}
		//hand.text = matches[1] + " " + matches[2] + matches[3] + matches[4];
		hand.text = text;
		var toX = 9 - (+factors[2][0]);
		var toY = +factors[2][1] - 1;
		/*
		if(matches[2] == "同") {
			var toX = currentHand.lastX;
			var toY = currentHand.lastY;
		} else {
			var toX = 9 - "０１２３４５６７８９".indexOf(matches[2]);
			var toY = "零一二三四五六七八九".indexOf(matches[3]) - 1;
		}
		*/
		var nari = false;
		var fromX = 9 - (+factors[1][0]);
		var fromY = +factors[1][1] - 1;
		//var type = "　歩と香●桂●銀●金角馬飛龍王".indexOf(matches[4][0]);
		var type = { FU: 1, TO: 2, KY: 3, NY: 4, KE: 5, NK: 6, GI: 7,
					NG: 8, KI: 9, KA: 10, UM: 11, HI: 12, RY: 13, OU: 14
		}[factors[3]];
		if(fromY == -1) {
			fromX = -1;
		} else {
			var piece = hand.board[fromX][fromY];
			if(piece.screen != type) {
				nari = true;
			}
			type = piece.type;
		}
		/*
		if(matches[4].indexOf("打") != -1) {
			var fromX = -1;
			var fromY = -1;
			var type = "　歩と香●桂●銀●金角馬飛龍王".indexOf(matches[4][0]);
		} else if(matches[4].indexOf("成") != -1) {
			nari = true;
		}
		if(matches[6] != null) {
			var fromX = 9 - matches[6];
			var fromY = matches[7] - 1;
		}
		*/
		/////////////////////////////////////////////
		//console.log(fromX, fromY, toX, toY);
		hand.lastX = toX;
		hand.lastY = toY;
		if(hand.board[toX][toY]) {
			var piece = hand.board[toX][toY];
			piece.screen = piece.type;
			piece.sente = hand.sente;
			piece.onBoard = false;
			hand.mochigoma[piece.sente?0: 1].push(piece);
			hand.board[toX][toY] = null;
		}
		if(fromX == -1) {
			var mochigoma = hand.mochigoma[hand.sente?0: 1];
			//console.log(type, mochigoma);
			for(var i = 0; i < mochigoma.length; i++) {
				if(mochigoma[i].type == type) {
					var piece = mochigoma[i];
					break;
				}
			}
			if(i == mochigoma.length) {
				Error("mochigoma not found: " + text);
			} else {
				hand.board[toX][toY] = piece;
				piece.x = toX;
				piece.y = toY;
				piece.onBoard = true;
				mochigoma.splice(i, 1);
			}
		} else {
			var piece = hand.board[fromX][fromY];
			piece.x = toX;
			piece.y = toY;
			if(nari) {
				piece.screen = piece.type + 1;
			}
			hand.board[toX][toY] = piece;
			hand.board[fromX][fromY] = null;
		}
		hand.text = hand.moveCount + " " + createHandText(hand, currentHand, fromX, fromY, nari);
		return hand;
	}
	
	parser.parse = function(raw) {
		raw = raw || "";
		initialize();
		rawList = raw.split("\n");
		var pos = 0;
		while(pos < rawList.length && rawList[pos]) {
			var line = rawList[pos++];
			var hand = createHand(line);
			parser.handList.push(hand);
			currentHand = hand;
			comment("評価値: " + line.split(" ").pop());

			var prefix = currentHand.appendix?"# ": currentHand.comment.length?"* ": "　";
			currentHand.text = prefix + currentHand.text;
			if(/resign/.test(line)) {
				currentHand.text = "まで" + (currentHand.sente?"後手":"先手") + "の勝ち";
			}
		}
		viewer.init();
	};
})();
