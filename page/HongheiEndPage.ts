/**
* 红黑大战停止下注界面
*/
module gamehonghei.page{
	export class HongheiEndPage extends game.gui.base.Page {
		private _viewUI: ui.ajqp.game_ui.honghei.StopUI;
		
		constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
			super(v, onOpenFunc, onCloseFunc);
			this._asset = [
				Path_game_honghei.atlas_game_ui + "honghei.atlas",
			];
		}

		// 页面初始化函数
		protected init(): void {
			this._viewUI = this.createView('game_ui.honghei.StopUI');
			this.addChild(this._viewUI);
		}

		// 页面打开时执行函数
		protected onOpen(): void {
			super.onOpen();
			this._viewUI.ani1.on(LEvent.COMPLETE, this, this.onPlayComplte);
			this._viewUI.ani1.play(0, false);
		}
	
        private onPlayComplte(): void {
            this.close();
        }

		public close(): void {
			if (this._viewUI) {
				this._viewUI.ani1.off(LEvent.COMPLETE, this, this.onPlayComplte);
			}
			super.close();
		}
	}
}