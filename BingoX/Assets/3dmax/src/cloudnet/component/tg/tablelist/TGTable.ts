module cloudnet {
	/**
	 * 桌面遊戲桌列表共用控制器
	 * @author 
	 *
	 */
    export class TGTable extends eui.Component {

        //下注中(統一)
        public static STATE_BET: number = 1;

        //桌號(0 Base，基底設定，預設-1)
        public tableID: number = -1;

        //各階段字串的StringKey清單
        private phaseKeyList: number[];

        //顯示物件--------------------------------------------------------

        //遊戲名稱
        private nameTf: eui.BitmapLabel;

        //桌號文字框
        private tableIdTf: eui.BitmapLabel;

        //狀態文字框
        private stateTf: control.ColorfulBitmapLabel;
        private betStateTf: control.ColorfulBitmapLabel;

        //底圖
        private bg: eui.Image;
        private bg_over: eui.Image;

        private isSelect: boolean = false;

        public countdownTimerUI: cloudnet.HeaderTimerUI;

        private sens: eui.Rect;

        private fullImg: eui.Image;

        //[Ray]2018.12.20:秒數紀錄，滿座狀態切換時候要用
        private second: number = -1;

        //開始轉紅&跳動的秒數
        private static RED_TIME: number = 6;

        public static test: number = 0;
        public constructor() {
            super();
            this.once(eui.UIEvent.COMPLETE, this.uiCompHandler, this);

            let s: egret.Shape = new egret.Shape();
            s.graphics.beginFill(++TGTable.test * 100000);
            s.graphics.drawCircle(0, 0, 100);
            s.graphics.endFill();
            this.addChild(s);
        }

        /**
         * EXML解析完成
         */
        private uiCompHandler(): void {
            // this.sens.addEventListener(mouse.MouseEvent.MOUSE_OVER, this.onOver, this);
            // this.sens.addEventListener(mouse.MouseEvent.MOUSE_OUT, this.onOut, this);
            this.sens.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);

            //倒數秒數
            this.countdownTimerUI = new cloudnet.HeaderTimerUI();
            this.countdownTimerUI.x = this.stateTf.x + 88;
            this.countdownTimerUI.y = this.stateTf.y + 18;
            this.countdownTimerUI.scaleX = 0.7;
            this.countdownTimerUI.scaleY = 0.7;
            this.addChild(this.countdownTimerUI);
        }

        private onOver(e: egret.TouchEvent): void {
            this.setIsOver(true);
        }

        private onOut(e: egret.TouchEvent): void {
            this.setIsOver(false);
        }

        private setIsOver(value: boolean): void {
            if (value) {
                this.bg_over.visible = true;
            }
            else if (!this.isSelect) {
                this.bg_over.visible = false;
            }
        }
        /**
         * 點擊
         */
        private onTouchTap(e: egret.TouchEvent): void {
            this.setIsOver(true);
            this.isSelect = true;
            this.dispatchEventWith(cloudnet.GameEvent.CHOOSE_SEATS_COMPLETE, true, this.tableID)
        }

        /**
         * 檢查是不是下注前三秒,是的話顯示下注中text
         * @param countdownSec {number} 總倒數秒數
         * @param sec {number} 目前倒數秒數
         * @return {boolean} 是否要顯示下注中 
         */
        private checkShowBetText(countdownSec: number, sec: number): boolean {
            return sec == countdownSec || sec == countdownSec - 1 || sec == countdownSec - 2;
        }


        /**
         * 設定桌資訊
         */
        public setTableInfo(JSONObject: cloudnet.GameTableInfoTG): void {

            if (!this.phaseKeyList) {
                egret.error('尚未設定狀態資訊!!');
            }
            //不存在桌
            if (JSONObject == null) {
                this.visible = false;
                this.tableID = -1;
                return;
            }

            //紀錄桌號
            this.visible = true;
            //紀錄是否整桌重刷了(處理0秒靜止問題)
            let firstIn: boolean = false;
            if (this.tableID == -1 || this.tableID != JSONObject.TableID) {
                firstIn = true;
                //切頁要重置資料
                this.second = -1;
            }
            this.tableID = JSONObject.TableID;

            //名稱
            //[Jungle]2018.12.21 M版桌列表遊戲名稱使用遊戲選單名稱
            if (GameDataManager.getInstance().gameMenuName == null || GameDataManager.getInstance().gameMenuName == "") {
                this.nameTf.text = GameDataManager.getInstance().cnName;
            } else {
                this.nameTf.text = GameDataManager.getInstance().gameMenuName;
            }

            //顯示桌號
            let s: string = cloudnet.ResUtil.getString(cloudnet.StringKey.TABLE_ID);
            this.tableIdTf.text = s.replace('#', this.tableID + "");

            //紀錄資料
            let GLDisplayInfo: cloudnet.GLDisplayInfoVO = JSONObject.GLDisplayInfo;

            //倒數總時間
            let totalSecond: number = Math.max(Math.floor(GLDisplayInfo.TotalSecond / 1000));

            //尚未開桌
            if (!GLDisplayInfo) {
                this.stateTf.text = '';
                return;
            }

            //首次進入滿座還是要全刷
            if (firstIn && GLDisplayInfo.FullSeatChange) {
                GLDisplayInfo.FullSeatChange = false;
            }

            //只刷新滿座
            if (GLDisplayInfo.FullSeatChange) {
                GLDisplayInfo.FullSeatChange = false;
                if (GLDisplayInfo.FullSeat == 1) {
                    this.setCountdown(-1);
                    this.stateTf.visible = false;
                    this.fullImg.visible = true;
                }
                else {
                    //畫面上沒有秒數才顯示狀態
                    if (this.second == -1) {
                        this.stateTf.visible = true;
                    } else {
                        this.setCountdown(this.second, totalSecond);
                    }
                    this.fullImg.visible = false;
                }
                return;
            }

            let newState: number = GLDisplayInfo.State;

            //倒數N秒
            if (newState == TGTable.STATE_BET) {
                let newSecond: number = Math.max(Math.floor(GLDisplayInfo.Second / 1000), 0);

                //第一次一定要刷(0秒靜止)
                if (firstIn) {
                    // this.countdownTimerUI.tween = false;//倒數10秒開始跳動
                    if (newSecond < this.second || this.second == -1) {
                        this.second = newSecond;
                        this.setCountdown(newSecond, totalSecond);
                    }
                }
                //其他持續刷新只刷到0就不能再刷
                else if (newSecond >= 0) {
                    // this.countdownTimerUI.tween = newSecond <= TGTable.RED_TIME;//倒數10秒開始跳動
                    if (newSecond < this.second || this.second == -1) {
                        this.second = newSecond;
                        this.setCountdown(newSecond, totalSecond);
                    }
                }
                this.stateTf.visible = false;
            }
            //一般狀態
            else {
                this.second = -1;
                this.setCountdown(-1);

                this.stateTf.visible = true;
                this.stateTf.text = cloudnet.ResUtil.getString(this.phaseKeyList[newState]);
            }

            //滿座檢查(如果滿座就隱藏狀態，只顯示觀局按鈕)
            //[Ray]2018.12.13:直接在ResponseGameTableInfo轉換FullSeat，統一0:未滿,1:滿座
            if (GLDisplayInfo.FullSeat == 1) {
                this.setCountdown(-1);
                this.stateTf.visible = false;
                this.fullImg.visible = true;
            }
            else {
                this.fullImg.visible = false;
            }
        }

        /**
      * 設定要顯示下注中text或是倒數文字
      * @param second {number} 目前要倒數時間
      * @param totalSecond {number} 總倒數時間
      */
        private setCountdown(second: number, totalSecond: number = -1): void {

            //下注中
            if (totalSecond != -1 && this.checkShowBetText(totalSecond, second)) {
                this.betStateTf.visible = true;
                this.countdownTimerUI.setTime(-1);
            }
            //顯示秒數
            else {
                this.betStateTf.visible = false;

                if (second !== 0) {
                    this.countdownTimerUI.setTime(second - 1);
                }
            }

        }


        /**
         * 狀態對應字串顯示
         */
        public setPhaseStringKeyList(phaseKeyList: number[]) {
            this.phaseKeyList = phaseKeyList;
            this.betStateTf.text = cloudnet.ResUtil.getString(this.phaseKeyList[1]);
        }

        public reset(): void {
            this.isSelect = false;
            this.setIsOver(false);
        }
    }
}
