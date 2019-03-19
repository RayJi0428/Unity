module cloudnet {

	/**
	 * 手勢滑動控制器
	 * 外部塞入需要的物件，賦予物件手勢功能
	 */
	export class ScrollCotroller extends egret.EventDispatcher {

		//拖動最小距離
		private static MIN_DIST: number = 100;
		//至少5px才算拖動，才觸發鎖定點擊
		private static MOVE_DIST: number = 10;

		//切頁開始通知(禁用其他物件)
		public static ON_DRAG_START: string = "ScrollCotroller.ON_DRAG_START";

		//切頁完成通知(啟用其他物件)
		public static ON_DRAG_STOP: string = "ScrollCotroller.ON_DRAG_STOP";

		//頁數異動通知
		public static ON_PAGE_CHANGED: string = "ScrollCotroller.ON_PAGE_CHANGED";

		//要控制的顯示物件
		private container: egret.DisplayObject;

		//當前索引(正中間的索引值)
		private currentPage: number = 0;

		//前往頁面
		private newPage: number = 0;

		//總頁數
		private totalPage: number = 0;

		//初始座標
		private initX: number = 0;

		//位移前起始座標
		private beginX: number = 0;

		//每一頁距離
		private gap: number = 0;

		//拖曳X座標
		private dragX: number = -1;

		private _isDrag: boolean = false;

		//分頁循環
		private isLoop: boolean;

		//切頁方向(0:不動, 1:向右, -1:向左)
		public direction: number = 0;
		public static STATIC: number = 0;
		public static LEFT: number = -1;
		public static RIGHT: number = 1;

		//是否可用
		private enabled: boolean = true;
		/**
		 * ctor
		 */
		public constructor() {
			super();
		}

		/**
		 * 設置
		 * container:要管理的顯示物件
		 * gap:每一頁距離
		 * totalPage:總頁數
		 */
		public setup(
			container: egret.DisplayObject,
			gap: number,
			totalPage: number,
			loop: boolean = true): void {

			this.container = container;
			this.initX = this.container.x;
			this.gap = gap;
			this.totalPage = totalPage;
			this.isLoop = loop;

			if (totalPage > 1) {
				this.container.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
			}
		}

		/**
		 * 設定當前索引
		 */
		public setCurrentPage(page: number): void {
			this.currentPage = page;

		}



		/**
		 * 壓下觸發拖曳
		 */
		private onTouchBegin(e: egret.TouchEvent): void {

			if (!this.enabled)
				return;

			//紀錄當前X座標
			this.dragX = e.stageX;
			this.beginX = this.container.x;
			this.newPage = this.currentPage;//開始時先newPage先記錄為currentPage，萬一沒有成功拖曳就回到currentPage

			this.container.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);

			//[Ray]2018.01.16:TOUCH_MOVE改為stage監聽，避免更上層有東西擋住導致MOVE不正常
			this.container.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
			this.container.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
			this.container.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchEnd, this);
			this.container.stage.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchEnd, this);
		}

		/**
		 * 拖曳處理
		 */
		private onTouchMove(e: egret.TouchEvent): void {

			//拖動距離
			let distance: number = e.stageX - this.dragX;
			this.direction = distance > 0 ? ScrollCotroller.RIGHT : ScrollCotroller.LEFT;

			//[Ray]2019.01.02:至少超過一定距離才當作拖曳(鎖定按鈕)
			//A站>M共用簡繁越>超過三桌的TG遊戲使用三星系列手機、平板於桌列表經常性點擊入桌無效，請查修(C站也有此問題)
			if (Math.abs(distance) > ScrollCotroller.MOVE_DIST && !this._isDrag) {
				this.dispatchEventWith(ScrollCotroller.ON_DRAG_START);
				this._isDrag = true;
			}

			if (this._isDrag) {
				if (this.isLoop) {

					if (Math.abs(distance) > ScrollCotroller.MIN_DIST) {
						if (distance > 0) {
							this.newPage = this.currentPage - 1;
						}
						else {
							this.newPage = this.currentPage + 1;
						}
					}
					//距離小於MIN視為無效
					else {
						this.newPage = this.currentPage;
					}
					this.container.x = this.beginX + distance;
				}
				//不循環
				else {

					if (Math.abs(distance) > ScrollCotroller.MIN_DIST) {
						if (distance > 0 && this.currentPage != 0) {
							this.newPage = this.currentPage - 1;
							this.container.x = this.beginX + distance;
						}
						else if (distance < 0 && this.currentPage != this.totalPage - 1) {
							this.newPage = this.currentPage + 1;
							this.container.x = this.beginX + distance;
						}
					}
					//距離小於MIN視為無效
					else {
						this.newPage = this.currentPage;
					}
				}
			}
		}

		/**
		 * 拖曳結束
		 */
		private onTouchEnd(e: egret.TouchEvent): void {

			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchEnd, this);
			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchEnd, this);

			this.moveToPage(this.newPage);
		}

		/**
		 * 切到指定頁面
		 */
		public moveToPage(newPage: number, tween: number = 0.3): void {

			//newPage------------------------------------------------
			//循環切頁
			if (this.isLoop) {
				if (newPage > this.totalPage - 1) {
					newPage = 0;
				}
				if (newPage < 0) {
					newPage = this.totalPage - 1;
				}
			}
			//一般切頁要擋上下限
			else {
				newPage = Math.min(newPage, this.totalPage - 1);
				newPage = Math.max(newPage, 0);
			}
			this.newPage = newPage;

			//endX------------------------------------------------
			let endX: number;
			//頁面沒切換不處理
			if (newPage == this.currentPage) {
				endX = this.beginX;
			}
			else {
				//循環切頁
				if (this.isLoop) {
					endX = this.direction == ScrollCotroller.LEFT ? this.beginX - this.gap : this.beginX + this.gap;
				}
				//一般切頁直接計算最終X座標
				else {
					endX = this.initX - (newPage * this.gap);
				}
			}

			//tween------------------------------------------------
			//已經到終點直接處理Complete
			if (this.container.x == endX) {
				this.onTweenComplete();
			}
			else {
				//滑動時禁用
				this.container.touchEnabled = false;

				TweenLite.killTweensOf(this.container);
				let data: any = {};
				data.x = endX;
				data.onComplete = this.onTweenComplete;
				data.onCompleteScope = this;
				TweenLite.to(this.container, tween, data);
			}
		}


		/**
		 * 中斷拖曳
		 * [Min]2019.02.26 骰寶，若在拖曳途中進入開獎階段，畫面仍可被拖曳，故須強制中斷拖曳偵聽，並重新掛上TOUCH_BEGIN的偵聽
		 */
		public InterruptDrag(): void {
			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchEnd, this);
			this.container.stage.removeEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchEnd, this);
			this.container.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
		}


		/**
		 * 動畫演示完畢
		 */
		private onTweenComplete(): void {

			this._isDrag = false;

			//滑動時啟用
			this.container.touchEnabled = true;

			//檢查頁數是否有異動
			let pageChanged: boolean = this.currentPage != this.newPage;

			//更新當前頁面
			this.currentPage = this.newPage;

			if (this.isLoop) {
				//校正座標
				this.container.x = this.initX;
			}

			//重置資料
			this.dragX = -1;
			this.newPage = -1;

			this.container.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);

			//通知拖曳結束
			this.dispatchEventWith(ScrollCotroller.ON_DRAG_STOP, false);

			//頁數確實有異動才傳通知
			if (pageChanged) {
				this.dispatchEventWith(ScrollCotroller.ON_PAGE_CHANGED, false, this.currentPage);
			}
		}

		public get isDrag(): boolean {
			return this._isDrag;
		}

		public reset() {
			//校正座標
			this.container.x = this.initX;
			//重置資料
			this.dragX = -1;
			this.newPage = -1;
		}

		public setEnabled(v: boolean): void {
			this.enabled = v;
		}
	}
}