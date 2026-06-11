function ggbOnInit() {
    if (typeof lang !== "undefined") {
        ggbApplet.setValue("lang", lang);
        ggbApplet.evalCommand("RunClickScript[buttonLang]");
    }
    ggbApplet.evalCommand("SetActiveView[1]");
    ggbApplet.evalCommand("CenterView[(0,0)]");
}