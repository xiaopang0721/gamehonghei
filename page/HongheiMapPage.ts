/**
* 红黑大战地图
*/
module gamehonghei.page {
    import TextFieldU = utils.TextFieldU;
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
    const PLAYER_LEAST_MONEY = 50 // 投注最少携带金额
    const ALL_GAME_ROOM_CONFIG_ID = [101, 102, 103, 104];// 可进入的maplv
    //房间配置
    const MONEY_LIMIT_CONFIG = {
        "101": [5000, 2000, 5000],       //新手(上庄限制，入座限制，投注限额)
        "102": [20000, 5000, 8000],      //小资(上庄限制，入座限制，投注限额)
        "103": [50000, 10000, 25000],    //老板(上庄限制，入座限制，投注限额)
        "104": [100000, 20000, 50000],   //富豪(上庄限制，入座限制，投注限额)
    };
    //房间下注选择筹码
    const ROOM_CHIP_CONFIG = {
        "101": [1, 10, 50, 100, 1000],     //新手
        "102": [10, 50, 100, 500, 1000],   //小资
        "103": [50, 100, 500, 1000, 5000],  //老板
        "104": [100, 500, 1000, 5000, 10000],  //富豪
    };
    const ONLINE_NUM_RATE_CONFIG = {
        "101": 0.6,     //新手
        "102": 0.5,   //小资
        "103": 0.4,  //老板
        "104": 0.35,  //富豪
    };
    export class HongheiMapPage extends game.gui.base.Page {
        private _viewUI: ui.ajqp.game_ui.honghei.HongHeiUI;
        private _hongheiMgr: HongheiMgr;
        private _hongheiStory: HongheiStory;
        private _hongheiMapInfo: HongheiMapInfo;
        private _mainPlayerBenefit: number = 0;//玩家收益
        private _betMainTotal: number = 0;//玩家总下注
        private _lottery: string = "";//中奖区域
        private _areaList: Array<any> = [];//下注区域UI集合
        private _areaKuangUIList: Array<any> = [];//下注区域边框集合
        private _txtTotalUIList: Array<any> = [];//总下注文本UI集合
        private _txtBetUIList: Array<any> = [];//玩家下注文本UI集合
        private _seatUIList: Array<any> = [];//座位UI集合
        private _chipUIList: Array<ui.ajqp.game_ui.tongyong.effect.Effect_cmUI> = [];//筹码UI集合
        private _chipArr: Array<number> = [];//筹码大小类型
        private _cardsArr: Array<any> = [];//开牌信息集合
        private _clipList: Array<HongheiClip> = [];//飘字集合
        private _imgdiList: Array<LImage> = [];//飘字集合
        private _seatlimit: number;//入座金币
        private _betlimit: number;//投注限额
        private _curStatus: number;//当前地图状态
        private _countDown: number;//倒计时时间戳
        private _curChip: number;//当前选择筹码
        private _curChipY: number;//当前选择筹码y轴位置
        private _btnRepeatY: number;//重复下注位置
        private _chipSortScore: number = 0;//筹码层级
        private _unitSeated: Array<any> = [];//入座精灵信息集合
        private _chipTotalList: Array<any> = [[], [], []];//区域绘制筹码集合
        private _betTotalList: Array<any> = [0, 0, 0];//区域下注总额集合（所有玩家）
        private _betMainList: Array<any> = [0, 0, 0];//区域下注总额集合（主玩家）
        private _rebetList: Array<number> = [0, 0, 0];//重复下注列表(3个区域)
        private _mainHeadPos: any = [[0, 0], [0, -10]];//主玩家座位头像初始位置
        private _headStartPos: any = [[0, 0], [0, 158], [0, 316], [0, 0], [0, 158], [0, 316]];//座位头像初始位置
        private _headEndPos: any = [[10, 0], [10, 158], [10, 316], [-10, 0], [-10, 158], [-10, 316]];//座位头像移动位置
        private _htmlText: laya.html.dom.HTMLDivElement;
        private _htmlTextArr: Array<laya.html.dom.HTMLDivElement>;
        private _resultArry: Array<number> = [];
        private _onlineNumRate: number = 1;//在线人数比例

        constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
            super(v, onOpenFunc, onCloseFunc);
            this._isNeedDuang = false;
            this._delta = 1000;
            this._asset = [
                Path_game_honghei.atlas_game_ui + "honghei.atlas",
                Path_game_honghei.atlas_game_ui_honghei_effect + "kaipai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "qifu.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "chongzhi.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "nyl.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "yq.atlas",
                PathGameTongyong.atlas_game_ui_tongyong_general + "anniu.atlas",
                PathGameTongyong.atlas_game_ui_tongyong_general_effect + "fapai_1.atlas",
                PathGameTongyong.atlas_game_ui_tongyong_general_effect + "xipai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong_general_effect + "kaipai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong_general_effect + "ksyx.atlas",
                PathGameTongyong.atlas_game_ui_tongyong_general_effect + "ksxz.atlas",
            ];
        }

        // 页面初始化函数
        protected init(): void {
            this._viewUI = this.createView('game_ui.honghei.HongHeiUI');
            this.addChild(this._viewUI);
            this.initView();
            if (!this._pageHandle) {
                this._pageHandle = PageHandle.Get("HongheiMapPage");//额外界面控制器
            }
            this._hongheiStory = this._game.sceneObjectMgr.story as HongheiStory;
            if (this._hongheiStory) {
                this._hongheiMgr = this._hongheiStory.hongheiMgr;
                if (this._hongheiMgr) {
                    this._hongheiMgr.on(HongheiMgr.DEAL_OVER, this, this.onUpdateAniDeal);
                    this._hongheiMgr.on(HongheiMgr.OPEN_OVER, this, this.onOpenCardOver);
                    this._hongheiMgr.on(HongheiMgr.OPEN_OVER1, this, this.onOpenCardOver1);
                }
                this.onUpdateMapInfo();
            }
            this._viewUI.mouseThrough = true;
            this._game.playMusic(Path_game_honghei.music_honghei + "honghei_bgm.mp3");
        }

