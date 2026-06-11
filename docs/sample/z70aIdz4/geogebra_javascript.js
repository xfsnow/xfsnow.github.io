function ggbOnInit() {
     if (typeof lang !=="undefined") {
       ggbApplet.setValue("lang",lang);
       ggbApplet.evalCommand("RunClickScript[buttonLang]");
     }
    ggbApplet.evalCommand("RunClickScript[buttonNext]");
}
