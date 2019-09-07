/**
*红黑大战剧情
*/
module gamehonghei.story {
	const enum MAP_STATUS {
        PLAY_STATUS_NONE = 0, // 准备阶段
        PLAY_STATUS_GAMESTART = 1, // 游戏开始
        PLAY_STATUS_WASH_CARD = 2, // 洗牌阶段
        PLAY_STATUS_PUSH_CARD = 3, // 发牌阶段
        PLAY_STATUS_BET = 4, // 下注阶段
        PLAY_STATUS_STOP_BET = 5,// 停止下注阶段
        PLAY_STATUS_SHOW_CARD = 6, // 开牌阶段
        PLAY_STATUS_SETTLE = 7, // 结算阶段
        PLAY_STATUS_SETTLE_SHOW = 8, // 结算结果展示
        PLAY_STATUS_RELAX = 9, // 休息阶段
    }
	export class HongheiStory extends gamecomponent.story.StoryBaiRenBase {
		/**房间场次信息*/
		static readonly ROOM_INFO_LEVEL: string = "ROOM_INFO_LEVEL";

		private _hongheiMgr: HongheiMgr;
		private _curStatus: number;
		private _hongheiMapInfo: HongheiMapInfo;
		private _openCards: Array<number> = [];
		private _isFaPai: boolean = false;

		constructor(v: Game, mapid: string, maplv: number) {
			super(v, mapid, maplv);
			this.init();
		}

		get hongheiMgr() {
			return this._hongheiMgr;
		}

		init() {
			if (!this._hongheiMgr) {
				this._hongheiMgr = new HongheiMgr(this._game);
			}
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
			this._game.sceneObjectMgr.on(MapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);

			this.onIntoNewMap();
		}

		private onIntoNewMap(info?: MapAssetInfo): void {
			if (!info) return;
			this.onMapInfoChange();
			this._game.uiRoot.closeAll();
			this._game.uiRoot.HUD.open(HongheiPageDef.PAGE_HHDZ_MAP);
		}

		private onMapInfoChange(): void {
			let mapinfo = this._game.sceneObjectMgr.mapInfo;
			this._hongheiMapInfo = mapinfo as HongheiMapInfo;
			if (mapinfo) {
				this.onUpdateBattle();
				this.onUpdateState();
			}
		}

		private onUpdateState(): void {
			if (!this._hongheiMapInfo) return;
			let mapStatus = this._hongheiMapInfo.GetMapState();
			if (this._curStatus == mapStatus) return;
			this._curStatus = mapStatus;
			switch (this._curStatus) {
				case MAP_STATUS.PLAY_STATUS_NONE:// 准备阶段
					this.serverClose();
					break;
				case MAP_STATUS.PLAY_STATUS_GAMESTART:// 游戏开始
					this._openCards = [];
					break;
				case MAP_STATUS.PLAY_STATUS_WASH_CARD:// 洗牌阶段
					break;
				case MAP_STATUS.PLAY_STATUS_PUSH_CARD:// 发牌阶段
					this.cardsDeal();
					break;
				case MAP_STATUS.PLAY_STATUS_BET:// 下注阶段
					this.cardsReDeal()
					break;
				case MAP_STATUS.PLAY_STATUS_STOP_BET:// 停止下注阶段
					this.cardsReDeal()
					break;
				case MAP_STATUS.PLAY_STATUS_SHOW_CARD:// 开牌阶段
					this.cardsReDeal()
					break;
				case MAP_STATUS.PLAY_STATUS_SETTLE:// 结算阶段
					this.cardsReDeal()
					break;
				case MAP_STATUS.PLAY_STATUS_SETTLE_SHOW://结算结果展示
					this.cardsReDeal()
					break;
				case MAP_STATUS.PLAY_STATUS_RELAX:// 休息阶段
					this._openCards = [];
					this._hongheiMgr.clear();
					this._isFaPai = false;
					break;
			}
		}

