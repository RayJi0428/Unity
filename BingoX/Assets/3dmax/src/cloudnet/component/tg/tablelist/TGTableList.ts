module cloudnet {
	/**
	 * TG基本桌列表
	 */
	export class TGTableList extends eui.Component implements ITable {

		//EUI------------------------------------------------
		//兩顆按鈕
		private prevBtn: eui.Image;
		private nextBtn: eui.Image;

		//所有桌群組
		private tableGroup: eui.Group;

		private tableItemList: any[];

		//EUI------------------------------------------------
		//桌列表資料
		private _tableListData: cloudnet.IGameTableInfo[];

		//當前頁面索引
		private currentPage: number = -1;

		//一頁桌數量
		private NUM_TABLE_PER_PAGE: number = 3;

		//桌物件數量
		private totalTable: number = 9;

		//切頁控制器
		private pageConroller: cloudnet.PageController;

		//手勢控制器
		private scrollController: cloudnet.ScrollCotroller;

		//切頁索引資料，沒有桌的補-1[[0,1,2],[3,4,5]...[N,-1,-1]]
		private changePageData: number[][];

		private page_0: eui.Group;//正中間
		private page_1: eui.Group;//右邊
		private page_2: eui.Group;//左邊

		//目前桌物件排序清單(0左1中2右)
		private pageList: eui.Group[];

		/**
		 * ctor
		 */
		public constructor(skinName: string) {
			super();

			this.once(eui.UIEvent.COMPLETE, this.uiCompHandler, this);
			this.skinName = skinName;
		}

		private uiCompHandler(): void {

			this.tableItemList = [];
			for (let i: number = 0; i < this.totalTable; ++i) {
				let table_class_define: string = GameDataManager.getInstance().table_class;
				let table_class = egret.getDefinitionByName(table_class_define);
				let table: any = new table_class(GameDataManager.getInstance().table_skin);
				let group: eui.Group = this[`page_${Math.floor(i / 3)}`];
				group.name = `page_${Math.floor(i / 3)}`;
				group.addChild(table);
				this.tableItemList.push(table);
			}

			//目前桌物件排序清單(0左1中2右)
			this.pageList = [this.page_0, this.page_1, this.page_2];

			this.pageConroller = new cloudnet.PageController();
			this.pageConroller.addEventListener(cloudnet.PageController.ON_CHANGE_START, this.onChangeStart, this);
			this.pageConroller.addEventListener(cloudnet.PageController.ON_CHANGE_STOP, this.onChangeStop, this);
			this.pageConroller.addEventListener(cloudnet.PageController.ON_PAGE_CHANGED, this.onPageChanged, this);
			this.pageConroller.tweenDuration = 0.5;

			this.scrollController = new cloudnet.ScrollCotroller();
			this.scrollController.addEventListener(cloudnet.ScrollCotroller.ON_DRAG_START, this.onChangeStart, this);
			this.scrollController.addEventListener(cloudnet.ScrollCotroller.ON_DRAG_STOP, this.onChangeStop, this);
			this.scrollController.addEventListener(cloudnet.ScrollCotroller.ON_PAGE_CHANGED, this.onPageChanged, this);

			this.scaleX = this.scaleY = .4;
			this.x = this.y = 200;
		}

		/**
         * 切頁完成通知(重新刷資料)
         */
		private onPageChanged(e: egret.Event): void {
			this.setCurrentPage(e.data);
		}

        /**
         * 設定當前頁面，並刷新對應資料
         */
		private setCurrentPage(page: number): void {

			if (this.currentPage == page)
				return;

			let dir: number = this.scrollController.direction;
			let pageGroup: eui.Group;

			//向右切一頁(0左1中2右)中間不動，刷新左右桌資訊
			if (dir == ScrollCotroller.LEFT) {
				pageGroup = this.pageList.shift();
				this.pageList.push(pageGroup);
				this.pageList[0].x = -720;
				this.pageList[1].x = 0;
				this.pageList[2].x = 720;
				this.setGroupData(0, page - 1);
				this.setGroupData(2, page + 1);
			}
			//向左切一頁(0左1中2右)中間不動，刷新左右桌資訊
			else if (dir == ScrollCotroller.RIGHT) {
				pageGroup = this.pageList.pop();
				this.pageList.unshift(pageGroup);
				this.pageList[0].x = -720;
				this.pageList[1].x = 0;
				this.pageList[2].x = 720;
				this.setGroupData(0, page - 1);
				this.setGroupData(2, page + 1);
			}
			//直接跳頁
			else {
				this.setGroupData(0, page - 1);
				this.setGroupData(1, page);
				this.setGroupData(2, page + 1);
			}
			this.currentPage = page;

			this.pageConroller.setCurrentPage(this.currentPage);
			this.scrollController.setCurrentPage(this.currentPage);
		}

		/**
         * 設定頁面資料(一次3桌)
         */
		private setGroupData(group: number, page: number): void {

			//小於0取最後一組
			if (page < 0) {
				page = this.changePageData.length - 1;
			}

			//大於長度取第一組
			if (page >= this.changePageData.length) {
				page = 0;
			}

			let indexData: number[] = this.changePageData[page];

			let curGroup: eui.Group = this.pageList[group];

			//若begin是0,則刷0,1,2桌資訊
			for (let i: number = 0; i < this.NUM_TABLE_PER_PAGE; ++i) {
				let dataIndex: number = indexData[i];
				let table: any = curGroup.getChildAt(i);
				table.setTableInfo(this._tableListData[dataIndex]);
			}
		}


		//ITable實現------------------------------------------------------------------------------


		/**
		* 直接讓table物件檢查是否是要刷新自己，是就拿新資料刷新
		*/
		setTableInfo(value: cloudnet.IGameTableInfo): void {

			for (let i: number = 0; i < this.totalTable; ++i) {

				//確定與桌物件相同tableID才刷
				if (this.tableItemList[i].tgTable.tableID == value.TableID) {
					this.tableItemList[i].setTableInfo(value);
				}
			}
		}

		setTableInfoAll(value: cloudnet.IGameTableInfo[]): void {

			this._tableListData = value;

			//換算實際頁面數
			let totalPage: number = Math.floor(this._tableListData.length / this.NUM_TABLE_PER_PAGE);
			totalPage += (this._tableListData.length % this.NUM_TABLE_PER_PAGE > 0) ? 1 : 0;

			//建立切頁用索引資料
			this.createChangePageData(this._tableListData, totalPage);

			for (var i: number = 0; i < this.NUM_TABLE_PER_PAGE; ++i) {
				this.tableItemList[i].reset();
			}

			//頁面控制器
			this.pageConroller.setup(this.tableGroup, this.prevBtn, this.nextBtn, 720, totalPage);

			//手勢控制器
			this.scrollController.setup(this.tableGroup, 720, totalPage);

			//首次進入，初始化設定為第0頁
			this.setCurrentPage(0);
		}

		/**
		 * 建立切頁用的索引資料
		 */
		private createChangePageData(tableListData: IGameTableInfo[], totalPage: number): void {
			this.changePageData = [];
			for (let i: number = 0; i < totalPage; ++i) {
				let indexData: number[] = [];
				for (let j: number = 0; j < this.NUM_TABLE_PER_PAGE; ++j) {
					let dataIndex: number = i * this.NUM_TABLE_PER_PAGE + j;

					//[Ray]2018.11.29:有資料就塞index沒有塞-1
					if (tableListData[dataIndex]) {
						indexData.push(dataIndex);
					}
					else {
						indexData.push(-1);
					}
				}
				this.changePageData.push(indexData);
			}
		}

		/**
		 * 
		 */
		private onChangeStart(e: egret.Event): void {
			//拖曳時禁止使用桌
			this.setTableEnabled(false);
		}

		/**
		 * 
		 */
		private onChangeStop(e: egret.Event): void {
			//拖曳完成啟用桌
			this.setTableEnabled(true);
		}


		setJackpot(value: any): void {

		}

		enter(): void {
			//[Ray]2018.12.13:全部桌物件重刷狀態
			for (var i: number = 0; i < this.totalTable; ++i) {
				this.tableItemList[i].reset();
			}
		}
		exit(): void {

		}

		/**
		 * 設定所有桌是否可點擊
		 * TODO:目前因為換bmpData遊戲做，所以沒辦法靠TGTableList屬性判斷，必須另外串一條路由TableList設定Table亮起才行
		 */
		private setTableEnabled(value: boolean): void {

			for (var i: number = 0; i < this.totalTable; ++i) {
				this.tableItemList[i].enabled = value;
			}

			this.pageConroller.setButtonVisible(value);
			this.scrollController.setEnabled(value);
		}

		public onOrientationChange(): void {

		}
	}
}