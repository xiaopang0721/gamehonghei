/**
* 红黑大战
*/
module gamehonghei.page {
	const STATUS_CONFIG = ["准备中", "游戏开始", "洗牌中", "发牌中", "下注中", "停止下注", "开牌中", "结算中", "结算结果展示", "准备中"];
	export class HongheiPageOld extends game.gui.base.Page {
		private _viewUI: ui.game_ui.honghei.HongHei_HUDUI;
		private _player: any;
		private _playerInfo: any;
		private _listState: any;
		private _hongheiHudMgr: HongheiHudMgr;
		private _gridEditorList: Array<GridEditor>;

		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._asset = [
				Path_game_honghei.atlas_game_ui + "honghei.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "dating.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "logo.atlas",
			];
			this._isNeedDuang = false;
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.honghei.HongHei_HUDUI', ["game_ui.tongyong.HudUI"]);
			this.addChild(this._viewUI);
			if (!this._hongheiHudMgr) {
				this._hongheiHudMgr = new HongheiHudMgr(this._game);
				this._hongheiHudMgr.on(HongheiHudMgr.EVENT_RETURN_MAPINFO, this, this.onUpdateMapinfo);
			}
			this._listState = [];
			this._gridEditorList = [];
			let textureTypes = {
				"R": Path_game_honghei.ui_honghei + "tu_g1.png",//红
				"B": Path_game_honghei.ui_honghei + "tu_x1.png",//黑
				"1": PathGameTongyong.ui_tongyong_general + "plszx_1.png",
				"2": PathGameTongyong.ui_tongyong_general + "plszx_2.png",
				"3": PathGameTongyong.ui_tongyong_general + "plszx_3.png",
				"4": PathGameTongyong.ui_tongyong_general + "plszx_4.png",
				"5": PathGameTongyong.ui_tongyong_general + "plszx_5.png",
				"6": PathGameTongyong.ui_tongyong_general + "plszx_6.png",
				"7": PathGameTongyong.ui_tongyong_general + "plszx_7.png",
				"8": PathGameTongyong.ui_tongyong_general + "plszx_8.png",
				"9": PathGameTongyong.ui_tongyong_general + "plszx_9.png",
			}
			for (let index = 0; index < this._viewUI.box_rooms.numChildren; index++) {
				this._viewUI.box_rooms._childs[index].visible = false;
				this._listState.push(this._viewUI["txt_status" + index]);
				this._gridEditorList.push(new GridEditor(19.1, 16.3, 30, 6, textureTypes, false))
				this._gridEditorList[index].x = 198;
				this._gridEditorList[index].y = 17;
				this._listState[index].parent.addChild(this._gridEditorList[index]);
			}
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.btn_xinshou.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.btn_chuji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.btn_zhongji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			this._viewUI.btn_gaoji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			(this._viewUI.view as TongyongHudPage).onOpen(this._game, HongheiPageDef.GAME_NAME);
			for (let index = 0; index < this._viewUI.box_rooms.numChildren; index++) {
				this._viewUI.box_rooms._childs[index].visible = true;
				Laya.Tween.from(this._viewUI.box_rooms._childs[index], {
					right: -this._viewUI.box_rooms.width
				}, 200 + index * 100, Laya.Ease.linearNone);
			}

			this._game.playMusic(Path_game_honghei.music_honghei + "honghei_bgm.mp3");
		}


		//帧心跳
		update(diff: number) {
			if (this._hongheiHudMgr) {
				this._hongheiHudMgr.update(diff);
			}
			this.onTime();
		}

		private onUpdateMapinfo(): void {
			let data = this._hongheiHudMgr.data;
			for (let i = 0; i < this._listState.length; i++) {
				if (data[i][2]) {
					let roadInfo = data[i][2];
					let posInfo = data[i][3];
					let arr = [];
					if (roadInfo && roadInfo.length) {
						for (let j = 0; j < roadInfo.length; j++) {
							arr.push(posInfo[j][0]);
							arr.push(posInfo[j][1]);
							arr.push(roadInfo[j]);
						}
					}
					this._gridEditorList[i].setData(arr)
				}
			}
		}

		private onTime(): void {
			if (!this._hongheiHudMgr || !this._hongheiHudMgr.data || !this._hongheiHudMgr.data.length) return;
			let data = this._hongheiHudMgr.data;
			for (let i = 0; i < this._listState.length; i++) {
				let curTime = this._game.sync.serverTimeBys;
				let endTime = data[i][1] + 2;
				let time = Math.floor(endTime - curTime);
				if (time <= 0) {
					this._listState[i].text = "刷新中...";
				} else {
					this._listState[i].text = STATUS_CONFIG[data[i][0]] + time + "s";
				}
			}
		}

		protected onBtnTweenEnd(e: any, target: any): void {
			this._player = this._game.sceneObjectMgr.mainPlayer;
			if (!this._player) return;
			switch (target) {
				//新手场
				case this._viewUI.btn_xinshou:
					this._game.sceneObjectMgr.intoStory(HongheiPageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_HHDZ_1.toString(), true);
					break;
				//小资场	
				case this._viewUI.btn_chuji:
					this._game.sceneObjectMgr.intoStory(HongheiPageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_HHDZ_2.toString(), true);
					break;
				//老板场	
				case this._viewUI.btn_zhongji:
					this._game.sceneObjectMgr.intoStory(HongheiPageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_HHDZ_3.toString(), true);
					break;
				//富豪场	
				case this._viewUI.btn_gaoji:
					this._game.sceneObjectMgr.intoStory(HongheiPageDef.GAME_NAME, Web_operation_fields.GAME_ROOM_CONFIG_HHDZ_4.toString(), true);
					break;
				default:
					break;
			}
		}

		public close(): void {
			this._player = null;
			if (this._viewUI) {
				this._viewUI.btn_xinshou.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.btn_chuji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.btn_zhongji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				this._viewUI.btn_gaoji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				if (this._hongheiHudMgr) {
					this._hongheiHudMgr.off(HongheiHudMgr.EVENT_RETURN_MAPINFO, this, this.onUpdateMapinfo);
					this._hongheiHudMgr.clear();
					this._hongheiHudMgr = null;
				}
				if (this._gridEditorList) {
					for (let i = 0; i < this._gridEditorList.length; i++) {
						this._gridEditorList[i].removeSelf()
						this._gridEditorList[i].destroy();
						this._gridEditorList[i] = null;
					}
				}
				this._game.stopMusic();
				Laya.Tween.clearAll(this);
			}
			super.close();
		}
	}
}