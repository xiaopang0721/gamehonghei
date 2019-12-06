/**
* 红黑大战
*/
module gamehonghei.page {
	export class HongheiPage extends game.gui.base.Page {
		static readonly BET_TIME: number = 15;   //下注时长
		static readonly BET_MAX: number[] = [5000, 8000, 25000, 50000];   //投注限额
		private _viewUI: ui.nqp.game_ui.honghei.HongHei_HUDUI;
		private _player: any;
		private _playerInfo: any;
		private _hongheiHudMgr: HongheiHudMgr;

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
			this._viewUI.list_room.hScrollBarSkin = "";
			this._viewUI.list_room.itemRender = this.createChildren("game_ui.honghei.component.HUDRenderUI", HongheiHUDRender);
			this._viewUI.list_room.renderHandler = new Handler(this, this.renderHandler);
			this._viewUI.list_room.scrollBar.elasticDistance = 100;
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.btn_join.on(LEvent.CLICK, this, this.onBtnClickWithTween);
			(this._viewUI.view as TongyongHudPage).onOpen(this._game, HongheiPageDef.GAME_NAME);

			let datas = [];
			for (let i = 0; i < HongheiPage.BET_MAX.length; i++) {
				let data = [];
				data[0] = HongheiPage.BET_MAX[i];
				data[1] = i;
				datas.push(data);
			}

			this._viewUI.list_room.dataSource = datas;

			this._game.playMusic(Path_game_honghei.music_honghei + "honghei_bgm.mp3");
		}

		public close(): void {
			this._player = null;
			if (this._viewUI) {
				this._viewUI.list_room.dataSource = [];
				this._viewUI.btn_join.off(LEvent.CLICK, this, this.onBtnClickWithTween);
				if (this._hongheiHudMgr) {
					this._hongheiHudMgr.off(HongheiHudMgr.EVENT_RETURN_MAPINFO, this, this.onUpdateMapinfo);
					this._hongheiHudMgr.clear();
					this._hongheiHudMgr = null;
				}
				this._game.stopMusic();
				Laya.Tween.clearAll(this);
			}
			super.close();
		}

		public resize(w: number, h: number, realW: number, realH: number, isLayout: boolean = true): void {
			super.resize(w, h, realW, realH);
			if (this._viewUI) {
				this._viewUI.list_room.width = this._clientWidth;
			}
		}

		private renderHandler(cell: HongheiHUDRender, index: number) {
			if (!cell) return;
			cell.setData(this, this._game, cell.dataSource);
			if (!cell.isTween) {
				Laya.Tween.from(cell, { x: cell.x + 600 }, 200 + index * 100);
				cell.isTween = true;
			}
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
			this._viewUI.list_room.cells.forEach(element => {
				let cell = element as HongheiHUDRender;
				let i = cell.index;
				if (cell.index >= 0) {
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
						cell.setGridData(arr);
					}
				}
			});
		}

		private onTime(): void {
			if (!this._hongheiHudMgr || !this._hongheiHudMgr.data || !this._hongheiHudMgr.data.length) return;
			let data = this._hongheiHudMgr.data;
			this._viewUI.list_room.cells.forEach(element => {
				let cell = element as HongheiHUDRender;
				let i = cell.index;
				if (cell.index >= 0) {
					let curTime = this._game.sync.serverTimeBys;
					let endTime = data[i][1];
					let time = Math.floor(endTime - curTime);
					let valueBar: number;
					if (data[i][0] == 4) {//下注中
						if (time <= 0) {
							valueBar = 0;
							cell.state = "结算中...";
							cell.barV = valueBar;
						} else {
							valueBar = time / HongheiPage.BET_TIME;
							cell.state = "下注中..." + time + "s";
							if (cell.tag != 1 && valueBar) {
								cell.tag = 1;
								cell.barV = valueBar;
								Laya.Tween.to(cell.bar, { value: 0 }, time * 1000, null, Handler.create(this, () => {
									cell.tag = 0;
								}));
							}
						}
					} else {
						valueBar = 0;
						cell.state = "结算中...";
						cell.barV = valueBar;
					}
				}
			});
		}

		protected onBtnTweenEnd(e: any, target: any): void {
			this._player = this._game.sceneObjectMgr.mainPlayer;
			if (!this._player) return;
			this._playerInfo = this._player.playerInfo;
			switch (target) {
				// case this._viewUI.btn_join:
				// 	let maplv = TongyongUtil.getJoinMapLv(HongheiPageDef.GAME_NAME, this._playerInfo.money);
				// 	if (!maplv) return;
				// 	this._game.sceneObjectMgr.intoStory(HongheiPageDef.GAME_NAME, maplv.toString(), true);
				// 	break;
			}
		}
	}

	class HongheiHUDRender extends ui.nqp.game_ui.honghei.component.HUDRenderUI {
		public index: number;
		public isTween: boolean;
		private _page: HongheiPage;
		private _game: Game;
		private _max: number;
		private _gridEditor: GridEditor;
		private _textureTypes = {
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

		constructor() {
			super();
		}

		setData(page: HongheiPage, game: Game, data: any) {
			if (!data) {
				this.visible = false;
				return;
			}
			if (this._max == data[0]) {
				return;
			}
			this._page = page;
			this._game = game;
			this._max = data[0];
			this.index = data[1];
			this.visible = true;
			this.on(LEvent.CLICK, this, this.onClick);
			this.show();
		}

		destroy() {
			this.off(LEvent.CLICK, this, this.onClick);
			if (this._gridEditor) {
				this._gridEditor.removeSelf()
				this._gridEditor.destroy();
				this._gridEditor = null;
			}
			super.destroy();
		}

		setGridData(arr) {
			this._gridEditor.setData(arr);
		}

		set state(v) {
			this.txt_status.text = v.toString();
		}

		set barV(v) {
			this.bar.value = v;
		}

		private show() {
			if (!this._gridEditor) {
				this._gridEditor = new GridEditor(33, 35, 17, 6, this._textureTypes, false);
				this.addChild(this._gridEditor);
			}
			this.txt_max.text = '投注限额：' + this._max;
			this._gridEditor.x = 43;
			this._gridEditor.y = 100;
			this.btn_xinshou.skin = PathGameTongyong.ui_tongyong + 'hud/btn_hud_' + this.index + '.png';
			this.img.skin = PathGameTongyong.ui_tongyong + 'hud/difen_1_' + this.index + '.png';
		}

		private onClick() {
			this._game.sceneObjectMgr.intoStory(HongheiPageDef.GAME_NAME, Web_operation_fields['GAME_ROOM_CONFIG_HHDZ_' + (this.index + 1)].toString(), true);
		}
	}
}