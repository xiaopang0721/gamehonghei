/**
* 红黑大战筹码信息
*/
module gamehonghei.data {
	export class HongheiChip extends gamecomponent.object.PlayingChip {
		constructor() {
			super();
		}
		//筹码起始位置(主玩家，其他玩家，红赢位置，座位0，座位1，座位2，座位3，座位4，座位5,黑赢位置)  
		private _chipStart = [[200, 620], [67, 661], [165, 75], [85, 200], [85, 365], [85, 530], [1225, 200], [1225, 365], [1225, 530], [1115, 75]];
		//筹码终点位置
		private _chipEnd = [[265, 335], [1015, 335], [635, 310]];
		private _startIndex: number;
		private _targetIndex: number;
		public _seatIndex: number;//精灵座位归属
		private _radiusX: number;//圆形区域X半径
		private _radiusY: number;//圆形区域Y半径
		//初始位置，终点位置，筹码类型，筹码大小，筹码层级
		setData(startIdx: number, targetIdx: number, type: number, value: number, index: number, unitIndex: number) {
			this.size = 0.4;
			this.sortScore = 999 - index;
			this.pos = new Vector2(this._chipStart[startIdx][0], this._chipStart[startIdx][1]);
			this._val = value.toString();
			this._type = type;
			this._startIndex = startIdx;
			this._targetIndex = targetIdx - 1;
			// this.rotateAngle = MathU.randomRange(0, 360);
			this._seatIndex = unitIndex;
			this._radiusX = targetIdx <= 2 ? 100 : 150;
			this._radiusY = targetIdx <= 2 ? 95 : 90;
		}

		sendChip() {
			let posX = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusX).x;
			let posY = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusY).y;
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.targe_pos.x = posX;
			this.targe_pos.y = posY;
			super.sendChip();
		}

		drawChip() {
			let posX = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusX).x;
			let posY = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusY).y;
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.pos.x = posX;
			this.pos.y = posY;
			this.targe_pos.x = posX;
			this.targe_pos.y = posY;
		}

		flyChip(index: number, isBanker: boolean, count: number, game: Game) {
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.isFinalPos = false;
			let target = isBanker ? this._chipEnd : this._chipStart;
			this.targe_pos.x = target[index][0];
			this.targe_pos.y = target[index][1];
			if (!this.pos) return;
			super.flyChipBase(500 + count * 15,game);
		}
	}
}