import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import React, { useEffect } from "react";
import { Circle, Group, Layer, Rect, Stage, Image } from "react-konva";
import { clamp, KeyState, useKeys, useResizerObserver } from "../../utils/utils";

interface Planet {
  radius?: number;
  position?: Vector2d;
  data?: PlanetData;
}

interface PlanetData {
  id?: string;
  name?: string;
  meanRadius?: number;
  discoveryBy?: string;
  discoveryDate?: any;
  bodyType?: string;
  aroundPlanet?: any;
}

function Planets() {
  const dimensions = useResizerObserver("main-content");
  const [zoom, setZoom] = React.useState(1);
  const keys = useKeys();

  const [planets, setPlanets] = React.useState(Array<Planet>);

  useEffect(() => {
    fetch("https://api.le-systeme-solaire.net/rest.php/bodies?data=id%2C%20name%2C%20meanRadius%2C%20discoveryBy%2C%20discoveryDate%2C%20aroundPlanet%2C%20bodyType&order=id&page=1%2C10")
      .then(async (res) => {
        const p = await res.json();
        const ps: Array<Planet> = p.bodies.map((data: PlanetData) => {
          const planet: Planet = {radius: 10, position: {x: 10, y: 20}, data: data};
          return planet;
        });

        const maxRadius = ps.reduce((prev: Planet, current: Planet) => {
          const prevRad = prev.data?.meanRadius ?? 0;
          const currentRad = current.data?.meanRadius ?? 0;
          return currentRad > prevRad ? current : prev;
        }).data?.meanRadius ?? 0;

        ps.forEach(value => {
          if(value.radius === undefined)
            value.radius = 0;
          value.radius = (maxRadius === 0 ? 0 : value.radius / maxRadius) * 100;
          value.position = {x: Math.random() * 200, y: Math.random() * 200};
        });

        setPlanets(ps);
      })
      .catch(err => {
        console.log("siuu" + err);
      });
  }, []);

  function onWheelEvent(e: KonvaEventObject<WheelEvent>) {
    if(keys["Shift"] === KeyState.DOWN)
      setZoom(clamp(e.evt.deltaY > 0 ? zoom - 0.05 : zoom + 0.05, 0.5, 1.5));
  }

  function CreatePlanet(value: Planet) {
    console.log(value);

    return (
      <Circle radius={value.radius} stroke="white" fill="gray" x={value.position?.x} y={value.position?.y}></Circle>
    )
  }

  function CreateSun() {
    return (
      <Group>

      </Group>
    );
  }
  
  return (
    <React.Fragment>
      <Stage height={dimensions.height} width={dimensions.width}>
        <Layer>
          <Group onWheel={onWheelEvent}>
            <Rect height={dimensions.height} width={dimensions.width} stroke="gray"/>
            <Group x={dimensions.width / 2} y={dimensions.height / 2}>
              {CreateSun() }
            { planets.map((value) => {
                  return CreatePlanet(value)
                })
              }
            </Group>
          </Group>
        </Layer>
      </Stage>
    </React.Fragment>
  )
}

export default Planets;