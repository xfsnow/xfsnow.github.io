function ggbOnInit() {
    ggbApplet.evalCommand("SetActiveView[1]");
    ggbApplet.evalCommand("CenterView[(0,0)]");
    ggbApplet.evalCommand("RunClickScript[buttonNext]");

     if (typeof lang !=="undefined") {
       ggbApplet.setValue("lang",lang);
       ggbApplet.evalCommand("RunClickScript[buttonLang]");
     }
}