        // 页面打开时执行函数
        protected onOpen(): void {
            super.onOpen();
            //api充值不显示
            this._viewUI.btn_chongzhi.visible = !WebConfig.enterGameLocked;

            this._viewUI.btn_spread.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_back.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_rule.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_set.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_zhanji.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_repeat.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_qifu.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_road.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_chongzhi.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_playerList.on(LEvent.CLICK, this, this.onBtnClickWithTween);

            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUnitAdd);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_REMOVE_UNIT, this, this.onUnitRemove);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
            this._game.sceneObjectMgr.on(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);

            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateStatus);
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
            // this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_GAME_NO, this, this.onUpdateGameNo);//牌局号
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_COUNT_DOWN, this, this.onUpdateCountDown);//倒计时时间戳更新
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);//游戏记录更新
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_SEATED_LIST, this, this.onUpdateSeatedList);//入座列表更新
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_CARD_RECORD, this, this.onUpdateCardRecord);//牌型更新
            this._game.sceneObjectMgr.on(HongheiMapInfo.EVENT_STATUS_CHECK, this, this.initRoomConfig);//地图传送参数
            this._game.qifuMgr.on(QiFuMgr.QIFU_FLY, this, this.qifuFly);
            this._viewUI.hong_win.ani1.on(LEvent.COMPLETE, this, this.playAniOver);
            this._viewUI.hei_win.ani1.on(LEvent.COMPLETE, this, this.playAniOver);
            this.onUpdateUnitOffline();
            this.onUpdateCountDown();
            this.onUpdateSeatedList();
        }

        protected layout(): void {
            super.layout();
            if (this._viewUI) {
                //全面屏
                if (this._game.isFullScreen) {
                    this._viewUI.box_top_left.left = 14 + 56;
                    this._viewUI.box_room_left.left = 115 + 56;
                    this._viewUI.box_top_right.right = 28 + 56;
                    this._viewUI.box_bottom_right.right = 12 + 56;
                } else {
                    this._viewUI.box_top_left.left = 14;
                    this._viewUI.box_room_left.left = 115;
                    this._viewUI.box_top_right.right = 28;
                    this._viewUI.box_bottom_right.right = 12;
                }
            }
        }

        private _curDiffTime: number;
        update(diff: number) {
            super.update(diff);
            if (!this._curDiffTime || this._curDiffTime < 0) {
                this._viewUI.btn_chongzhi.ani1.play(0, false);
                this._curDiffTime = TongyongPageDef.CZ_PLAY_DIFF_TIME;
            } else {
                this._curDiffTime -= diff;
            }
        }

        //帧间隔心跳
        deltaUpdate() {
            let bool = this._curStatus == MAP_STATUS.PLAY_STATUS_BET || this._curStatus == MAP_STATUS.PLAY_STATUS_SETTLE;
            if (!bool) {
                this._viewUI.box_time.visible = false;
                return;
            }
            if (!this._hongheiMapInfo) return;
            let curTime = this._game.sync.serverTimeBys;
            let time = Math.floor(this._countDown - curTime);
            this._viewUI.box_time.visible = time > 0;
            this._viewUI.box_time.txt_time.text = time.toString();
            this._viewUI.box_time.ani1.gotoAndStop(24);
            if (this._curStatus == MAP_STATUS.PLAY_STATUS_BET) {
                if (time <= 3 && !this._viewUI.box_time.ani1.isPlaying) {
                    this._viewUI.box_time.ani1.play(1, true);
                }
                if (time > 3) {
                    this._viewUI.box_time.ani1.gotoAndStop(24);
                }
                if (time == 1) {
                    this._game.playSound(PathGameTongyong.music_tongyong + "time2.mp3", false);
                } else if (time == 2 || time == 3) {
                    this._game.playSound(PathGameTongyong.music_tongyong + "time1.mp3", false);
                }
            }
        }

        //玩家进来了
        private onUnitAdd(u: Unit) {
            this.onUpdateUnit();
        }

        //玩家出去了
        private onUnitRemove(u: Unit) {
            this.onUpdateUnit();
        }

        private onUpdateAniDeal(): void {
            this._viewUI.paixieRight.ani2.gotoAndStop(0);
        }

        private onSeeCardOver(index: number): void {
            if (index == 1) {
                this._viewUI.kaipaiHong.ani_kaipai.stop();
                this._viewUI.kaipaiHong.visible = false;
                this._hongheiMgr.showcard(index);
                let url = Path_game_honghei.ui_honghei + "brnntype_normal_{0}.png";
                this._viewUI.box_hei.visible = true;
                let cardType = this._resultArry[3] == 6 ? 0 : this._resultArry[3]
                this._viewUI.img_card1Type.skin = StringU.substitute(url, cardType);
                this._game.playSound(StringU.substitute(Path_game_honghei.music_honghei + "type{0}.mp3", cardType), false);
            } else {
                this._viewUI.kaipaiHei.ani_kaipai.stop();
                this._viewUI.kaipaiHei.visible = false;
                this._hongheiMgr.showcard(index);
                let url = Path_game_honghei.ui_honghei + "brnntype_normal_{0}.png";
                this._viewUI.box_hong.visible = true;
                let cardType = this._resultArry[4] == 6 ? 0 : this._resultArry[4]
                this._viewUI.img_card2Type.skin = StringU.substitute(url, cardType);
                this._game.playSound(StringU.substitute(Path_game_honghei.music_honghei + "type{0}.mp3", cardType), false);
            }
        }

        private onUpdateMapInfo(): void {
            let mapinfo = this._game.sceneObjectMgr.mapInfo;
            this._hongheiMapInfo = mapinfo as HongheiMapInfo;
            if (mapinfo) {
                this.initRoomConfig();
                this.onUpdateBattle();
                this.onUpdateRecord();
                this.onUpdateCardRecord();
                this.onUpdateStatus();
                this.updateOnline();
                this.onUpdateChipGrey();
                if (!this._hongheiMgr.isReconnect) {
                    this._viewUI.paixieRight.ani2.gotoAndStop(0);
                }
            }
        }

        private onUpdateUnitOffline() {
            let mainPlayer = this._game.sceneObjectMgr.mainPlayer;
            if (!mainPlayer) return;
            let mainPlayerInfo = mainPlayer.playerInfo;
            this._viewUI.main_player.txt_name.text = getMainPlayerName(mainPlayerInfo.nickname);
            this._viewUI.main_player.img_icon.skin = TongyongUtil.getHeadUrl(mainPlayer.playerInfo.headimg, 2);
            let money = EnumToString.getPointBackNum(mainPlayerInfo.money, 2);
            this._viewUI.main_player.txt_money.text = money.toString();
            this._viewUI.main_player.img_qifu.visible = TongyongUtil.getIsHaveQiFu(mainPlayer, this._game.sync.serverTimeBys);
            this._viewUI.main_player.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(mainPlayer.playerInfo.headKuang);
            this._viewUI.main_player.img_vip.skin = TongyongUtil.getVipUrl(mainPlayer.playerInfo.headKuang);
            this._viewUI.main_player.img_vip.visible = mainPlayer.playerInfo.vip_level > 0;
            this._viewUI.main_player.img_vip.skin = TongyongUtil.getVipUrl(mainPlayer.playerInfo.vip_level);
        }

        private onUpdateUnit(qifu_index?: number) {
            if (!this._hongheiMapInfo) return;
            let battleInfoMgr = this._hongheiMapInfo.battleInfoMgr;
            //主玩家的座位
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                let headImg = mainUnit.GetHeadImg();
                this._viewUI.main_player.txt_name.text = getMainPlayerName(mainUnit.GetName());
                if (this._curStatus != MAP_STATUS.PLAY_STATUS_SETTLE) {
                    this._viewUI.main_player.txt_money.text = EnumToString.getPointBackNum(TongyongUtil.getMoneyChange(mainUnit.GetMoney()), 2).toString();
                }
                let mainIdx = mainUnit.GetIndex();
                this._viewUI.main_player.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(mainUnit.GetHeadKuangImg());
                this._viewUI.main_player.img_vip.visible = mainUnit.GetVipLevel() > 0;
                this._viewUI.main_player.img_vip.skin = TongyongUtil.getVipUrl(mainUnit.GetVipLevel());
                //祈福成功 头像上就有动画
                if (qifu_index && mainIdx == qifu_index) {
                    this._viewUI.main_player.qifu_type.visible = true;
                    this._viewUI.main_player.qifu_type.skin = this._qifuTypeImgUrl;
                    this.playTween(this._viewUI.main_player.qifu_type, qifu_index);
                }
                //祈福成功 头像上就有动画
                if (qifu_index && mainIdx == qifu_index) {
                    this._viewUI.main_player.qifu_type.visible = true;
                    this._viewUI.main_player.qifu_type.skin = this._qifuTypeImgUrl;
                    //时间戳变化 才加上祈福标志
                    this.playTween(this._viewUI.main_player.qifu_type, qifu_index);
                    Laya.timer.once(2500, this, () => {
                        this._viewUI.main_player.img_qifu.visible = true;
                        this._viewUI.main_player.img_icon.skin = TongyongUtil.getHeadUrl(mainUnit.GetHeadImg(), 2);
                    })
                }
                else {
                    this._viewUI.main_player.img_qifu.visible = TongyongUtil.getIsHaveQiFu(mainUnit, this._game.sync.serverTimeBys);
                    this._viewUI.main_player.img_icon.skin = TongyongUtil.getHeadUrl(mainUnit.GetHeadImg(), 2);
                }
                //根据精灵身上的金币变化来调整筹码
                this.onUpdateChipGrey();
            }
            this.onUpdateSeatedList(qifu_index);
        }

        private onUpdateSeatedList(qifu_index?: number): void {
            if (!this._hongheiMapInfo) return;
            let seatedList = this._hongheiMapInfo.GetSeatedList();
            if (seatedList != "") {
                this._unitSeated = JSON.parse(seatedList);
            }
            if (!this._unitSeated.length) {
                return;
            }
            for (let i = 0; i < this._seatUIList.length; i++) {
                let unitIndex = this._unitSeated[i][0];
                let unit = this._game.sceneObjectMgr.getUnitByIdx(unitIndex);
                let seat = this._seatUIList[i];
                if (unit) {
                    seat.txt_name.text = getMainPlayerName(unit.GetName());
                    seat.txt_name.fontSize = 15;
                    if (this._curStatus != MAP_STATUS.PLAY_STATUS_SETTLE) {
                        seat.txt_money.text = EnumToString.getPointBackNum(TongyongUtil.getMoneyChange(unit.GetMoney()), 2).toString();
                    }
                    seat.img_txk.skin = TongyongUtil.getTouXiangKuangUrl(unit.GetHeadKuangImg());
                    seat.img_txk.visible = true;
                    seat.img_vip.visible = unit.GetVipLevel() > 0;
                    seat.img_vip.skin = TongyongUtil.getVipUrl(unit.GetVipLevel());
                    seat.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg(), 2);
                    //祈福成功 头像上就有动画
                    if (qifu_index && unitIndex == qifu_index) {
                        seat.qifu_type.visible = true;
                        seat.qifu_type.skin = this._qifuTypeImgUrl;
                        this.playTween1(seat.qifu_type, qifu_index);
                    }
                    //时间戳变化 才加上祈福标志
                    if (TongyongUtil.getIsHaveQiFu(unit, this._game.sync.serverTimeBys)) {
                        if (qifu_index && unitIndex == qifu_index) {
                            Laya.timer.once(2500, this, () => {
                                seat.img_qifu.visible = true;
                                seat.img_icon.skin = TongyongUtil.getHeadUrl(unit.GetHeadImg(), 2);
                            })
                        }
                    } else {
                        seat.img_qifu.visible = false;
                    }
                } else {
                    seat.txt_name.text = "";
                    seat.txt_money.text = "点击入座";
                    seat.img_icon.skin = PathGameTongyong.ui_tongyong_general + "tu_weizi.png";
                    seat.img_txk.visible = false;
                    seat.img_qifu.visible = false;
                    seat.qifu_type.visible = false;
                    seat.img_vip.visible = false;
                }
            }
        }

        private onUpdateSettleMoney(): void {
            if (!this._hongheiMapInfo) return;
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                let money = EnumToString.getPointBackNum(TongyongUtil.getMoneyChange(mainUnit.GetMoney()), 2);
                this._viewUI.main_player.txt_money.text = money.toString();
            }
            let seatedList = this._hongheiMapInfo.GetSeatedList();
            if (seatedList != "") {
                this._unitSeated = JSON.parse(seatedList);
            }
            if (!this._unitSeated.length) {
                return;
            }
            for (let i = 0; i < this._seatUIList.length; i++) {
                let unitIndex = this._unitSeated[i][0];
                let unit = this._game.sceneObjectMgr.getUnitByIdx(unitIndex);
                let seat = this._seatUIList[i];
                if (unit) {
                    seat.txt_money.text = EnumToString.getPointBackNum(TongyongUtil.getMoneyChange(unit.GetMoney()), 2).toString();
                }
            }
        }

        private _diff: number = 500;
        private _timeList: { [key: number]: number } = {};
        private _firstList: { [key: number]: number } = {};
        private playTween(img: LImage, index, isTween?: boolean) {
            if (!img) return;
            if (!this._timeList[index]) {
                this._timeList[index] = 0;
            }
            if (this._timeList[index] >= 2500) {
                this._timeList[index] = 0;
                this._firstList[index] = 0;
                img.visible = false;
                return;
            }
            Laya.Tween.to(img, { alpha: isTween ? 1 : 0.2 }, this._diff, Laya.Ease.linearNone, Handler.create(this, this.playTween, [img, index, !isTween]), this._firstList[index] ? this._diff : 0);
            this._timeList[index] += this._diff;
            this._firstList[index] = 1;
        }
        private _timeList1: { [key: number]: number } = {};
        private _firstList1: { [key: number]: number } = {};
        private playTween1(img: LImage, index, isTween?: boolean) {
            if (!img) return;
            if (!this._timeList1[index]) {
                this._timeList1[index] = 0;
            }
            if (this._timeList1[index] >= 2500) {
                this._timeList1[index] = 0;
                this._firstList1[index] = 0;
                img.visible = false;
                return;
            }
            Laya.Tween.to(img, { alpha: isTween ? 1 : 0.2 }, this._diff, Laya.Ease.linearNone, Handler.create(this, this.playTween1, [img, index, !isTween]), this._firstList1[index] ? this._diff : 0);
            this._timeList1[index] += this._diff;
            this._firstList1[index] = 1;
        }

        private _qifuTypeImgUrl: string;
        private qifuFly(dataSource: any): void {
            if (!dataSource) return;
            let dataInfo = dataSource;
            if (!this._game.sceneObjectMgr || !this._game.sceneObjectMgr.mainUnit || this._game.sceneObjectMgr.mainUnit.GetIndex() != dataSource.qifu_index) return;
            this._game.qifuMgr.showFlayAni(this._viewUI.main_player, this._viewUI, dataSource, (dataInfo) => {
                //相对应的玩家精灵做出反应
                this._qifuTypeImgUrl = TongyongUtil.getQFTypeImg(dataInfo.qf_id);
                this.onUpdateUnit(dataInfo.qifu_index);
            });
        }

        //更新在线人数
        private updateOnline() {
            let unitNum = 0;
            for (let key in this._game.sceneObjectMgr.unitDic) {
                if (this._game.sceneObjectMgr.unitDic.hasOwnProperty(key)) {
                    let unit = this._game.sceneObjectMgr.unitDic[key];
                    if (unit) {
                        unitNum++;
                    }
                }
            }
            let onlineNum = Math.floor(this._game.datingGame.OnlineNumMgr.getOnlineNum(this._hongheiMapInfo.GetMapID()) * this._onlineNumRate);
            let innerHtml = StringU.substitute("在线<span style='color:#18ff00'>{0}</span>人", unitNum + onlineNum);
            this._htmlText.innerHTML = innerHtml;
        }

        private updateMoney(): void {
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (mainUnit) {
                let money = EnumToString.getPointBackNum(TongyongUtil.getMoneyChange(mainUnit.GetMoney()), 2);
                this._viewUI.main_player.txt_money.text = money.toString();
            }
        }

        private playAniOver(): void {
            this._viewUI.hong_win.visible = false;
            this._viewUI.hong_win.ani1.stop();
            this._viewUI.hei_win.visible = false;
            this._viewUI.hei_win.ani1.stop();
        }

        //战斗结构体更新
        private _battleIndex: number = -1;
        private onUpdateBattle() {
            if (!this._hongheiMapInfo) return;
            let battleInfoMgr = this._hongheiMapInfo.battleInfoMgr;
            if (!battleInfoMgr) return;
            for (let i = 0; i < battleInfoMgr.info.length; i++) {
                let info = battleInfoMgr.info[i];
                if (info instanceof gamecomponent.object.BattleInfoDeal) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this._cardsArr = this._cardsArr.concat(info);
                    }
                }
                if (info instanceof gamecomponent.object.BattleInfoAreaBet) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattleBet(info, i);
                    }
                }
                if (info instanceof gamecomponent.object.BattleInfoSettle) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this.onBattleSettle(info);
                    }
                }
                if (info instanceof gamecomponent.object.BattleLogCardsResult) {
                    if (this._battleIndex < i) {
                        this._battleIndex = i;
                        this._resultArry = info.Results;
                        this.onBattleResult(info);
                    }
                }
            }
        }

        //战斗日志来更新桌面上的筹码
        private onBattleBet(info: any, index: number): void {
            //主玩家的座位
            if (!this._game.sceneObjectMgr.mainUnit) return;
            let mainIdx = this._game.sceneObjectMgr.mainUnit.GetIndex();
            let startIdx: number;
            let targetIdx: number;
            let isMainPlayer: boolean = info.SeatIndex == mainIdx;
            if (isMainPlayer) {//主玩家
                startIdx = 0;
            } else {//其他玩家
                startIdx = 1;
                for (let i = 0; i < this._unitSeated.length; i++) {
                    let unitIndex = this._unitSeated[i][0];
                    let unit = this._game.sceneObjectMgr.getUnitByIdx(unitIndex);
                    if (unit && info.SeatIndex == unitIndex) {
                        this.moveHead(this._seatUIList[i], this._headStartPos[i][0], this._headStartPos[i][1], this._headEndPos[i][0], this._headEndPos[i][1]);
                        startIdx = 3 + i;
                    }
                }
            }
            targetIdx = info.BetIndex;
            let type = this._chipArr.indexOf(info.BetVal);
            this.createChip(startIdx, targetIdx, type, info.BetVal, index, info.SeatIndex);
            this.updateChipOnTable(targetIdx - 1, info.BetVal, isMainPlayer);
        }

        //头像出筹码动态效果
        private moveHead(view, startX, startY, endX, endY): void {
            Laya.Tween.clearAll(view);
            Laya.Tween.to(view, { x: endX, y: endY }, 50, null, Handler.create(this, () => {
                Laya.Tween.to(view, { x: startX, y: startY }, 50);
            }))
        }

        private updateChipOnTable(index: number, bet: number, isMainPlayer: boolean) {
            if (isMainPlayer) {
                this._betMainList[index] += bet;
                this._betMainTotal += bet;
            }
            this._betTotalList[index] += bet;

            this.updateBetNum();
        }

        private updateBetNum(): void {
            for (let i = 0; i < 3; i++) {
                this._htmlTextArr[i].innerHTML = StringU.substitute("<span style='color:#ffd200'>{0}</span><span style='color:#ffffff'>/{1}</span>", this._betMainList[i], this._betTotalList[i]);
            }
        }

        //创建筹码
        private createChip(startIdx: number, targetIdx: number, type: number, value: number, index: number, unitIndex: number) {
            let chip = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CHIP_MARK, HongheiChip) as HongheiChip;
            chip.setData(startIdx, targetIdx, type, value, index, unitIndex);
            chip.visible = false;
            this._chipTotalList[targetIdx - 1].push(chip);
            if (this._hongheiMgr.isReconnect && this._curStatus != MAP_STATUS.PLAY_STATUS_BET) {
                chip.visible = true;
                chip.drawChip();
            }
            else {
                chip.visible = true;
                chip.sendChip();
                this._game.playSound(Path_game_honghei.music_honghei + "chouma.mp3", false);
            }
            this._chipSortScore = index;//存下来最后一个筹码层级
        }

        //庄家飞筹码去输的区域
        private bankerFlyChip(startIdx: number, targetIdx: number, type: number, value: number, index: number, unitIndex: number) {
            let chip = this._game.sceneObjectMgr.createOfflineObject(SceneRoot.CHIP_MARK, HongheiChip) as HongheiChip;
            chip.setData(startIdx, targetIdx, type, value, index, unitIndex);
            this._chipTotalList[targetIdx - 1].push(chip);
            chip.sendChip();
        }

        private _clipResult: any[] = [];
        private onBattleSettle(info: any): void {
            if (!this._game.sceneObjectMgr.mainUnit) return;
            if (this._game.sceneObjectMgr.mainUnit.GetIndex() == info.SeatIndex) {
                this._mainPlayerBenefit = parseFloat(info.SettleVal);
            }
            if (info.SettleVal == 0) return;
            this._clipResult.push([info.SeatIndex, info.SettleVal]);
        }

        private areaName: string[] = ["红", "黑", "幸运一击"];
        private onBattleResult(info: any): void {
            for (let i = 0; i < info.Results.length; i++) {
                if (i < this.areaName.length) {
                    //中奖区域
                    if (info.Results[i] != 0) {
                        if (!this._lottery) {
                            this._lottery = this.areaName[i];
                        } else {
                            this._lottery += " , " + this.areaName[i];
                        }
                    }
                }
            }
        }

        //结算飘筹码
        private flyChipEffect(): void {
            if (!this._resultArry.length) return
            let location = this._resultArry[0] != 0 ? 2 : 9;
            for (let i = 0; i < this._chipTotalList.length; i++) {
                let chipArr = [];
                chipArr = this._chipTotalList[i];
                //玩家输了
                if (this._resultArry[i] == 0) {
                    this._game.playSound(Path_game_honghei.music_honghei + "piaoqian.mp3", false);
                    for (let j = 0; j < chipArr.length; j++) {
                        let chip: HongheiChip = chipArr[j];
                        //庄家先收筹码
                        chip.flyChip(location, false, j, this._game);
                    }
                } else {
                    this._areaKuangUIList[i].visible = true;
                    Laya.timer.once(1100, this, () => {
                        this._game.playSound(Path_game_honghei.music_honghei + "piaoqian.mp3", false);
                        for (let j = 0; j < 20; j++) {
                            let ranType = MathU.randomRange(0, 4);
                            let ranVal = this._chipArr[ranType];
                            this._chipSortScore++;
                            this.bankerFlyChip(location, i + 1, ranType, ranVal, this._chipSortScore, -1);
                        }
                    })
                    Laya.timer.once(2100, this, () => {
                        this._game.playSound(Path_game_honghei.music_honghei + "piaoqian.mp3", false);
                        for (let j = 0; j < chipArr.length; j++) {
                            let chip: HongheiChip = chipArr[j];
                            let mainIndex = this._game.sceneObjectMgr.mainUnit.GetIndex();
                            if (chip._seatIndex == mainIndex) {
                                chip.flyChip(0, false, j, this._game);//主玩家收筹码
                            } else {
                                let isSeat: boolean = false;
                                for (let k = 0; k < this._unitSeated.length; k++) {
                                    let seatInfo = this._unitSeated[k];
                                    if (seatInfo && seatInfo[0] == chip._seatIndex) {
                                        chip.flyChip(3 + k, false, j, this._game);//入座玩家收筹码
                                        isSeat = true;
                                        break;
                                    }
                                }
                                if (!isSeat) {
                                    chip.flyChip(1, false, j, this._game);//其他玩家收筹码
                                }
                            }
                        }
                    })
                }
            }
        }

        //显示结算界面
        private showSettleInfo(): void {
            if (!this._resultArry.length) return
            let myBenefit = 0;
            if (this._mainPlayerBenefit) {
                myBenefit = this._mainPlayerBenefit;
            }
            this._pageHandle.pushOpen({
                id: TongyongPageDef.PAGE_TONGYONG_SETTLE,
                dataSource: { myBet: this._betMainTotal, myBenefit: this._mainPlayerBenefit, lottery: this._lottery },
                parent: this._game.uiRoot.HUD
            });
        }

        //开牌结束(开始播放搓牌动作)
        private onOpenCardOver() {
            for (let i = 0; i < this._cardsArr.length; i++) {
                Laya.timer.once(1800 * i, this, () => {
                    this.onBattleDeal(this._cardsArr[i]);
                });
            }
        }

        //开牌结束(不播放搓牌动作)
        private onOpenCardOver1() {
            if (!this._resultArry.length) return
            this._viewUI.kaipaiHong.ani_kaipai.stop();
            this._viewUI.kaipaiHong.visible = false;
            this._hongheiMgr.showcard(1);
            let url = Path_game_honghei.ui_honghei + "brnntype_normal_{0}.png";
            this._viewUI.box_hei.visible = true;
            this._viewUI.img_card1Type.skin = StringU.substitute(url, this._resultArry[3] == 6 ? 0 : this._resultArry[3]);
            this._viewUI.kaipaiHei.ani_kaipai.stop();
            this._viewUI.kaipaiHei.visible = false;
            this._hongheiMgr.showcard(2);
            this._viewUI.box_hong.visible = true;
            this._viewUI.img_card2Type.skin = StringU.substitute(url, this._resultArry[4] == 6 ? 0 : this._resultArry[4]);
        }

        private onBattleDeal(info: any): void {
            let cards = this._hongheiMgr.initCard(info.Cards)
            if (info.SeatIndex == 1) {
                this._viewUI.kaipaiHong.card.skin = StringU.substitute(PathGameTongyong.ui_tongyong_pai + "{0}.png", info.Cards[2]);
                this._viewUI.kaipaiHong.visible = true;
                this._viewUI.kaipaiHong.ani_kaipai.play(0, false);
            }
            else {
                this._viewUI.kaipaiHei.card.skin = StringU.substitute(PathGameTongyong.ui_tongyong_pai + "{0}.png", info.Cards[2]);
                this._viewUI.kaipaiHei.visible = true;
                this._viewUI.kaipaiHei.ani_kaipai.play(0, false);
            }
            this._hongheiMgr.hidecard(info.SeatIndex);
        }

        //金币变化 飘字clip
        public addMoneyClip(index: number, value: number): void {
            let clip_money = value >= 0 ? new HongheiClip(HongheiClip.ADD_MONEY_FONT) : new HongheiClip(HongheiClip.SUB_MONEY_FONT);
            let preSkin = value >= 0 ? PathGameTongyong.ui_tongyong_general + "tu_jia.png" : PathGameTongyong.ui_tongyong_general + "tu_jian.png";
            let img_di = value >= 0 ? new LImage(PathGameTongyong.ui_tongyong_general + "tu_yingqian.png") : new LImage(PathGameTongyong.ui_tongyong_general + "tu_shuqian.png");
            let playerIcon: any;
            if (index == this._game.sceneObjectMgr.mainUnit.GetIndex()) {
                playerIcon = this._viewUI.main_player;
            } else {
                let unit = this._game.sceneObjectMgr.getUnitByIdx(index);
                if (!unit) return;
                let seatIndex = unit.GetSeat();
                let bool = false;
                for (let i = 0; i < this._unitSeated.length; i++) {
                    let unitIndex = this._unitSeated[i][0];
                    if (index == unitIndex) {
                        bool = true;
                    }
                }
                if (!seatIndex) return;
                if (!bool) return;
                playerIcon = this._seatUIList[seatIndex - 1];
            }
            //飘字底
            img_di.centerX = playerIcon.img_di.centerX;
            img_di.centerY = playerIcon.img_di.centerY;
            playerIcon.img_di.parent.addChild(img_di);
            this._imgdiList.push(img_di);
            playerIcon.img_di.visible = false;
            //飘字
            clip_money.setText(Math.abs(value), true, false, preSkin);
            clip_money.centerX = playerIcon.clip_money.centerX - 4;
            clip_money.centerY = playerIcon.clip_money.centerY;
            playerIcon.clip_money.parent.addChild(clip_money);
            this._clipList.push(clip_money);
            playerIcon.clip_money.visible = false;
            //飘字box缓动
            playerIcon.box_clip.y = 57;
            playerIcon.box_clip.visible = true;
            Laya.Tween.clearAll(playerIcon.box_clip);
            Laya.Tween.to(playerIcon.box_clip, { y: playerIcon.box_clip.y - 55 }, 700);
            //赢钱动画
            playerIcon.effWin.visible = value > 0;
            value > 0 && playerIcon.effWin.ani1.play(0, false);
        }

        //清理飘字clip
        private clearClips(): void {
            if (this._clipList && this._clipList.length) {
                for (let i: number = 0; i < this._clipList.length; i++) {
                    let clip = this._clipList[i];
                    clip.removeSelf();
                    clip.destroy(true);
                    clip = null;
                }
            }
            this._clipList = [];

            if (this._imgdiList && this._imgdiList.length) {
                for (let j: number = 0; j < this._imgdiList.length; j++) {
                    let imgdi = this._imgdiList[j];
                    imgdi.removeSelf();
                    imgdi.destroy(true);
                    imgdi = null;
                }
            }
            this._imgdiList = [];
        }

        //更新地图状态
        private onUpdateStatus() {
            if (!this._hongheiMapInfo) return;
            let mapStatus = this._hongheiMapInfo.GetMapState();
            if (this._curStatus == mapStatus) return;
            this._curStatus = mapStatus;
            this._viewUI.paixieRight.cards.visible = this._curStatus > MAP_STATUS.PLAY_STATUS_WASH_CARD || this._curStatus == MAP_STATUS.PLAY_STATUS_STOP_BET;
            if (this._curStatus > MAP_STATUS.PLAY_STATUS_WASH_CARD) {
                this._viewUI.paixieRight.ani_chupai.gotoAndStop(12);
            }
            this.onChipDisabled(this._curStatus == MAP_STATUS.PLAY_STATUS_BET);
            this._viewUI.box_status.visible = false;
            switch (this._curStatus) {
                case MAP_STATUS.PLAY_STATUS_NONE:// 准备阶段
                    break;
                case MAP_STATUS.PLAY_STATUS_GAMESTART:// 游戏开始
                    this.updateOnline();
                    this._viewUI.txt_status.text = "";
                    this._viewUI.box_status.visible = true;
                    this._viewUI.clip_status.index = 0;
                    this.resetAll();
                    this._pageHandle.pushOpen({ id: HongheiPageDef.PAGE_HHDZ_START, parent: this._game.uiRoot.HUD });
                    break;
                case MAP_STATUS.PLAY_STATUS_WASH_CARD:// 洗牌
                    this.resetAll();
                    this._pageHandle.pushClose({ id: HongheiPageDef.PAGE_HHDZ_START, parent: this._game.uiRoot.HUD });
                    this._viewUI.txt_status.text = "";
                    this._viewUI.box_status.visible = true;
                    this._viewUI.clip_status.index = 2;
                    this._viewUI.xipai.x = 640;
                    this._viewUI.xipai.y = 310;
                    this._viewUI.xipai.scaleX = 1;
                    this._viewUI.xipai.scaleY = 1;
                    this._viewUI.xipai.alpha = 1;
                    this._viewUI.xipai.rotation = 0;
                    this._viewUI.xipai.visible = true;
                    this._viewUI.xipai.ani_xipai.play(0, false);
                    Laya.timer.once(800, this, () => {
                        Laya.Tween.to(this._viewUI.xipai, { x: 847, y: 186, alpha: 0, rotation: -30, scaleX: 0.35, scaleY: 0.35 }, 500);
                    })
                    Laya.timer.once(1300, this, () => {
                        this._viewUI.paixieRight.cards.visible = true;
                        this._viewUI.paixieRight.ani_chupai.play(0, false);
                    })
                    break;
                case MAP_STATUS.PLAY_STATUS_PUSH_CARD:// 发牌阶段
                    this._viewUI.txt_status.text = "";
                    this._viewUI.box_status.visible = true;
                    this._viewUI.clip_status.index = 4;
                    this._viewUI.paixieRight.ani2.play(0, true);
                    break;
                case MAP_STATUS.PLAY_STATUS_BET:// 下注阶段
                    if (Math.floor(this._hongheiMapInfo.GetCountDown() - this._game.sync.serverTimeBys) >= 14) {
                        this._pageHandle.pushOpen({ id: HongheiPageDef.PAGE_HHDZ_BEGIN, parent: this._game.uiRoot.HUD });
                        this._game.playSound(Path_game_honghei.music_honghei + "dingding_start.mp3");
                        this._game.playSound(Path_game_honghei.music_honghei + "xiazhu_start.mp3");
                    }
                    this.onUpdateSeatedList();
                    this._viewUI.txt_status.text = "";
                    this._viewUI.box_status.visible = true;
                    this._viewUI.clip_status.index = 3;
                    let bool = false;
                    for (let i = 0; i < this._rebetList.length; i++) {
                        if (this._rebetList[i] > 0) {
                            bool = true;
                            break;
                        }
                    }
                    this._viewUI.btn_repeat.disabled = !bool;

                    for (let i = 0; i < this._areaKuangUIList.length; i++) {
                        this._areaKuangUIList[i].visible = true;
                        this.kuangShanShuo(this._areaKuangUIList[i]);
                        Laya.timer.once(1000, this, () => {
                            this._areaKuangUIList[i].visible = false;
                            this._areaKuangUIList[i].alpha = 1;
                            Laya.Tween.clearAll(this._areaKuangUIList[i]);
                            Laya.timer.clearAll(this._areaKuangUIList[i]);
                        });
                    }
                    break;
                case MAP_STATUS.PLAY_STATUS_STOP_BET:// 停止下注
                    for (let i: number = 0; i < this._areaKuangUIList.length; i++) {
                        this._areaKuangUIList[i].visible = false;
                    }
                    this._pageHandle.pushClose({ id: HongheiPageDef.PAGE_HHDZ_BEGIN, parent: this._game.uiRoot.HUD });
                    this._pageHandle.pushOpen({ id: HongheiPageDef.PAGE_HHDZ_END, parent: this._game.uiRoot.HUD });
                    this._viewUI.txt_status.text = "";
                    this._game.playSound(Path_game_honghei.music_honghei + "dingding_end.mp3");
                    this._game.playSound(Path_game_honghei.music_honghei + "xiazhu_end.mp3");
                    break;
                case MAP_STATUS.PLAY_STATUS_SHOW_CARD:// 开牌阶段
                    this._pageHandle.pushClose({ id: HongheiPageDef.PAGE_HHDZ_END, parent: this._game.uiRoot.HUD });
                    this._viewUI.txt_status.text = "";
                    this._viewUI.box_status.visible = true;
                    this._viewUI.clip_status.index = 5;
                    let betAllTotal = 0;
                    for (let i = 0; i < this._betMainList.length; i++) {
                        betAllTotal += this._betMainList[i];
                    }
                    if (betAllTotal > 0) {
                        for (let i = 0; i < this._betMainList.length; i++) {
                            this._rebetList[i] = this._betMainList[i];
                        }
                    }
                    break;
                case MAP_STATUS.PLAY_STATUS_SETTLE:// 结算阶段
                    this.onUpdateSeatedList();
                    this._viewUI.txt_status.text = "";
                    this._viewUI.box_status.visible = true;
                    this._viewUI.clip_status.index = 6;
                    this.showMainReusult();
                    break;
                case MAP_STATUS.PLAY_STATUS_SETTLE_SHOW:// 结算结果展示
                    this.flyChipEffect();
                    Laya.timer.once(2800, this, () => {
                        this.onUpdateSettleMoney();
                        if (this._mainPlayerBenefit >= 0) {
                            let rand = MathU.randomRange(1, 3);
                            this._game.playSound(StringU.substitute(PathGameTongyong.music_tongyong + "win{0}.mp3", rand), true);
                        } else if (this._mainPlayerBenefit < 0) {
                            let rand = MathU.randomRange(1, 4);
                            this._game.playSound(StringU.substitute(PathGameTongyong.music_tongyong + "lose{0}.mp3", rand), true);
                        }
                        if (this._clipResult && this._clipResult.length > 0) {
                            for (let i = 0; i < this._clipResult.length; i++) {
                                let info = this._clipResult[i];
                                this.addMoneyClip(info[0], info[1]);
                            }
                        }
                    })
                    break;
                case MAP_STATUS.PLAY_STATUS_RELAX:// 休息阶段
                    this._pageHandle.pushClose({ id: TongyongPageDef.PAGE_TONGYONG_SETTLE, parent: this._game.uiRoot.HUD });
                    this._viewUI.clip_status.index = 1;
                    this.resetAll();

                    break;

            }

            this._pageHandle.updatePageHandle();//更新额外界面的开关状态
            this._pageHandle.reset();//清空额外界面存储数组
        }

        private showMainReusult(): void {
            if (this._resultArry[0] == 1) {
                this._game.playSound(Path_game_honghei.music_honghei + "win_red.mp3");
                this._viewUI.hong_win.visible = true;
                this._viewUI.hong_win.ani1.play(0, false);
            } else if (this._resultArry[1] == 1) {
                this._game.playSound(Path_game_honghei.music_honghei + "win_black.mp3");
                this._viewUI.hei_win.visible = true;
                this._viewUI.hei_win.ani1.play(0, false);
            }
        }

        //按钮缓动回调
        protected onBtnTweenEnd(e: any, target: any): void {
            switch (target) {
                case this._viewUI.btn_spread://菜单
                    this.menuTween(!this._viewUI.box_menu.visible);
                    break;
                case this._viewUI.btn_road://大路详情
                    this._game.uiRoot.general.open(HongheiPageDef.PAGE_HHDZ_ZOUSHI);
                    break;
                case this._viewUI.btn_qifu://祈福
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_QIFU);
                    break;
                case this._viewUI.btn_rule://规则
                    this._game.uiRoot.general.open(HongheiPageDef.PAGE_HHDZ_RULE);
                    break;
                case this._viewUI.btn_set://设置
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_SETTING)
                    break;
                case this._viewUI.btn_playerList://设置
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_PLAYER_LIST)
                    break;
                case this._viewUI.btn_zhanji://战绩
                    this._game.uiRoot.general.open(TongyongPageDef.PAGE_TONGYONG_RECORD, (page) => {
                        page.dataSource = HongheiPageDef.GAME_NAME;
                    });
                    break;
                case this._viewUI.btn_repeat://重复下注
                    this.repeatBet();
                    break;
                case this._viewUI.btn_back://返回
                    let totalBet = 0;
                    for (let i = 0; i < 3; i++) {
                        totalBet += this._betMainList[i];
                    }
                    if (totalBet && this._hongheiMapInfo && this._hongheiMapInfo.GetPlayState() == 1) {
                        this._game.showTips("游戏尚未结束，请先打完这局哦~");
                        return;
                    }
                    this._game.sceneObjectMgr.leaveStory(true);
                    break;
                case this._viewUI.btn_chongzhi://充值
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                    break
                default:
                    break;
            }
        }

        private kuangShanShuo(img) {
            img.alpha = 0;
            Laya.Tween.to(img, { alpha: 1 }, 333, null, Handler.create(this, () => {
                this.kuangShanShuo(img);
            }))
        }

        //重复下注
        private repeatBet(): void {
            if (this._betWait) return;//投注间隔
            let betArr = [];
            let total = 0;
            for (let i = 0; i < this._rebetList.length; i++) {
                if (this._rebetList[i] + this._betMainList[i] > this._betlimit) {
                    this._game.uiRoot.topUnder.showTips(StringU.substitute("投注点限红{0}哦~", this._betlimit));
                    return;
                }
            }
            for (let i = 0; i < this._rebetList.length; i++) {
                if (this._betMainList[0] > 0) {//红
                    if (this._rebetList[1] > 0) {
                        this._game.uiRoot.topUnder.showTips("老板，红黑不能同时下注哦~");
                        return;
                    }
                }
                if (this._betMainList[1] > 0) {//黑
                    if (this._rebetList[0] > 0) {
                        this._game.uiRoot.topUnder.showTips("老板，红黑不能同时下注哦~");
                        return;
                    }
                }
                total += this._rebetList[i];
            }
            if (total > TongyongUtil.getMoneyChange(this._game.sceneObjectMgr.mainUnit.GetMoney())) {
                this._game.uiRoot.topUnder.showTips("老板,您的金币不够重复下注啦~");
                return;
            }
            for (let i = 0; i < this._rebetList.length; i++) {
                let antes = this._rebetList[i]//之前区域i下注总额
                if (antes) {
                    //从最大筹码开始循环，优先丢出大额筹码，剩下零头再由小额筹码去拼凑
                    for (let j = this._chipArr.length - 1; j >= 0; j--) {
                        if (!antes) break;
                        let num = Math.floor(antes / this._chipArr[j]);
                        if (num) {
                            antes = antes - this._chipArr[j] * num;
                            for (let k = 0; k < num; k++) {
                                this._game.network.call_hhdazhan_bet(this._chipArr[j], i + 1);
                            }
                        }
                    }
                }
            }
            this.moveHead(this._viewUI.main_player, this._mainHeadPos[0][0], this._mainHeadPos[0][1], this._mainHeadPos[1][0], this._mainHeadPos[1][1]);
            this._betWait = true;
            Laya.timer.once(100, this, () => {
                this._betWait = false;
            })
        }

        private _betWait: boolean = false;
        private onAreaBetMouseOut(index: number, e: LEvent): void {
            if (this._curStatus == MAP_STATUS.PLAY_STATUS_BET) {
                this._areaKuangUIList[index].visible = false;
            }
        }

        private onAreaBetMouseDown(index: number, e: LEvent): void {
            if (this._curStatus == MAP_STATUS.PLAY_STATUS_BET) {
                this._areaKuangUIList[index].visible = true;
            }
        }

        //红黑区域下注
        private onAreaBetMouseUp(index: number, e: LEvent): void {
            if (this._curStatus != MAP_STATUS.PLAY_STATUS_BET) {
                this._game.uiRoot.topUnder.showTips("当前不在下注时间，请在下注时间再进行下注！");
                return;
            }
            this._areaKuangUIList[index].visible = false;
            if (this._betWait) return;//投注间隔
            let total = this._betMainList[index];
            if (this._curChip + total > this._betlimit) {
                this._game.uiRoot.topUnder.showTips(StringU.substitute("本投注点限红{0}哦~", this._betlimit));
                return;
            }
            if (index == 0) {//红
                if (this._betMainList[1] > 0) {
                    this._game.uiRoot.topUnder.showTips("老板，红黑不能同时下注哦~");
                    return;
                }
            }
            if (index == 1) {//黑
                if (this._betMainList[0] > 0) {
                    this._game.uiRoot.topUnder.showTips("老板，红黑不能同时下注哦~");
                    return;
                }
            }
            let money = TongyongUtil.getMoneyChange(this._game.sceneObjectMgr.mainUnit.GetMoney());
            let betBefore = 0;
            for (let i = 0; i < 3; i++) {
                betBefore += this._betMainList[i];
            }
            if (money + betBefore < PLAYER_LEAST_MONEY) {
                TongyongPageDef.ins.alertRecharge(StringU.substitute("老板，您的金币少于{0}哦~\n补充点金币去大杀四方吧~", PLAYER_LEAST_MONEY), () => {
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                }, () => {
                }, true, TongyongPageDef.TIPS_SKIN_STR['cz']);
                return;
            }
            if (!this._curChip || this._curChip > money || this._curChip == -1) {
                TongyongPageDef.ins.alertRecharge("老板，您的金币不足哦~\n补充点金币去大杀四方吧~", () => {
                    this._game.uiRoot.general.open(DatingPageDef.PAGE_CHONGZHI);
                }, () => {
                }, true, TongyongPageDef.TIPS_SKIN_STR['cz']);
                return;
            }
            this.moveHead(this._viewUI.main_player, this._mainHeadPos[0][0], this._mainHeadPos[0][1], this._mainHeadPos[1][0], this._mainHeadPos[1][1]);
            this._betWait = true;
            Laya.timer.once(100, this, () => {
                this._betWait = false;
            })
            this._rebetList[index] += this._curChip;
            this._game.network.call_hhdazhan_bet(this._curChip, index + 1)
        }

        //筹码点击事件
        private onClickChip(index: number, e: LEvent): void {
            if (this._chipArr[index] == this._curChip) return;
            this._game.uiRoot.btnTween(e.currentTarget);
            this.onSelectChip(index);
        }

        //选择筹码
        private onSelectChip(index: number): void {
            if (this._game.sceneObjectMgr.mainUnit && TongyongUtil.getMoneyChange(this._game.sceneObjectMgr.mainUnit.GetMoney()) < this._chipArr[0]) {
                this._curChip = -1;
                for (let i: number = 0; i < this._chipUIList.length; i++) {
                    this._chipUIList[i].y = this._curChipY;
                    this._chipUIList[i].img0.visible = this._chipUIList[i].img1.visible = false;
                    this._chipUIList[i].ani1.gotoAndStop(0);
                }
            } else {
                this._curChip = this._chipArr[index];
                for (let i: number = 0; i < this._chipUIList.length; i++) {
                    this._chipUIList[i].y = i == index ? this._curChipY - 10 : this._curChipY;
                    this._chipUIList[i].img0.visible = this._chipUIList[i].img1.visible = i == index;
                    if (i == index) {
                        this._chipUIList[i].ani1.play(0, true);
                    } else {
                        this._chipUIList[i].ani1.gotoAndStop(0);
                    }
                }
            }
        }

        //筹码是否置灰（是否下注阶段）
        private onChipDisabled(isBetState: boolean): void {
            this._viewUI.btn_repeat.disabled = !isBetState;
            if (isBetState) {
                if (this._curChip == -1 && TongyongUtil.getMoneyChange(this._game.sceneObjectMgr.mainUnit.GetMoney()) >= this._chipArr[0]) {
                    this._curChip = this._chipArr[0];
                }
                Laya.Tween.to(this._viewUI.btn_repeat, { y: this._btnRepeatY }, 300);
                let index = this._chipArr.indexOf(this._curChip);
                for (let i: number = 0; i < this._chipUIList.length; i++) {
                    this._isTweenOver = false;
                    Laya.Tween.to(this._chipUIList[i], { y: i == index ? this._curChipY - 10 : this._curChipY }, 300, null, Handler.create(this, () => {
                        this._isTweenOver = true;
                    }));
                    this._chipUIList[i].img0.visible = this._chipUIList[i].img1.visible = i == index;
                    !this._chipUIList[i].disabled && (this._chipUIList[i].mouseEnabled = true);
                    this._chipUIList[i].alpha = 1;
                    if (i == index) {
                        this._chipUIList[i].ani1.play(0, true);
                    } else {
                        this._chipUIList[i].ani1.gotoAndStop(0);
                    }
                }
            } else {
                Laya.Tween.to(this._viewUI.btn_repeat, { y: this._btnRepeatY + 20 }, 300);
                for (let i: number = 0; i < this._chipUIList.length; i++) {
                    Laya.Tween.to(this._chipUIList[i], { y: this._curChipY + 20 }, 300);
                    !this._chipUIList[i].disabled && (this._chipUIList[i].mouseEnabled = false);
                    this._chipUIList[i].alpha = 0.75;
                    this._chipUIList[i].ani1.gotoAndStop(0);
                    this._chipUIList[i].img0.visible = this._chipUIList[i].img1.visible = false;
                }
            }
        }

        private _isTweenOver: boolean = false;
        private onUpdateChipGrey() {
            if (!this._game.sceneObjectMgr.mainUnit) return;
            let money: number = TongyongUtil.getMoneyChange(this._game.sceneObjectMgr.mainUnit.GetMoney());
            let curMaxChipIndex: number = -1;
            for (let i = 0; i < this._chipUIList.length; i++) {
                let index = this._chipUIList.length - 1 - i;
                let chipUI = this._chipUIList[index];
                if (money < this._chipArr[index]) {
                    chipUI.disabled = true;
                } else {
                    if (curMaxChipIndex == -1) {
                        curMaxChipIndex = index;
                    }
                    chipUI.disabled = false;
                }
            }
            //如果因为钱不够导致当前选中筹码被置灰，则向下调整选中筹码
            let curChipIndex = this._chipArr.indexOf(this._curChip);
            if (curChipIndex > curMaxChipIndex && this._isTweenOver) {
                if (this._curStatus == MAP_STATUS.PLAY_STATUS_BET) {
                    this.onSelectChip(curMaxChipIndex);
                }
            }
        }

        //选择座位入座
        private onSelectSeat(index: number): void {
            let mainUnit = this._game.sceneObjectMgr.mainUnit;
            if (!mainUnit) return;
            if (TongyongUtil.getMoneyChange(mainUnit.GetMoney()) < this._seatlimit) {
                this._game.uiRoot.topUnder.showTips("金币不足");
                return;
            }
            this._game.network.call_hhdazhan_seated(index + 1);
        }

        protected onMouseClick(e: LEvent) {
            if (e.target != this._viewUI.btn_spread) {
                this.menuTween(false);
            }
        }

        //菜单栏
        private menuTween(isOpen: boolean) {
            if (isOpen) {
                this._viewUI.box_menu.visible = true;
                this._viewUI.box_menu.scale(0.2, 0.2);
                this._viewUI.box_menu.alpha = 0;
                Laya.Tween.to(this._viewUI.box_menu, { scaleX: 1, scaleY: 1, alpha: 1 }, 300, Laya.Ease.backInOut);
            } else {
                Laya.Tween.to(this._viewUI.box_menu, { scaleX: 0.2, scaleY: 0.2, alpha: 0 }, 300, Laya.Ease.backInOut, Handler.create(this, () => {
                    this._viewUI.box_menu.visible = false;
                }));
            }
        }

        private resetAll(): void {
            Laya.Tween.clearAll(this);
            Laya.timer.clearAll(this);
            this.clearClips();
            this.resetUI();
            this.resetData();
            this._hongheiMgr.clear();
        }

        private onUpdateGameNo(): void {
            let gameNo = this._hongheiMapInfo.GetGameNo();
            if (gameNo) {
                this._viewUI.txt_id.visible = true;
                this._viewUI.txt_id.text = "牌局号：" + gameNo;
            }
        }

        private onUpdateCountDown(): void {
            if (!this._hongheiMapInfo) return;
            this._countDown = this._hongheiMapInfo.GetCountDown();
        }

        private onUpdateRecord(): void {
            if (!this._hongheiMapInfo) return;
            let recordArr = [];
            let gameRecord = this._hongheiMapInfo.GetGameRecord();
            if (gameRecord != "") {
                recordArr = JSON.parse(gameRecord);
            }
            let tempRecord = [];
            let length = recordArr.length;
            let maxlenth = this._viewUI.list_record0.repeatX
            if (length > maxlenth) {
                for (let i = 0; i < maxlenth; i++) {
                    tempRecord[i] = recordArr[recordArr.length - maxlenth + i];
                }
            } else {
                tempRecord = recordArr;
            }
            this._viewUI.list_record0.dataSource = tempRecord;
        }

        private onUpdateCardRecord(): void {
            if (!this._hongheiMapInfo) return;
            let recordArr = [];
            let cardRecord = this._hongheiMapInfo.GetCardRecord();
            if (cardRecord != "") {
                recordArr = JSON.parse(cardRecord);
            }
            let tempRecord = [];
            let length = recordArr.length;
            let maxlenth = this._viewUI.list_record1.repeatX
            if (length > maxlenth) {
                for (let i = 0; i < maxlenth; i++) {
                    tempRecord[i] = recordArr[recordArr.length - maxlenth + i]
                }
            } else {
                tempRecord = recordArr
            }
            this._viewUI.list_record1.dataSource = tempRecord;
        }

        //初始化UI界面
        private initView(): void {
            this._viewUI.box_menu.zOrder = 99;
            this._viewUI.box_menu.visible = false;
            this._viewUI.hong_win.visible = false;
            this._viewUI.hei_win.visible = false;
            this._areaList = [];
            this._chipUIList = [];
            this._seatUIList = [];
            this._areaKuangUIList = [];
            this._txtTotalUIList = [];
            this._txtBetUIList = [];
            this._htmlTextArr = [];

            //下注区域光效和文本
            for (let i: number = 0; i < 3; i++) {
                this._areaList.push(this._viewUI["area" + i]);
                this._areaKuangUIList.push(this._viewUI["kuang" + i]);
                this._txtTotalUIList.push(this._viewUI["txt_total" + i]);
                this._areaKuangUIList[i].visible = false;
                this._areaList[i].on(LEvent.MOUSE_OUT, this, this.onAreaBetMouseOut, [i]);
                this._areaList[i].on(LEvent.MOUSE_DOWN, this, this.onAreaBetMouseDown, [i]);
                this._areaList[i].on(LEvent.MOUSE_UP, this, this.onAreaBetMouseUp, [i]);
                //下注文本：玩家下注数/总下注数
                this._htmlTextArr[i] = TextFieldU.createHtmlText(this._txtTotalUIList[i]);
                this._htmlTextArr[i].style.lineHeight = 30;
                this._htmlTextArr[i].style.valign = "middle";
                this._htmlTextArr[i].innerHTML = "<span style='color:#ffd200'>0</span><span style='color:#ffffff'>/0</span>";
            }
            //筹码选择区域
            for (let i: number = 0; i < 5; i++) {
                this._chipUIList.push(this._viewUI["btn_chip" + i]);
                this._chipUIList[i].on(LEvent.CLICK, this, this.onSelectChip, [i]);
                if (i == 0) {
                    this._curChipY = this._chipUIList[i].y;
                }
            }
            //座位
            for (let i: number = 0; i < 6; i++) {
                this._seatUIList.push(this._viewUI["seat" + i]);
                this._seatUIList[i].clip_money.visible = false;
                this._seatUIList[i].on(LEvent.CLICK, this, this.onSelectSeat, [i]);
                this._seatUIList[i].effWin.visible = false;
                this._seatUIList[i].img_qifu.visible = false;
                this._seatUIList[i].img_vip.visible = false;
            }
            //开牌动作
            this._viewUI.kaipaiHong.visible = false;
            this._viewUI.kaipaiHong.ani_kaipai.stop();
            this._viewUI.kaipaiHong.ani_kaipai.on(LEvent.COMPLETE, this, this.onSeeCardOver, [1]);
            this._viewUI.kaipaiHei.visible = false;
            this._viewUI.kaipaiHei.ani_kaipai.stop();
            this._viewUI.kaipaiHei.ani_kaipai.on(LEvent.COMPLETE, this, this.onSeeCardOver, [2]);

            this._viewUI.list_record0.itemRender = this.createChildren("game_ui.honghei.component.RecordRenderUI", MapRecordRender1);
            this._viewUI.list_record0.renderHandler = new Handler(this, this.renderHandler1);
            this._viewUI.list_record1.itemRender = this.createChildren("game_ui.honghei.component.DuiZi1UI", MapRecordRender2);
            this._viewUI.list_record1.renderHandler = new Handler(this, this.renderHandler2);
            if (!this._htmlText) {
                this._htmlText = TextFieldU.createHtmlText(this._viewUI.txt_online);
            }
            //主玩家UI
            this._viewUI.main_player.clip_money.visible = false;
            this._viewUI.main_player.effWin.visible = false;
            //界面UI
            this._btnRepeatY = this._viewUI.btn_repeat.y;
            this._viewUI.txt_id.visible = false;
            this._viewUI.box_time.visible = false;
            this._viewUI.xipai.visible = false;
            this._viewUI.paixieRight.ani_chupai.stop();
            this._viewUI.paixieRight.ani2.gotoAndStop(0);
            this._viewUI.box_hong.visible = false;
            this._viewUI.box_hei.visible = false;
            this._viewUI.box_room_left.visible = false;
            this._viewUI.btn_repeat.disabled = true;
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

        private initRoomConfig(): void {
            let maplv = this._hongheiMapInfo.GetMapLevel();
            if (maplv && ALL_GAME_ROOM_CONFIG_ID.indexOf(maplv) != -1) {
                this._chipArr = ROOM_CHIP_CONFIG[maplv];
                this._seatlimit = MONEY_LIMIT_CONFIG[maplv][1];
                this._betlimit = MONEY_LIMIT_CONFIG[maplv][2];
                this._onlineNumRate = ONLINE_NUM_RATE_CONFIG[maplv];

                if (!this._chipArr) return;
                for (let i = 0; i < this._chipArr.length; i++) {
                    this._chipUIList[i].btn_num.label = EnumToString.sampleChipNum(this._chipArr[i]);
                    this._chipUIList[i].btn_num.skin = StringU.substitute(PathGameTongyong.ui_tongyong_general + "tu_cm{0}.png", i);
                }
                if (!this._curChip) this.onSelectChip(0);
            }
        }

        //重置UI
        private resetUI(): void {
            //主玩家UI
            this._viewUI.main_player.clip_money.visible = false;
            //界面UI
            for (let i = 0; i < 3; i++) {
                this._htmlTextArr[i].innerHTML = "<span style='color:#ffd200'>0</span><span style='color:#ffffff'>/0</span>";
                this._areaKuangUIList[i].visible = false;
            }
            this._viewUI.hong_win.visible = false;
            this._viewUI.hei_win.visible = false;
            this._viewUI.box_hong.visible = false;
            this._viewUI.box_hei.visible = false;
        }

        private resetData(): void {
            this._battleIndex = -1;
            this._cardsArr = [];
            this._resultArry = [];
            this._clipResult = [];
            for (let i = 0; i < 3; i++) {
                this._chipTotalList[i] = [];
            }
            this._betTotalList = [0, 0, 0];
            this._betMainList = [0, 0, 0];
            this._mainPlayerBenefit = 0;
            this._betMainTotal = 0;
            this._lottery = "";
            this._hongheiMgr && (this._hongheiMgr.isReconnect = false);
        }

        public close(): void {
            if (this._viewUI) {
                this._viewUI.btn_spread.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_back.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_rule.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_chongzhi.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_set.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_zhanji.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_repeat.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_road.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_qifu.off(LEvent.CLICK, this, this.onBtnClickWithTween);
                this._viewUI.btn_playerList.off(LEvent.CLICK, this, this.onBtnClickWithTween);

                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_ADD_UNIT, this, this.onUnitAdd);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_REMOVE_UNIT, this, this.onUnitRemove);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_MONEY_CHANGE, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_CHANGE, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_ACTION, this, this.onUpdateUnit);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_MAPINFO_CHANGE, this, this.onUpdateMapInfo);
                this._game.sceneObjectMgr.off(SceneObjectMgr.EVENT_UNIT_QIFU_TIME_CHANGE, this, this.onUpdateUnit);

                this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_STATUS_CHECK, this, this.onUpdateStatus);
                this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_BATTLE_CHECK, this, this.onUpdateBattle);
                this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_COUNT_DOWN, this, this.onUpdateCountDown);//倒计时时间戳更新
                this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_GAME_RECORD, this, this.onUpdateRecord);//游戏记录更新
                this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_SEATED_LIST, this, this.onUpdateSeatedList);//入座列表更新
                this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_CARD_RECORD, this, this.onUpdateCardRecord);//牌型更新
                this._game.sceneObjectMgr.off(HongheiMapInfo.EVENT_STATUS_CHECK, this, this.initRoomConfig);//地图传送参数
                this._game.qifuMgr.off(QiFuMgr.QIFU_FLY, this, this.qifuFly);
                this._viewUI.hong_win.ani1.off(LEvent.COMPLETE, this, this.playAniOver);
                this._viewUI.hei_win.ani1.off(LEvent.COMPLETE, this, this.playAniOver);

                for (let i: number = 0; i < this._areaList.length; i++) {
                    this._areaList[i] && this._areaList[i].off(LEvent.MOUSE_OUT, this, this.onAreaBetMouseOut);
                    this._areaList[i] && this._areaList[i].off(LEvent.MOUSE_DOWN, this, this.onAreaBetMouseDown);
                    this._areaList[i] && this._areaList[i].off(LEvent.MOUSE_UP, this, this.onAreaBetMouseUp);
                }
                this._areaList = []
                for (let i: number = 0; i < this._chipUIList.length; i++) {
                    this._chipUIList[i] && this._chipUIList[i].off(LEvent.CLICK, this, this.onSelectChip);
                }
                this._chipUIList = []
                for (let i: number = 0; i < this._seatUIList.length; i++) {
                    this._seatUIList[i] && this._seatUIList[i].off(LEvent.CLICK, this, this.onSelectSeat, [i]);
                }
                this._seatUIList = []
                this._chipTotalList = []
                this._viewUI.kaipaiHong.ani_kaipai.off(LEvent.COMPLETE, this, this.onSeeCardOver);
                this._viewUI.kaipaiHei.ani_kaipai.off(LEvent.COMPLETE, this, this.onSeeCardOver);
                this._viewUI.paixieRight.ani_chupai.stop();
                this._viewUI.paixieRight.ani2.gotoAndStop(0);
                if (this._hongheiMgr) {
                    this._hongheiMgr.off(HongheiMgr.DEAL_OVER, this, this.onUpdateAniDeal);
                    this._hongheiMgr.off(HongheiMgr.OPEN_OVER, this, this.onOpenCardOver);
                    this._hongheiMgr.off(HongheiMgr.OPEN_OVER1, this, this.onOpenCardOver1);
                }

                this._game.uiRoot.HUD.close(HongheiPageDef.PAGE_HHDZ_BEGIN);
                this._game.uiRoot.HUD.close(HongheiPageDef.PAGE_HHDZ_END);
                this.resetAll();
                this._hongheiStory && this._hongheiStory.clear();
                this._game.stopAllSound();
                this._game.stopMusic();
                Laya.Tween.clearAll(this);
                Laya.timer.clearAll(this);
            }
            super.close();
        }
    }
    class MapRecordRender1 extends ui.ajqp.game_ui.honghei.component.RecordRenderUI {
        private _game: Game;
        private _data: any;
        constructor() {
            super();
        }
        setData(game: Game, data: any) {
            this._game = game;
            this._data = data;
            if (this._data != -1 && this._data != 1) {
                this.visible = false;
                return;
            }
            this.visible = true;
            this.record.skin = StringU.substitute(Path_game_honghei.ui_honghei + "zs_{0}.png", this._data == 1 ? "0" : "1");
        }
        destroy() {
            super.destroy();
        }
    }
    class MapRecordRender2 extends ui.ajqp.game_ui.honghei.component.DuiZi1UI {
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
                this.img.skin = PathGameTongyong.ui_tongyong_general + "anniu/tu_dzdt1.png";
            }
            else {
                this.img.skin = PathGameTongyong.ui_tongyong_general + "anniu/tu_dzdt2.png";
            }
        }
        destroy() {
            super.destroy();
        }
    }
}