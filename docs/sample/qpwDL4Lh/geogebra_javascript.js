function ggbOnInit() {
    ggbApplet.evalCommand("CenterView[(0,0)]");
     if (typeof lang !=="undefined") {
       ggbApplet.setValue("lang",lang);
       ggbApplet.evalCommand("RunClickScript[buttonLang]");
     }
}

