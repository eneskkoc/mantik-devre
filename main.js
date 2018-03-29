var ControlMode = {
	wiring: 0,
	selecting: 1,
	deleting: 2
};

function LogicSim()//işlem yapılan yer
{
	this.__proto__ = new Cevre();

	var myIsDragging = false;
	var myIsSelecting = false;
	var myCanDrag = false;
	
	var myIsWiring = false;
	var myCizgiStart = null;
	
	var myGridSize = 8;
	var myGridImage = null;
	
	var myDeleteBtn = null;
	var mySelectBtn = null;
	var myMoveBtn = null;

	var myCtrlDown = false;

	var mySelection = new Cevre();
	var myCanPlace = false;
	var myLastDragPos = null;

	var myCustoms = new Array();

	this.canvas = null;
	this.context = null;
	
	this.toolbar = null;
	
	this.mouseX = 0;
	this.mouseY = 0;
	
	this.mosueDownPos = null;

	this.mode = ControlMode.wiring;
	
	this.initialize = function()
	{
		this.canvas = document.getElementById("canvas");
		this.context = this.canvas.getContext("2d");
		
		this.toolbar = new Toolbar();
		var grp = this.toolbar.addGroup("Tools");
		grp.addItem(new Button.Tool(images.newfile, function() {
			if (confirm("Yeni sayfa açılsın mı?")) {
				logicSim.clear();
			}
		}));
		myDeleteBtn = grp.addItem(new Button.Tool(images.delete, function() {
			if (logicSim.mode == ControlMode.deleting)
				logicSim.setMode(ControlMode.wiring);
			else
				logicSim.setMode(ControlMode.deleting);
		}));



		grp = this.toolbar.addGroup("Logic Gates");
		grp.addItem(new AndGate());
		grp.addItem(new OrGate());
		grp.addItem(new XorGate());
		grp.addItem(new NotGate());
		grp.addItem(new NandGate());
		grp.addItem(new NorGate());
		grp.addItem(new XnorGate());
		grp.addItem(new AndGate1());
		grp.addItem(new OrGate1());

		grp = this.toolbar.addGroup("Input");
		grp.addItem(new ConstInput());
				grp = this.toolbar.addGroup("Output");
		grp.addItem(new OutputDisplay());
		this.customGroup = this.toolbar.addGroup("");
		
		this.setGridSize(16);
		this.onResizeCanvas();

		
	}
		
	this.startDragging = function(gateType)
	{
		mySelection.clear();

		if (gateType != null) {
			this.deselectAll();

			var gate = new Gate(gateType, 0, 0);
			gate.selected = true;

			mySelection.placeGate(gate);
		} else {
			var pos = this.mouseDownPos;

			for (var i = this.gates.length - 1; i >= 0; i--) {
				var gate = this.gates[i];
				if (!gate.selected) continue;

				if (myCtrlDown) {
					gate.selected = false;
					var data = gate.saveData();
					gate = new Gate(gate.type, gate.x, gate.y);
					gate.loadData(data);
					gate.selected = true;
				} else {
					this.removeGate(gate);
				}

				gate.x -= pos.x;
				gate.y -= pos.y;

				mySelection.placeGate(gate);
			}

			var cizgis = this.getAllCizgis();
			var toRemove = new Array();
			for (var i = 0; i < cizgis.length; ++ i) {
				var cizgi = cizgis[i];
				if (!cizgi.selected) continue;

				if (myCtrlDown) {
					cizgi.selected = false;
				} else {
					toRemove.push(cizgi);
				}

				mySelection.placeCizgi(cizgi.start.sub(pos), cizgi.end.sub(pos), true);
			}

			if (!myCtrlDown) {
				this.removeCizgis(toRemove);
			}
		}

		myIsDragging = true;
	}

	this.getDraggedPosition = function()
	{
		var snap = myGridSize / 2;

		for (var i = this.gates.length - 1; i >= 0; i--) {
			var gate = this.gates[i];
			if (gate.selected) {
				snap = myGridSize;
				break;
			}
		}

		if (mySelection.gates.length > 0) {
			snap = myGridSize;
		}

		return new Pos(
			Math.round(this.mouseX / snap) * snap,
			Math.round(this.mouseY / snap) * snap
		);
	}

	this.getSelectedRect = function()//seçme işlemini kare olarak yapıyor
	{
		var start = new Pos(this.mouseDownPos.x, this.mouseDownPos.y);
		var end = this.getDraggedPosition();

		if (end.x < start.x) {
			var temp = end.x;
			end.x = start.x;
			start.x = temp;
		}

		if (end.y < start.y) {
			var temp = end.y;
			end.y = start.y;
			start.y = temp;
		}

		return new Rect(start.x, start.y, end.x - start.x, end.y - start.y);
	}
	
	this.stopDragging = function()
	{
		myIsDragging = false;

		if (this.getDraggedPosition().x >= 256) {
			if (myCanPlace) {
				this.tryMerge(mySelection, this.getDraggedPosition(), true);
			} else {
				this.tryMerge(mySelection, this.mouseDownPos, true);
			}
		}

		mySelection.clear();
	}

	this.setMode = function(mode)
	{
		if (mode == ControlMode.deleting) {
			var deleted = false;
			for (var i = this.gates.length - 1; i >= 0; i--) {
				var gate = this.gates[i];
				if (gate.selected) {
					deleted = true;
					this.removeGate(gate);
				}
			}
