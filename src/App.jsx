import { useState, useEffect } from "react"
import FindPlace from "./component/findplace"
import appState from "./component/lib/appState";
import { getCanvas } from "./component/lib/saveFile";
import createScene from "./component/lib/createScene";
import tinycolor from "tinycolor2";
import ColorLayer from "./component/lib/colorLayer";
import config from './component/config'
import GridLayer from "./component/lib/gridLayer";
import './styles/app.css'

const App = () => {
  const [placeFound, setPlaceFound] = useState(false);
  const [name, setName] = useState('');
  const [scene, setScene] = useState(null);
  const [zazzleLink, setZazzleLink] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(config.getBackgroundColor().toRgb());
  const [labelColor, setLabelColor] = useState(config.getLabelColor().toRgb());
  const [layers, setLayers] = useState([])
  const [showSettings, setShowSettings] = useState(false);

  const onGridLoaded = (grid) => {
      if(grid.isArea){
        appState.set('areaId', grid.id);
        appState.unset('osm_id');
        appState.unset('bbox');
      }else if (grid.bboxString){
        appState.unset('areaId');
        appState.set('osm_id', grid.id);
        appState.set('bbox', grid.bboxString);
      }
      setPlaceFound(true);
      setName(grid.name.split(',')[0]);
      const canvas = getCanvas();
      canvas.style.visibility = 'visible';

      // Create scene and set state
      const newScene = createScene(canvas);
      setScene(newScene);

      // GridLayer logic (moved here to avoid null scene issues)
      const gridLayer = new GridLayer();
      gridLayer.id = 'lines';
      gridLayer.setGrid(grid);
      newScene.add(gridLayer);

      // Make the newScene globally accessible
      window.scene = newScene;

  }

  // React to scene updates
  useEffect(() => {
    if (scene) {
      scene.on('layer-added', updateLayers);
      scene.on('layer-removed', updateLayers);
    }
    // Cleanup to avoid memory leaks
    return () => {
      if (scene) {
        scene.off('layer-added', updateLayers);
        scene.off('layer-removed', updateLayers);
      }
    };
  }, [scene]);

  const updateLayers = () => {
    const newLayers = []
    let lastLayer = 0;
    const renderer = scene.getRenderer();
    const root = renderer.getRoot();
    root.children.forEach(layer => {
      if(!layer.color) return ;
      let name = layer.id;
      if(!name){
        lastLayer += 1;
        name = 'lines' + lastLayer;
      }
      const layerColor = tinycolor.fromRatio(layer.color);
      newLayers.push(new ColorLayer(name, layerColor, newColor => {
        setZazzleLink(null);
        layer.color = toRatio(newColor);
        renderer.renderFrame();
        scene.fire('color-change', layer);
      }));
    });

    newLayers.push(
      new ColorLayer('background', backgroundColor, setBackgroundColor),
      new ColorLayer('labels', labelColor, newColor => setLabelColor(newColor)),
    )

    setLayers(newLayers);

    function toRatio(c){
      return {r:c.r/0xff, g:c.g/0xff, b: c.b/0xff, a: c.a};
    }

    setZazzleLink(null);
  }

  const toggleSetting = () => {
    setShowSettings(!showSettings);
  }

  const toPNGFile = () => {
    scene.saveToPNG(name)
  }

  const toSVGFile = () => {
    scene.saveToSVG(name)
  }

  const startOver = () => {
    appState.unset('areaId');
    appState.unsetPlace();
    appState.unset('q');
    appState.enableCache();

    dispose();
    setPlaceFound(false);
    setZazzleLink(false);
    setShowSettings(false);
    setBackgroundColor(config.getBackgroundColor.toRgb());
    setLabelColor(config.getLabelColor().toRgb());

    document.body.style.backgroundColor = config.getBackgroundColor.toRgbString();
    getCanvas().style.visibility = 'hidden';
  }

  const dispose = () => {
    if(scene){
      scene.dispose();
      window.scene = null;
    }
  }

  return (
    <div>
      {!placeFound && <FindPlace onLoaded={onGridLoaded} />}
      {placeFound && (
        <div id="app">
          <div className="controls">
            <a href="#" className="print-button" onClick={toggleSetting}>Customize...</a>
            <a href="#" className="try-another" onClick={startOver}>Try another city</a>
          </div>
          {showSettings && (
            <div className="print-window">
              <h3>Export</h3>
              <div className="row">
                <a href="#" onClick={toPNGFile} className="col">As an image (.png)</a>
                <span className="col c-2">
                  Save the current screen as a raster image
                </span>
              </div>

              <div className="row">
                <a href="#" onClick={toSVGFile} className="col">As a vector (.svg)</a>
                <span className="col c-2">
                  Save the current screen as a vector image
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App;