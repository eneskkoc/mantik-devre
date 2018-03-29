function Cizgi(start, end)//kapılarla input ve output arasındaki bağlantı çizgileri
{
	var myStartConns = new Array();
	var myEndConns = new Array();
	
	this.group = null;
	
	this.start = new Pos(start.x, start.y);
	this.end = new Pos(end.x, end.y);

	this.selected = false;
	
	if (this.start.x > this.end.x || this.start.y > this.end.y)
	{
		var temp = this.start;
		this.start = this.end;
		this.end = temp;
	}
	
	this.clone = function()
	{
		return new Cizgi(this.start, this.end);		
	}

	this.equals = function(cizgi)
	{
		return cizgi.start.equals(this.start) && cizgi.end.equals(this.end);
	}

	this.render = function(context, offset, selectClr)
	{
		if (this.selected)
		{
			if (selectClr == null) selectClr = "#6666FF";

			context.globalAlpha = 0.5;
			context.fillStyle = selectClr;
			context.fillRect(this.start.x + offset.x - 4, this.start.y + offset.y - 4,
				this.end.x - this.start.x + 8, this.end.y - this.start.y + 8);
			context.globalAlpha = 1.0;
		}

		context.strokeStyle = "#000000";
		context.lineWidth = 2;
		
		context.beginPath();
		context.moveTo(this.start.x + offset.x, this.start.y + offset.y);
		context.lineTo(this.end.x + offset.x, this.end.y + offset.y);
		context.stroke();
		context.closePath();
		
		context.fillStyle = "#000000";
		
		if (myStartConns.length > 1) {
			context.beginPath();
			context.arc(this.start.x + offset.x, this.start.y + offset.y, 3, 0, Math.PI * 2, true);
			context.fill();
			context.closePath();
		}

		if (myEndConns.length > 1) {
			context.beginPath();
			context.arc(this.end.x + offset.x, this.end.y + offset.y, 3, 0, Math.PI * 2, true);
			context.fill();
			context.closePath();
		}
	}
	
	this.getConnections = function()
	{
		return myStartConns.concat(myEndConns);
	}
	
	this.isHorizontal = function()
	{
		return this.start.y == this.end.y;
	}
	
	this.isVertical = function()
	{
		return this.start.x == this.end.x;
	}
	
	this.runsAlong = function(cizgi)//uzun düz ve yatay çizgi çizme
	{
		return (this.isHorizontal() && cizgi.isHorizontal()
			&& this.start.y == cizgi.start.y && this.start.x <= cizgi.end.x
			&& this.end.x >= cizgi.start.x)
			|| (this.isVertical() && cizgi.isVertical()
			&& this.start.x == cizgi.start.x && this.start.y <= cizgi.end.y
			&& this.end.y >= cizgi.start.y);
	}

	this.split = function(cizgi)
	{		
		if (this.isHorizontal()) {
			if (cizgi.start.x == this.start.x || cizgi.start.x == this.end.x) {
				return [];
			}

			var splat = new Cizgi(new Pos(cizgi.start.x, this.start.y), this.end);
			splat.group = this.group;
			splat.selected = this.selected;
			this.end = new Pos(cizgi.start.x, this.start.y);

			return [splat];
		} else {
			if (cizgi.start.y == this.start.y || cizgi.start.y == this.end.y) {
				return [];
			}

			var splat = new Cizgi(new Pos(this.start.x, cizgi.start.y), this.end);
			splat.group = this.group;
			splat.selected = this.selected;
			this.end = new Pos(this.start.x, cizgi.start.y);
			
			return [splat];
		}
	}

	this.merge = function(cizgi)
	{
		this.selected = this.selected || cizgi.selected;
		
		if (this.isHorizontal()) {
			this.start.x = Math.min(this.start.x, cizgi.start.x);
			this.end.x   = Math.max(this.end.x,   cizgi.end.x  );
		} else {
			this.start.y = Math.min(this.start.y, cizgi.start.y);
			this.end.y   = Math.max(this.end.y,   cizgi.end.y  );
		}
	}
	
	this.crossesPos = function(pos)
	{
		return (this.isHorizontal() && this.start.y == pos.y
			&& this.start.x <= pos.x && this.end.x >= pos.x)
			|| (this.isVertical() && this.start.x == pos.x
			&& this.start.y <= pos.y && this.end.y >= pos.y);
	}
	
	this.intersects = function(cizgi)
	{
		return this.start.x <= cizgi.end.x && this.end.x >= cizgi.start.x &&
			this.start.y <= cizgi.end.y && this.end.y >= cizgi.start.y;
	}
	
	this.crosses = function(cizgi)//çapraz çizme
	{
		return this.start.x < cizgi.end.x && this.end.x > cizgi.start.x &&
			this.start.y < cizgi.end.y && this.end.y > cizgi.start.y;
	}
	
	this.crossPos = function(cizgi)
	{
		if (this.isVertical() && cizgi.isHorizontal()) {
			return new Pos(this.start.x, cizgi.start.y);
		} else {
			return new Pos(cizgi.start.x, this.start.y);
		}
	}
	
	this.canConnect = function(cizgi)
	{
		return !myStartConns.contains(cizgi) && !myEndConns.contains(cizgi)
			&& this.intersects(cizgi) && !this.crosses(cizgi);
	}

	this.hasConnection = function(pos)
	{
		if (pos.equals(this.start)) {
			return myStartConns.length > 0;
		}

		if (pos.equals(this.end)) {
			return myEndConns.length > 0;
		}

		return false;
	}
	
	this.connect = function(cizgi)//çizgi çizerken çizgiyi durdurup devam ettirmek
	{
		if (cizgi == this) return;

		var conns = myStartConns;

		if (this.end.equals(cizgi.start) || this.end.equals(cizgi.end)) {
			conns = myEndConns;
		}

		if (!conns.contains(cizgi)) {
			conns.push(cizgi);
		}
	}
	
	this.disconnect = function(cizgi)
	{
		var index = myConnections.indexOf(cizgi);
		myConnections.splice(index, 1);
	}
	
	
}
