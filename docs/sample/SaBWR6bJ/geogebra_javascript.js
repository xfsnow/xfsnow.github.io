function ggbOnInit() {
  ggbApplet.registerAddListener('onAdd');
}

function onAdd(name){
  var type = ggbApplet.getObjectType(name);
  //alert('type: ' + type + '\n' + 'name: ' + name);
  if( type == 'point' || type == 'segment'){
    ggbApplet.setVisible(name, false);
  }
}
