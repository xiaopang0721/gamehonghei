/**
* name 
*/
module gamehonghei.manager {
	export class HongheiMgr extends gamecomponent.managers.PlayingCardMgrBase<HongheiData>{
		static readonly CARDS_NUM = 2; //场上共2副牌
		static readonly MAX_CARD_COUNT = 3; //最大手牌数
		static readonly MAPINFO_OFFLINE: string = "HongheiMgr.MAPINFO_OFFLINE";//假精灵
		static readonly DEAL_OVER: string = "HongheiMgr.DEAL_OVER";//发牌结束
		static readonly OPEN_OVER: string = "HongheiMgr.OPEN_OVER";//开牌结束
		static readonly OPEN_OVER1: string = "HongheiMgr.OPEN_OVER1";//开牌结束1

		private _unitOffline: UnitOffline;//假精灵信息
		private _isCancel: boolean = false;
		private _isReConnect: boolean = true;
		private _isOpenCards: boolean = false;
		private _cardsIndex: Array<number> = [];//牌的归属位置

		constructor(game: Game) {
			super(game);
		}

		get unitOffline() {
			return this._unitOffline;
		}

		set unitOffline(v) {
			this._unitOffline = v;
			this.event(HongheiMgr.MAPINFO_OFFLINE)
		}

		get isCancel() {
			return this._isCancel;
		}

		set isCancel(v) {
			this._isCancel = v;
			this.event(HongheiMgr.MAPINFO_OFFLINE)
		}

		get isReconnect() {
			return this._isReConnect;
		}

		set isReconnect(v) {
			this._isReConnect = v;
		}

		set cardIndex(v) {
			this._cardsIndex = v;
		}

		get allCards() {
			return this._cards;
		}

		get isOpenCards() {
			return this._isOpenCards;
		}

		set isOpenCards(v) {
			this._isOpenCards = v;
		}

		//对牌进行排序 重写不需要排序
		SortCards(cards: any[]) {

		}

		//管理器自己的排序
		sortCards(cards: any[]) {
			if (!cards) return;
			cards.sort((a: HongheiData, b: HongheiData) => {
				return a.Compare(b);
			});
		}

		initCard(all_val: Array<number>) {
			let card_arr = [];
			for (let i: number = 0; i < all_val.length; i++) {
				let card: HongheiData;
				card = new HongheiData();
				card.Init(all_val[i]);
				card_arr.push(card);
			}
			return card_arr;
		}

		setValue(_cards, i, fanpai) {
			if (!this._cards.length) return;
			if (!_cards) return;
			let card = this._cards[i] as HongheiData;
			if (card) {
				card.Init(_cards.GetVal());
				card.index = i;
				card.sortScore = i;
				if (fanpai) {
					card.fanpai();
				}
			}
		}

		setValue1(_cards, i, fanpai) {
			if (!this._cards.length) return;
			if (!_cards) return;
			let card = this._cards[i] as HongheiData;
			card.Init(_cards.GetVal());
			card.index = i;
			card.sortScore = i;
			if (fanpai) {
				card.fanpai1();
			}
		}

		sort() {
			let cards = this._cards; //牌堆
			for (let index = 0; index < HongheiMgr.CARDS_NUM; index++) {//循环两手牌
				for (let i = 0; i < HongheiMgr.MAX_CARD_COUNT; i++) {//循环三张牌
					let card = cards[index * HongheiMgr.MAX_CARD_COUNT + i] as HongheiData;
					if (card) {
						card.myOwner(index);
						card.index = i;
						card.sortScore = -i;
						card.scaleX = -1;
					}
				}
			}
		}

		//发牌
		fapai() {
			let count = 0;
			let counter = 0;
			for (let j: number = 0; j < HongheiMgr.MAX_CARD_COUNT; j++) {
				for (let i: number = 0; i < this._cards.length / HongheiMgr.MAX_CARD_COUNT; i++) {
					Laya.timer.once(160 * count, this, () => {
						this._game.playSound(PathGameTongyong.music_tongyong + "fapai.mp3", false);
						let card = this._cards[i * HongheiMgr.MAX_CARD_COUNT + j];
						if (!card) return;
						card.fapai();
						counter++;
						if (counter >= this._cards.length) {
							this.event(HongheiMgr.DEAL_OVER);
						}
					});
					count++;
				}
			}
		}


		//重连发牌
		refapai() {
			for (let i: number = 0; i < this._cards.length; i++) {
				let card = this._cards[i];
				if (!card) return;
				card.refapai();
			}
		}

		//翻牌
		fanpai() {
			let count = 1;
			for (let j: number = 0; j < HongheiMgr.CARDS_NUM; j++) {
				for (let i: number = 0; i < this._cards.length / HongheiMgr.CARDS_NUM; i++) {
					Laya.timer.once(500 * count, this, () => {
						let card = this._cards[i * HongheiMgr.CARDS_NUM + j];
						if (!card) return;
						card.fanpai();
					});
					count++;
				}
			}
		}

		//翻牌（断线重连）
		refanpai() {
			for (let i: number = 0; i < this._cards.length; i++) {
				let card = this._cards[i];
				if (!card) return;
				card.fanpai();
			}
		}

		//隐藏第三张
		hidecard(index: number) {
			let card = this._cards[3 * (index - 1) + 2];
			if (!card) return;
			card.hidecard();
		}

		//显示第三张
		showcard(index: number) {
			let card = this._cards[3 * (index - 1) + 2];
			if (!card) return;
			card.showcard();
		}
	}
}