		createObj() {
			let card = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CARD_MARK, HongheiData) as HongheiData;
			card.pos = new Vector2(835, 187); //牌发出来的位置
			card.rotateAngle = 60;
			return card;
		}

		//开牌
		private cardsOpen(): void {
			let count = 1;
			let counter = 0;
			for (let i: number = 0; i < HongheiMgr.MAX_CARD_COUNT; i++) {
				for (let j = 0; j < HongheiMgr.CARDS_NUM; j++) {
					Laya.timer.once(400 * count, this, () => {
						if (this._hongheiMgr) {
							let index = j * HongheiMgr.MAX_CARD_COUNT + i;
							let fanpai = (index == 2 || index == 5) ? false : true;
							this._hongheiMgr.setValue(this._openCards[index], index, fanpai);
							counter++;
							if (counter >= this._openCards.length) {
								this.hongheiMgr.event(HongheiMgr.OPEN_OVER);
							}
						}
					});
					count++;
				}
			}
		}

		//正常游戏发牌
		private cardsDeal(): void {
			if (this._isFaPai) return;
			this._isFaPai = true;
			let cards = [1, 1, 1, 1, 1, 1];
			let handle = new Handler(this, this.createObj);
			this._hongheiMgr.Init(cards, handle);
			this._hongheiMgr.sort();
			this._hongheiMgr.fapai();
		}

		//断线重连,重发下牌
		private cardsReDeal(): void {
			if (!this._hongheiMapInfo) return;
			let status = this._game.sceneObjectMgr.mapInfo.GetMapState();
			if (this._openCards.length >= 6) {
				if (status == MAP_STATUS.PLAY_STATUS_SHOW_CARD) {
					this.cardsOpen();
					this._hongheiMgr.isOpenCards = true;
				}
			} else {
				if (this._isFaPai) return;
				this._isFaPai = true;
				let cards = [1, 1, 1, 1, 1, 1];
				let handle = new Handler(this, this.createObj);
				this._hongheiMgr.Init(cards, handle);
				this._hongheiMgr.sort();
				this._hongheiMgr.refapai();
			}
		}

		//战斗结构体 出牌
		private onUpdateBattle(): void {
			if (!this._hongheiMapInfo) return;
			let battleInfoMgr = this._hongheiMapInfo.battleInfoMgr;
			for (let i: number = 0; i < battleInfoMgr.info.length; i++) {
				let info = battleInfoMgr.info[i];
				if (info instanceof gamecomponent.object.BattleInfoDeal) {
					let arr = this._hongheiMgr.initCard(info.Cards).concat();
					if (this._openCards.length < 6) {
						this._openCards = this._openCards.concat(arr)
					}
				}
			}
			if (this._hongheiMgr.isReconnect && this._curStatus >= MAP_STATUS.PLAY_STATUS_SHOW_CARD && !this._hongheiMgr.isOpenCards) {
				this._hongheiMgr.isReconnect = false;
				let count = 0;
				for (let i = 0; i < this._openCards.length; i++) {
					this._hongheiMgr.setValue1(this._openCards[i], i, true);
					count++;
					if (count >= this._openCards.length) {
						Laya.timer.once(1000, this, () => {
							this.hongheiMgr.event(HongheiMgr.OPEN_OVER1);
						})
					}
				}
			}
		}

		enterMap() {
			//各种判断
			this._game.network.call_match_game(this._mapid, this.maplv);
			return true;
		}

		leavelMap() {
			//各种判断
			this._game.network.call_leave_game();
			return true;
		}

		clear() {
			this._hongheiMapInfo = null;
			this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
			this._game.sceneObjectMgr.off(MapInfo.EVENT_STATUS_CHECK, this, this.onUpdateState);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_LOAD_MAP, this, this.onIntoNewMap);
			this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onMapInfoChange);
			if (this._hongheiMgr) {
				this._hongheiMgr = null;
			}
		}

		update(diff: number) {

		}
	}
}