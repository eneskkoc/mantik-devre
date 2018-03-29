SocketFace = new Object();//kapılar,input ve output ile bağlantı kurmak için

SocketFace.left 	= "LEFT";
SocketFace.top 		= "TOP";
SocketFace.right 	= "RIGHT";
SocketFace.bottom 	= "BOTTOM";

function SocketInfo(face, offset, label)
{
	this.face = face;
	this.offset = offset;
	this.label = label;
	
	this.isLeft 	= this.face == SocketFace.left;
	this.isTop 		= this.face == SocketFace.top;
	this.isRight 	= this.face == SocketFace.right;
	this.isBottom 	= this.face == SocketFace.bottom;
	
	this.getPosition = function(gateType, x, y)
	{
		return new Pos(
			x + 
			((this.face == SocketFace.left) ? 0
			: (this.face == SocketFace.right) ? gateType.width
			: this.offset * 8),
			y +
			((this.face == SocketFace.top) ? 0
			: (this.face == SocketFace.bottom) ? gateType.height
			: this.offset * 8)
		);
	}
}

function GateType(name, width, height, inputs, outputs)//kapı tipleri için
{
	this.isGateType = true;

	this.name = name;

	this.width = width;
	this.height = height;
	
	this.inputs = inputs;
	this.outputs = outputs;
	
	this.func = function(gate, inputs)
	{
		return [false];
	}
	
	this.initialize = function(gate)
	{
		
	}
	
	this.click = function(gate)
	{
		
	}
	
	this.mouseDown = function(gate)
	{
	
	}
	
	this.mouseUp = function(gate)
	{
	
	}

	this.saveData = function(gate)
	{
		return null;
	}

	this.loadData = function(gate, data)
	{

	}
	
	this.render = function(context, x, y, gate)
	{
		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		
		for (var i = 0; i < this.inputs.length + this.outputs.length; ++ i)
		{
			var inp = (i < this.inputs.length ? this.inputs[i] : this.outputs[i - this.inputs.length]);
			var start = inp.getPosition(this, x, y);
			var end = inp.getPosition(this, x, y);
			
			if (inp.face == SocketFace.left || inp.face == SocketFace.right)
				end.x = x + this.width / 2;
			else
				end.y = y + this.height / 2;
				
			context.beginPath();
			context.moveTo(start.x, start.y);
			context.lineTo(end.x, end.y);
			context.stroke();
			context.closePath();
		}
	}
}

function DefaultGate(name, image, renderOverride, inputs, outputs)
{
	this.__proto__ = new GateType(name, image.width, image.height, inputs, outputs);
	
	this.ctorname = arguments.callee.caller.name;

	this.image = image;
	this.renderOverride = renderOverride;
	
	this.render = function(context, x, y, gate)
	{
		this.__proto__.render(context, x, y, gate);
		if (!this.renderOverride)
			context.drawImage(this.image, x, y);
	}
}
function AndGate()
{
	this.__proto__ = new DefaultGate("AND", images.and, false,
		[
			new SocketInfo(SocketFace.left, 1, "A"),
			new SocketInfo(SocketFace.left, 3, "B")
		],
		[
			new SocketInfo(SocketFace.right, 2, "Q")
		]
	);
	
	this.func = function(gate, inputs)
	{
		return [inputs[0] && inputs[1]];
	}
}
