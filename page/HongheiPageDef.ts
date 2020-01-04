/**
* name 
*/
module gamehonghei.page {
	export class HongheiPageDef extends game.gui.page.PageDef {
		static GAME_NAME: string;
		//红黑大战界面
		static PAGE_HHDZ: string = "1";
		//红黑大战地图UI
		static PAGE_HHDZ_MAP: string = "2";
		//红黑大战开始下注界面
		static PAGE_HHDZ_BEGIN: string = "3";
		//红黑大战停止下注界面
		static PAGE_HHDZ_END: string = "4";
		//红黑大战开始界面
		static PAGE_HHDZ_START: string = "5";
		//红黑大战走势
		static PAGE_HHDZ_ZOUSHI: string = "6";
		//红黑大战规则界面
		static PAGE_HHDZ_RULE: string = "101";

		static myinit(str: string) {
			super.myinit(str);
			HongheiClip.init();
			PageDef._pageClassMap[HongheiPageDef.PAGE_HHDZ] = HongheiPage;
			PageDef._pageClassMap[HongheiPageDef.PAGE_HHDZ_MAP] = HongheiMapPage;
			PageDef._pageClassMap[HongheiPageDef.PAGE_HHDZ_BEGIN] = HongheiBeginPage;
			PageDef._pageClassMap[HongheiPageDef.PAGE_HHDZ_RULE] = HongheiRulePage;
			PageDef._pageClassMap[HongheiPageDef.PAGE_HHDZ_END] = HongheiEndPage;
			PageDef._pageClassMap[HongheiPageDef.PAGE_HHDZ_START] = HongheiStartPage;
			PageDef._pageClassMap[HongheiPageDef.PAGE_HHDZ_ZOUSHI] = HongheiZoushiPage;


			this["__needLoadAsset"] = [
				DatingPath.atlas_dating_ui + "qifu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "qifu.atlas",
				Path_game_honghei.atlas_game_ui + "honghei.atlas",
				Path_game_honghei.atlas_game_ui + "honghei/effect/bipai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "chongzhi.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "nyl.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "yq.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/fapai_1.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/xipai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong + "general/effect/kaipai.atlas",
				PathGameTongyong.atlas_game_ui_tongyong_general + "anniu.atlas",
				PathGameTongyong.atlas_game_ui_tongyong_general_effect + "anniug.atlas",
				PathGameTongyong.atlas_game_ui_tongyong_general_effect + "ksyx.atlas",
				PathGameTongyong.atlas_game_ui_tongyong_general_effect + "ksxz.atlas",

				Path_game_honghei.ui_honghei_effect_sk + "honghei.png",
				Path_game_honghei.ui_honghei_effect_sk + "honghei.sk",
				Path.custom_atlas_scene + 'card.atlas',
				Path.custom_atlas_scene + 'chip.atlas',
				Path.map + 'pz_honghei.png',
				Path.map_far + 'bg_honghei.jpg'
			]

			if (WebConfig.needMusicPreload) {
				this["__needLoadAsset"] = this["__needLoadAsset"].concat([
					Path_game_honghei.music_honghei + "honghei_bgm.mp3",
					Path_game_honghei.music_honghei + "chouma.mp3",
					Path_game_honghei.music_honghei + "dingding_end.mp3",
					Path_game_honghei.music_honghei + "dingding_start.mp3",
					Path_game_honghei.music_honghei + "piaoqian.mp3",
					Path_game_honghei.music_honghei + "type0.mp3",
					Path_game_honghei.music_honghei + "type1.mp3",
					Path_game_honghei.music_honghei + "type2.mp3",
					Path_game_honghei.music_honghei + "type3.mp3",
					Path_game_honghei.music_honghei + "type4.mp3",
					Path_game_honghei.music_honghei + "type5.mp3",
					Path_game_honghei.music_honghei + "win_black.mp3",
					Path_game_honghei.music_honghei + "win_red.mp3",
					Path_game_honghei.music_honghei + "xiazhu_end.mp3",
					Path_game_honghei.music_honghei + "xiazhu_start.mp3",
				])
			}
		}
	}
}