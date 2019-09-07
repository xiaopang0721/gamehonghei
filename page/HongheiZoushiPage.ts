/**
* 红黑大战走势界面 
*/
module gamehonghei.page {
    export class HongheiZoushiPage extends game.gui.base.Page {
        private _viewUI: ui.game_ui.honghei.HongHeiZouShiTuUI;
        private _hongheiMapInfo: HongheiMapInfo;
        private _gridEditor: GridEditor;

        constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
            super(v, onOpenFunc, onCloseFunc);
            this._isNeedBlack = true;
            this._isClickBlack = true;
            this._isNeedDuang = false;
            this._asset = [
                Path_game_honghei.atlas_game_ui + "honghei.atlas",
                PathGameTongyong.atlas_game_ui_tongyong+ "general.atlas",
            ];
        }

        // 页面初始化函数
        protected init(): void {
            this._viewUI = this.createView('game_ui.honghei.HongHeiZouShiTuUI');
            this.addChild(this._viewUI);
            
            let textureTypes = {
                "R": PathGameTongyong.ui_tongyong_general + "tu_yq2.png",//红
                "B": PathGameTongyong.ui_tongyong_general + "tu_yq1.png",//黑
            }
            this._gridEditor = new GridEditor(31.93, 31.7, 20, 6, textureTypes, false)
            this._gridEditor.x = 63;
            this._gridEditor.y = 103;
            this._viewUI.list_game_result.parent.addChild(this._gridEditor);
        }

        private renderHandler1(cell: MapRecordRender1, index: number) {
            if (cell) {
                cell.setData(this._game, cell.dataSource);
            }
        }

        private renderHandler2(cell: MapRecordRender2, index: number) {
            if (cell) {
                cell.setData(this._game, cell.dataSource);
            }
        }

        // 页面打开时执行函数
        protected onOpen(): void {
            super.onOpen();
            this._viewUI.list_game_result.itemRender = this.createChildren("game_ui.honghei.component.HongHeiHongDianUI", MapRecordRender1);
            this._viewUI.list_game_result.renderHandler = new Handler(this, this.renderHandler1);
            this._viewUI.list_card_type.itemRender = this.createChildren("game_ui.honghei.component.DuiZiUI", MapRecordRender2);
            this._viewUI.list_card_type.renderHandler = new Handler(this, this.renderHandler2);

            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);//游戏记录更新
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_CARD_RECORD, this, this.onUpdateCardRecord);//牌型更新
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_ROAD_RECORD, this, this.onUpdateRoadRecord);//大路游戏更新
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_ROAD_POS, this, this.onUpdateRoadRecord);//大路坐标更新
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);//大路坐标更新

            this.onUpdateMapInfo();
            this.onUpdateRecord();
            this.onUpdateCardRecord();
            this.onUpdateRoadRecord();
        }

        private onUpdateMapInfo() {
            this._hongheiMapInfo = this._game.sceneObjectMgr.mapInfo as HongheiMapInfo;
            if (this._hongheiMapInfo) {
                this.onUpdateRecord();
                this.onUpdateCardRecord();
                this.onUpdateRoadRecord();
            }
        }

        public close(): void {
            this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);//游戏记录更新
            this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_CARD_RECORD, this, this.onUpdateCardRecord);//牌型更新
            this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_ROAD_RECORD, this, this.onUpdateRoadRecord);//大路游戏更新
            this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_ROAD_POS, this, this.onUpdateRoadRecord);//大路坐标更新
            this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);//大路坐标更新
            super.close();
        }

        //胜负结果
        private onUpdateRecord(): void {
            if (!this._hongheiMapInfo) return;
            let recordArr = [];
            if (this._hongheiMapInfo.GetGameRecord() != "") {
                recordArr = JSON.parse(this._hongheiMapInfo.GetGameRecord());
            }
            this._viewUI.list_game_result.dataSource = recordArr;
            // this._viewUI.txt_total.text = StringU.substitute("近{0}局胜负",recordArr.length);
            let length = recordArr.length;
            let totalLenth = 20;
            //计算最近20场胜负
            let temp_hong = 0;
            let temp_hei = 0;
            for (let i = 0; i < length; i++) {
                if (recordArr[i] == 1) {
                    temp_hong += 1;
                } else {
                    temp_hei += 1;
                }
            }
            let hong_num = Math.round(temp_hong * 100 / totalLenth);
            let hei_num = Math.round(temp_hei * 100 / totalLenth);
            if (length >= totalLenth) {
                hei_num = 100 - hong_num;
            }
            this._viewUI.txt_hong.text = hong_num + "%";
            this._viewUI.txt_hei.text = hei_num + "%";
        }

        //牌型
        private onUpdateCardRecord(): void {
            if (!this._hongheiMapInfo) return;
            let recordArr = [];
            if (this._hongheiMapInfo.GetCardRecord() != "") {
                recordArr = JSON.parse(this._hongheiMapInfo.GetCardRecord());
            }
            this._viewUI.list_card_type.dataSource = recordArr;
        }

        //牌路
        private onUpdateRoadRecord(): void {
            if (!this._hongheiMapInfo) return;
            let recordArr = [];//大路游戏记录
            let posArr = [];//大路坐标记录
            if (this._hongheiMapInfo.GetRoadRecord() != "") {
                recordArr = JSON.parse(this._hongheiMapInfo.GetRoadRecord());
            }
            if (this._hongheiMapInfo.GetRoadPos() != "") {
                posArr = JSON.parse(this._hongheiMapInfo.GetRoadPos());
            }
            let arr = [];
            if (recordArr && recordArr.length && posArr && posArr.length) {
                for (let i = 0; i < recordArr.length; i++) {
                    arr.push(posArr[i][0]);
                    arr.push(posArr[i][1]);
                    arr.push(recordArr[i]);
                }
            }
            this._gridEditor.setData(arr)
        }
    }

    class MapRecordRender1 extends ui.game_ui.honghei.component.HongHeiHongDianUI {
        private _game: Game;
        private _data: any;
        constructor() {
            super();
        }
        setData(game: Game, data: any) {
            this._game = game;
            this._data = data;
            if (!this._data) {
                this.visible = false;
                return;
            }
            this.visible = true;
            this.img.skin = StringU.substitute(PathGameTongyong.ui_tongyong_general + "tu_hd{0}.png", this._data == 1 ? "0" : "1");
        }
        destroy() {
            super.destroy();
        }
    }

    class MapRecordRender2 extends ui.game_ui.honghei.component.DuiZiUI {
        private _game: Game;
        private _data: any;
        constructor() {
            super();
        }
        setData(game: Game, data: any) {
            this._game = game;
            this._data = data;
            if (!this._data) {
                this.visible = false;
                return;
            }
            this.visible = true;
            if (this._data == 1 || this._data == 7) {
                this.txt_cardType.text = "单张";
            }
            else if (this._data == 2 || this._data == 8) {
                this.txt_cardType.text = "对子";
            }
            else if (this._data == 3) {
                this.txt_cardType.text = "顺子";
            }
            else if (this._data == 4) {
                this.txt_cardType.text = "金花";
            }
            else if (this._data == 5) {
                this.txt_cardType.text = "顺金";
            }
            else if (this._data == 6) {
                this.txt_cardType.text = "豹子";
            }
            if (this._data == 1 || this._data == 2 || this._data == 7) {
                this.img.skin = PathGameTongyong.ui_tongyong_general + "tu_dzdt.png";
            }
            else {
                this.img.skin = PathGameTongyong.ui_tongyong_general + "tu_dzdt1.png";
            }
        }
        destroy() {
            super.destroy();
        }
    }
}