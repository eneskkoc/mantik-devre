function CizgiGroup()
{
    var myCizgis = new Array();
    var myBounds = null;

    this.input = null;
    this.outputs = new Array();
    
    this.isEmpty = false;
    
    this.getCizgis = function()
    {
        return myCizgis;
    }
    
    this.canAddCizgi = function(cizgi)
    {   
        if (myBounds == null || !myBounds.intersectsCizgi(cizgi, true)) return false;

        for (var i = 0; i < myCizgis.length; ++ i) {
            if (myCizgis[i].canConnect(cizgi)) {
                return true;
            }
        }
        
        return false;
    }
    
    this.crossesPos = function(pos)
    {
        if (myBounds == null || !myBounds.contains(pos)) return false;

        for (var i = 0; i < myCizgis.length; ++ i) {
            if (myCizgis[i].crossesPos(pos)) {
                return true;
            }
        }
        
        return false;
    }
    
    this.getCizgiAt = function(pos)
    {
        if (myBounds == null || !myBounds.contains(pos)) return null;

        for (var i = 0; i < myCizgis.length; ++ i) {
            if (myCizgis[i].crossesPos(pos)) return myCizgis[i];
        }
        
        return null;
    }
    
    this.setInput = function(gate, output)//giriş ile bağlantı
    {
        this.input = new Link(gate, output);
        
        for (var i = 0; i < this.outputs.length; ++ i) {
            var link = this.outputs[i];
            link.gate.linkInput(this.input.gate, this.input.socket, link.socket);
        }
    }
    
    this.removeInput = function()//giriş taşınmasında bağlantı
    {
        this.input = null;
        
        var cizgis = myCizgis;
        myCizgis = [];

        for (var i = 0; i < this.outputs.length; ++ i) {
            var link = this.outputs[i];
            logicSim.removeGate(link.gate);
            logicSim.placeGate(link.gate);
        }

        myCizgis = cizgis;
    }
    
    this.addOutput = function(gate, input)//çıkış ile bağlantı
    {   
        var link = new Link(gate, input);
        
        if (this.outputs.containsEqual(link)) return;
        
        if (this.input != null) {
            gate.linkInput(this.input.gate, this.input.socket, link.socket);
        }

        this.outputs.push(link);
    }
    
    this.removeOutput = function(link)
    {
        logicSim.removeGate(link.gate);
        logicSim.placeGate(link.gate);
    }
    
    this.removeAllOutputs = function()
    {
        var cizgis = myCizgis;
        myCizgis = [];

        for (var i = this.outputs.length - 1; i >= 0; -- i) {
            this.removeOutput(this.outputs[i]);
        }

        myCizgis = cizgis;
    }
