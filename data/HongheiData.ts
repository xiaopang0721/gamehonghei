/**
* 红黑大战牌信息
*/
module gamehonghei.data {
	export class HongheiData extends gamecomponent.object.PlayingPuKeCard {
		constructor() {
			super();
		}
		//前两张牌X轴位置，牌Y轴位置，牌间隔距离
		private _posList = [[165, 75, 85], [1115, 75, -85]];
		private _curIdx: number;

		myOwner(index: number) {
			this.size = 0.2;
			this.time_interval = 400;
			this._curIdx = index;
		}

		//发牌
		fapai() {
			let posX = this._posList[this._curIdx][0];
			let posY = this._posList[this._curIdx][1];
			let space = this._posList[this._curIdx][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.targe_pos.x = posX + this.index * space;
			this.targe_pos.y = posY;
			let size = 0.7;
			if(!this.pos) return;
			Laya.Tween.to(this.pos, { x: this.targe_pos.x, y: this.targe_pos.y }, this.time_interval);
			Laya.Tween.to(this, { size: size, rotateAngle: Math.PI * 4 }, this.time_interval);
		}

		//重连发牌
		refapai() {
			let posX = this._posList[this._curIdx][0];
			let posY = this._posList[this._curIdx][1];
			let space = this._posList[this._curIdx][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.targe_pos.x = posX + this.index * space;
			this.targe_pos.y = posY;
			this.size = 0.7;
			this.rotateAngle = Math.PI * 4;
			this.time_interval = 0;
			super.fapai();
		}

		hidecard() {
			this.visible = false;
		}

		showcard() {
			this.visible = true;
			this.rotateAngle = Math.PI * 4;
			this.scaleX = 1;
			this.isShow = true;
		}

		fanpai() {
			this.time_interval = 400;
			super.fanpai()
		}

		fanpai1() {
			this.time_interval = 0;
			super.fanpai()
		}
	}
}