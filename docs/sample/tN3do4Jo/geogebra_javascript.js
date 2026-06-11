function ggbOnInit() {
    ggbApplet.evalCommand("SetActiveView[1]");
    ggbApplet.evalCommand("CenterView[(0,0)]");
    ggbApplet.evalCommand("SetValue[A,Q1]");
    ggbApplet.evalCommand("SetValue[B,Q2]");

     if (typeof lang !=="undefined") {
       ggbApplet.setValue("lang",lang);
       ggbApplet.evalCommand("RunClickScript[buttonLang]");
     }
}
