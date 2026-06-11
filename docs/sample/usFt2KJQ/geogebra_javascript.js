function ggbOnInit() {
    ggbApplet.evalCommand("SetActiveView[1]");
    ggbApplet.evalCommand("CenterView[(0,0)]");

     if (typeof lang !=="undefined") {
       ggbApplet.setValue("lang",lang);
       ggbApplet.evalCommand("RunClickScript[buttonLang]");
     }

    ggbApplet.evalCommand("SetValue[showPoint,true]");
    ggbApplet.evalCommand("SetValue[showAxis,true]");
}

